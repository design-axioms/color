import { chromium } from "playwright";
import { WALKER_LIBRARY } from "./utils/walker.ts";

export interface Violation {
  element: string;
  text: string;
  selector: string;
  responsible: string;
  reason: string;
  surface?: string;
  actual?: string;
}

const SCANNER_LOGIC = `
function scanForViolations() {
  const allElements = document.body.querySelectorAll("*");
  const violations = [];

  for (const element of Array.from(allElements)) {
    if (element instanceof HTMLElement) {
      if (element.offsetParent === null) continue;
      if (element.tagName === "AXIOMATIC-DEBUGGER") continue;
      if (element.matches(".expressive-code .copy button div")) continue;
      if (element.matches(".preview-swatch, .handle, .selection-marker, .track-fill")) continue;
      if (element.matches(".expressive-code figcaption, .expressive-code figcaption *")) continue;
      if (element.tagName === "INPUT" && (element.type === "range" || element.type === "color")) continue;

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

scanForViolations();
`;

const INJECTED_SCRIPT = WALKER_LIBRARY + SCANNER_LOGIC;

async function checkViolations(): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  page.on("console", (msg) => {
    console.log("PAGE LOG:", msg.text());
  });

  let url = process.argv[2] || "https://color-system.localhost/";
  if (url.startsWith("/")) {
    url = `https://color-system.localhost${url}`;
  }

  console.log(`Checking violations for: ${url}`);

  const maxRetries = 5;
  let connected = false;

  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.goto(url, { timeout: 30000, waitUntil: "domcontentloaded" });
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

    const violations = await page.evaluate<Violation[]>(INJECTED_SCRIPT);

    if (violations.length === 0) {
      console.log("✅ No violations found.");
    } else {
      console.log(`🚫 Found ${violations.length} violations:`);
      console.table(violations);
    }
  }

  await checkMode("light");
  await checkMode("dark");

  console.log("\n--- CONTINUITY CHECK (Tau Zero) ---");
  // 5. Compare
  // const continuityViolations = 0;

  // We need to inject the walker library again for the diagnosis step if we want to use it inside evaluate
  // But here we are comparing stateA and stateB which are just JSON objects in Node.
  // To get the blame, we need to run the diagnosis INSIDE the browser during the check.

  // Let's rewrite the continuity check to run entirely in the browser, like overlay.ts does.
  // This is more efficient and allows access to the DOM for diagnosis.

  const CONTINUITY_SCRIPT =
    WALKER_LIBRARY +
    `
    async function checkContinuity() {
      // 1. Freeze Time (Set tau to 0)
      document.documentElement.style.setProperty("--tau", "0");
      const style = document.createElement("style");
      style.innerHTML = "* { transition: none !important; }";
      document.head.appendChild(style);

      // 2. Capture State A (Light Mode + Tau=0)
      document.documentElement.setAttribute("data-theme", "light");
      // Wait for style recalc
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      
      const allElements = Array.from(document.body.querySelectorAll("*"));
      const stateA = allElements.map(el => {
        const style = getComputedStyle(el);
        return {
          bg: style.backgroundColor,
          color: style.color
        };
      });

      // 3. Toggle Theme (Dark Mode + Tau=0)
      document.documentElement.setAttribute("data-theme", "dark");
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      // 4. Capture State B & Compare
      const violations = [];

      allElements.forEach((element, i) => {
        if (!(element instanceof HTMLElement)) return;
        if (element.offsetParent === null) return;
        if (element.tagName === "AXIOMATIC-DEBUGGER") return;
        if (element.matches(".expressive-code .copy button div")) return;
        if (element.matches(".preview-swatch, .handle, .selection-marker, .track-fill")) return;

        const a = stateA[i];
        const style = getComputedStyle(element);
        const b = { bg: style.backgroundColor, color: style.color };

        if (a.bg === "rgba(0, 0, 0, 0)" && b.bg === "rgba(0, 0, 0, 0)") {
          // Ignore transparent
        } else if (a.bg !== b.bg) {
          // Diagnose the cause
          const context = findContextRoot(element);
          const tokens = resolveTokens(element, context);
          const bgToken = tokens.find(t => t.intent === "Actual Background");
          
          let culprit = "Unknown Selector";
          const classList = Array.from(element.classList);
          const bgUtilities = classList.filter((c) => c.startsWith("bg-"));
          const otherClasses = classList.filter(
            (c) =>
              !c.startsWith("bg-") &&
              !c.startsWith("text-") &&
              !c.startsWith("surface-") &&
              !c.startsWith("theme-"),
          );
          const hasInlineStyle = element.style.backgroundColor !== "";

          if (bgToken && bgToken.sourceVar.startsWith("--")) {
             culprit = \`Variable \${bgToken.sourceVar}\`;
          } else if (hasInlineStyle) {
             culprit = "Inline 'style' attribute";
          } else if (bgUtilities.length > 0) {
             culprit = \`Utility classes: \${bgUtilities.join(", ")}\`;
          } else if (otherClasses.length > 0) {
             culprit = \`Custom CSS classes: \${otherClasses.join(", ")}\`;
          } else if (element.id) {
             culprit = \`ID selector: #\${element.id}\`;
          } else {
             culprit = "Tag selector or User Agent default";
          }

          violations.push({
            tag: element.tagName.toLowerCase(),
            classes: element.className,
            id: element.id,
            reason: \`Continuity Violation (Background): Snapped from \${a.bg} to \${b.bg}. Culprit: \${culprit}\`
          });
        } else if (a.color !== b.color) {
          violations.push({
            tag: element.tagName.toLowerCase(),
            classes: element.className,
            id: element.id,
            reason: \`Continuity Violation (Foreground): Snapped from \${a.color} to \${b.color}.\`
          });
        }
      });
      
      return violations;
    }
    checkContinuity();
  `;

  const violations =
    await page.evaluate<
      Array<{ tag: string; classes: string; id: string; reason: string }>
    >(CONTINUITY_SCRIPT);

  if (violations.length === 0) {
    console.log("✅ No continuity violations found.");
  } else {
    console.log(`🚫 Found ${violations.length} continuity violations:`);
    violations.forEach((v) => {
      console.log(`[${v.tag}.${v.classes.replace(/ /g, ".")}] ${v.reason}`);
    });
  }

  await browser.close();
}

checkViolations().catch(console.error);
