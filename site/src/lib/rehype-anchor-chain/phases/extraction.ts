import type { Element, ElementContent, Root } from "hast";
import { select } from "hast-util-select";
import { visit } from "unist-util-visit";

export function extractFootnotes(tree: Root): Map<string, ElementContent[]> {
  const map = new Map<string, ElementContent[]>();
  const footnotesSection = select(
    "section[data-footnotes], section.footnotes",
    tree,
  );

  if (!footnotesSection) return map;

  const list = select("ol", footnotesSection);
  if (!list) return map;

  list.children.forEach((li) => {
    if (li.type !== "element" || li.tagName !== "li") return;
    const id = li.properties?.id as string;
    if (!id) return;
    const content = filterBackrefs(li.children);
    map.set(id, content);
  });

  // Remove the section from the tree
  visit(tree, "root", (node: Root) => {
    node.children = node.children.filter((c) => c !== footnotesSection);
  });
  visit(tree, "element", (node: Element) => {
    node.children = node.children.filter((c) => c !== footnotesSection);
  });

  return map;
}

function filterBackrefs(children: ElementContent[]): ElementContent[] {
  return children
    .map((child) => {
      if (child.type === "element") {
        const classes = (child.properties?.className as string[]) || [];
        if (
          classes.includes("data-footnote-backref") ||
          classes.includes("footnote-backref")
        ) {
          return null;
        }
        child.children = filterBackrefs(child.children);
        return child;
      }
      return child;
    })
    .filter(Boolean) as ElementContent[];
}
