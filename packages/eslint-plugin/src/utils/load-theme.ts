import fs from "fs";
import path from "path";

export function findThemeCss(cwd: string): string | null {
  // Heuristic: Look for css/theme.css or theme.css
  const candidates = [
    path.join(cwd, "css", "theme.css"),
    path.join(cwd, "theme.css"),
    path.join(cwd, "src", "theme.css"),
    path.join(cwd, "styles", "theme.css"),
    path.join(cwd, "..", "..", "css", "theme.css"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export function findUtilitiesCss(cwd: string): string | null {
  // Heuristic: Look for css/utilities.css
  const candidates = [
    path.join(cwd, "css", "utilities.css"),
    path.join(cwd, "utilities.css"),
    path.join(cwd, "src", "utilities.css"),
    path.join(cwd, "styles", "utilities.css"),
    path.join(cwd, "..", "..", "css", "utilities.css"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export function extractVariablesFromCss(cssPath: string): Set<string> {
  try {
    const content = fs.readFileSync(cssPath, "utf-8");
    const regex = /--[a-zA-Z0-9-]+:/g;
    const matches = content.match(regex);
    if (!matches) return new Set();

    // Remove the trailing colon
    return new Set(matches.map((m) => m.slice(0, -1)));
  } catch (e) {
    console.error(`Failed to read CSS file at ${cssPath}`, e);
    return new Set();
  }
}

export function extractVariableToClassMap(
  cssPath: string,
): Map<string, string> {
  const map = new Map<string, string>();
  try {
    const content = fs.readFileSync(cssPath, "utf-8");
    // Simple regex to find .classname { ... var(--token) ... }
    // This is a bit naive but works for simple utility files
    // We look for a class block, then scan for vars inside it

    // Regex to match a class block: .classname { content }
    const blockRegex = /\.([a-zA-Z0-9-_]+)\s*\{([^}]+)\}/g;
    let match;

    while ((match = blockRegex.exec(content)) !== null) {
      const className = match[1];
      const blockContent = match[2];

      // Find all vars used in this block
      const varRegex = /var\((--[a-zA-Z0-9-]+)\)/g;
      let varMatch;
      while ((varMatch = varRegex.exec(blockContent)) !== null) {
        const varName = varMatch[1];
        // If multiple classes use the same var, the last one wins (or we could store a list)
        // For now, let's just store the first one we find or overwrite.
        // Ideally we want the most specific one.
        // Let's assume 1:1 for now for simple utilities like .shadow-sm
        map.set(varName, className);
      }
    }

    return map;
  } catch (e) {
    console.error(`Failed to read CSS file at ${cssPath}`, e);
    return map;
  }
}

export function findColorConfig(cwd: string): string | null {
  const candidates = [
    path.join(cwd, "color-config.json"),
    path.join(cwd, "..", "color-config.json"),
    path.join(cwd, "..", "..", "color-config.json"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export interface ColorConfig {
  groups?: {
    surfaces?: {
      slug: string;
    }[];
  }[];
}

export function loadColorConfig(configPath: string): ColorConfig | null {
  try {
    const content = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(content) as ColorConfig;
  } catch (e) {
    console.error(`Failed to read color config at ${configPath}`, e);
    return null;
  }
}
