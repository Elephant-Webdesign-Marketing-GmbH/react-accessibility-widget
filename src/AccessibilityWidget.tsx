import { useEffect, useState, useRef } from "react";
import {
  X,
  PersonStanding,
  Type,
  Contrast,
  ZoomIn,
  ZoomOut,
  Focus,
  Maximize2,
  Eye,
  Volume2,
  VolumeX,
  AlignLeft,
  Palette,
} from "lucide-react";
import "./styles.css";

/**
 * Widget position on screen
 */
export type WidgetPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

/**
 * Widget props for customization
 */
export interface AccessibilityWidgetProps {
  /** Position of the floating button (default: "bottom-right") */
  position?: WidgetPosition;
  /** Horizontal offset in pixels (default: 24) */
  offsetX?: number;
  /** Vertical offset in pixels (default: 24) */
  offsetY?: number;
}

/**
 * Accessibility settings that can be persisted
 */
export interface AccessibilitySettings {
  // Text & Font
  fontSize: number;
  fontFamily: "default" | "dyslexic" | "arial" | "serif";
  lineHeight: "normal" | "relaxed" | "loose";
  letterSpacing: "normal" | "wide" | "wider";

  // Visual
  contrastMode: "normal" | "high" | "dark" | "yellow-black";
  colorBlindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia";
  uiScale: number;

  // Interaction
  focusMode: boolean;
  reducedMotion: boolean;

  // Audio
  textToSpeech: boolean;
  speechRate: number;
}

/**
 * Default accessibility settings
 */
const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 100,
  fontFamily: "default",
  lineHeight: "normal",
  letterSpacing: "normal",
  contrastMode: "normal",
  colorBlindMode: "none",
  uiScale: 100,
  focusMode: false,
  reducedMotion: false,
  textToSpeech: false,
  speechRate: 1,
};

/**
 * Local storage key for persisting settings
 */
const STORAGE_KEY = "accessibility-settings";

/**
 * AccessibilityWidget Component
 *
 * A comprehensive accessibility widget with 16+ features:
 *
 * TEXT & FONT:
 * - Adjust font size (80-150%)
 * - Dyslexia-friendly fonts
 * - Adjust line height
 * - Adjust letter spacing
 *
 * VISUAL:
 * - Contrast modes (Normal, High, Dark, Yellow/Black)
 * - Color filters for color blindness (Protanopia, Deuteranopia, Tritanopia)
 * - UI scaling (Enlarge buttons, icons)
 *
 * INTERACTION:
 * - Focus mode for keyboard navigation
 * - Reduce motion
 * - Full keyboard operability
 *
 * AUDIO:
 * - Text-to-speech function
 * - Adjust speech rate
 *
 * All settings are saved in localStorage and restored on next visit.
 */
