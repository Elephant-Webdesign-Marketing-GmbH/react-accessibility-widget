/**
 * Internationalization strings for the accessibility widget
 */

import { WidgetLocale } from "../enums/WidgetLocale";

export interface I18nStrings {
  // TTS Section
  ttsTitle: string;
  ttsReadAloudLabel: string;
  ttsReadAloudHint: string;
  ttsSpeechRateLabel: string;
  ttsSlower: string;
  ttsFaster: string;
  ttsVoiceLabel: string;
  ttsVoiceDefault: string;
  ttsReadTextLabel: string;
  ttsStopReadingLabel: string;
  ttsReadHint: string;
  
  // TTS Floating Controls
  ttsPause: string;
  ttsResume: string;
  ttsStop: string;
  ttsModeAuto: string;
  ttsModeHighlight: string;
  ttsControlLabel: string;
  ttsHideControls: string;
  
  // TTS Status Messages
  ttsNotSupported: string;
  ttsNoTextFound: string;
  ttsStarted: string;
  ttsError: string;
  ttsPauseNotSupported: string;
  
  // General
  enabled: string;
  disabled: string;
}

const deStrings: I18nStrings = {
  // TTS Section
  ttsTitle: "Text-zu-Sprache",
  ttsReadAloudLabel: "Vorlesefunktion",
  ttsReadAloudHint: "Ermöglicht das Vorlesen von ausgewähltem Text oder der gesamten Seite",
  ttsSpeechRateLabel: "Sprechgeschwindigkeit",
  ttsSlower: "Langsamer",
  ttsFaster: "Schneller",
  ttsVoiceLabel: "Stimme",
  ttsVoiceDefault: "System-Standard",
  ttsReadTextLabel: "Text vorlesen",
  ttsStopReadingLabel: "Vorlesen stoppen",
  ttsReadHint: "Wählen Sie Text aus oder lassen Sie die gesamte Seite vorlesen",
  
  // TTS Floating Controls
  ttsPause: "Pause",
  ttsResume: "Fortsetzen",
  ttsStop: "Stoppen",
  ttsModeAuto: "Automatisch vorlesen",
  ttsModeHighlight: "Mit Hervorhebung vorlesen",
  ttsControlLabel: "Vorlese-Steuerung",
  ttsHideControls: "Steuerung ausblenden",
  
  // TTS Status Messages
  ttsNotSupported: "Text-zu-Sprache wird von Ihrem Browser nicht unterstützt.",
  ttsNoTextFound: "Kein Text zum Vorlesen gefunden. Bitte wählen Sie Text aus.",
  ttsStarted: "Vorlesen gestartet",
  ttsError: "Fehler beim Vorlesen",
  ttsPauseNotSupported: "Pause wird von Ihrem Browser nicht vollständig unterstützt. Vorlesen wurde gestoppt.",
  
  // General
  enabled: "Aktiviert",
  disabled: "Deaktiviert",
};

const enStrings: I18nStrings = {
  // TTS Section
  ttsTitle: "Text-to-Speech",
  ttsReadAloudLabel: "Read Aloud Feature",
  ttsReadAloudHint: "Enables reading of selected text or the entire page",
  ttsSpeechRateLabel: "Speech Rate",
  ttsSlower: "Slower",
  ttsFaster: "Faster",
  ttsVoiceLabel: "Voice",
  ttsVoiceDefault: "System Default",
  ttsReadTextLabel: "Read Text",
  ttsStopReadingLabel: "Stop Reading",
  ttsReadHint: "Select text or let the entire page be read aloud",
  
  // TTS Floating Controls
  ttsPause: "Pause",
  ttsResume: "Resume",
  ttsStop: "Stop",
  ttsModeAuto: "Automatic reading",
  ttsModeHighlight: "Reading with highlighting",
  ttsControlLabel: "Read-aloud controls",
  ttsHideControls: "Hide controls",
  
  // TTS Status Messages
  ttsNotSupported: "Text-to-speech is not supported by your browser.",
  ttsNoTextFound: "No text found to read. Please select some text.",
  ttsStarted: "Reading started",
  ttsError: "Error reading text",
  ttsPauseNotSupported: "Pause is not fully supported by your browser. Reading has been stopped.",
  
  // General
  enabled: "Enabled",
  disabled: "Disabled",
};

export const i18nStrings: Record<WidgetLocale, I18nStrings> = {
  [WidgetLocale.DE]: deStrings,
  [WidgetLocale.EN]: enStrings,
};

/**
 * Get strings for a specific locale
 */
export function getI18nStrings(locale: WidgetLocale): I18nStrings {
  return i18nStrings[locale] || i18nStrings[WidgetLocale.DE];
}

/**
 * Detect locale from document language
 */
export function detectLocale(): WidgetLocale {
  const docLang = document.documentElement.lang.toLowerCase();
  
  if (docLang.startsWith("en")) {
    return WidgetLocale.EN;
  }
  
  // Default to German
  return WidgetLocale.DE;
}
