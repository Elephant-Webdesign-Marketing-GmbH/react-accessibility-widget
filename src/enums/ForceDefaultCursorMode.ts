/**
 * Controls when the widget overrides custom page cursors with system defaults.
 */
export enum ForceDefaultCursorMode {
  /** Force system cursor only while visual a11y settings differ from defaults. */
  WHEN_ACTIVE = "when-active",
  /** Always force system cursor while the widget is mounted. */
  ALWAYS = "always",
}
