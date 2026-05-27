/**
 * Controller for highlighting text during speech synthesis
 */

export interface HighlightOptions {
  /** Root element to search for text nodes */
  rootElement?: Element;
  /** CSS class for highlighted elements */
  highlightClass?: string;
}

/**
 * Controller for highlighting words/sentences during text-to-speech
 */
export class SpeechHighlightController {
  private highlightClass: string;
  private currentHighlight: HTMLElement | null = null;
  private textNodeMap: Array<{ node: Text; offset: number }> = [];
  private rootElement: Element;

  constructor(options: HighlightOptions = {}) {
    this.highlightClass = options.highlightClass || "a11y-speech-highlight";
    this.rootElement = options.rootElement || document.body;
  }

  /**
   * Initialize the controller for highlighting
   * Creates a mapping of text offsets to DOM text nodes
   */
  initialize(): void {
    this.clear();
    this.textNodeMap = this.buildTextNodeMap(this.rootElement);
  }

  /**
   * Highlight text at a specific character offset
   * @param charIndex Character index in the spoken text
   * @param charLength Length of text to highlight
   */
  highlightAt(charIndex: number, charLength: number): void {
    // Remove previous highlight
    this.removeCurrentHighlight();

    // Find the text node(s) containing this character range
    const startNode = this.findTextNodeAtOffset(charIndex);
    if (!startNode) {
      return;
    }

    try {
      // Create a range for the text to highlight
      const range = document.createRange();
      const localOffset = charIndex - startNode.offset;
      
      range.setStart(startNode.node, Math.max(0, localOffset));
      range.setEnd(startNode.node, Math.min(startNode.node.length, localOffset + charLength));

      // Wrap the range in a mark element
      const mark = document.createElement("mark");
      mark.className = this.highlightClass;
      range.surroundContents(mark);
      
      this.currentHighlight = mark;

      // Scroll into view (smooth, center)
      mark.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    } catch (error) {
      // Silently fail if highlighting fails (e.g., range spans multiple nodes)
      console.debug("Highlight failed:", error);
    }
  }

  /**
   * Set up event listeners for utterance boundary events
   * @param utterance SpeechSynthesisUtterance to attach listeners to
   */
  attachToUtterance(utterance: SpeechSynthesisUtterance): void {
    this.initialize();

    utterance.addEventListener("boundary", (event: SpeechSynthesisEvent) => {
      if (event.name === "word") {
        // Highlight the current word
        const charIndex = event.charIndex;
        const charLength = event.charLength || 1;
        this.highlightAt(charIndex, charLength);
      }
    });

    // Clear highlight when speech ends
    utterance.addEventListener("end", () => {
      this.clear();
    });
  }

  /**
   * Clear all highlights and reset state
   */
  clear(): void {
    this.removeCurrentHighlight();
    this.textNodeMap = [];
  }

  /**
   * Remove the current highlight element
   */
  private removeCurrentHighlight(): void {
    if (this.currentHighlight) {
      const parent = this.currentHighlight.parentNode;
      if (parent) {
        // Replace the mark element with its text content
        const textNode = document.createTextNode(this.currentHighlight.textContent || "");
        parent.replaceChild(textNode, this.currentHighlight);
        
        // Normalize to merge adjacent text nodes
        parent.normalize();
      }
      this.currentHighlight = null;
    }
  }

  /**
   * Build a map of text nodes with their cumulative character offsets
   */
  private buildTextNodeMap(root: Element): Array<{ node: Text; offset: number }> {
    const map: Array<{ node: Text; offset: number }> = [];
    let cumulativeOffset = 0;

    // Use TreeWalker to find all text nodes
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          
          // Skip if parent is not visible or is in excluded elements
          if (parent) {
            const style = window.getComputedStyle(parent);
            if (style.display === "none" || style.visibility === "hidden") {
              return NodeFilter.FILTER_REJECT;
            }
            
            // Skip widget elements
            if (parent.hasAttribute("data-a11y-widget") || 
                parent.closest("[data-a11y-widget]")) {
              return NodeFilter.FILTER_REJECT;
            }
          }
          
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    let currentNode: Node | null;
    while ((currentNode = walker.nextNode())) {
      const textNode = currentNode as Text;
      const text = textNode.textContent?.trim();
      
      if (text) {
        map.push({
          node: textNode,
          offset: cumulativeOffset,
        });
        cumulativeOffset += text.length + 1; // +1 for space between nodes
      }
    }

    return map;
  }

  /**
   * Find the text node containing a specific character offset
   */
  private findTextNodeAtOffset(charIndex: number): { node: Text; offset: number } | null {
    for (let i = 0; i < this.textNodeMap.length; i++) {
      const current = this.textNodeMap[i];
      const next = this.textNodeMap[i + 1];
      
      if (!next || charIndex < next.offset) {
        return current;
      }
    }
    
    return this.textNodeMap[this.textNodeMap.length - 1] || null;
  }
}
