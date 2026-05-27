/**
 * Strategy for applying font size adjustments to the host page.
 */
export enum FontSizeScalingMode {
  /** Scale via root font-size percentage (works for rem/em). */
  REM_ROOT = "rem-root",
  /** Scale via page zoom (fallback when content uses fixed px font sizes). */
  PX_ZOOM = "px-zoom",
}
