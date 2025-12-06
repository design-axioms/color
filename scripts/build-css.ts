import { bundle } from "lightningcss";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const INPUT = join(ROOT, "css/index.css");
const OUTPUT = join(ROOT, "dist/style.css");

console.log(`Bundling CSS from ${INPUT} to ${OUTPUT}...`);

try {
  const { code, map } = bundle({
    filename: INPUT,
    minify: true,
    sourceMap: true,
    // Targeting modern browsers that support @layer, :has, etc.
    targets: {
      chrome: 120 << 16,
      firefox: 120 << 16,
      safari: 17 << 16,
    },
  });

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, code);
  if (map) {
    writeFileSync(OUTPUT + ".map", map);
  }

  console.log("✅ CSS bundled successfully.");
} catch (err) {
  console.error("❌ CSS bundling failed:");
  console.error(err);
  process.exit(1);
}
