import { test, expect } from "@playwright/test";
import { InspectorHelper } from "./helpers/inspector.js";

test("inspector correctly identifies CSS rule culprit", async ({ page }) => {
  const inspector = new InspectorHelper(page);
  await page.goto("/");

  // 1. Inject Test Case
  await page.addStyleTag({
    content: `
      .distractor-class { border: 5px solid red; }
      :root[data-theme="light"] .culprit-class { background-color: #ff0000; }
      :root[data-theme="dark"] .culprit-class { background-color: #0000ff; }
      .culprit-class { transition: none; }
    `,
  });

  await page.evaluate(() => {
    const btn = document.createElement("div");
    btn.id = "test-case-div";
    btn.className = "culprit-class distractor-class";
    btn.textContent = "Continuity Test";
    document.body.appendChild(btn);
  });

  // 2. Open Inspector
  await inspector.open();

  // 3. Run Continuity Check
  await inspector.runContinuityCheck();

  // 4. Check the List
  const reportText = await inspector.getContinuityReasonsText();

  expect(reportText).toContain(".culprit-class");
  expect(reportText).not.toContain("distractor-class");
});

test("inspector identifies hardcoded text color violation", async ({
  page,
}) => {
  const inspector = new InspectorHelper(page);
  await page.goto("/");

  // 1. Inject Test Case
  await page.addStyleTag({
    content: `
      .hardcoded-text { color: #ffffff !important; }
      .surface-card { --axm-text-high-token: #000000; }
    `,
  });

  await page.evaluate(() => {
    const btn = document.createElement("button");
    btn.id = "violation-btn";
    btn.className = "surface-card hardcoded-text";
    btn.textContent = "Violation Test";
    document.body.appendChild(btn);
  });

  // 2. Open Inspector
  await inspector.open();

  // 3. Run Violation Check
  await inspector.runViolationCheck();

  // 4. Verify Violation overlay exists
  const boxes = await inspector.getViolations();
  await expect(boxes.first()).toBeVisible();

  // 5. Verify Inspector diagnosis identifies culprit rule
  await inspector.inspectElement("#violation-btn");
  const reason = await inspector.getAdviceReason();
  expect(reason).toContain("CSS Rule:");
  expect(reason).toContain(".hardcoded-text");
});

test("inspector identifies nested CSS rule violation (media query)", async ({
  page,
}) => {
  const inspector = new InspectorHelper(page);
  await page.goto("/");

  // 1. Inject Test Case
  await page.addStyleTag({
    content: `
      @media (min-width: 1px) {
        .nested-violation { background-color: #ff00ff; }
      }
    `,
  });

  await page.evaluate(() => {
    const div = document.createElement("div");
    div.id = "nested-div";
    div.className = "nested-violation";
    div.textContent = "Nested Violation";
    document.body.appendChild(div);
  });

  // 2. Open Inspector
  await inspector.open();

  // 3. Inspect Element
  await inspector.inspectElement("#nested-div");

  // 4. Verify Advice Reason
  const reason = await inspector.getAdviceReason();

  // It should identify the rule, not say "User Agent"
  expect(reason).toContain("CSS Rule:");
  expect(reason).toContain(".nested-violation");
});

test("inspector identifies forbidden Starlight variable usage", async ({
  page,
}) => {
  const inspector = new InspectorHelper(page);
  await page.goto("/");

  await page.addStyleTag({
    content: `
      .starlight-var-violation { background-color: var(--sl-color-bg) !important; }
    `,
  });

  // Override the site's Starlight token lock (inline !important) so the
  // inspector has a real foreign-token value to detect.
  await page.evaluate(() => {
    document.documentElement.style.setProperty(
      "--sl-color-bg",
      "rgb(1, 2, 3)",
      "important",
    );
  });

  await page.evaluate(() => {
    const div = document.createElement("div");
    div.id = "sl-var-div";
    div.className = "surface-card starlight-var-violation";
    div.textContent = "Starlight var violation";
    document.body.appendChild(div);
  });

  await inspector.open();
  await inspector.inspectElement("#sl-var-div");
  const reason = await inspector.getAdviceReason();

  expect(reason).toContain("Foreign token detected");
  expect(reason).toContain("--sl-color-bg");
});

test("inspector identifies forbidden legacy computed variable usage", async ({
  page,
}) => {
  const inspector = new InspectorHelper(page);
  await page.goto("/");

  await page.addStyleTag({
    content: `
      :root { --computed-surface-highlight: rgb(4, 5, 6); }
      .legacy-computed-violation { background-color: var(--computed-surface-highlight) !important; }
    `,
  });

  await page.evaluate(() => {
    const div = document.createElement("div");
    div.id = "computed-var-div";
    div.className = "surface-card legacy-computed-violation";
    div.textContent = "Legacy computed var violation";
    document.body.appendChild(div);
  });

  await inspector.open();
  await inspector.inspectElement("#computed-var-div");
  const reason = await inspector.getAdviceReason();

  expect(reason).toContain("Legacy computed variable detected");
  expect(reason).toContain("--computed-surface-highlight");
});

test("inspector avoids false-positive violations during tau transition", async ({
  page,
}) => {
  const inspector = new InspectorHelper(page);
  await page.goto("/");

  await page.addStyleTag({
    content: `
      .bridge-bg-transition {
        background-color: var(--axm-bridge-surface) !important;
        transition: --axm-bridge-surface 5s linear, --_axm-computed-surface 0s linear !important;
      }
    `,
  });

  await page.evaluate(() => {
    const div = document.createElement("div");
    div.id = "bridge-bg";
    div.className = "surface-card bridge-bg-transition";
    div.textContent = "Bridge surface transition";
    document.body.appendChild(div);

    document.documentElement.setAttribute("data-axm-ready", "true");
    document.documentElement.setAttribute("data-axm-resolved-mode", "light");
  });

  await inspector.open();

  // Flip modes and immediately scan; without scan-stabilization this is prone to
  // transient mismatches between computed surface and painted background.
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-axm-resolved-mode", "dark");
  });

  await inspector.runViolationCheck();

  const boxes = await inspector.getViolations();
  await expect(boxes).toHaveCount(0);
});
