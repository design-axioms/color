import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/*.spec.ts"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { open: "never", outputFolder: ".tmp/playwright-report" }],
  ],
  outputDir: ".tmp/test-results",
  testIgnore: [
    "golden-master.spec.ts",
    "llm-context.spec.ts",
    "verify-colors.spec.ts",
  ],
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command:
        "pnpm --filter site build && pnpm --filter site preview -- --host 127.0.0.1 --port 4321",
      url: "http://127.0.0.1:4321",
      // Avoid stale previews: always run against the current workspace build.
      reuseExistingServer: false,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: "pnpm --filter vercel-demo dev --port 5174",
      url: "http://127.0.0.1:5174",
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
  projects: [
    {
      name: "chromium",
      testIgnore: [
        "golden-master.spec.ts",
        "llm-context.spec.ts",
        "verify-colors.spec.ts",
        "vercel-alignment.spec.ts",
        "css-utils.playwright.spec.ts",
      ],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://127.0.0.1:4321",
      },
    },
    {
      name: "chromium-vercel-demo",
      testMatch: [
        "**/vercel-alignment.spec.ts",
        "**/css-utils.playwright.spec.ts",
      ],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://127.0.0.1:5174",
      },
    },
  ],
});
