/**
 * List all built Astro pages.
 *
 * Primary use: generate an authoritative route list for automation (snaps/continuity)
 * by reading HTML output from `site/dist` after `pnpm --filter site build`.
 */

import { readdir } from "node:fs/promises";
import path from "node:path";

type Format = "json" | "lines";

type Options = {
  distDir: string;
  format: Format;
  include404: boolean;
  limit: number | null;
};

function parseArgs(argv: string[]): Options {
  const opts: Options = {
    distDir: "site/dist",
    format: "lines",
    include404: false,
    limit: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg) continue;

    if (arg === "--dist") {
      const value = argv[i + 1];
      if (!value) throw new Error("--dist requires a value");
      opts.distDir = value;
      i += 1;
      continue;
    }

    if (arg === "--format") {
      const value = argv[i + 1];
      if (!value) throw new Error("--format requires a value");
      if (value !== "json" && value !== "lines") {
        throw new Error(`Invalid --format: ${value}`);
      }
      opts.format = value;
      i += 1;
      continue;
    }

    if (arg === "--include-404") {
      opts.include404 = true;
      continue;
    }

    if (arg === "--limit") {
      const value = argv[i + 1];
      if (!value) throw new Error("--limit requires a value");
      const parsed = Number.parseInt(value, 10);
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error(`Invalid --limit: ${value}`);
      }
      opts.limit = parsed;
      i += 1;
      continue;
    }

    throw new Error(`Unknown arg: ${arg}`);
  }

  return opts;
}

async function walkHtmlFiles(dir: string): Promise<string[]> {
  const out: string[] = [];

  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      out.push(...(await walkHtmlFiles(full)));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".html")) continue;

    out.push(full);
  }

  return out;
}

function toRoute(distDir: string, fullPath: string): string | null {
  const rel = path.relative(distDir, fullPath);

  // Normalize Windows separators (even though CI is typically POSIX).
  const relPosix = rel.split(path.sep).join("/");

  if (relPosix === "index.html") return "/";
  if (relPosix.endsWith("/index.html")) {
    const prefix = relPosix.slice(0, -"/index.html".length);
    return `/${prefix}/`;
  }

  // Non-index html pages (rare) become `/path/to/file`.
  return `/${relPosix.replace(/\.html$/, "")}`;
}

function isIgnoredRoute(route: string, include404: boolean): boolean {
  if (!include404 && route === "/404") return true;

  // Astro integration pages occasionally end up as HTML artifacts; keep the list
  // focused on user-facing pages.
  if (route.startsWith("/_astro/")) return true;

  return false;
}

async function main(): Promise<void> {
  // Allow piping to `head`/`sed` without crashing the process.
  process.stdout.on("error", (err) => {
    const code = (err as { code?: string } | null)?.code;
    if (code === "EPIPE") process.exit(0);
    throw err;
  });

  const opts = parseArgs(process.argv.slice(2));
  const distDir = path.resolve(process.cwd(), opts.distDir);

  let htmlFiles: string[];
  try {
    htmlFiles = await walkHtmlFiles(distDir);
  } catch (e) {
    const err = e as { message?: string };
    const msg = err.message ? ` (${err.message})` : "";
    throw new Error(
      `Unable to read ${opts.distDir}${msg}. Run \`pnpm --filter site build\` first.`,
    );
  }

  const routes = new Set<string>();
  for (const file of htmlFiles) {
    const route = toRoute(distDir, file);
    if (!route) continue;
    if (isIgnoredRoute(route, opts.include404)) continue;
    routes.add(route);
  }

  const sorted = Array.from(routes).sort((a, b) => a.localeCompare(b));
  const limited =
    opts.limit === null ? sorted : sorted.slice(0, Math.max(0, opts.limit));

  if (opts.format === "json") {
    process.stdout.write(`${JSON.stringify(limited, null, 2)}\n`);
    return;
  }

  for (const r of limited) {
    process.stdout.write(`${r}\n`);
  }
}

await main();
