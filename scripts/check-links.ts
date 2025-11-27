import fs from "fs";
import { glob } from "glob";
import path from "path";

const DOCS_DIR = path.resolve("site/src/content/docs");

async function checkLinks() {
  const files = await glob("**/*.{md,mdx}", { cwd: DOCS_DIR });
  let errors = 0;

  for (const file of files) {
    const filePath = path.join(DOCS_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const [fullMatch, text, link] = match;

      // Ignore external links, anchors, and absolute paths (for now)
      if (
        link.startsWith("http") ||
        link.startsWith("#") ||
        link.startsWith("/")
      ) {
        continue;
      }

      // Resolve relative path
      const dir = path.dirname(filePath);
      const resolvedPath = path.resolve(dir, link);

      // Check if file exists
      // Try exact match, then with .md, .mdx
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
        console.error(`Broken link in ${file}: ${link} -> ${resolvedPath}`);
        errors++;
      }
    }
  }

  if (errors === 0) {
    console.log("No broken relative links found.");
  } else {
    console.log(`Found ${errors} broken links.`);
  }
}

checkLinks();
