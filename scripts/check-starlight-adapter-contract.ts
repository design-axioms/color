/**
 * Starlight adapter contract sentinel.
 *
 * Goal: prevent “border popping” regressions by enforcing the chrome continuity
 * contract at the source level.
 *
 * - SVG `fill/stroke: currentColor` is encouraged.
 * - Docs chrome borders must NOT use `currentColor`.
 * - Adapter CSS must NOT transition bridge exports or border-color in chrome.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE = path.join(ROOT, "site/src/styles/starlight-custom.css");

const content = fs.readFileSync(FILE, "utf8");

const marker = "/* --- Starlight Chrome Continuity Contract ---";
const markerIndex = content.indexOf(marker);
if (markerIndex === -1) {
  console.error(
    `\n[starlight-adapter-contract] Missing marker '${marker}' in ${path.relative(ROOT, FILE)}\n`,
  );
  process.exit(1);
}

const chromeBlock = content.slice(markerIndex);

const failures: Array<{ rule: string; match: string }> = [];

const deny = (rule: string, re: RegExp) => {
  re.lastIndex = 0;
  const m = re.exec(chromeBlock);
  if (m) failures.push({ rule, match: m[0] });
};

// Chrome borders must not be coupled to text color.
deny(
  "no-chrome-border-currentColor",
  /\bborder(?:-color)?\s*:\s*[^;]*\bcurrentColor\b/iu,
);

// Chrome must not animate bridge exports; only `--tau` drives motion.
deny(
  "no-chrome-transition-bridge-vars",
  /\btransition\s*:\s*[^;]*--axm-bridge-/iu,
);

// Chrome must not explicitly transition border-color.
deny(
  "no-chrome-transition-border-color",
  /\btransition\s*:\s*[^;]*\bborder-color\b/iu,
);

if (failures.length > 0) {
  console.error(
    `\n❌ [starlight-adapter-contract] Contract violations in ${path.relative(ROOT, FILE)}:\n`,
  );
  for (const f of failures) {
    console.error(`- ${f.rule}: ${JSON.stringify(f.match.trim())}`);
  }
  console.error(
    "\nFix: route chrome borders through `--axm-bridge-border-*` (or mapped `--sl-*`) and avoid transitioning bridge exports/border-color in chrome.\n",
  );
  process.exit(1);
}

console.log(
  "✅ [starlight-adapter-contract] Starlight adapter contract passed.",
);
