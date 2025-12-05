import type { DebugContext } from "./types.ts";

export function findContextRoot(element: HTMLElement): DebugContext {
  let current: HTMLElement | null = element;

  while (current) {
    // Check if this element is a surface
    // Heuristic: Check for class starting with "surface-" or "body" tag
    const isSurface =
      current.tagName === "BODY" ||
      Array.from(current.classList).some((c) => c.startsWith("surface-"));

    if (isSurface) {
      const style = getComputedStyle(current);
      const surfaceName =
        current.tagName === "BODY"
          ? "page"
          : Array.from(current.classList)
              .find((c) => c.startsWith("surface-"))
              ?.replace("surface-", "") || "unknown";

      // Determine polarity
      // We check the computed color-scheme.
      // Note: If the global mode is 'light', and this surface is inverted,
      // the Hard Flip logic should have set 'color-scheme: dark' on this element.
      let polarity: "light" | "dark" | null = null;
      const colorScheme = style.colorScheme;

      if (colorScheme === "dark") {
        polarity = "dark";
      } else if (colorScheme === "light") {
        polarity = "light";
      } else {
        // Fallback: Check if a parent has a specific mode class (e.g. .dark)
        // or check the system preference if color-scheme is 'light dark'
        if (document.documentElement.classList.contains("dark")) {
          polarity = "dark";
        } else {
          polarity = "light";
        }
      }

      return {
        surface: surfaceName,
        polarity: polarity,
        backgroundColor: style.backgroundColor,
        element: current,
      };
    }

    current = current.parentElement;
  }

  // Fallback to body if no surface found (shouldn't happen if body is a surface)
  return {
    surface: "page",
    polarity: document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
    backgroundColor: getComputedStyle(document.body).backgroundColor,
    element: document.body,
  };
}
