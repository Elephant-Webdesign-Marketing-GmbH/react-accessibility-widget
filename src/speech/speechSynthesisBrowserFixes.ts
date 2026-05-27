/**
 * Browser-specific fixes and utilities for Web Speech API
 */

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  label: string;
}

/**
 * Wait for voices to be loaded (Chrome/Safari bug workaround)
 * @returns Promise that resolves when voices are available
 */
export function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Wait for voiceschanged event (Chrome/Safari)
    const handler = () => {
      const loadedVoices = window.speechSynthesis.getVoices();
      if (loadedVoices.length > 0) {
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
        resolve(loadedVoices);
      }
    };

    window.speechSynthesis.addEventListener("voiceschanged", handler);
    
    // Fallback timeout after 2 seconds
    setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve(window.speechSynthesis.getVoices());
    }, 2000);
  });
}

/**
 * Get voices filtered by language prefix
 * @param langPrefix Language prefix (e.g., "de", "en")
 * @returns Array of matching voices
 */
export function getVoicesByLanguage(langPrefix: string): SpeechSynthesisVoice[] {
  const voices = window.speechSynthesis.getVoices();
  return voices.filter((voice) => voice.lang.toLowerCase().startsWith(langPrefix.toLowerCase()));
}

/**
 * Find the best voice for a given language (prefers premium/enhanced voices)
 * @param lang BCP-47 language tag (e.g., "de-DE", "en-US")
 * @returns Best matching voice or null
 */
export function findBestVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  
  const langPrefix = lang.split("-")[0];
  
  // Filter voices by language
  const matchingVoices = voices.filter((voice) => 
    voice.lang === lang || voice.lang.startsWith(langPrefix)
  );
  
  if (matchingVoices.length === 0) return null;
  
  // IMPORTANT: Prioritize LOCAL system voices for reliability
  // Chrome's "Google Deutsch" voice has known issues on macOS Chrome
  // Local macOS voices (Anna, Yannick, etc.) work reliably
  const localVoice = matchingVoices.find((voice) => 
    voice.localService && !voice.name.toLowerCase().includes('google')
  );
  
  if (localVoice) return localVoice;
  
  // Fallback: Premium/enhanced voices
  const premiumVoice = matchingVoices.find((voice) => 
    voice.name.toLowerCase().includes('premium') ||
    voice.name.toLowerCase().includes('enhanced') ||
    voice.name.toLowerCase().includes('neural') ||
    voice.name.toLowerCase().includes('quality')
  );
  
  if (premiumVoice) return premiumVoice;
  
  // Fallback: Try exact match first
  const exactMatch = matchingVoices.find((voice) => voice.lang === lang);
  if (exactMatch) return exactMatch;
  
  // Fallback: Return first matching voice
  return matchingVoices[0];
}

/**
 * Get voice by URI
 * @param voiceUri Voice URI from SpeechSynthesisVoice
 * @returns Matching voice or null
 */
export function getVoiceByUri(voiceUri: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => voice.voiceURI === voiceUri) || null;
}

/**
 * Format voices for UI dropdown
 * @param langPrefix Optional language prefix to filter
 * @returns Array of voice options with labels
 */
export function formatVoicesForUI(langPrefix?: string): VoiceOption[] {
  let voices = window.speechSynthesis.getVoices();
  
  if (langPrefix) {
    voices = voices.filter((voice) => voice.lang.toLowerCase().startsWith(langPrefix.toLowerCase()));
  }

  return voices.map((voice) => ({
    voice,
    label: `${voice.name} (${voice.lang})${voice.default ? " - Standard" : ""}`,
  }));
}

/**
 * Map common language codes to BCP-47 tags
 * @param lang Language code (e.g., "de", "en")
 * @returns BCP-47 language tag
 */
export function mapLanguageToBCP47(lang: string): string {
  const mapping: Record<string, string> = {
    de: "de-DE",
    en: "en-US",
    fr: "fr-FR",
    es: "es-ES",
    it: "it-IT",
    pt: "pt-PT",
    nl: "nl-NL",
    pl: "pl-PL",
    ru: "ru-RU",
    ja: "ja-JP",
    zh: "zh-CN",
    ko: "ko-KR",
  };

  const lowerLang = lang.toLowerCase().split("-")[0];
  return mapping[lowerLang] || lang;
}

/**
 * Check if pause/resume is supported (Safari workaround detection)
 * @returns True if pause/resume is reliable
 */
export function isPauseResumeSupported(): boolean {
  // Safari on iOS has issues with pause/resume
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  // Assume desktop browsers support it well
  return !(isSafari && isIOS);
}
