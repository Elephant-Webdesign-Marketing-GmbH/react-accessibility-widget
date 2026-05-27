import { ForceDefaultCursorMode } from "../enums/ForceDefaultCursorMode";
import type { AccessibilitySettings } from "../AccessibilityWidget";
import { isVisualSettingsActive } from "./isVisualSettingsActive";

/**
 * Determines whether the widget should override custom page cursors.
 */
export function resolveForceDefaultCursor(
  mode: ForceDefaultCursorMode | false | undefined,
  settings: AccessibilitySettings
): boolean {
  if (mode === ForceDefaultCursorMode.ALWAYS) {
    return true;
  }

  if (mode === ForceDefaultCursorMode.WHEN_ACTIVE) {
    return isVisualSettingsActive(settings);
  }

  return false;
}
