/**
 * Custom hook for text-to-speech functionality using Web Speech API with chunking
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { SpeechSynthesisStatus } from "./SpeechSynthesisStatus";
import { extractReadableText, cacheCurrentSelection } from "./extractReadableText";
import { SpeechChunkQueue, QueueProgress } from "./SpeechChunkQueue";
import { isPauseResumeSupported, waitForVoices } from "./speechSynthesisBrowserFixes";

export interface UseSpeechSynthesisOptions {
  /** Speech language (BCP-47, e.g., "de-DE") */
  lang: string;
  /** Speech rate (0.5 - 2.0) */
  rate: number;
  /** Voice URI to use */
  voiceUri?: string | null;
  /** Content selector for text extraction */
  contentSelector?: string;
  /** Callback for status updates */
  onStatusChange?: (status: SpeechSynthesisStatus) => void;
  /** Callback for progress updates */
  onProgress?: (progress: QueueProgress) => void;
  /** Callback for errors */
  onError?: (error: string) => void;
  /** Callback when speech completes */
  onComplete?: () => void;
}

export interface UseSpeechSynthesisReturn {
  /** Current status */
  status: SpeechSynthesisStatus;
  /** Current progress */
  progress: QueueProgress;
  /** Whether speech is currently active */
  isSpeaking: boolean;
  /** Whether speech is paused */
  isPaused: boolean;
  /** Start speaking with optional text */
  speak: (text?: string) => void;
  /** Pause speech */
  pause: () => void;
  /** Resume speech */
  resume: () => void;
  /** Stop speech */
  stop: () => void;
  /** Cache current selection (call before opening modal) */
  cacheSelection: () => void;
}

/**
 * Hook for text-to-speech functionality with chunking and pause/resume
 */
export function useSpeechSynthesis(options: UseSpeechSynthesisOptions): UseSpeechSynthesisReturn {
  const { lang, rate, voiceUri, contentSelector, onStatusChange, onProgress, onError, onComplete } = options;

  const [status, setStatus] = useState<SpeechSynthesisStatus>(SpeechSynthesisStatus.IDLE);
  const [progress, setProgress] = useState<QueueProgress>({ current: 0, total: 0 });
  const queueRef = useRef<SpeechChunkQueue | null>(null);

  // Use refs to store latest callbacks without triggering re-renders
  const onStatusChangeRef = useRef(onStatusChange);
  const onProgressRef = useRef(onProgress);
  const onErrorRef = useRef(onError);
  const onCompleteRef = useRef(onComplete);

  // Preload voices on mount
  useEffect(() => {
    if ("speechSynthesis" in window) {
      waitForVoices();
    }
  }, []);

  // Update refs when callbacks change
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Stable callbacks that always call the latest version
  const handleStatusChange = useCallback((newStatus: SpeechSynthesisStatus) => {
    setStatus(newStatus);
    onStatusChangeRef.current?.(newStatus);
  }, []);

  const handleProgress = useCallback((newProgress: QueueProgress) => {
    setProgress(newProgress);
    onProgressRef.current?.(newProgress);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    console.error("Speech synthesis error:", errorMessage);
    onErrorRef.current?.(errorMessage);
  }, []);

  const handleComplete = useCallback(() => {
    setProgress({ current: 0, total: 0 });
    onCompleteRef.current?.();
  }, []);

  const cacheSelection = useCallback(() => {
    // This function is now just a placeholder since caching is handled in the widget
    return cacheCurrentSelection();
  }, []);

  const speak = useCallback((explicitText?: string) => {
    if (!("speechSynthesis" in window)) {
      handleError("Text-to-Speech wird von Ihrem Browser nicht unterstützt.");
      return;
    }

    // Extract text first (before any async operations)
    const textToSpeak = extractReadableText({
      text: explicitText,
      contentSelector,
    });

    if (!textToSpeak) {
      handleError("Kein Text zum Vorlesen gefunden. Bitte wählen Sie Text aus.");
      return;
    }

    // Only stop if actually speaking
    const wasSpeaking = status === SpeechSynthesisStatus.SPEAKING || status === SpeechSynthesisStatus.PAUSED;
    if (wasSpeaking && queueRef.current) {
      queueRef.current.stop();
      queueRef.current = null;
    } else if (queueRef.current) {
      queueRef.current = null;
    }

    // Create new queue
    const queue = new SpeechChunkQueue({
      lang,
      rate,
      voiceUri,
      onStatusChange: handleStatusChange,
      onProgress: handleProgress,
      onError: handleError,
      onComplete: handleComplete,
    });

    queue.load(textToSpeak);
    queue.start();
    queueRef.current = queue;
  }, [lang, rate, voiceUri, contentSelector, status, handleStatusChange, handleProgress, handleError, handleComplete]);

  const pause = useCallback(() => {
    if (!queueRef.current) return;

    if (isPauseResumeSupported()) {
      queueRef.current.pause();
    } else {
      // Fallback: stop for browsers that don't support pause well
      handleError("Pause wird von Ihrem Browser nicht vollständig unterstützt. Vorlesen wurde gestoppt.");
      queueRef.current.stop();
    }
  }, [handleError]);

  const resume = useCallback(() => {
    if (!queueRef.current) return;
    queueRef.current.resume();
  }, []);

  const stop = useCallback(() => {
    if (!queueRef.current) return;
    queueRef.current.stop();
    setProgress({ current: 0, total: 0 });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (queueRef.current) {
        queueRef.current.stop();
      }
    };
  }, []);

  return {
    status,
    progress,
    isSpeaking: status === SpeechSynthesisStatus.SPEAKING,
    isPaused: status === SpeechSynthesisStatus.PAUSED,
    speak,
    pause,
    resume,
    stop,
    cacheSelection,
  };
}
