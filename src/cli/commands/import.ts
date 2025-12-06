import fs from "fs";
import path from "path";
import { DTCGImporter } from "../../lib/importers/dtcg.ts";
import type { SolverConfig } from "../../lib/types.ts";

export function importCommand(
  inputFile: string,
  options: { out?: string; dryRun?: boolean } = {},
): void {
  const cwd = process.cwd();
  const inputPath = path.resolve(cwd, inputFile);

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }

  console.log(`Reading tokens from ${inputPath}...`);
  const content = fs.readFileSync(inputPath, "utf-8");

  const importer = new DTCGImporter();
  let config: SolverConfig;

  try {
    config = importer.parse(content);
  } catch (error: unknown) {
    console.error(
      "Error parsing DTCG tokens:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }

  const output = JSON.stringify(config, null, 2);

  if (options.dryRun) {
    console.log("--- Generated Configuration ---");
    console.log(output);
  } else {
    const outFile = options.out || "color-config.json";
    const outPath = path.resolve(cwd, outFile);
    fs.writeFileSync(outPath, output);
    console.log(`Configuration written to ${outPath}`);
  }
}
