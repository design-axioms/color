import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";
import { isBlockElement, isSidenote } from "../utils.ts";

export function processAnchors(tree: Root) {
  let paragraphCounter = 0;
  let noteCounter = 0;

  visit(tree, "element", (node: Element) => {
    if (!node.children) return;

    let currentBlockAnchor: string | null =
      (node.properties?.["data-anchor-id"] as string) || null;
    let lastNoteAnchor: string | null = null;

    for (const child of node.children) {
      if (child.type !== "element") continue;

      // 1. Process Blocks
      if (isBlockElement(child) && !isSidenote(child)) {
        paragraphCounter++;
        const anchorId = `--p-${paragraphCounter}`;

        let style = (child.properties?.style as string) || "";
        if (style && !style.trim().endsWith(";")) {
          style += ";";
        }
        child.properties = {
          ...child.properties,
          style: `${style} anchor-name: ${anchorId};`,
          "data-anchor-id": anchorId,
        };

        currentBlockAnchor = anchorId;
        lastNoteAnchor = null;
      }

      // 2. Process Notes
      if (isSidenote(child)) {
        noteCounter++;
        const currentNoteId = `--note-${noteCounter}`;
        const classes = (child.properties?.className as string[]) || [];
        let style = (child.properties?.style as string) || "";
        if (style && !style.trim().endsWith(";")) {
          style += ";";
        }

        style += ` anchor-name: ${currentNoteId};`;

        if (lastNoteAnchor) {
          style += ` position-anchor: ${lastNoteAnchor};`;
          classes.push("tether-stack");
        } else if (currentBlockAnchor) {
          style += ` position-anchor: ${currentBlockAnchor};`;
          classes.push("tether-direct");
        } else {
          if (node.properties?.["data-anchor-id"]) {
            const parentAnchor = node.properties["data-anchor-id"] as string;
            style += ` position-anchor: ${parentAnchor};`;
            classes.push("tether-direct");
            lastNoteAnchor = currentNoteId;
          }
        }

        child.properties = {
          ...child.properties,
          className: classes,
          style: style,
        };

        if (
          classes.includes("tether-direct") ||
          classes.includes("tether-stack")
        ) {
          lastNoteAnchor = currentNoteId;
        }
      }
    }
  });
}
