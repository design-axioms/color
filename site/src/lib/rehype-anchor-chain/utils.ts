import type { ElementContent } from "hast";

export function isBlockElement(node: ElementContent): boolean {
  if (node.type !== "element") return false;
  const blockTags = [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "pre",
    "table",
    "li",
    "blockquote",
    "div",
    "section",
    "article",
    "main",
  ];
  return blockTags.includes(node.tagName);
}

export function isSidenote(node: ElementContent | undefined): boolean {
  if (!node || node.type !== "element") return false;
  if (node.tagName !== "aside") return false;
  const classNames = (node.properties?.className as string[]) || [];
  return classNames.includes("sidenote");
}
