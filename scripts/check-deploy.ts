import { execSync } from "node:child_process";

const SCOPE = "yehuda-katzs-projects";
const PROJECTS = ["color", "color-site"];

function getBranch(): string {
  return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
}

function slugify(branch: string): string {
  // Vercel replaces non-alphanumeric chars with '-'
  return branch.replace(/[^a-zA-Z0-9]/g, "-");
}

function run(command: string): string {
  try {
    // Capture both stdout and stderr
    return execSync(command + " 2>&1", { stdio: "pipe" }).toString();
  } catch (e: unknown) {
    console.error("Command failed:", command);
    if (e instanceof Error) {
      console.error("Error:", e.message);
    }
    // execSync throws an error that has stdout/stderr properties if it's a child_process error
    const err = e as { stdout?: Buffer; stderr?: Buffer };
    return (err.stdout?.toString() ?? "") + (err.stderr?.toString() ?? "");
  }
}

function main(): void {
  const branch = getBranch();
  const slug = slugify(branch);

  console.log(`🔍 Checking deployments for branch: ${branch} (slug: ${slug})`);

  for (const project of PROJECTS) {
    const url = `${project}-git-${slug}-${SCOPE}.vercel.app`;
    console.log(`\n---------------------------------------------------`);
    console.log(`🚀 Project: ${project}`);
    console.log(`🔗 URL: https://${url}`);

    console.log(`\n📊 Status:`);
    // Just use 'vercel' since pnpm adds it to PATH
    const inspectOutput = run(`vercel inspect ${url}`);
    console.log(inspectOutput);

    // Extract Deployment ID to construct Dashboard URL
    const idMatch = inspectOutput.match(/id\s+(dpl_[a-zA-Z0-9]+)/);
    if (idMatch) {
      const id = idMatch[1];
      const dashboardUrl = `https://vercel.com/${SCOPE}/${project}/${id}`;
      console.log(`\n📋 Dashboard & Logs: ${dashboardUrl}`);
    } else {
      console.log(`\n⚠️ Could not extract Deployment ID.`);
    }
  }
}

main();
