import type { AccessibilitySettings } from "../AccessibilityWidget";

/**
 * Returns true when settings modify page rendering (excluding speech-only options).
 */
export function isVisualSettingsActive(settings: AccessibilitySettings): boolean {
  return (
    settings.fontSize !== 100 ||
    settings.fontFamily !== "default" ||
    settings.lineHeight !== "normal" ||
    settings.letterSpacing !== "normal" ||
    settings.contrastMode !== "normal" ||
    settings.colorBlindMode !== "none" ||
    settings.uiScale !== 100 ||
    settings.focusMode ||
    settings.reducedMotion
  );
}
