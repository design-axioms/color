import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const SITE_DIR = path.join(ROOT, "site");
const OUTPUT_DIR = path.join(SITE_DIR, "dist");

console.log("Building Astro Site...");
execSync("pnpm build", { cwd: SITE_DIR, stdio: "inherit" });

console.log(`✅ Site build complete at ${OUTPUT_DIR}`);
