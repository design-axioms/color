import type { Element, ElementContent, Root, Text } from "hast";
import { SKIP, visit } from "unist-util-visit";
import { isBlockElement } from "../utils.ts";

interface FootnoteRef {
  id: string;
  label: string;
}

export function injectSidenotes(
  tree: Root,
  map: Map<string, ElementContent[]>,
) {
  visit(tree, "element", (node: Element) => {
    if (!node.children || node.children.length === 0) return;

    const newChildren: ElementContent[] = [];

    for (const child of node.children) {
      newChildren.push(child);

      if (isBlockElement(child)) {
        const refs = findFootnoteRefs(child as Element);

        for (const ref of refs) {
          const refId = ref.id;
          const content =
            map.get(refId) ||
            map.get(refId.replace("user-content-", "")) ||
            map.get("user-content-" + refId);

          if (content) {
            const number = ref.label;
            let sidenoteContent = [...content];

            if (number) {
              const sup: Element = {
                type: "element",
                tagName: "sup",
                properties: { className: ["sidenote-number"] },
                children: [{ type: "text", value: number }],
              };
              const space: Text = { type: "text", value: " " };

              if (
                sidenoteContent.length > 0 &&
                sidenoteContent[0].type === "element" &&
                sidenoteContent[0].tagName === "p"
              ) {
                const p = sidenoteContent[0];
                const newP = { ...p, children: [sup, space, ...p.children] };
                sidenoteContent[0] = newP;
              } else if (
                sidenoteContent.length > 0 &&
                sidenoteContent[0].type === "element" &&
                (sidenoteContent[0].tagName === "ul" ||
                  sidenoteContent[0].tagName === "ol")
              ) {
                const list = sidenoteContent[0];
                if (
                  list.children &&
                  list.children.length > 0 &&
                  list.children[0].type === "element" &&
                  list.children[0].tagName === "li"
                ) {
                  const firstLi = list.children[0];
                  if (
                    firstLi.children.length > 0 &&
                    firstLi.children[0].type === "element" &&
                    firstLi.children[0].tagName === "p"
                  ) {
                    const p = firstLi.children[0];
                    const newP = {
                      ...p,
                      children: [sup, space, ...p.children],
                    };
                    firstLi.children[0] = newP;
                  } else {
                    firstLi.children = [sup, space, ...firstLi.children];
                  }
                } else {
                  sidenoteContent = [sup, space, ...sidenoteContent];
                }
              } else {
                sidenoteContent = [sup, space, ...sidenoteContent];
              }
            }

            const sidenote: Element = {
              type: "element",
              tagName: "aside",
              properties: {
                className: ["sidenote", "surface-card", "text-subtle"],
                id: refId.startsWith("user-content-")
                  ? refId
                  : `user-content-${refId}`,
              },
              children: sidenoteContent,
            };

            if (child.type === "element" && child.tagName === "li") {
              child.children.push(sidenote);
            } else {
              newChildren.push(sidenote);
            }
          }
        }
      }
    }

    node.children = newChildren;
  });
}

function findFootnoteRefs(node: Element): FootnoteRef[] {
  const refs: FootnoteRef[] = [];
  visit(node, "element", (el) => {
    if (el !== node && isBlockElement(el)) return SKIP;
    if (el.tagName === "a") {
      const hasRefAttribute = "dataFootnoteRef" in (el.properties || {});
      const classes = (el.properties?.className as string[]) || [];
      const hasRefClass =
        classes.includes("data-footnote-ref") ||
        classes.includes("footnote-ref");

      if (hasRefAttribute || hasRefClass) {
        const href = el.properties?.href as string;
        if (href && href.startsWith("#")) {
          let label = "";
          if (el.children && el.children.length > 0) {
            const textNode = el.children.find((c) => c.type === "text") as Text;
            if (textNode) label = textNode.value;
          }
          refs.push({ id: href.substring(1), label });
        }
      }
    }
  });
  return refs;
}
