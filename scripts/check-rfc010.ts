/**
 * RFC 010 compliance gate.
 *
 * Scope: shipped consumer layers (docs/site styles + examples).
 *
 * This is intentionally conservative: it rejects raw color literals and
 * direct token-variable usage in consumer CSS/JS/TS/TSX where we expect
 * class-based utilities to be used instead.
 */

import { globSync } from "glob";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type Violation = {
  file: string;
  line: number;
  column: number;
  rule: string;
  match: string;
};

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const POLICY_DIR = path.join(ROOT, "policy");

const POLICY_PATHS = {
  // Per-config strict policies (primary enforcement source)
  site: path.join(POLICY_DIR, "class-tokens.site.json"),
  vercelDemo: path.join(POLICY_DIR, "class-tokens.vercel-demo.json"),
  // Back-compat / unknown-scope fallback
  union: path.join(POLICY_DIR, "class-tokens.json"),
} as const;

const IGNORE_GLOBS = [
  "**/node_modules/**",
  "**/dist/**",
  "**/coverage/**",
  "**/.astro/**",
  "**/.svelte-kit/**",
  "**/vendor/**",
  "**/site/src/styles/theme.css",
  "**/examples/**/css/theme.css",
  "**/css/engine.css",
  "**/css/theme.css",
];

const FILE_GLOBS = [
  "site/src/**/*.{css,astro,svelte,ts,tsx,js,jsx}",
  "examples/**/src/**/*.{css,ts,tsx,js,jsx,html,astro,svelte}",
];

// RFC 010 boundary: Starlight theme variables are not a styling API for authored components.
// They are only allowed in a single bridge stylesheet that targets Starlight-owned markup.
const ALLOWED_STARLIGHT_VARS_FILES = new Set<string>([
  "site/src/styles/starlight-custom.css",
]);

// RFC 013: integration adapters may reference bridge exports, but consumers may not.
const ALLOWED_BRIDGE_EXPORTS_FILES = new Set<string>([
  "site/src/styles/starlight-custom.css",
]);

type ClassTokenPolicy = {
  schemaVersion: number;
  classTokens: string[];
  reservedPrefixes?: string[];
};

type LoadedPolicy = {
  allowed: ReadonlySet<string>;
  dashedPrefixes: ReadonlySet<string>;
};

const cachedPolicies = new Map<string, LoadedPolicy>();

function policyPathForFile(filePath: string): string {
  const r = rel(filePath);
  if (r.startsWith("site/src/")) return POLICY_PATHS.site;
  if (r.startsWith("examples/vercel-demo/src/")) return POLICY_PATHS.vercelDemo;
  return POLICY_PATHS.union;
}

function loadAllowedClassTokens(policyPath: string): LoadedPolicy {
  const cached = cachedPolicies.get(policyPath);
  if (cached) return cached;

  if (!fs.existsSync(policyPath)) {
    throw new Error(
      `Missing class-token policy at ${rel(policyPath)}. Run: node scripts/generate-class-tokens.ts`,
    );
  }

  const policy = JSON.parse(
    fs.readFileSync(policyPath, "utf8"),
  ) as ClassTokenPolicy;

  if (!policy || !Array.isArray(policy.classTokens)) {
    throw new Error(
      `Invalid class-token policy at ${rel(policyPath)} (expected { classTokens: string[] }).`,
    );
  }

  const allowed = new Set(policy.classTokens);
  const dashedPrefixes = new Set<string>();

  if (Array.isArray(policy.reservedPrefixes)) {
    for (const prefix of policy.reservedPrefixes) {
      if (typeof prefix === "string" && prefix.length > 0) {
        dashedPrefixes.add(prefix);
      }
    }
  } else {
    // Back-compat fallback: reserve any prefix implied by the allowlist.
    for (const token of allowed) {
      const dash = token.indexOf("-");
      if (dash > 0) dashedPrefixes.add(token.slice(0, dash));
    }
  }

  const loaded = { allowed, dashedPrefixes };
  cachedPolicies.set(policyPath, loaded);
  return loaded;
}

