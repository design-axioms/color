import { chromium } from "playwright";

export interface Violation {
  element: string;
  text: string;
  selector: string;
  responsible: string;
  reason: string;
  surface?: string;
  actual?: string;
}

const INJECTED_SCRIPT = `
// --- walker.ts ---
function findContextRoot(element) {
  let current = element;

  while (current) {
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

// --- Main Logic ---
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

function scanForViolations() {
  const allElements = document.body.querySelectorAll("*");
  const violations = [];

  for (const element of Array.from(allElements)) {
    if (element instanceof HTMLElement) {
      if (element.offsetParent === null) continue;
      if (element.tagName === "AXIOMATIC-DEBUGGER") continue;

      const context = findContextRoot(element);
      const tokens = resolveTokens(element, context);

      const surfaceToken = tokens.find((t) => t.intent === "Surface Color");
      const bgToken = tokens.find((t) => t.intent === "Actual Background");

      const hasSurfaceMismatch =
        surfaceToken && bgToken && surfaceToken.value !== bgToken.value;
      const hasUnconnectedPrivateToken = tokens.some(
        (t) => t.isLocal && t.isPrivate && !t.responsibleClass && !t.isInline,
      );

      if (hasSurfaceMismatch || hasUnconnectedPrivateToken) {
        let reason = "";
        if (hasSurfaceMismatch) reason = "Surface Mismatch";
        if (hasUnconnectedPrivateToken)
          reason = reason ? \`\${reason} & Private Token\` : "Private Token";

        const responsible = bgToken?.responsibleClass || 
                           tokens.find(t => t.isPrivate)?.responsibleClass || 
                           "unknown";

        const text = element.innerText ? element.innerText.substring(0, 30).replace(/\\n/g, ' ') : "";
        const selector = getCssSelector(element);

        violations.push({
          element: \`<\${element.tagName.toLowerCase()}>\`,
          text: text.length > 0 ? \`"\${text}"\` : "(empty)",
          selector,
          responsible,
          reason,
          surface: surfaceToken?.value,
          actual: bgToken?.value,
        });
      }
    }
  }
  return violations;
}

return scanForViolations();
`;

async function checkViolations(): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  let url = process.argv[2] || "https://color-system.localhost/";
  if (url.startsWith("/")) {
    url = `https://color-system.localhost${url}`;
  }

  console.log(`Checking violations for: ${url}`);

  const maxRetries = 5;
  let connected = false;

  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.goto(url, { timeout: 5000, waitUntil: "domcontentloaded" });
      connected = true;
      break;
    } catch {
      console.log(`Connection attempt ${i + 1} failed. Retrying...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  if (!connected) {
    console.error("Failed to connect to server.");
    await browser.close();
    process.exit(1);
  }

  async function checkMode(mode: string): Promise<void> {
    console.log(`\n--- ${mode.toUpperCase()} MODE ---`);

    await page.evaluate((m) => {
      document.documentElement.setAttribute("data-theme", m);
    }, mode);

    // Allow CSS to apply
    await page.waitForTimeout(500);

    // Inject and run the violation scanner

    const violations = await page.evaluate(INJECTED_SCRIPT);

    if (violations.length === 0) {
      console.log("✅ No violations found.");
    } else {
      console.log(`🚫 Found ${violations.length} violations:`);
      console.table(violations);
    }
  }

  await checkMode("light");
  await checkMode("dark");

  await browser.close();
}

checkViolations().catch(console.error);