export function AccessibilityWidget({
  position = "bottom-right",
  offsetX = 24,
  offsetY = 24,
}: AccessibilityWidgetProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isCancelledRef = useRef(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Calculate position styles for widget button
  const getPositionStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      position: "fixed",
      zIndex: 9999,
    };

    switch (position) {
      case "bottom-right":
        styles.right = `${offsetX}px`;
        styles.bottom = `${offsetY}px`;
        break;
      case "bottom-left":
        styles.left = `${offsetX}px`;
        styles.bottom = `${offsetY}px`;
        break;
      case "top-right":
        styles.right = `${offsetX}px`;
        styles.top = `${offsetY}px`;
        break;
      case "top-left":
        styles.left = `${offsetX}px`;
        styles.top = `${offsetY}px`;
        break;
    }

    return styles;
  };

  // Calculate position styles for dialog (next to widget)
  const getDialogStyles = (): React.CSSProperties => {
    // On mobile, center the dialog
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return {
        margin: "1rem auto",
      };
    }

    // On desktop, position next to widget with viewport constraints
    const styles: React.CSSProperties = {};
    const minSpacing = 16; // Minimum spacing from viewport edge
    const widgetSize = 56; // Widget button size
    const dialogSpacing = 16; // Space between widget and dialog
    
    switch (position) {
      case "bottom-right":
        styles.marginLeft = "auto";
        styles.marginRight = `clamp(${minSpacing}px, ${offsetX + widgetSize + dialogSpacing}px, calc(100vw - 48rem - ${minSpacing}px))`;
        styles.marginBottom = `clamp(${minSpacing}px, ${offsetY}px, calc(100vh - 85vh - ${minSpacing}px))`;
        styles.marginTop = `clamp(${minSpacing}px, auto, calc(100vh - 85vh - ${minSpacing}px))`;
        break;
      case "bottom-left":
        styles.marginRight = "auto";
        styles.marginLeft = `clamp(${minSpacing}px, ${offsetX + widgetSize + dialogSpacing}px, calc(100vw - 48rem - ${minSpacing}px))`;
        styles.marginBottom = `clamp(${minSpacing}px, ${offsetY}px, calc(100vh - 85vh - ${minSpacing}px))`;
        styles.marginTop = `clamp(${minSpacing}px, auto, calc(100vh - 85vh - ${minSpacing}px))`;
        break;
      case "top-right":
        styles.marginLeft = "auto";
        styles.marginRight = `clamp(${minSpacing}px, ${offsetX + widgetSize + dialogSpacing}px, calc(100vw - 48rem - ${minSpacing}px))`;
        styles.marginTop = `clamp(${minSpacing}px, ${offsetY}px, calc(100vh - 85vh - ${minSpacing}px))`;
        styles.marginBottom = `clamp(${minSpacing}px, auto, calc(100vh - 85vh - ${minSpacing}px))`;
        break;
      case "top-left":
        styles.marginRight = "auto";
        styles.marginLeft = `clamp(${minSpacing}px, ${offsetX + widgetSize + dialogSpacing}px, calc(100vw - 48rem - ${minSpacing}px))`;
        styles.marginTop = `clamp(${minSpacing}px, ${offsetY}px, calc(100vh - 85vh - ${minSpacing}px))`;
        styles.marginBottom = `clamp(${minSpacing}px, auto, calc(100vh - 85vh - ${minSpacing}px))`;
        break;
    }

    return styles;
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AccessibilitySettings;
        setSettings(parsed);
        applySettings(parsed);
      } catch (error) {
        console.error("Failed to parse accessibility settings:", error);
      }
    }
  }, []);

  // Manage dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Keyboard shortcut to open/close widget: Alt + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A to toggle widget
      if (e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Escape to close widget
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  /**
   * Apply accessibility settings to the document
   */
  const applySettings = (newSettings: AccessibilitySettings) => {
    const html = document.documentElement;
    const body = document.body;

    // Font size
    html.style.fontSize = `${newSettings.fontSize}%`;

    // Font family
    html.classList.remove("a11y-font-dyslexic", "a11y-font-arial", "a11y-font-serif");
    if (newSettings.fontFamily === "dyslexic") {
      html.classList.add("a11y-font-dyslexic");
    } else if (newSettings.fontFamily === "arial") {
      html.classList.add("a11y-font-arial");
    } else if (newSettings.fontFamily === "serif") {
      html.classList.add("a11y-font-serif");
    }

    // Line height
    html.classList.remove("a11y-line-height-relaxed", "a11y-line-height-loose");
    if (newSettings.lineHeight === "relaxed") {
      html.classList.add("a11y-line-height-relaxed");
    } else if (newSettings.lineHeight === "loose") {
      html.classList.add("a11y-line-height-loose");
    }

    // Letter spacing
    html.classList.remove("a11y-letter-spacing-wide", "a11y-letter-spacing-wider");
    if (newSettings.letterSpacing === "wide") {
      html.classList.add("a11y-letter-spacing-wide");
    } else if (newSettings.letterSpacing === "wider") {
      html.classList.add("a11y-letter-spacing-wider");
    }

    // Contrast mode
    html.classList.remove(
      "a11y-contrast-high",
      "a11y-contrast-dark",
      "a11y-contrast-yellow-black"
    );
    if (newSettings.contrastMode === "high") {
      html.classList.add("a11y-contrast-high");
    } else if (newSettings.contrastMode === "dark") {
      html.classList.add("a11y-contrast-dark");
    } else if (newSettings.contrastMode === "yellow-black") {
      html.classList.add("a11y-contrast-yellow-black");
    }

    // Color blind mode
    html.classList.remove(
      "a11y-colorblind-protanopia",
      "a11y-colorblind-deuteranopia",
      "a11y-colorblind-tritanopia"
    );
    if (newSettings.colorBlindMode === "protanopia") {
      html.classList.add("a11y-colorblind-protanopia");
    } else if (newSettings.colorBlindMode === "deuteranopia") {
      html.classList.add("a11y-colorblind-deuteranopia");
    } else if (newSettings.colorBlindMode === "tritanopia") {
      html.classList.add("a11y-colorblind-tritanopia");
    }

    // UI Scale
    body.style.setProperty("--a11y-ui-scale", `${newSettings.uiScale / 100}`);

    // Focus mode
    if (newSettings.focusMode) {
      html.classList.add("a11y-focus-mode");
    } else {
      html.classList.remove("a11y-focus-mode");
    }

    // Reduced motion
    if (newSettings.reducedMotion) {
      html.classList.add("a11y-reduce-motion");

      // Create or update a style element to force disable all animations immediately
      let styleElement = document.getElementById("a11y-reduce-motion-override");
      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = "a11y-reduce-motion-override";
        document.head.appendChild(styleElement);
      }

      styleElement.textContent = `
        /* Force disable all animations and transitions */
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
        
        /* Disable Framer Motion animations */
        [style*="transform"],
        [style*="opacity"],
        [data-framer-component-type] {
          animation: none !important;
          transition: none !important;
        }
      `;
    } else {
      html.classList.remove("a11y-reduce-motion");

      // Remove the override style element
      const styleElement = document.getElementById("a11y-reduce-motion-override");
      if (styleElement) {
        styleElement.remove();
      }
    }
  };

  /**
   * Update settings and persist to localStorage
   */
  const updateSettings = (partial: Partial<AccessibilitySettings>) => {
    const newSettings = { ...settings, ...partial };
    const oldSettings = settings;

    setSettings(newSettings);
    applySettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));

    // If reducedMotion was toggled, reload page to ensure animations don't start
    if (
      partial.reducedMotion !== undefined &&
      partial.reducedMotion !== oldSettings.reducedMotion
    ) {
      // Small delay to ensure settings are saved
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  };

  /**
   * Reset all settings to default
   */
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    applySettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  };

  /**
   * Increase font size by 10%
   */
  const increaseFontSize = () => {
    const newSize = Math.min(settings.fontSize + 10, 150);
    updateSettings({ fontSize: newSize });
  };

  /**
   * Decrease font size by 10%
   */
  const decreaseFontSize = () => {
    const newSize = Math.max(settings.fontSize - 10, 80);
    updateSettings({ fontSize: newSize });
  };

  /**
   * Increase UI scale by 10%
   */
  const increaseUIScale = () => {
    const newScale = Math.min(settings.uiScale + 10, 150);
    updateSettings({ uiScale: newScale });
  };

  /**
   * Decrease UI scale by 10%
   */
  const decreaseUIScale = () => {
    const newScale = Math.max(settings.uiScale - 10, 80);
    updateSettings({ uiScale: newScale });
  };

  /**
   * Text-to-Speech: Speak selected text or entire page
   */
  const speakText = (text?: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported by your browser.");
      return;
    }

    // Stop current speech if speaking
    if (isSpeaking) {
      isCancelledRef.current = true;
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Reset cancelled flag
    isCancelledRef.current = false;

    // Get text to speak
    let textToSpeak = text;
    if (!textToSpeak) {
      const selection = window.getSelection();
      textToSpeak = selection?.toString() || "";

      // If no selection, speak the main content
      if (!textToSpeak) {
        const mainContent = document.getElementById("main-content");
        textToSpeak = mainContent?.innerText || document.body.innerText;
      }
    }

    if (!textToSpeak) {
      alert("No text found to read. Please select some text.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "en-US";
    utterance.rate = settings.speechRate;

    utterance.onend = () => {
      setIsSpeaking(false);
      isCancelledRef.current = false;
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      // Only show error if it wasn't a manual cancellation
      if (!isCancelledRef.current) {
        console.error("Speech synthesis error:", event);
        alert("Error reading text.");
      }
      isCancelledRef.current = false;
    };

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  /**
   * Stop text-to-speech
   */
  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      isCancelledRef.current = true;
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  /**
   * Toggle text-to-speech feature
   */
  const toggleTextToSpeech = () => {
    const newValue = !settings.textToSpeech;
    updateSettings({ textToSpeech: newValue });

    if (!newValue && isSpeaking) {
      stopSpeaking();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        ref={triggerRef}
        type="button"
        className="a11y-widget-trigger"
        style={getPositionStyles()}
        onClick={() => setIsOpen(true)}
        aria-label="Open Accessibility Settings (Alt + A)"
        title="Open Accessibility Settings (Alt + A)"
      >
        <PersonStanding className="a11y-widget-trigger-icon" aria-hidden="true" />
      </button>

      {/* Dialog/Modal */}
      <dialog
        ref={dialogRef}
        className="a11y-widget-dialog"
        style={getDialogStyles()}
        onClose={() => setIsOpen(false)}
        onClick={(e) => {
          // Close when clicking backdrop
          if (e.target === dialogRef.current) {
            setIsOpen(false);
          }
        }}
      >
        <div className="a11y-widget-content">
          {/* Header */}
          <div className="a11y-widget-header">
            <div className="a11y-widget-header-title">
              <PersonStanding className="a11y-widget-header-icon" aria-hidden="true" />
              <h2>Accessibility Settings</h2>
            </div>
            <button
              type="button"
              className="a11y-widget-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <X className="a11y-icon" aria-hidden="true" />
            </button>
          </div>
          <p className="a11y-widget-description">
            Customize the display and features to your individual needs
          </p>

          {/* Scrollable Content */}
          <div className="a11y-widget-scroll-area">
            {/* Section: Text & Font */}
            <div className="a11y-widget-section">
              <h3 className="a11y-widget-section-title">
                <Type className="a11y-section-icon" aria-hidden="true" />
                Text & Font
              </h3>

              {/* Font Size */}
              <div className="a11y-widget-control">
                <label className="a11y-widget-label">Font Size</label>
                <div className="a11y-widget-control-row">
                  <button
                    type="button"
                    className="a11y-btn a11y-btn-outline"
                    onClick={decreaseFontSize}
                    disabled={settings.fontSize <= 80}
                    aria-label="Decrease font size"
                  >
                    <ZoomOut className="a11y-icon" aria-hidden="true" />
                  </button>
                  <span className="a11y-widget-value" aria-live="polite">
                    {settings.fontSize}%
                  </span>
                  <button
                    type="button"
                    className="a11y-btn a11y-btn-outline"
                    onClick={increaseFontSize}
                    disabled={settings.fontSize >= 150}
                    aria-label="Increase font size"
                  >
                    <ZoomIn className="a11y-icon" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Font Family */}
              <div className="a11y-widget-control">
                <label className="a11y-widget-label">Font Family</label>
                <div className="a11y-widget-button-grid">
                  <button
                    type="button"
                    className={`a11y-btn ${settings.fontFamily === "default" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ fontFamily: "default" })}
                    aria-pressed={settings.fontFamily === "default"}
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    className={`a11y-btn ${settings.fontFamily === "dyslexic" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ fontFamily: "dyslexic" })}
                    aria-pressed={settings.fontFamily === "dyslexic"}
                  >
                    Dyslexia-Friendly
                  </button>
                  <button
                    type="button"
                    className={`a11y-btn ${settings.fontFamily === "arial" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ fontFamily: "arial" })}
                    aria-pressed={settings.fontFamily === "arial"}
                  >
                    Arial (Sans-Serif)
                  </button>
                  <button
                    type="button"
                    className={`a11y-btn ${settings.fontFamily === "serif" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ fontFamily: "serif" })}
                    aria-pressed={settings.fontFamily === "serif"}
                  >
                    Serif (Classic)
                  </button>
                </div>
              </div>

              {/* Line Height */}
              <div className="a11y-widget-control">
                <label className="a11y-widget-label">
                  <AlignLeft className="a11y-label-icon" aria-hidden="true" />
                  Line Height
                </label>
                <div className="a11y-widget-button-grid a11y-widget-button-grid-3">
                  <button
                    type="button"
                    className={`a11y-btn ${settings.lineHeight === "normal" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ lineHeight: "normal" })}
                    aria-pressed={settings.lineHeight === "normal"}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    className={`a11y-btn ${settings.lineHeight === "relaxed" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ lineHeight: "relaxed" })}
                    aria-pressed={settings.lineHeight === "relaxed"}
                  >
                    Relaxed
                  </button>
                  <button
                    type="button"
                    className={`a11y-btn ${settings.lineHeight === "loose" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ lineHeight: "loose" })}
                    aria-pressed={settings.lineHeight === "loose"}
                  >
                    Loose
                  </button>
                </div>
              </div>

              {/* Letter Spacing */}
              <div className="a11y-widget-control">
                <label className="a11y-widget-label">Letter Spacing</label>
                <div className="a11y-widget-button-grid a11y-widget-button-grid-3">
                  <button
                    type="button"
                    className={`a11y-btn ${settings.letterSpacing === "normal" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ letterSpacing: "normal" })}
                    aria-pressed={settings.letterSpacing === "normal"}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    className={`a11y-btn ${settings.letterSpacing === "wide" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ letterSpacing: "wide" })}
                    aria-pressed={settings.letterSpacing === "wide"}
                  >
                    Wide
                  </button>
                  <button
                    type="button"
                    className={`a11y-btn ${settings.letterSpacing === "wider" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ letterSpacing: "wider" })}
                    aria-pressed={settings.letterSpacing === "wider"}
                  >
                    Very Wide
                  </button>
                </div>
              </div>
            </div>

            <hr className="a11y-separator" />

            {/* Section: Visual */}
            <div className="a11y-widget-section">
              <h3 className="a11y-widget-section-title">
                <Eye className="a11y-section-icon" aria-hidden="true" />
                Visual Adjustments
              </h3>

              {/* Contrast Mode */}
              <div className="a11y-widget-control">
                <label className="a11y-widget-label">
                  <Contrast className="a11y-label-icon" aria-hidden="true" />
                  Contrast Mode
                </label>
                <div className="a11y-widget-button-grid">
                  <button
                    type="button"
                    className={`a11y-btn ${settings.contrastMode === "normal" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ contrastMode: "normal" })}
                    aria-pressed={settings.contrastMode === "normal"}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    className={`a11y-btn ${settings.contrastMode === "high" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ contrastMode: "high" })}
                    aria-pressed={settings.contrastMode === "high"}
                  >
                    High Contrast
                  </button>
                  <button
                    type="button"
                    className={`a11y-btn ${settings.contrastMode === "dark" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ contrastMode: "dark" })}
                    aria-pressed={settings.contrastMode === "dark"}
                  >
                    Dark Mode
                  </button>
                  <button
                    type="button"
                    className={`a11y-btn ${settings.contrastMode === "yellow-black" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ contrastMode: "yellow-black" })}
                    aria-pressed={settings.contrastMode === "yellow-black"}
                  >
                    Yellow/Black
                  </button>
                </div>
                <p className="a11y-widget-hint">
                  Yellow/Black is particularly readable and reduces eye strain
                </p>
              </div>

              {/* Color Blind Mode */}
              <div className="a11y-widget-control">
                <label className="a11y-widget-label">
                  <Palette className="a11y-label-icon" aria-hidden="true" />
                  Color Filters (Color Blindness)
                </label>
                <div className="a11y-widget-button-grid">
                  <button
                    type="button"
                    className={`a11y-btn ${settings.colorBlindMode === "none" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ colorBlindMode: "none" })}
                    aria-pressed={settings.colorBlindMode === "none"}
                  >
                    No Filter
                  </button>
                  <button
                    type="button"
                    className={`a11y-btn ${settings.colorBlindMode === "protanopia" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ colorBlindMode: "protanopia" })}
                    aria-pressed={settings.colorBlindMode === "protanopia"}
                  >
                    Protanopia (Red)
                  </button>
                  <button
                    type="button"
                    className={`a11y-btn ${settings.colorBlindMode === "deuteranopia" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ colorBlindMode: "deuteranopia" })}
                    aria-pressed={settings.colorBlindMode === "deuteranopia"}
                  >
                    Deuteranopia (Green)
                  </button>
                  <button
                    type="button"
                    className={`a11y-btn ${settings.colorBlindMode === "tritanopia" ? "a11y-btn-active" : "a11y-btn-outline"}`}
                    onClick={() => updateSettings({ colorBlindMode: "tritanopia" })}
                    aria-pressed={settings.colorBlindMode === "tritanopia"}
                  >
                    Tritanopia (Blue)
                  </button>
                </div>
                <p className="a11y-widget-hint">
                  Adjusts colors to make them more distinguishable for people with color blindness
                </p>
              </div>

              {/* UI Scale */}
              <div className="a11y-widget-control">
                <label className="a11y-widget-label">
                  <Maximize2 className="a11y-label-icon" aria-hidden="true" />
                  UI Scaling (Buttons & Icons)
                </label>
                <div className="a11y-widget-control-row">
                  <button
                    type="button"
                    className="a11y-btn a11y-btn-outline"
                    onClick={decreaseUIScale}
                    disabled={settings.uiScale <= 80}
                    aria-label="Decrease UI elements"
                  >
                    <ZoomOut className="a11y-icon" aria-hidden="true" />
                  </button>
                  <span className="a11y-widget-value" aria-live="polite">
                    {settings.uiScale}%
                  </span>
                  <button
                    type="button"
                    className="a11y-btn a11y-btn-outline"
                    onClick={increaseUIScale}
                    disabled={settings.uiScale >= 150}
                    aria-label="Increase UI elements"
                  >
                    <ZoomIn className="a11y-icon" aria-hidden="true" />
                  </button>
                </div>
                <p className="a11y-widget-hint">
                  Enlarges buttons, icons, and other interactive elements
                </p>
              </div>
            </div>

            <hr className="a11y-separator" />

            {/* Section: Interaction */}
            <div className="a11y-widget-section">
              <h3 className="a11y-widget-section-title">
                <Focus className="a11y-section-icon" aria-hidden="true" />
                Interaction & Navigation
              </h3>

              {/* Focus Mode */}
              <div className="a11y-widget-control">
                <label className="a11y-widget-label">Focus Mode (Keyboard Navigation)</label>
                <button
                  type="button"
                  className={`a11y-btn a11y-btn-full ${settings.focusMode ? "a11y-btn-active" : "a11y-btn-outline"}`}
                  onClick={() => updateSettings({ focusMode: !settings.focusMode })}
                  aria-pressed={settings.focusMode}
                >
                  {settings.focusMode ? "Enabled" : "Disabled"}
                </button>
                <p className="a11y-widget-hint">
                  Highlights focused elements more prominently for better keyboard navigation
                </p>
              </div>

              {/* Reduced Motion */}
              <div className="a11y-widget-control">
                <label className="a11y-widget-label">Reduce Motion</label>
                <button
                  type="button"
                  className={`a11y-btn a11y-btn-full ${settings.reducedMotion ? "a11y-btn-active" : "a11y-btn-outline"}`}
                  onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
                  aria-pressed={settings.reducedMotion}
                >
                  {settings.reducedMotion ? "Enabled" : "Disabled"}
                </button>
                <p className="a11y-widget-hint">
                  Disables animations for users sensitive to motion
                </p>
              </div>
            </div>

            <hr className="a11y-separator" />

            {/* Section: Audio */}
            <div className="a11y-widget-section">
              <h3 className="a11y-widget-section-title">
                <Volume2 className="a11y-section-icon" aria-hidden="true" />
                Text-to-Speech
              </h3>

              {/* Text to Speech Toggle */}
              <div className="a11y-widget-control">
                <label className="a11y-widget-label">Read Aloud Feature</label>
                <button
                  type="button"
                  className={`a11y-btn a11y-btn-full ${settings.textToSpeech ? "a11y-btn-active" : "a11y-btn-outline"}`}
                  onClick={toggleTextToSpeech}
                  aria-pressed={settings.textToSpeech}
                >
                  {settings.textToSpeech ? "Enabled" : "Disabled"}
                </button>
                <p className="a11y-widget-hint">
                  Enables reading of selected text or the entire page
                </p>
              </div>

              {/* Speech Controls - Only show when enabled */}
              {settings.textToSpeech && (
                <>
                  {/* Speech Rate */}
                  <div className="a11y-widget-control">
                    <label className="a11y-widget-label">Speech Rate</label>
                    <div className="a11y-widget-control-row">
                      <button
                        type="button"
                        className="a11y-btn a11y-btn-outline"
                        onClick={() =>
                          updateSettings({
                            speechRate: Math.max(0.5, settings.speechRate - 0.25),
                          })
                        }
                        disabled={settings.speechRate <= 0.5}
                        aria-label="Slower"
                      >
                        Slower
                      </button>
                      <span className="a11y-widget-value">{settings.speechRate}x</span>
                      <button
                        type="button"
                        className="a11y-btn a11y-btn-outline"
                        onClick={() =>
                          updateSettings({
                            speechRate: Math.min(2, settings.speechRate + 0.25),
                          })
                        }
                        disabled={settings.speechRate >= 2}
                        aria-label="Faster"
                      >
                        Faster
                      </button>
                    </div>
                  </div>

                  {/* Speak Button */}
                  <div className="a11y-widget-control">
                    <button
                      type="button"
                      className={`a11y-btn a11y-btn-full ${isSpeaking ? "a11y-btn-destructive" : "a11y-btn-active"}`}
                      onClick={() => (isSpeaking ? stopSpeaking() : speakText())}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="a11y-btn-icon" aria-hidden="true" />
                          Stop Reading
                        </>
                      ) : (
                        <>
                          <Volume2 className="a11y-btn-icon" aria-hidden="true" />
                          Read Text
                        </>
                      )}
                    </button>
                    <p className="a11y-widget-hint">
                      Select text or let the entire page be read aloud
                    </p>
                  </div>
                </>
              )}
            </div>

            <hr className="a11y-separator" />

            {/* Reset Button */}
            <div className="a11y-widget-section">
              <button
                type="button"
                className="a11y-btn a11y-btn-outline a11y-btn-full"
                onClick={resetSettings}
              >
                Reset All Settings
              </button>
            </div>
          </div>
        </div>
      </dialog>

      {/* SVG Color Blind Filters */}
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
        <defs>
          {/* Protanopia Filter */}
          <filter id="a11y-protanopia-filter">
            <feColorMatrix
              type="matrix"
              values="
              0.567, 0.433, 0,     0, 0
              0.558, 0.442, 0,     0, 0
              0,     0.242, 0.758, 0, 0
              0,     0,     0,     1, 0"
            />
          </filter>

          {/* Deuteranopia Filter */}
          <filter id="a11y-deuteranopia-filter">
            <feColorMatrix
              type="matrix"
              values="
              0.625, 0.375, 0,   0, 0
              0.7,   0.3,   0,   0, 0
              0,     0.3,   0.7, 0, 0
              0,     0,     0,   1, 0"
            />
          </filter>

          {/* Tritanopia Filter */}
          <filter id="a11y-tritanopia-filter">
            <feColorMatrix
              type="matrix"
              values="
              0.95, 0.05,  0,     0, 0
              0,    0.433, 0.567, 0, 0
              0,    0.475, 0.525, 0, 0
              0,    0,     0,     1, 0"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
}