const PATTERNS: Array<{
  rule: string;
  re: RegExp;
  appliesTo: "css" | "code" | "all";
}> = [
  {
    rule: "no-private-axm-vars",
    re: /var\(--_axm-[a-z0-9-]+\)/gi,
    appliesTo: "all",
  },
  {
    rule: "no-axm-vars",
    re: /var\(--axm-[a-z0-9-]+\)/gi,
    appliesTo: "all",
  },
  {
    rule: "no-hardcoded-colors",
    re: /#[0-9a-f]{3,8}\b/gi,
    appliesTo: "all",
  },
  {
    rule: "no-hardcoded-color-functions",
    re: /\b(?:rgb|rgba|hsl|hsla|oklch|oklab|color-mix)\(/gi,
    appliesTo: "all",
  },
  {
    rule: "no-tailwind-color-classes",
    // Target the most common footguns. Expand as needed.
    re: /\b(?:bg|text|border)-(?:black|white|gray|red|green|blue|yellow|orange|purple|pink)(?:\/[0-9]{1,3})?\b/g,
    appliesTo: "code",
  },
];

function rel(p: string): string {
  return path.relative(ROOT, p).replaceAll(path.sep, "/");
}

function toLineColumn(
  content: string,
  index: number,
): { line: number; column: number } {
  let line = 1;
  let lastNewline = -1;
  for (let i = 0; i < index; i++) {
    if (content.charCodeAt(i) === 10) {
      line++;
      lastNewline = i;
    }
  }
  return { line, column: index - lastNewline };
}

function collectViolations(filePath: string): Violation[] {
  const ext = path.extname(filePath).toLowerCase();
  const kind: "css" | "code" = ext === ".css" ? "css" : "code";

  const content = fs.readFileSync(filePath, "utf8");

  const violations: Violation[] = [];

  // RFC 010: `--sl-*` variables are permitted only at the Starlight boundary.
  // We scan raw text (not just CSS) because `--sl-` can appear in embedded styles.
  const r = rel(filePath);
  if (content.includes("--sl-") && !ALLOWED_STARLIGHT_VARS_FILES.has(r)) {
    const re = /--sl-[a-z0-9-]+/gi;
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(content)) !== null) {
      const where = toLineColumn(content, match.index);
      violations.push({
        file: r,
        line: where.line,
        column: where.column,
        rule: "no-starlight-vars-outside-boundary",
        match: match[0],
      });
      if (match.index === re.lastIndex) re.lastIndex++;
    }
  }

  // RFC 010: Legacy un-namespaced `--computed-*` variables are not a consumer-facing API.
  // They are banned everywhere in consumer layers (even as locally-defined props), because
  // they indicate "addressing the engine" rather than expressing intent via class tokens.
  if (content.includes("--computed-")) {
    const re = /--computed-[a-z0-9-]+/gi;
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(content)) !== null) {
      const where = toLineColumn(content, match.index);
      violations.push({
        file: r,
        line: where.line,
        column: where.column,
        rule: "no-legacy-computed-vars",
        match: match[0],
      });
      if (match.index === re.lastIndex) re.lastIndex++;
    }
  }

  for (const { rule, re, appliesTo } of PATTERNS) {
    if (appliesTo !== "all" && appliesTo !== kind) continue;

    re.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = re.exec(content)) !== null) {
      if (rule === "no-axm-vars") {
        const raw = match[0] ?? "";
        const isBridge = /^var\(--axm-bridge-[a-z0-9-]+\)$/i.test(raw);
        if (isBridge && ALLOWED_BRIDGE_EXPORTS_FILES.has(r)) {
          if (match.index === re.lastIndex) re.lastIndex++;
          continue;
        }
      }

      const where = toLineColumn(content, match.index);
      violations.push({
        file: rel(filePath),
        line: where.line,
        column: where.column,
        rule,
        match: match[0],
      });

      // Prevent infinite loops on zero-length matches (shouldn't happen here).
      if (match.index === re.lastIndex) re.lastIndex++;
    }
  }

  // RFC 010: Axiomatic color effects must be expressed via class tokens.
  // Validate that any Axiomatic-looking class token used in markup is in the allowlist.
  // Note: This does NOT attempt to validate arbitrary classnames; only those that match
  // the prefixes implied by the allowlist.
  if (ext === ".svelte" || ext === ".astro" || ext === ".html") {
    const { allowed, dashedPrefixes } = loadAllowedClassTokens(
      policyPathForFile(filePath),
    );

    // class="a b c" (simple static attributes)
    const classAttr = /\bclass\s*=\s*(["'])(.*?)\1/gs;
    let m: RegExpExecArray | null;
    while ((m = classAttr.exec(content)) !== null) {
      const raw = m[2] ?? "";
      const tokens = raw.split(/\s+/g).filter(Boolean);
      for (const token of tokens) {
        // Skip dynamic/templated tokens (common in Astro/Svelte)
        if (
          token.includes("{") ||
          token.includes("}") ||
          token.includes(":") ||
          token.includes("$")
        ) {
          continue;
        }

        if (allowed.has(token)) continue;
        const dash = token.indexOf("-");
        if (dash <= 0) continue;

        const prefix = token.slice(0, dash);
        if (!dashedPrefixes.has(prefix)) continue;

        const where = toLineColumn(content, m.index);
        violations.push({
          file: rel(filePath),
          line: where.line,
          column: where.column,
          rule: "unknown-class-token",
          match: token,
        });
      }
    }

    // Svelte class directives: class:surface-card={...}
    if (ext === ".svelte") {
      const directive = /\bclass:([a-zA-Z_][a-zA-Z0-9_-]*)\b/g;
      while ((m = directive.exec(content)) !== null) {
        const token = m[1];
        if (!token) continue;
        if (allowed.has(token)) continue;

        const dash = token.indexOf("-");
        if (dash <= 0) continue;
        const prefix = token.slice(0, dash);
        if (!dashedPrefixes.has(prefix)) continue;

        const where = toLineColumn(content, m.index);
        violations.push({
          file: rel(filePath),
          line: where.line,
          column: where.column,
          rule: "unknown-class-token",
          match: token,
        });
      }
    }
  }

  return violations;
}

const files = FILE_GLOBS.flatMap((pattern) =>
  globSync(pattern, { ignore: IGNORE_GLOBS, nodir: true }),
);

const allViolations = files.flatMap(collectViolations);

if (allViolations.length > 0) {
  const grouped = new Map<string, Violation[]>();
  for (const v of allViolations) {
    const key = `${v.file}`;
    const existing = grouped.get(key) ?? [];
    existing.push(v);
    grouped.set(key, existing);
  }

  console.error("RFC 010 compliance violations found:\n");
  for (const [file, violations] of grouped) {
    for (const v of violations.slice(0, 50)) {
      console.error(`${file}:${v.line}:${v.column}  ${v.rule}  ${v.match}`);
    }
    if (violations.length > 50) {
      console.error(`${file}: (and ${violations.length - 50} more...)`);
    }
  }

  console.error(`\nTotal violations: ${allViolations.length}`);
  process.exit(1);
}

console.log("RFC 010 compliance: OK");
