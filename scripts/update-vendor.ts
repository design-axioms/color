import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const VENDOR_DIR = join(ROOT, "vendor");
const CONFIG_PATH = join(VENDOR_DIR, "vendor.json");

interface VendorConfig {
  [key: string]: {
    url: string;
    branch?: string;
    description?: string;
  };
}

function run(command: string, cwd: string): void {
  console.log(`> ${command}`);
  execSync(command, { cwd, stdio: "inherit" });
}

function main(): void {
  if (!existsSync(CONFIG_PATH)) {
    console.error(`Config not found at ${CONFIG_PATH}`);
    process.exit(1);
  }

  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) as VendorConfig;

  if (!existsSync(VENDOR_DIR)) {
    mkdirSync(VENDOR_DIR, { recursive: true });
  }

  for (const [name, repo] of Object.entries(config)) {
    const targetDir = join(VENDOR_DIR, name);
    console.log(`\nProcessing ${name}...`);

    if (existsSync(targetDir)) {
      console.log(`Updating existing repository in ${targetDir}`);
      // Check if it's a git repo
      if (existsSync(join(targetDir, ".git"))) {
        run("git fetch origin", targetDir);
        run(`git reset --hard origin/${repo.branch || "main"}`, targetDir);
      } else {
        console.warn(
          `Directory ${targetDir} exists but is not a git repository. Skipping.`,
        );
      }
    } else {
      console.log(`Cloning ${repo.url} into ${targetDir}`);
      run(`git clone ${repo.url} ${name}`, VENDOR_DIR);
    }
  }

  console.log("\nVendor update complete.");
}

main();
