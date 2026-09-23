/**
 * Internationalization strings for the accessibility widget
 */

import { WidgetLocale } from "./enums/WidgetLocale";

export interface I18nStrings {
  // Trigger & Dialog
  triggerLabel: string;
  dialogTitle: string;
  dialogDescription: string;
  close: string;
  resetAll: string;
  version: string;

  // Text & Font Section
  textSectionTitle: string;
  fontSizeLabel: string;
  fontSizeDecrease: string;
  fontSizeIncrease: string;
  fontFamilyLabel: string;
  fontFamilyDefault: string;
  fontFamilyDyslexic: string;
  fontFamilyArial: string;
  fontFamilySerif: string;
  lineHeightLabel: string;
  lineHeightNormal: string;
  lineHeightRelaxed: string;
  lineHeightLoose: string;
  letterSpacingLabel: string;
  letterSpacingNormal: string;
  letterSpacingWide: string;
  letterSpacingWider: string;

  // Visual Section
  visualSectionTitle: string;
  contrastLabel: string;
  contrastNormal: string;
  contrastHigh: string;
  contrastDark: string;
  contrastYellowBlack: string;
  contrastHint: string;
  colorFilterLabel: string;
  colorFilterNone: string;
  colorFilterProtanopia: string;
  colorFilterDeuteranopia: string;
  colorFilterTritanopia: string;
  colorFilterHint: string;
  uiScaleLabel: string;
  uiScaleDecrease: string;
  uiScaleIncrease: string;
  uiScaleHint: string;

  // Interaction Section
  interactionSectionTitle: string;
  focusModeLabel: string;
  focusModeHint: string;
  reducedMotionLabel: string;
  reducedMotionHint: string;

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
  ttsStart: string;
  ttsPause: string;
  ttsResume: string;
  ttsStop: string;
  ttsModeGroupLabel: string;
  ttsModeAutoShort: string;
  ttsModeHighlightShort: string;
  ttsModeAuto: string;
  ttsModeHighlight: string;
  ttsSpeedGroupLabel: string;
  ttsSpeedSliderLabel: string;
  ttsControlLabel: string;
  ttsHideControls: string;

  // TTS Status Messages
  ttsNotSupported: string;
  ttsNoTextFound: string;
  ttsStarted: string;
  ttsPaused: string;
  ttsFinished: string;
  ttsError: string;
  ttsPauseNotSupported: string;

  // General
  enabled: string;
  disabled: string;
}

const deStrings: I18nStrings = {
  // Trigger & Dialog
  triggerLabel: "Barrierefreiheit-Einstellungen öffnen (Alt + A)",
  dialogTitle: "Barrierefreiheit",
  dialogDescription: "Passen Sie Darstellung und Funktionen an Ihre individuellen Bedürfnisse an",
  close: "Schließen",
  resetAll: "Alle Einstellungen zurücksetzen",
  version: "Version",

  // Text & Font Section
  textSectionTitle: "Text & Schrift",
  fontSizeLabel: "Schriftgröße",
  fontSizeDecrease: "Schrift verkleinern",
  fontSizeIncrease: "Schrift vergrößern",
  fontFamilyLabel: "Schriftart",
  fontFamilyDefault: "Standard",
  fontFamilyDyslexic: "Legasthenie-freundlich",
  fontFamilyArial: "Arial (serifenlos)",
  fontFamilySerif: "Serif (klassisch)",
  lineHeightLabel: "Zeilenabstand",
  lineHeightNormal: "Normal",
  lineHeightRelaxed: "Erhöht",
  lineHeightLoose: "Weit",
  letterSpacingLabel: "Zeichenabstand",
  letterSpacingNormal: "Normal",
  letterSpacingWide: "Weit",
  letterSpacingWider: "Sehr weit",

  // Visual Section
  visualSectionTitle: "Visuelle Anpassungen",
  contrastLabel: "Kontrastmodus",
  contrastNormal: "Normal",
  contrastHigh: "Hoher Kontrast",
  contrastDark: "Dunkelmodus",
  contrastYellowBlack: "Gelb/Schwarz",
  contrastHint: "Gelb/Schwarz ist besonders gut lesbar und schont die Augen",
  colorFilterLabel: "Farbfilter (Farbenblindheit)",
  colorFilterNone: "Kein Filter",
  colorFilterProtanopia: "Protanopie (Rot)",
  colorFilterDeuteranopia: "Deuteranopie (Grün)",
  colorFilterTritanopia: "Tritanopie (Blau)",
  colorFilterHint: "Passt Farben an, damit sie bei Farbenblindheit besser unterscheidbar sind",
  uiScaleLabel: "Bedienelemente skalieren (Buttons & Icons)",
  uiScaleDecrease: "Bedienelemente verkleinern",
  uiScaleIncrease: "Bedienelemente vergrößern",
  uiScaleHint: "Vergrößert Buttons, Icons und andere interaktive Elemente",

  // Interaction Section
  interactionSectionTitle: "Interaktion & Navigation",
  focusModeLabel: "Fokusmodus (Tastaturnavigation)",
  focusModeHint: "Hebt fokussierte Elemente deutlicher hervor, für eine bessere Tastaturnavigation",
  reducedMotionLabel: "Bewegungen reduzieren",
  reducedMotionHint: "Deaktiviert Animationen für bewegungsempfindliche Personen",

  // TTS Section
  ttsTitle: "Vorlesen",
  ttsReadAloudLabel: "Vorlesefunktion",
  ttsReadAloudHint: "Ermöglicht das Vorlesen von ausgewähltem Text oder der gesamten Seite",
  ttsSpeechRateLabel: "Sprechgeschwindigkeit",
  ttsSlower: "Langsamer",
  ttsFaster: "Schneller",
  ttsVoiceLabel: "Stimme",
  ttsVoiceDefault: "System-Standard",
  ttsReadTextLabel: "Text vorlesen",
  ttsStopReadingLabel: "Vorlesen stoppen",
  ttsReadHint: "Wählen Sie Text aus oder lassen Sie die gesamte Seite vorlesen. Die Steuerung erscheint beim Start.",

  // TTS Floating Controls
  ttsStart: "Vorlesen starten",
  ttsPause: "Pause",
  ttsResume: "Fortsetzen",
  ttsStop: "Stoppen",
  ttsModeGroupLabel: "Lesemodus",
  ttsModeAutoShort: "Auto",
  ttsModeHighlightShort: "Hervorheben",
  ttsModeAuto: "Automatisch vorlesen",
  ttsModeHighlight: "Mit Hervorhebung vorlesen",
  ttsSpeedGroupLabel: "Geschwindigkeit",
  ttsSpeedSliderLabel: "Vorlese-Geschwindigkeit",
  ttsControlLabel: "Vorlese-Steuerung",
  ttsHideControls: "Steuerung ausblenden",

  // TTS Status Messages
  ttsNotSupported: "Vorlesen wird von Ihrem Browser nicht unterstützt.",
  ttsNoTextFound: "Kein Text zum Vorlesen gefunden. Bitte wählen Sie Text aus.",
  ttsStarted: "Vorlesen gestartet",
  ttsPaused: "Pausiert",
  ttsFinished: "Vorlesen beendet",
  ttsError: "Fehler beim Vorlesen",
  ttsPauseNotSupported: "Pause wird von Ihrem Browser nicht vollständig unterstützt. Vorlesen wurde gestoppt.",

  // General
  enabled: "Aktiviert",
  disabled: "Deaktiviert",
};

