import { FontSizeScalingMode } from "../enums/FontSizeScalingMode";

const PROBE_FONT_SIZE_PERCENT = 200;
const MIN_SCALED_RATIO = 1.75;
const MIN_SAMPLES = 3;
const MIN_SCALED_FRACTION = 0.5;

const TEXT_SAMPLE_SELECTORS = [
  "main p",
  "main li",
  "main a",
  "article p",
  "article li",
  "#main-content p",
  "#main-content li",
  "body > p",
  "h1",
  "h2",
  "h3",
  "h4",
].join(", ");

const WIDGET_EXCLUDE_SELECTOR =
  "[data-a11y-widget], .a11y-widget-trigger, .a11y-widget-dialog, .a11y-widget-backdrop";

function isInsideWidget(element: Element): boolean {
  return element.closest(WIDGET_EXCLUDE_SELECTOR) !== null;
}

function collectTextSampleElements(): HTMLElement[] {
  const elements = document.querySelectorAll<HTMLElement>(TEXT_SAMPLE_SELECTORS);
  const samples: HTMLElement[] = [];

  for (const element of elements) {
    if (isInsideWidget(element)) {
      continue;
    }
    samples.push(element);
    if (samples.length >= 24) {
      break;
    }
  }

  return samples;
}

function countElementsThatScaleWithRoot(
  samples: HTMLElement[],
  sizesBefore: number[],
  sizesAfter: number[]
): number {
  let scaledCount = 0;

  for (let index = 0; index < samples.length; index += 1) {
    const before = sizesBefore[index];
    const after = sizesAfter[index];

    if (before > 0 && after >= before * MIN_SCALED_RATIO) {
      scaledCount += 1;
    }
  }

  return scaledCount;
}

/**
 * Detect whether the page primarily uses rem/em (root scaling) or fixed px font sizes.
 */
export function detectFontSizeScalingMode(): FontSizeScalingMode {
  if (typeof document === "undefined") {
    return FontSizeScalingMode.REM_ROOT;
  }

  const html = document.documentElement;
  const samples = collectTextSampleElements();

  if (samples.length < MIN_SAMPLES) {
    return FontSizeScalingMode.REM_ROOT;
  }

  const previousInlineFontSize = html.style.fontSize;
  const sizesBefore = samples.map((element) =>
    parseFloat(getComputedStyle(element).fontSize)
  );

  html.style.fontSize = `${PROBE_FONT_SIZE_PERCENT}%`;

  const sizesAfter = samples.map((element) =>
    parseFloat(getComputedStyle(element).fontSize)
  );

  html.style.fontSize = previousInlineFontSize;

  const scaledCount = countElementsThatScaleWithRoot(
    samples,
    sizesBefore,
    sizesAfter
  );
  const scaledFraction = scaledCount / samples.length;

  if (scaledFraction >= MIN_SCALED_FRACTION) {
    return FontSizeScalingMode.REM_ROOT;
  }

  return FontSizeScalingMode.PX_ZOOM;
}
