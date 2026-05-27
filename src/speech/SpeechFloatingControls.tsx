/**
 * Floating controls for text-to-speech functionality
 */

import { Pause, Play, Square, X } from "lucide-react";
import { SpeechReadMode } from "../enums/SpeechReadMode";
import { SpeechSynthesisStatus } from "./SpeechSynthesisStatus";
import { QueueProgress } from "./SpeechChunkQueue";

export interface SpeechFloatingControlsProps {
  /** Current speech status */
  status: SpeechSynthesisStatus;
  /** Current read mode */
  readMode: SpeechReadMode;
  /** Current speech rate (0.5 - 2.0) */
  speechRate: number;
  /** Current progress (optional) */
  progress?: QueueProgress;
  /** Callback to start speech */
  onSpeak: () => void;
  /** Callback to pause speech */
  onPause: () => void;
  /** Callback to resume speech */
  onResume: () => void;
  /** Callback to stop speech */
  onStop: () => void;
  /** Callback when mode changes */
  onModeChange: (mode: SpeechReadMode) => void;
  /** Callback when rate changes */
  onRateChange: (rate: number) => void;
  /** Callback when controls are closed */
  onClose: () => void;
  /** Position of the widget (to position controls accordingly) */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export function SpeechFloatingControls({
  status,
  readMode,
  speechRate,
  progress,
  onSpeak,
  onPause,
  onResume,
  onStop,
  onModeChange,
  onRateChange,
  onClose,
  position = "bottom-right",
}: SpeechFloatingControlsProps) {
  const isSpeaking = status === SpeechSynthesisStatus.SPEAKING;
  const isPaused = status === SpeechSynthesisStatus.PAUSED;
  const isIdle = status === SpeechSynthesisStatus.IDLE;
  const isActive = isSpeaking || isPaused;

  // Calculate position based on widget position
  const getPositionClass = () => {
    switch (position) {
      case "bottom-right":
        return "a11y-speech-floating-bottom-right";
      case "bottom-left":
        return "a11y-speech-floating-bottom-left";
      case "top-right":
        return "a11y-speech-floating-top-right";
      case "top-left":
        return "a11y-speech-floating-top-left";
      default:
        return "a11y-speech-floating-bottom-right";
    }
  };

  return (
    <div 
      className={`a11y-speech-floating-bar ${getPositionClass()}`}
      role="toolbar"
      aria-label="Vorlese-Steuerung"
      data-a11y-widget
    >
      {/* Play/Pause/Resume Button */}
      <button
        type="button"
        className="a11y-speech-control-btn"
        onClick={() => {
          if (isIdle) {
            onSpeak();
          } else if (isPaused) {
            onResume();
          } else if (isSpeaking) {
            onPause();
          }
        }}
        aria-label={isIdle ? "Vorlesen starten" : isPaused ? "Fortsetzen" : "Pause"}
        title={isIdle ? "Vorlesen starten" : isPaused ? "Fortsetzen" : "Pause"}
      >
        {isIdle || isPaused ? (
          <Play className="a11y-speech-control-icon" aria-hidden="true" />
        ) : (
          <Pause className="a11y-speech-control-icon" aria-hidden="true" />
        )}
      </button>

      {/* Stop Button - only when active */}
      {isActive && (
        <button
          type="button"
          className="a11y-speech-control-btn a11y-speech-control-stop"
          onClick={onStop}
          aria-label="Stoppen"
          title="Stoppen"
        >
          <Square className="a11y-speech-control-icon" aria-hidden="true" />
        </button>
      )}

      {/* Mode Toggle */}
      <div className="a11y-speech-mode-toggle" role="group" aria-label="Lesemodus">
        <button
          type="button"
          className={`a11y-speech-mode-btn ${readMode === SpeechReadMode.AUTO ? "active" : ""}`}
          onClick={() => onModeChange(SpeechReadMode.AUTO)}
          aria-pressed={readMode === SpeechReadMode.AUTO}
          title="Automatisch vorlesen"
        >
          Auto
        </button>
        <button
          type="button"
          className={`a11y-speech-mode-btn ${readMode === SpeechReadMode.HIGHLIGHT ? "active" : ""}`}
          onClick={() => onModeChange(SpeechReadMode.HIGHLIGHT)}
          aria-pressed={readMode === SpeechReadMode.HIGHLIGHT}
          title="Mit Hervorhebung vorlesen"
        >
          Highlight
        </button>
      </div>

      {/* Progress Indicator */}
      {progress && progress.total > 1 && isActive && (
        <span className="a11y-speech-progress" aria-live="polite">
          {progress.current} / {progress.total}
        </span>
      )}

      {/* Speed Control */}
      <div className="a11y-speech-speed-control" role="group" aria-label="Geschwindigkeit">
        <label htmlFor="speech-rate-slider" className="a11y-speech-speed-label">
          {speechRate.toFixed(1)}x
        </label>
        <input
          id="speech-rate-slider"
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={speechRate}
          onChange={(e) => onRateChange(parseFloat(e.target.value))}
          className="a11y-speech-speed-slider"
          aria-label="Vorlese-Geschwindigkeit"
          title={`Geschwindigkeit: ${speechRate.toFixed(1)}x`}
        />
      </div>

      {/* Close Button */}
      <button
        type="button"
        className="a11y-speech-control-btn a11y-speech-control-close"
        onClick={onClose}
        aria-label="Steuerung ausblenden"
        title="Steuerung ausblenden"
      >
        <X className="a11y-speech-control-icon" aria-hidden="true" />
      </button>
    </div>
  );
}