const enStrings: I18nStrings = {
  // Trigger & Dialog
  triggerLabel: "Open Accessibility Settings (Alt + A)",
  dialogTitle: "Accessibility Settings",
  dialogDescription: "Customize the display and features to your individual needs",
  close: "Close",
  resetAll: "Reset All Settings",
  version: "Version",

  // Text & Font Section
  textSectionTitle: "Text & Font",
  fontSizeLabel: "Font Size",
  fontSizeDecrease: "Decrease font size",
  fontSizeIncrease: "Increase font size",
  fontFamilyLabel: "Font Family",
  fontFamilyDefault: "Default",
  fontFamilyDyslexic: "Dyslexia-Friendly",
  fontFamilyArial: "Arial (Sans-Serif)",
  fontFamilySerif: "Serif (Classic)",
  lineHeightLabel: "Line Height",
  lineHeightNormal: "Normal",
  lineHeightRelaxed: "Relaxed",
  lineHeightLoose: "Loose",
  letterSpacingLabel: "Letter Spacing",
  letterSpacingNormal: "Normal",
  letterSpacingWide: "Wide",
  letterSpacingWider: "Very Wide",

  // Visual Section
  visualSectionTitle: "Visual Adjustments",
  contrastLabel: "Contrast Mode",
  contrastNormal: "Normal",
  contrastHigh: "High Contrast",
  contrastDark: "Dark Mode",
  contrastYellowBlack: "Yellow/Black",
  contrastHint: "Yellow/Black is particularly readable and reduces eye strain",
  colorFilterLabel: "Color Filters (Color Blindness)",
  colorFilterNone: "No Filter",
  colorFilterProtanopia: "Protanopia (Red)",
  colorFilterDeuteranopia: "Deuteranopia (Green)",
  colorFilterTritanopia: "Tritanopia (Blue)",
  colorFilterHint: "Adjusts colors to make them more distinguishable for people with color blindness",
  uiScaleLabel: "UI Scaling (Buttons & Icons)",
  uiScaleDecrease: "Decrease UI elements",
  uiScaleIncrease: "Increase UI elements",
  uiScaleHint: "Enlarges buttons, icons, and other interactive elements",

  // Interaction Section
  interactionSectionTitle: "Interaction & Navigation",
  focusModeLabel: "Focus Mode (Keyboard Navigation)",
  focusModeHint: "Highlights focused elements more prominently for better keyboard navigation",
  reducedMotionLabel: "Reduce Motion",
  reducedMotionHint: "Disables animations for users sensitive to motion",

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
  ttsReadHint: "Select text or let the entire page be read aloud. Controls appear when reading starts.",

  // TTS Floating Controls
  ttsStart: "Start reading",
  ttsPause: "Pause",
  ttsResume: "Resume",
  ttsStop: "Stop",
  ttsModeGroupLabel: "Reading mode",
  ttsModeAutoShort: "Auto",
  ttsModeHighlightShort: "Highlight",
  ttsModeAuto: "Automatic reading",
  ttsModeHighlight: "Reading with highlighting",
  ttsSpeedGroupLabel: "Speed",
  ttsSpeedSliderLabel: "Reading speed",
  ttsControlLabel: "Read-aloud controls",
  ttsHideControls: "Hide controls",

  // TTS Status Messages
  ttsNotSupported: "Text-to-speech is not supported by your browser.",
  ttsNoTextFound: "No text found to read. Please select some text.",
  ttsStarted: "Reading started",
  ttsPaused: "Paused",
  ttsFinished: "Reading finished",
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
 * Detect locale from document language (defaults to German)
 */
export function detectLocale(): WidgetLocale {
  if (typeof document === "undefined") {
    return WidgetLocale.DE;
  }

  const docLang = document.documentElement.lang.toLowerCase();

  if (docLang.startsWith("en")) {
    return WidgetLocale.EN;
  }

  // Default to German
  return WidgetLocale.DE;
}
