export const WALKER_LIBRARY = `
// --- walker.ts ---
function findContextRoot(element) {
  let current = element;

  while (current) {
    const isSurface =
      current.tagName === "BODY" ||
      Array.from(current.classList).some((c) => c.startsWith("surface-")) ||
      current.classList.contains("astro-code") ||
      current.classList.contains("expressive-code") ||
      current.matches?.(".expressive-code .frame") ||
      current.classList.contains("card") ||
      current.classList.contains("sl-link-button") ||
      current.matches?.("site-search button");

    console.log("Checking", current.tagName, current.className, "isSurface:", isSurface);

    if (isSurface) {
      const style = getComputedStyle(current);
      let surfaceName = "unknown";

      if (current.tagName === "BODY") {
        surfaceName = "page";
      } else {
        const surfaceClass = Array.from(current.classList).find((c) =>
          c.startsWith("surface-"),
        );
        if (surfaceClass) {
          surfaceName = surfaceClass.replace("surface-", "");
        } else if (current.classList.contains("astro-code") || current.classList.contains("expressive-code") || current.matches?.(".expressive-code .frame")) {
          surfaceName = "workspace";
        } else if (current.classList.contains("card")) {
          surfaceName = "card";
        } else if (current.classList.contains("sl-link-button")) {
          surfaceName = "action";
        } else if (current.matches?.("site-search button")) {
          surfaceName = "action-soft";
        }
      }

      let polarity = null;
      const colorScheme = style.colorScheme;

      if (colorScheme === "dark") {
        polarity = "dark";
      } else if (colorScheme === "light") {
        polarity = "light";
      } else {
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

  return {
    surface: "page",
    polarity: document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
    backgroundColor: getComputedStyle(document.body).backgroundColor,
    element: document.body,
  };
}

function findVariableSource(startElement, variableName) {
  const startValue = getComputedStyle(startElement)
    .getPropertyValue(variableName)
    .trim();

  if (!startValue) return null;

  let current = startElement;
  let lastMatch = startElement;

  while (true) {
    const parent = current.parentElement;
    if (!parent) {
      return current;
    }

    const parentValue = getComputedStyle(parent)
      .getPropertyValue(variableName)
      .trim();

    if (parentValue !== startValue) {
      return current;
    }

    lastMatch = parent;
    current = parent;
  }

  return lastMatch;
}

// --- resolver.ts ---
const TOKENS = [
  { name: "text-high", var: "--axm-text-high-token" },
  { name: "text-subtle", var: "--axm-text-subtle-token" },
  { name: "text-subtlest", var: "--axm-text-subtlest-token" },
  { name: "surface", var: "--axm-surface-token" },
  { name: "border-dec", var: "--axm-border-dec-token" },
  { name: "border-int", var: "--axm-border-int-token" },
];

const DEFAULTS = {
  "--alpha-hue": 0,
  "--alpha-beta": 0.008,
};

function resolveTokens(element, context) {
  const style = getComputedStyle(element);
  const contextStyle = getComputedStyle(context.element);
  const tokens = [];

  const findMatch = (value) => {
    if (!value || value === "transparent" || value === "rgba(0, 0, 0, 0)")
      return null;

    for (const token of TOKENS) {
      const tokenValue = contextStyle.getPropertyValue(token.var).trim();
      if (tokenValue === value) {
        return token.name;
      }
    }
    return null;
  };

  const addToken = (intent, value, sourceVar, sourceValue) => {
    let sourceElement = element;

    if (sourceVar.startsWith("--")) {
      sourceElement = findVariableSource(element, sourceVar);
    }

    let isDefault = false;
    const defaultValue = DEFAULTS[sourceVar];
    if (defaultValue !== undefined) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && Math.abs(numValue - defaultValue) < 0.0001) {
        isDefault = true;
      }
    }

    let responsibleClass;
    if (sourceElement && !isDefault) {
      const classList = Array.from(sourceElement.classList);

      if (intent === "Context Hue" || intent === "Context Chroma") {
        responsibleClass = classList.find(
          (c) => c.startsWith("theme-") || c.startsWith("hue-"),
        );
      } else if (intent === "Surface Color") {
        responsibleClass = classList.find((c) => c.startsWith("surface-") || c.includes("card") || c.includes("sl-link-button"));
        if (!responsibleClass && sourceElement.tagName === "BODY") {
          responsibleClass = "surface-page";
        }
      } else if (intent === "Text Source" || intent === "Final Text Color") {
        responsibleClass = classList.find((c) => c.startsWith("text-"));
        if (!responsibleClass && sourceElement.tagName === "BODY") {
          responsibleClass = "text-high (default)";
        }
      } else if (intent === "Actual Background") {
        responsibleClass = classList.find((c) => c.startsWith("bg-"));
      }

      if (!responsibleClass) {
        responsibleClass = classList.find(
          (c) =>
            c.startsWith("theme-") ||
            c.startsWith("hue-") ||
            c.startsWith("surface-") ||
            c.startsWith("text-") ||
            c.startsWith("bg-") ||
            c.includes("card") ||
            c.includes("sl-link-button")
        );
      }
    }

    const isInline = sourceElement
      ? sourceElement.style.getPropertyValue(sourceVar) !== ""
      : false;

    const isSemanticallyPublic =
      intent === "Final Text Color" || intent === "Surface Color";

    tokens.push({
      intent,
      value,
      sourceVar,
      sourceValue,
      element: sourceElement || undefined,
      isLocal: sourceElement === element,
      isPrivate:
        !isSemanticallyPublic &&
        (sourceVar.startsWith("--_") || sourceVar.startsWith("--axm-computed")),
      responsibleClass,
      isInline,
      isDefault,
    });
  };

  const hue = style.getPropertyValue("--alpha-hue").trim();
  if (hue) {
    addToken("Context Hue", hue, "--alpha-hue", hue);
  }

  const chroma = style.getPropertyValue("--alpha-beta").trim();
  if (chroma) {
    addToken("Context Chroma", chroma, "--alpha-beta", chroma);
  }

  const lightnessSource = style
    .getPropertyValue("--_axm-text-lightness-source")
    .trim();
  if (lightnessSource) {
    const match = findMatch(lightnessSource);
    const isPublic = !!match;
    const sourceVar = "--_axm-text-lightness-source";
    const sourceElement = findVariableSource(element, sourceVar);

    let responsibleClass;
    if (sourceElement) {
      const classList = Array.from(sourceElement.classList);
      responsibleClass = classList.find((c) => c.startsWith("text-"));
      if (!responsibleClass && sourceElement.tagName === "BODY") {
        responsibleClass = "text-high (default)";
      }
    }

    tokens.push({
      intent: "Text Source",
      value: lightnessSource,
      sourceVar,
      sourceValue: match || "Custom/Inherited",
      isPrivate: !isPublic,
      element: sourceElement || undefined,
      isLocal: sourceElement === element,
      responsibleClass,
    });
  }

  const fgColor = style.getPropertyValue("--_axm-computed-fg-color").trim();
  if (fgColor && fgColor !== "transparent") {
    addToken("Final Text Color", fgColor, "--_axm-computed-fg-color", fgColor);
  }

  const surfaceColor = style.getPropertyValue("--_axm-computed-surface").trim();
  if (surfaceColor && surfaceColor !== "transparent") {
    addToken(
      "Surface Color",
      surfaceColor,
      "--_axm-computed-surface",
      surfaceColor,
    );
  }

  const bgColor = style.backgroundColor;
  if (bgColor && bgColor !== "transparent" && bgColor !== "rgba(0, 0, 0, 0)") {
    addToken("Actual Background", bgColor, "background-color", bgColor);
  }

  return tokens;
}

function getCssSelector(el) {
  if (!(el instanceof Element)) return;
  const path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += '#' + el.id;
      path.unshift(selector);
      break;
    } else {
      let sib = el, nth = 1;
      while (sib = sib.previousElementSibling) {
        if (sib.nodeName.toLowerCase() == selector)
          nth++;
      }
      if (nth != 1)
        selector += ":nth-of-type(" + nth + ")";
    }
    path.unshift(selector);
    el = el.parentNode;
  }
  return path.join(" > ");
}
`;
