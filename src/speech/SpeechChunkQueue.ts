/**
 * Speech chunk queue for handling long text with pause/resume support
 */

import { SpeechSynthesisStatus } from "./SpeechSynthesisStatus";
import { findBestVoice } from "./speechSynthesisBrowserFixes";

export interface SpeechChunk {
  text: string;
  index: number;
}

export interface QueueProgress {
  current: number;
  total: number;
}

export interface SpeechChunkQueueOptions {
  /** Speech language (BCP-47) */
  lang: string;
  /** Speech rate (0.5 - 2.0) */
  rate: number;
  /** Voice URI (optional) */
  voiceUri?: string | null;
  /** Max characters per chunk (default: 3000) */
  maxChunkSize?: number;
  /** Callback when status changes */
  onStatusChange?: (status: SpeechSynthesisStatus) => void;
  /** Callback on progress update */
  onProgress?: (progress: QueueProgress) => void;
  /** Callback on error */
  onError?: (error: string) => void;
  /** Callback on queue completion */
  onComplete?: () => void;
}

/**
 * Split text into chunks at sentence boundaries
 */
function splitIntoChunks(text: string, maxSize: number): SpeechChunk[] {
  const chunks: SpeechChunk[] = [];
  
  // Split by sentence boundaries (. ! ? followed by space or end)
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [text];
  
  let currentChunk = "";
  let chunkIndex = 0;
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    
    // If adding this sentence exceeds max size, save current chunk and start new one
    if (currentChunk && (currentChunk.length + trimmedSentence.length + 1) > maxSize) {
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex++,
      });
      currentChunk = trimmedSentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + trimmedSentence;
    }
    
    // If current chunk is at or near max size, save it
    if (currentChunk.length >= maxSize) {
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex++,
      });
      currentChunk = "";
    }
  }
  
  // Add remaining text as final chunk
  if (currentChunk.trim()) {
    chunks.push({
      text: currentChunk.trim(),
      index: chunkIndex,
    });
  }
  
  return chunks;
}

/**
 * Queue manager for chunked speech synthesis with pause/resume support
 */
export class SpeechChunkQueue {
  private chunks: SpeechChunk[] = [];
  private currentIndex: number = 0;
  private status: SpeechSynthesisStatus = SpeechSynthesisStatus.IDLE;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPausedManually: boolean = false;
  private options: Required<Omit<SpeechChunkQueueOptions, "voiceUri">> & { voiceUri?: string | null };

  constructor(options: SpeechChunkQueueOptions) {
    this.options = {
      maxChunkSize: 3000,
      onStatusChange: () => {},
      onProgress: () => {},
      onError: () => {},
      onComplete: () => {},
      ...options,
    };
  }

  /**
   * Load text and split into chunks
   */
  load(text: string): void {
    this.chunks = splitIntoChunks(text, this.options.maxChunkSize);
    this.currentIndex = 0;
    this.isPausedManually = false;
    
    if (this.chunks.length === 0) {
      this.options.onError?.("Kein Text zum Vorlesen gefunden.");
      return;
    }
  }

  /**
   * Start speaking from current position
   */
  start(): void {
    if (this.chunks.length === 0) {
      this.options.onError?.("Keine Chunks geladen. Bitte load() zuerst aufrufen.");
      return;
    }

    if (!("speechSynthesis" in window)) {
      this.options.onError?.("Text-to-Speech wird von Ihrem Browser nicht unterstützt.");
      return;
    }

    // If paused, resume instead
    if (this.status === SpeechSynthesisStatus.PAUSED && this.currentUtterance) {
      this.resume();
      return;
    }

    this.isPausedManually = false;
    
    // Chrome fix: Cancel any pending speech and wait briefly
    // This MUST happen synchronously in user gesture context
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
      // Tiny delay to let cancel complete
      setTimeout(() => this.speakCurrentChunk(), 10);
    } else {
      this.speakCurrentChunk();
    }
  }

  /**
   * Pause speech (if supported by browser)
   */
  pause(): void {
    if (!("speechSynthesis" in window)) return;

    if (this.status === SpeechSynthesisStatus.SPEAKING) {
      window.speechSynthesis.pause();
      this.isPausedManually = true;
      this.updateStatus(SpeechSynthesisStatus.PAUSED);
    }
  }

  /**
   * Resume speech from paused state
   */
  resume(): void {
    if (!("speechSynthesis" in window)) return;

    if (this.status === SpeechSynthesisStatus.PAUSED) {
      window.speechSynthesis.resume();
      this.isPausedManually = false;
      this.updateStatus(SpeechSynthesisStatus.SPEAKING);
    }
  }

  /**
   * Stop speech and reset queue
   */
  stop(): void {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    this.currentUtterance = null;
    this.isPausedManually = false;
    this.updateStatus(SpeechSynthesisStatus.IDLE);
  }

  /**
   * Get current progress
   */
  getProgress(): QueueProgress {
    return {
      current: this.currentIndex + 1,
      total: this.chunks.length,
    };
  }

  /**
   * Get current status
   */
  getStatus(): SpeechSynthesisStatus {
    return this.status;
  }

  /**
   * Check if queue is complete
   */
  isComplete(): boolean {
    return this.currentIndex >= this.chunks.length && this.status === SpeechSynthesisStatus.IDLE;
  }

  /**
   * Speak the current chunk
   */
  private speakCurrentChunk(): void {
    if (this.currentIndex >= this.chunks.length) {
      this.updateStatus(SpeechSynthesisStatus.IDLE);
      this.options.onComplete?.();
      return;
    }

    const chunk = this.chunks[this.currentIndex];
    const utterance = new SpeechSynthesisUtterance(chunk.text);
    
    utterance.lang = this.options.lang;
    utterance.rate = this.options.rate;

    // Set voice - prefer premium/enhanced voices for natural sound
    if (this.options.voiceUri) {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.voiceURI === this.options.voiceUri);
      if (voice) utterance.voice = voice;
    } else {
      // Auto-select best voice (prefers premium/enhanced)
      const bestVoice = findBestVoice(this.options.lang);
      if (bestVoice) utterance.voice = bestVoice;
    }

    utterance.onstart = () => {
      this.updateStatus(SpeechSynthesisStatus.SPEAKING);
      this.options.onProgress?.(this.getProgress());
    };

    utterance.onend = () => {
      if (this.isPausedManually || this.status === SpeechSynthesisStatus.IDLE) {
        return;
      }

      this.currentIndex++;
      
      if (this.currentIndex < this.chunks.length) {
        setTimeout(() => {
          if (!this.isPausedManually && this.status !== SpeechSynthesisStatus.IDLE) {
            this.speakCurrentChunk();
          }
        }, 50);
      } else {
        this.updateStatus(SpeechSynthesisStatus.IDLE);
        this.options.onComplete?.();
      }
    };

    utterance.onerror = (event) => {
      if (event.error === "canceled" || event.error === "interrupted") {
        return;
      }
      this.options.onError?.(`Fehler beim Vorlesen: ${event.error}`);
      this.updateStatus(SpeechSynthesisStatus.ERROR);
    };

    this.currentUtterance = utterance;
    
    // Ensure utterance is spoken immediately
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Update status and notify callback
   */
  private updateStatus(newStatus: SpeechSynthesisStatus): void {
    this.status = newStatus;
    this.options.onStatusChange?.(newStatus);
  }
}
