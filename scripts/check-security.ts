import { glob } from "glob";
import { readFile } from "node:fs/promises";

const WHITELIST = [
  "http://www.w3.org",
  "http://json-schema.org",
  "http://localhost",
  "http://127.0.0.1",
  "http://schemas.microsoft.com", // Common in XML/SVG
];

const IGNORE_PATTERNS = [
  "node_modules/**",
  "**/node_modules/**",
  "vendor/**",
  "dist/**",
  "coverage/**",
  ".git/**",
  "pnpm-lock.yaml",
  "**/*.map",
  "**/*.svg", // SVGs often contain http://www.w3.org namespaces
  "site/.astro/**",
  "site/dist/**",
  "site/node_modules/**",
  "**/*.png",
  "**/*.jpg",
  "**/*.jpeg",
  "**/*.gif",
  "**/*.webp",
  "**/*.ico",
  "**/*.woff",
  "**/*.woff2",
  "**/*.ttf",
  "**/*.eot",
  "**/*.mp4",
  "**/*.webm",
  "**/*.otf",
];

async function checkSecurity(): Promise<void> {
  const args = process.argv.slice(2);
  let files: string[] = [];

  if (args.length > 0) {
    console.log("Scanning specific files for insecure HTTP URLs...");
    files = args;
  } else {
    console.log("Scanning all files for insecure HTTP URLs...");
    files = await glob("**/*", {
      ignore: IGNORE_PATTERNS,
      nodir: true,
    });
  }

  let hasError = false;
  let checkedCount = 0;

  for (const file of files) {
    try {
      // Check if file matches any ignore pattern (simple extension check)
      const isIgnored = IGNORE_PATTERNS.some((pattern) => {
        if (pattern.startsWith("**/*.")) {
          const ext = pattern.substring(4);
          return file.endsWith(ext);
        }
        return false;
      });

      if (isIgnored) continue;

      // Skip if it looks like a binary file based on extension (simple check)
      // The glob ignore handles most, but just in case

      const content = await readFile(file, "utf-8");
      checkedCount++;

      // Match http:// followed by non-whitespace and non-quote characters
      const httpMatches = content.matchAll(/http:\/\/[^\s"'`)<>]+/g);

      for (const match of httpMatches) {
        const url = match[0];
        // Check if the URL starts with any whitelisted prefix
        const isWhitelisted = WHITELIST.some((w) => url.startsWith(w));

        if (!isWhitelisted) {
          console.error(`Error: Insecure URL found in ${file}: ${url}`);
          hasError = true;
        }
      }
    } catch {
      // Ignore read errors (e.g. directories or binary files that slipped through)
      continue;
    }
  }

  console.log(`Scanned ${checkedCount} files.`);

  if (hasError) {
    console.error("Security check failed: Insecure HTTP URLs detected.");
    process.exit(1);
  } else {
    console.log("Security check passed: No insecure HTTP URLs found.");
  }
}

void checkSecurity();
