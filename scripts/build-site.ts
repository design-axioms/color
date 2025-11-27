import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const DEMO_DIR = path.join(ROOT, "demo");
const SITE_DIR = path.join(ROOT, "site");
const OUTPUT_DIR = path.join(SITE_DIR, "dist");

console.log("Building Demo App...");
// Ensure we build for production to get the correct base path
execSync("pnpm build", {
  cwd: DEMO_DIR,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "production" },
});

console.log("Building Astro Site...");
execSync("pnpm build", { cwd: SITE_DIR, stdio: "inherit" });

console.log("Integrating Demo into Site...");
const demoSrc = path.join(DEMO_DIR, "dist");
const demoDest = path.join(OUTPUT_DIR, "demo");

if (fs.existsSync(demoDest)) {
  fs.rmSync(demoDest, { recursive: true, force: true });
}

// Copy recursively
fs.cpSync(demoSrc, demoDest, { recursive: true });

console.log(`✅ Site build complete at ${OUTPUT_DIR}`);
