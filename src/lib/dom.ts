import { AxiomaticError } from "./errors.ts";

export function requireElement<T extends Element>(
  element: T | null,
  selector: string,
  context?: string,
): T {
  if (element) return element;

  const where = context ? ` in ${context}` : "";
  throw new AxiomaticError(
    "DOM_ELEMENT_NOT_FOUND",
    `Required element '${selector}' not found${where}.`,
    { selector, context },
  );
}

export function querySelectorOrThrow(
  root: ParentNode,
  selector: string,
  context?: string,
): Element {
  return requireElement(root.querySelector(selector), selector, context);
}

export function requireDocumentBody(context?: string): HTMLBodyElement {
  if (typeof document === "undefined") {
    throw new AxiomaticError(
      "DOM_ELEMENT_NOT_FOUND",
      "Required document is not available.",
      { selector: "document", context },
    );
  }

  return requireElement(document.body, "body", context);
}

export function requireDocumentHead(context?: string): HTMLHeadElement {
  if (typeof document === "undefined") {
    throw new AxiomaticError(
      "DOM_ELEMENT_NOT_FOUND",
      "Required document is not available.",
      { selector: "document", context },
    );
  }

  return requireElement(document.head, "head", context);
}
