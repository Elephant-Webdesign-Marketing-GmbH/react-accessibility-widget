import type { AccessibilitySettings } from "../AccessibilityWidget";

/**
 * Payload for the `a11y-settings-change` custom event.
 * Host pages can use `forceDefaultCursor` to hide JS-based custom cursor elements.
 */
export interface A11ySettingsChangeDetail {
  settings: AccessibilitySettings;
  /** True when any visual/interaction setting differs from widget defaults. */
  isActive: boolean;
  /** True when the widget currently forces the system default cursor. */
  forceDefaultCursor: boolean;
}
