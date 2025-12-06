import { glob } from "glob";
import fs from "node:fs";

const files = await glob("**/*.{md,mdx}", {
  ignore: ["node_modules/**", "dist/**"],
});
let hasError = false;

console.log(`Checking math syntax in ${files.length} files...`);

for (const file of files) {
  const content = fs.readFileSync(file, "utf-8");
  const lines = content.split("\n");

  // Check for block math not on its own line
  // Regex looks for $$ that has text before it on the same line, or text after it
  // But we need to be careful about inline usage if that's even allowed for $$ (usually $$ is display math)
  // In standard markdown, $$ is display math and usually requires newlines.

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) continue;

    // Check for broken subscripts: *{ instead of _{
    // This is a heuristic but matches the specific error we saw
    if (line.includes("*{")) {
      // Exclude cases where it might be bold text starting with {
      // But inside math, *{ is almost always a typo for _{
      // We can try to detect if we are inside a math block, but simple line check is a good start
      console.error(
        `\n[ERROR] Suspicious syntax '*{' found in ${file}:${i + 1}`,
      );
      console.error(`  ${line.trim()}`);
      console.error(`  -> Did you mean '_{' for a subscript?`);
      hasError = true;
    }

    // Check for $$ not on its own line (heuristic for the rendering issue)
    // We want to catch: "some text $$ math $$" -> should be "\n$$\nmath\n$$"
    // But we allow "$$ math $$" if it's the whole line
    if (line.includes("$$")) {
      const trimmed = line.trim();
      if (
        trimmed !== "$$" &&
        !trimmed.startsWith("$$ ") &&
        !trimmed.endsWith(" $$")
      ) {
        // This is a bit loose. Let's look for specific bad patterns.
        // Bad: "text: $$"
        if (trimmed.match(/[^$]+\$\$/)) {
          console.warn(
            `\n[WARNING] Potential inline block math in ${file}:${i + 1}`,
          );
          console.warn(`  ${line.trim()}`);
          console.warn(
            `  -> Block math ($$) usually renders best when on its own line.`,
          );
        }
      }
    }
  }
}

if (hasError) {
  console.log("\n❌ Math syntax check failed.");
  process.exit(1);
} else {
  console.log("\n✅ Math syntax check passed.");
}
