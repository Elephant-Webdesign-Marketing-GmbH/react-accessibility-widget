import { FontSizeScalingMode } from "../enums/FontSizeScalingMode";

const PAGE_ZOOM_CSS_VAR = "--a11y-page-zoom";
const PX_ZOOM_CLASS = "a11y-font-px-zoom";

/**
 * Apply font size scaling using rem-root or px-zoom fallback strategy.
 */
export function applyFontSizeScaling(
  html: HTMLElement,
  fontSizePercent: number,
  mode: FontSizeScalingMode
): void {
  const scale = fontSizePercent / 100;

  if (mode === FontSizeScalingMode.PX_ZOOM) {
    html.style.fontSize = "";

    if (fontSizePercent === 100) {
      html.classList.remove(PX_ZOOM_CLASS);
      html.style.removeProperty(PAGE_ZOOM_CSS_VAR);
      return;
    }

    html.classList.add(PX_ZOOM_CLASS);
    html.style.setProperty(PAGE_ZOOM_CSS_VAR, String(scale));
    return;
  }

  html.classList.remove(PX_ZOOM_CLASS);
  html.style.removeProperty(PAGE_ZOOM_CSS_VAR);

  if (fontSizePercent === 100) {
    html.style.fontSize = "";
  } else {
    html.style.fontSize = `${fontSizePercent}%`;
  }
}
