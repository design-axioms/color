import type { Root } from "hast";
import { processAnchors } from "./phases/anchoring.ts";
import { extractFootnotes } from "./phases/extraction.ts";
import { injectSidenotes } from "./phases/injection.ts";

/**
 * Rehype plugin to implement the "Anchor Chain" layout engine (v3).
 *
 * This plugin constructs a layout dependency graph at build time using CSS Anchor Positioning.
 *
 * Mechanism:
 * 1. ID Generation: Assigns stable IDs to paragraphs (#p-N) and sidenotes (#note-N).
 * 2. Anchor Definition: Paragraphs become anchors for their associated sidenotes.
 * 3. Collision Resolution: Sidenotes are positioned based on:
 *    - The top of their anchor paragraph.
 *    - The bottom of the *previous* sidenote (to prevent overlap).
 *
 * Formula:
 * top: max(anchor(top), anchor(--prev-note bottom) + gap)
 */
export function rehypeAnchorChain() {
  return (tree: Root) => {
    // 1. Extract Footnotes & Transform to Sidenotes
    const footnoteMap = extractFootnotes(tree);
    if (footnoteMap.size > 0) {
      injectSidenotes(tree, footnoteMap);
    }

    // 2. Assign IDs and Build Dependency Graph
    processAnchors(tree);
  };
}
