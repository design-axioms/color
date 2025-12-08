import { Window } from "happy-dom";

const BASE_URL = "https://color-system.localhost";

async function checkPage(urlPath: string, pageName: string): Promise<void> {
  console.log(`\nChecking ${pageName} (${urlPath})...`);

  // Fetch the HTML
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const response = await fetch(BASE_URL + urlPath);

  if (!response.ok) {
    console.error(
      `Failed to fetch ${urlPath}: ${response.status} ${response.statusText}`,
    );
    return;
  }

  const html = await response.text();
  const window = new Window({ url: BASE_URL + urlPath });
  const document = window.document;
  document.write(html);

  // --- Axiomatic Checks ---

  // 1. Check for "Jammed" elements (heuristic: adjacent buttons without gap container)
  // This is hard to do purely with DOM, but we can check for class usage.
  const buttons = document.querySelectorAll(".surface-action");
  console.log(`Found ${buttons.length} .surface-action elements.`);

  buttons.forEach((btn, i) => {
    const parent = btn.parentElement;
    if (!parent) return;

    // Check if parent has flex/grid and gap
    const parentClasses = parent.className || "";
    const hasGap =
      parentClasses.includes("gap-") ||
      parentClasses.includes("space-x-") ||
      parentClasses.includes("space-y-");

    if (!hasGap && parent.children.length > 1) {
      // Check if siblings are also buttons
      const sibling = btn.nextElementSibling;
      if (sibling.classList.contains("surface-action")) {
        console.warn(
          `[Potential Jam] Button ${i} is adjacent to another button without obvious gap utility on parent.`,
        );
      }
    }
  });

  // 2. Check for "Premium" Inline Representations
  // Look for <code> blocks. Are they just plain?
  const codeBlocks = document.querySelectorAll(":not(pre) > code");
  console.log(`Found ${codeBlocks.length} inline code elements.`);

  // 3. Check for "Expectations" (Custom per page)
  if (pageName === "index") {
    const heroTitle = document.querySelector("h1");
    console.log(`Hero Title: "${heroTitle?.textContent.trim()}"`);

    const snippet = document.querySelector(".snippet-container");
    if (snippet) {
      console.log("✅ Snippet container found.");
    } else {
      console.error("❌ No snippet container found on Home Page.");
    }
  }

  window.close();
}

async function run(): Promise<void> {
  try {
    await checkPage("/", "index");
    await checkPage("/concepts/thinking-in-surfaces/", "concepts");
    await checkPage("/reference/tokens/", "tokens");
  } catch (e) {
    console.error(e);
  }
}

void run();
