import { AxiomaticError } from "./errors.ts";

/**
 * Ensures the DOM is ready for querying. Throws if document is loading.
 */
export function requireDOMReady(context?: string): void {
  if (typeof document === "undefined") {
    throw new AxiomaticError(
      "INSPECTOR_DOM_NOT_READY",
      "Document is not available in this environment.",
      { context },
    );
  }
  if (document.readyState === "loading") {
    throw new AxiomaticError(
      "INSPECTOR_DOM_NOT_READY",
      "DOM is not ready. Call after DOMContentLoaded event.",
      { context, readyState: document.readyState },
    );
  }
}

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

export function requireDocumentBody(context?: string): HTMLElement {
  if (typeof document === "undefined") {
    throw new AxiomaticError(
      "DOM_ELEMENT_NOT_FOUND",
      "Required document is not available.",
      { selector: "document", context },
    );
  }

  return requireElement(document.body, "body", context);
}

export function requireDocumentHead(context?: string): HTMLElement {
  if (typeof document === "undefined") {
    throw new AxiomaticError(
      "DOM_ELEMENT_NOT_FOUND",
      "Required document is not available.",
      { selector: "document", context },
    );
  }

  return requireElement(document.head, "head", context);
}

/**
 * Gets a computed style property value, throwing if empty or missing.
 */
export function getComputedStyleOrThrow(
  element: Element,
  property: string,
  context?: string,
): string {
  const value = getComputedStyle(element).getPropertyValue(property);
  if (!value || value.trim() === "") {
    const where = context ? ` in ${context}` : "";
    throw new AxiomaticError(
      "INSPECTOR_MISSING_COMPUTED_STYLE",
      `Computed style '${property}' is empty${where}.`,
      { property, element: element.tagName, context },
    );
  }
  return value;
}
