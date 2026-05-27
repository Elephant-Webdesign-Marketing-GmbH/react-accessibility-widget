import { A11Y_SETTINGS_CHANGE_EVENT_NAME } from "../constants/A11ySettingsChangeEventName";
import type { A11ySettingsChangeDetail } from "../types/A11ySettingsChangeDetail";

export function dispatchA11ySettingsChange(detail: A11ySettingsChangeDetail): void {
  window.dispatchEvent(
    new CustomEvent<A11ySettingsChangeDetail>(A11Y_SETTINGS_CHANGE_EVENT_NAME, { detail })
  );
}
