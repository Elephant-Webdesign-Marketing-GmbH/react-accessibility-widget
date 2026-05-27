import { useEffect, useState, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import { createPortal } from "react-dom";
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
import { FontSizeScalingMode } from "./enums/FontSizeScalingMode";
import { SpeechReadMode } from "./enums/SpeechReadMode";
import { A11Y_WIDGET_Z_INDEX } from "./constants/A11yZIndex";
import { WIDGET_VERSION } from "./constants/WidgetVersion";
import { applyFontSizeScaling } from "./fontSize/applyFontSizeScaling";
import { detectFontSizeScalingMode } from "./fontSize/detectFontSizeScalingMode";
import { mapLanguageToBCP47 } from "./speech/speechSynthesisBrowserFixes";
import { SpeechFloatingControls } from "./speech/SpeechFloatingControls";
import { useSpeechSynthesis } from "./speech/useSpeechSynthesis";
import { SpeechSynthesisStatus } from "./speech/SpeechSynthesisStatus";

/**
 * Widget position on screen
 */
export type WidgetPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

/**
 * Imperative API exposed via ref
 */
export interface AccessibilityWidgetRef {
  /** Start text-to-speech with optional text */
  speak: (text?: string) => void;
  /** Stop text-to-speech */
  stop: () => void;
  /** Check if currently speaking */
  isSpeaking: () => boolean;
  /** Open the settings modal */
  openSettings: () => void;
  /** Close the settings modal */
  closeSettings: () => void;
}

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
  /** Default speech language (BCP-47 tag, e.g., "de-DE"). Falls back to document lang */
  defaultSpeechLang?: string;
  /** CSS selector for main content to read (default: "#main-content") */
  readContentSelector?: string;
  /**
   * Font size scaling strategy.
   * - "auto" (default): detect rem vs px once and pick the best approach
   * - FontSizeScalingMode.REM_ROOT: always scale via html font-size %
   * - FontSizeScalingMode.PX_ZOOM: always scale via page zoom (px fallback)
   */
  fontSizeScaling?: FontSizeScalingMode | "auto";
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
  speechLang: string;
  speechVoiceUri: string | null;
  speechReadMode: SpeechReadMode;
}

/**
 * Get default speech language from document or fallback
 */
