import fs from "node:fs";
import path from "node:path";

const SOURCE_DIR = path.resolve(process.cwd(), "docs/legacy-guide/src");
const DEST_DIR = path.resolve(process.cwd(), "site/src/content/docs");

function migrateFile(filePath: string): void {
  const relativePath = path.relative(SOURCE_DIR, filePath);
  if (relativePath === "SUMMARY.md") return;

  const destPath = path.join(DEST_DIR, relativePath);
  const destDir = path.dirname(destPath);

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  let title = path.basename(filePath, ".md");
  let newContent = content;

  // Extract title from first H1
  const h1Index = lines.findIndex((line) => line.startsWith("# "));
  if (h1Index !== -1) {
    title = lines[h1Index].substring(2).trim();
    // Remove the H1 line
    lines.splice(h1Index, 1);
    newContent = lines.join("\n").trim();
  }

  // Create frontmatter
  const frontmatter = `---
title: ${title}
---

`;

  fs.writeFileSync(destPath, frontmatter + newContent);
  console.log(`Migrated: ${relativePath}`);
}

function walkDir(dir: string): void {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith(".md")) {
      migrateFile(filePath);
    }
  }
}

console.log("Starting migration...");
walkDir(SOURCE_DIR);
console.log("Migration complete.");
