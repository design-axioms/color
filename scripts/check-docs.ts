import { glob } from "glob";
import fs from "node:fs";
import path from "node:path";

const files = await glob("**/*.{md,mdx}", {
  ignore: ["node_modules/**", "dist/**"],
});
let hasError = false;

console.log(`Checking docs syntax in ${files.length} files...`);

for (const file of files) {
  const content = fs.readFileSync(file, "utf-8");
  const lines = content.split("\n");
  let inCodeBlock = false;

  // Check for block math not on its own line
  // Regex looks for $$ that has text before it on the same line, or text after it
  // But we need to be careful about inline usage if that's even allowed for $$ (usually $$ is display math)
  // In standard markdown, $$ is display math and usually requires newlines.

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) continue;

    // Toggle code block state
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    // Skip checks if inside a code block
    if (inCodeBlock) continue;

    // Check for broken subscripts: *{ instead of _{
    // This is a heuristic but matches the specific error we saw
    if (line.includes("*{")) {
      // Exclude cases where it might be bold text starting with {
      // But inside math, *{ is almost always a typo for _{
      // We can try to detect if we are inside a math block, but simple line check is a good start
      console.error(
        `\n[ERROR] Suspicious syntax '*{' found in ${file}:${i + 1}`,
      );
      console.error(`  ${line.trim()}`);
      console.error(`  -> Did you mean '_{' for a subscript?`);
      console.error(
        `  -> NOTE: If this file contains valid TeX that Prettier is breaking, add it to .prettierignore.`,
      );
      hasError = true;
    }

    // Check for HTML comments in MDX files
    if (file.endsWith(".mdx") && line.includes("<!--")) {
      console.error(
        `\n[ERROR] HTML comment '<!--' found in MDX file ${file}:${i + 1}`,
      );
      console.error(`  ${line.trim()}`);
      console.error(`  -> MDX treats '<' as the start of a JSX tag.`);
      console.error(`  -> Use JSX comments instead: '{/* comment */}'`);
      hasError = true;
    }

    // Check for $$ not on its own line (heuristic for the rendering issue)
    // We want to catch: "some text $$ math $$" -> should be "\n$$\nmath\n$$"
    // But we allow "$$ math $$" if it's the whole line
    if (line.includes("$$")) {
      const trimmed = line.trim();
      if (
        trimmed !== "$$" &&
        !trimmed.startsWith("$$ ") &&
        !trimmed.endsWith(" $$")
      ) {
        // This is a bit loose. Let's look for specific bad patterns.
        // Bad: "text: $$"
        if (trimmed.match(/[^$]+\$\$/)) {
          console.warn(
            `\n[WARNING] Potential inline block math in ${file}:${i + 1}`,
          );
          console.warn(`  ${line.trim()}`);
          console.warn(
            `  -> Block math ($$) usually renders best when on its own line.`,
          );
        }
      }
    }
  }
}

async function checkRelativeLinks(): Promise<void> {
  const DOCS_DIR = path.resolve("site/src/content/docs");

  if (!fs.existsSync(DOCS_DIR)) {
    console.warn(
      `\n[WARNING] Docs directory not found: ${DOCS_DIR}. Skipping link checks.`,
    );
    return;
  }

  const docFiles = await glob("**/*.{md,mdx}", { cwd: DOCS_DIR });
  console.log(`\nChecking relative links in ${docFiles.length} docs files...`);

  for (const relativeFile of docFiles) {
    const filePath = path.join(DOCS_DIR, relativeFile);
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === undefined) continue;

      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      if (inCodeBlock) continue;

      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match: RegExpExecArray | null;

      while ((match = linkRegex.exec(line)) !== null) {
        const link = match[2];
        if (!link) continue;

        // Ignore external links, anchors, and absolute paths.
        if (
          link.startsWith("http") ||
          link.startsWith("#") ||
          link.startsWith("/") ||
          link.startsWith("mailto:") ||
          link.startsWith("tel:")
        ) {
          continue;
        }

        // Strip query/hash for file existence checks.
        const linkPath = link.split("#")[0]?.split("?")[0] ?? link;
        if (!linkPath) continue;

        const dir = path.dirname(filePath);
        const resolvedPath = path.resolve(dir, linkPath);

        let exists = fs.existsSync(resolvedPath);
        if (!exists && !path.extname(resolvedPath)) {
          if (fs.existsSync(resolvedPath + ".md")) exists = true;
          else if (fs.existsSync(resolvedPath + ".mdx")) exists = true;
          else if (fs.existsSync(path.join(resolvedPath, "index.md")))
            exists = true;
          else if (fs.existsSync(path.join(resolvedPath, "index.mdx")))
            exists = true;
        }

        if (!exists) {
          console.error(
            `\n[ERROR] Broken link in ${relativeFile}:${i + 1}: ${link} -> ${resolvedPath}`,
          );
          hasError = true;
        }
      }
    }
  }
}

await checkRelativeLinks();

if (hasError) {
  console.log("\n❌ Docs syntax check failed.");
  process.exit(1);
} else {
  console.log("\n✅ Docs syntax check passed.");
}
