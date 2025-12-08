import fs from "node:fs";
import path from "node:path";

const QA_ROOT = path.join(process.cwd(), "qa-audit");

function reorganize(): void {
  if (!fs.existsSync(QA_ROOT)) {
    console.log("QA root not found.");
    return;
  }

  const pages = fs
    .readdirSync(QA_ROOT)
    .filter((f) => fs.statSync(path.join(QA_ROOT, f)).isDirectory());

  for (const page of pages) {
    const pageDir = path.join(QA_ROOT, page);
    const files = fs
      .readdirSync(pageDir)
      .filter((f) => f.endsWith(".png") || f.endsWith(".md"));

    for (const file of files) {
      // Parse filename: viewport-theme[-debug].png
      // Example: desktop-light.png, desktop-light-debug.png
      // Also handle: desktop-light-description.md
      const match = file.match(
        /^([a-z]+)-([a-z]+)(?:-(debug))?(\.png|-description\.md)$/,
      );

      if (match) {
        const [_, viewport, theme, isDebug, ext] = match;
        const targetDir = path.join(pageDir, viewport, theme);

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        let newName = "";
        if (ext === ".png") {
          newName = isDebug ? "debug.png" : "view.png";
        } else if (ext === "-description.md") {
          newName = "description.md";
        }

        if (newName) {
          const oldPath = path.join(pageDir, file);
          const newPath = path.join(targetDir, newName);

          console.log(
            `Moving ${page}/${file} -> ${page}/${viewport}/${theme}/${newName}`,
          );
          fs.renameSync(oldPath, newPath);
        }
      }
    }
  }
}

reorganize();