function getDefaultSpeechLang(defaultSpeechLang?: string): string {
  if (defaultSpeechLang) {
    return defaultSpeechLang;
  }
  
  const docLang = document.documentElement.lang;
  if (docLang) {
    return mapLanguageToBCP47(docLang);
  }
  
  return "de-DE";
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
  speechLang: "de-DE",
  speechVoiceUri: null,
  speechReadMode: SpeechReadMode.AUTO,
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
export const AccessibilityWidget = forwardRef<AccessibilityWidgetRef, AccessibilityWidgetProps>(
  function AccessibilityWidget(
    {
      position = "bottom-right",
      offsetX = 24,
      offsetY = 24,
      defaultSpeechLang,
      readContentSelector = "#main-content",
      fontSizeScaling = "auto",
    }: AccessibilityWidgetProps = {},
    ref
  ) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [showFloatingControls, setShowFloatingControls] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<string>("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fontSizeScalingModeRef = useRef<FontSizeScalingMode | null>(null);

  const resolveFontSizeScalingMode = useCallback((): FontSizeScalingMode => {
    if (fontSizeScaling !== "auto") {
      return fontSizeScaling;
    }

    if (fontSizeScalingModeRef.current === null) {
      fontSizeScalingModeRef.current = detectFontSizeScalingMode();
    }

    return fontSizeScalingModeRef.current;
  }, [fontSizeScaling]);

  // Memoize callbacks to prevent infinite re-renders
  const handleStatusChange = useCallback((status: SpeechSynthesisStatus) => {
    if (status === SpeechSynthesisStatus.SPEAKING) {
      setSpeechStatus("Vorlesen gestartet");
    } else if (status === SpeechSynthesisStatus.PAUSED) {
      setSpeechStatus("Pausiert");
    } else if (status === SpeechSynthesisStatus.ERROR) {
      setSpeechStatus("Fehler beim Vorlesen");
    }
  }, []);

  const handleError = useCallback((error: string) => {
    setSpeechStatus(error);
  }, []);

  const handleComplete = useCallback(() => {
    setSpeechStatus("Vorlesen beendet");
  }, []);

  // Use the speech synthesis hook
  const speechSynthesis = useSpeechSynthesis({
    lang: settings.speechLang,
    rate: settings.speechRate,
    voiceUri: settings.speechVoiceUri,
    contentSelector: readContentSelector,
    onStatusChange: handleStatusChange,
    onError: handleError,
    onComplete: handleComplete,
  });

  // Extract stable functions for use in dependencies
  const { speak, stop, pause, resume, cacheSelection, isSpeaking, status, progress } = speechSynthesis;

  // Calculate position styles for widget button
  const getPositionStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};

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
    // On mobile, dialog is centered
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: 'calc(100vw - 2rem)',
        maxHeight: 'calc(100vh - 2rem)',
      };
    }

    // On desktop, position next to widget with viewport constraints
    const minSpacing = 16; // Minimum distance from viewport edge
    const widgetSize = 56;
    const dialogSpacing = 16;
    const dialogMaxWidth = 768; // 48rem = 768px
    const dialogMaxHeight = window.innerHeight * 0.85;
    
    const styles: React.CSSProperties = {
      position: 'absolute',
      maxWidth: `${dialogMaxWidth}px`,
      maxHeight: `${dialogMaxHeight}px`,
    };
    
    switch (position) {
      case "bottom-right": {
        // Position to the left of the widget
        const right = offsetX + widgetSize + dialogSpacing;
        // Ensure dialog doesn't go beyond left edge
        const maxRight = window.innerWidth - dialogMaxWidth - minSpacing;
        styles.right = `${Math.min(right, maxRight)}px`;
        
        // Position at the same bottom level as widget
        const bottom = offsetY;
        // Ensure dialog doesn't go beyond top edge
        const maxBottom = window.innerHeight - dialogMaxHeight - minSpacing;
        styles.bottom = `${Math.min(bottom, maxBottom)}px`;
        break;
      }
      case "bottom-left": {
        // Position to the right of the widget
        const left = offsetX + widgetSize + dialogSpacing;
        // Ensure dialog doesn't go beyond right edge
        const maxLeft = window.innerWidth - dialogMaxWidth - minSpacing;
        styles.left = `${Math.min(left, maxLeft)}px`;
        
        // Position at the same bottom level as widget
        const bottom = offsetY;
        const maxBottom = window.innerHeight - dialogMaxHeight - minSpacing;
        styles.bottom = `${Math.min(bottom, maxBottom)}px`;
        break;
      }
      case "top-right": {
        // Position to the left of the widget
        const right = offsetX + widgetSize + dialogSpacing;
        const maxRight = window.innerWidth - dialogMaxWidth - minSpacing;
        styles.right = `${Math.min(right, maxRight)}px`;
        
        // Position at the same top level as widget
        const top = offsetY;
        const maxTop = window.innerHeight - dialogMaxHeight - minSpacing;
        styles.top = `${Math.min(top, maxTop)}px`;
        break;
      }
      case "top-left": {
        // Position to the right of the widget
        const left = offsetX + widgetSize + dialogSpacing;
        const maxLeft = window.innerWidth - dialogMaxWidth - minSpacing;
        styles.left = `${Math.min(left, maxLeft)}px`;
        
        // Position at the same top level as widget
        const top = offsetY;
        const maxTop = window.innerHeight - dialogMaxHeight - minSpacing;
        styles.top = `${Math.min(top, maxTop)}px`;
        break;
      }
    }

    return styles;
  };

  // Ensure widget overlay stacks above host page UI
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--a11y-widget-z-index",
      String(A11Y_WIDGET_Z_INDEX)
    );
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AccessibilitySettings;
        
        // Ensure speechLang is set (migration for existing settings)
        if (!parsed.speechLang) {
          parsed.speechLang = getDefaultSpeechLang(defaultSpeechLang);
        }
        
        // Ensure speechReadMode is set (migration for existing settings)
        if (!parsed.speechReadMode) {
          parsed.speechReadMode = SpeechReadMode.AUTO;
        }
        
        setSettings(parsed);
        applySettings(parsed);
      } catch (error) {
        console.error("Failed to parse accessibility settings:", error);
      }
    } else {
      // First-time initialization: set default speechLang based on document or prop
      const initialSettings = {
        ...DEFAULT_SETTINGS,
        speechLang: getDefaultSpeechLang(defaultSpeechLang),
      };
      setSettings(initialSettings);
    }
  }, [defaultSpeechLang]);

  // Handle body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Cache selection before modal potentially clears it
      cacheSelection();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, cacheSelection]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // Keyboard shortcut to open/close widget: Alt + A
  // Keyboard shortcut for read-aloud: Alt + R
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A to toggle widget
      if (e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Alt + R to start/stop text-to-speech (only if feature is enabled)
      if (e.altKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        if (settings.textToSpeech) {
          if (isSpeaking) {
            stop();
          } else {
            speak();
          }
        }
      }
      // Escape to close widget
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, settings.textToSpeech, isSpeaking, stop, speak]);

  /**
   * Apply accessibility settings to the document
   */
  const applySettings = (newSettings: AccessibilitySettings) => {
    const html = document.documentElement;
    const body = document.body;

    // Font size (rem-root or px-zoom fallback)
    applyFontSizeScaling(
      html,
      newSettings.fontSize,
      resolveFontSizeScalingMode()
    );

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
    // Stop any ongoing speech
    stop();
    
    const resetDefaults = {
      ...DEFAULT_SETTINGS,
      speechLang: getDefaultSpeechLang(defaultSpeechLang),
    };
    
    setSettings(resetDefaults);
    applySettings(resetDefaults);
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
   * Toggle text-to-speech feature
   */
  const toggleTextToSpeech = () => {
    const newValue = !settings.textToSpeech;
    updateSettings({ textToSpeech: newValue });

    if (!newValue && isSpeaking) {
      stop();
    }
  };

  /**
   * Handle mode change in floating controls
   */
  const handleModeChange = (mode: SpeechReadMode) => {
    updateSettings({ speechReadMode: mode });
  };

  /**
   * Handle rate change in floating controls
   */
  const handleRateChange = (rate: number) => {
    updateSettings({ speechRate: rate });
  };

  // Expose imperative API via ref
  useImperativeHandle(ref, () => ({
    speak,
    stop,
    isSpeaking: () => isSpeaking,
    openSettings: () => setIsOpen(true),
    closeSettings: () => setIsOpen(false),
  }), [speak, stop, isSpeaking]);

  const portalTarget =
    typeof document !== "undefined" ? document.body : null;

  const widgetOverlay = (
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
        data-a11y-widget
      >
        <PersonStanding className="a11y-widget-trigger-icon" aria-hidden="true" />
      </button>

      {/* Dialog/Modal */}
      {isOpen && (
        <div
          className="a11y-widget-backdrop"
          onClick={(e) => {
            // Close when clicking backdrop
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
          data-a11y-widget
        >
          <div
            ref={modalRef}
            className="a11y-widget-dialog"
            style={getDialogStyles()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="a11y-widget-title"
            data-a11y-widget
          >
        <div className="a11y-widget-content">
          {/* Header */}
          <div className="a11y-widget-header">
            <div className="a11y-widget-header-title">
              <PersonStanding className="a11y-widget-header-icon" aria-hidden="true" />
              <h2 id="a11y-widget-title">Accessibility Settings</h2>
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
                      onClick={() => (isSpeaking ? stop() : speak())}
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
                      Select text or let the entire page be read aloud. Controls appear when reading starts.
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

            <p className="a11y-widget-version" aria-label={`Version ${WIDGET_VERSION}`}>
              v{WIDGET_VERSION}
            </p>
          </div>
        </div>
          </div>
        </div>
      )}

      {/* Floating Speech Controls - Show when TTS is enabled */}
      {settings.textToSpeech && !showFloatingControls && (
        <SpeechFloatingControls
          status={status}
          readMode={settings.speechReadMode}
          speechRate={settings.speechRate}
          progress={progress}
          onSpeak={speak}
          onPause={pause}
          onResume={resume}
          onStop={stop}
          onModeChange={handleModeChange}
          onRateChange={handleRateChange}
          onClose={() => setShowFloatingControls(true)}
          position={position}
        />
      )}
    </>
  );

  return (
    <>
      {/* aria-live region for status announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="a11y-sr-only"
      >
        {speechStatus}
      </div>

      {portalTarget ? createPortal(widgetOverlay, portalTarget) : widgetOverlay}

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
});
