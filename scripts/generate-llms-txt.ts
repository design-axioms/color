import { glob } from "glob";
import fs from "node:fs";
import path from "node:path";

const SITE_DOCS_DIR = "site/src/content/docs";
const OUTPUT_DIR = "site/public";

// Files to include in the summary (llms.txt)
// Order matters for context window optimization
const SUMMARY_FILES = [
  // 1. The Constitution
  { path: "docs/design/theory/axioms.md", title: "Axioms (The Constitution)" },

  // 2. Core Concepts
  {
    path: "site/src/content/docs/concepts/thinking-in-surfaces.mdx",
    title: "Thinking in Surfaces",
  },
  {
    path: "site/src/content/docs/concepts/accessibility-first.mdx",
    title: "Accessibility First",
  },

  // 3. Getting Started
  {
    path: "site/src/content/docs/guides/quick-start.mdx",
    title: "Quick Start",
  },

  // 4. Reference
  { path: "site/src/content/docs/reference/cli.md", title: "CLI Reference" },
  {
    path: "site/src/content/docs/reference/javascript-api.md",
    title: "JavaScript API",
  },
  {
    path: "css/engine.css",
    title: "CSS Engine Reference",
    isCode: true,
    lang: "css",
  },
  {
    path: "css/theme.css",
    title: "CSS Theme Reference",
    isCode: true,
    lang: "css",
  },

  // 5. Schema (Special handling)
  {
    path: "color-config.schema.json",
    title: "Configuration Schema",
    isJson: true,
  },
];

// Helper to strip frontmatter
function stripFrontmatter(content: string): string {
  // Matches --- at start of file, followed by anything, followed by ---
  return content.replace(/^---\n[\s\S]*?\n---\n/, "");
}

// Helper to clean MDX components
function cleanMdx(content: string): string {
  let cleaned = content;

  // Remove import statements
  cleaned = cleaned.replace(/^import\s+.*?from\s+.*?;/gm, "");

  // Remove <Tabs>, <TabItem> wrappers but keep content if possible?
  // For now, let's just remove the tags.
  cleaned = cleaned.replace(/<Tabs>/g, "");
  cleaned = cleaned.replace(/<\/Tabs>/g, "");
  cleaned = cleaned.replace(/<TabItem.*?>/g, "");
  cleaned = cleaned.replace(/<\/TabItem>/g, "");

  // Remove <Card>, <LinkCard>
  cleaned = cleaned.replace(/<Card.*?>/g, "");
  cleaned = cleaned.replace(/<\/Card>/g, "");
  cleaned = cleaned.replace(/<LinkCard.*?>/g, "");

  // Remove <Aside>
  cleaned = cleaned.replace(/<Aside.*?>/g, "> "); // Convert to blockquote
  cleaned = cleaned.replace(/<\/Aside>/g, "");

  // Remove <FileTree>
  cleaned = cleaned.replace(/<FileTree>/g, "");
  cleaned = cleaned.replace(/<\/FileTree>/g, "");

  return cleaned.trim();
}

function generateSummary(): void {
  let output = "# Axiomatic Color - AI Context\n\n";
  output +=
    "This file contains a condensed overview of the Axiomatic Color system, designed for LLMs.\n\n";

  for (const file of SUMMARY_FILES) {
    output += `## ${file.title}\n\n`;

    try {
      const content = fs.readFileSync(file.path, "utf-8");

      if (file.isJson) {
        output += "```json\n" + content + "\n```\n\n";
      } else if (file.isCode) {
        output += "```" + (file.lang || "") + "\n" + content + "\n```\n\n";
      } else {
        let text = stripFrontmatter(content);
        text = cleanMdx(text);
        output += text + "\n\n";
      }
    } catch {
      console.warn(`Warning: Could not read file ${file.path}`);
    }

    output += "---\n\n";
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, "llms.txt"), output);
  console.log(`Generated ${path.join(OUTPUT_DIR, "llms.txt")}`);
}

async function generateFull(): Promise<void> {
  let output = "# Axiomatic Color - Full Documentation\n\n";

  // Get all MDX files in site/src/content/docs
  const files = await glob(`${SITE_DOCS_DIR}/**/*.{md,mdx}`);

  // Sort files to have a deterministic order (maybe alphabetical or by some priority?)
  // For now, alphabetical is fine.
  files.sort();

  // Add Axioms first
  const axiomsPath = "docs/design/theory/axioms.md";
  if (fs.existsSync(axiomsPath)) {
    output += `## Axioms\n\n`;
    output +=
      cleanMdx(stripFrontmatter(fs.readFileSync(axiomsPath, "utf-8"))) +
      "\n\n---\n\n";
  }

  for (const filePath of files) {
    const relativePath = path.relative(SITE_DOCS_DIR, filePath);
    output += `## ${relativePath}\n\n`;

    const content = fs.readFileSync(filePath, "utf-8");
    let text = stripFrontmatter(content);
    text = cleanMdx(text);
    output += text + "\n\n";
    output += "---\n\n";
  }

  // Add Schema
  output += "## Configuration Schema\n\n";
  output +=
    "```json\n" +
    fs.readFileSync("color-config.schema.json", "utf-8") +
    "\n```\n\n";

  fs.writeFileSync(path.join(OUTPUT_DIR, "llms-full.txt"), output);
  console.log(`Generated ${path.join(OUTPUT_DIR, "llms-full.txt")}`);
}

async function main(): Promise<void> {
  generateSummary();
  await generateFull();
}

main().catch(console.error);
