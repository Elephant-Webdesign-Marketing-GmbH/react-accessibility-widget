/**
 * Extract readable text from the page for text-to-speech
 */

export interface TextExtractionOptions {
  /** Explicit text to read */
  text?: string;
  /** Cached selection (from before modal opened) */
  cachedSelection?: string;
  /** CSS selector for main content (default: "#main-content") */
  contentSelector?: string;
  /** Elements to exclude (e.g., navigation, footer) */
  excludeSelectors?: string[];
}

/**
 * Default selectors to exclude from text extraction
 */
const DEFAULT_EXCLUDE_SELECTORS = [
  '[data-a11y-widget]',
  '[aria-hidden="true"]',
  'script',
  'style',
  'nav',
  '[role="navigation"]',
  '[role="banner"]',
  '[role="contentinfo"]',
  'header',
  'footer',
  '.a11y-widget-trigger',
  '.a11y-widget-modal',
  '.a11y-speech-floating-bar',
];

/**
 * Check if an element should be excluded from text extraction
 */
function shouldExcludeElement(element: Node, excludeSelectors: string[]): boolean {
  if (element.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  const el = element as Element;
  
  return excludeSelectors.some((selector) => {
    try {
      return el.matches(selector) || el.closest(selector) !== null;
    } catch {
      return false;
    }
  });
}

/**
 * Extract text from a DOM node using TreeWalker
 */
function extractTextFromNode(rootNode: Node, excludeSelectors: string[]): string {
  const walker = document.createTreeWalker(
    rootNode,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const parent = node.parentElement;
          if (parent && shouldExcludeElement(parent, excludeSelectors)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
        
        if (shouldExcludeElement(node, excludeSelectors)) {
          return NodeFilter.FILTER_REJECT;
        }
        
        return NodeFilter.FILTER_SKIP;
      },
    }
  );

  const textParts: string[] = [];
  let currentNode: Node | null;

  while ((currentNode = walker.nextNode())) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      const text = currentNode.textContent?.trim();
      if (text) {
        textParts.push(text);
      }
    }
  }

  return textParts.join(" ");
}

/**
 * Clean text for speech synthesis by removing emojis and problematic characters
 */
function cleanTextForSpeech(text: string): string {
  return text
    // Remove emojis (Unicode ranges for emojis)
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Symbols & Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & Map
    .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Alchemical Symbols
    .replace(/[\u{1F780}-\u{1F7FF}]/gu, '') // Geometric Shapes Extended
    .replace(/[\u{1F800}-\u{1F8FF}]/gu, '') // Supplemental Arrows-C
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Miscellaneous Symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract readable text from the page
 * Priority: explicit text → cached selection → content selector → body (filtered)
 */
export function extractReadableText(options: TextExtractionOptions = {}): string {
  const {
    text,
    cachedSelection,
    contentSelector = "#main-content",
    excludeSelectors = DEFAULT_EXCLUDE_SELECTORS,
  } = options;

  // 1. Explicit text provided
  if (text && text.trim()) {
    return cleanTextForSpeech(text.trim());
  }

  // 2. Cached selection (from before modal opened)
  if (cachedSelection && cachedSelection.trim()) {
    return cleanTextForSpeech(cachedSelection.trim());
  }

  // 3. Current selection
  const selection = window.getSelection();
  const selectionText = selection?.toString().trim();
  if (selectionText) {
    return cleanTextForSpeech(selectionText);
  }

  // 4. Content selector (e.g., #main-content)
  const mainContent = document.querySelector(contentSelector);
  if (mainContent) {
    const extracted = extractTextFromNode(mainContent, excludeSelectors);
    if (extracted.trim()) {
      return cleanTextForSpeech(extracted.trim());
    }
  }

  // 5. Fallback to body, but exclude widget and other non-content elements
  const bodyText = extractTextFromNode(document.body, excludeSelectors);
  return cleanTextForSpeech(bodyText.trim());
}

/**
 * Cache the current text selection
 * Useful before opening a modal that might clear the selection
 */
export function cacheCurrentSelection(): string {
  const selection = window.getSelection();
  return selection?.toString().trim() || "";
}
