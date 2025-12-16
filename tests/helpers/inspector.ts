import { Page, Locator, expect } from "@playwright/test";

export class InspectorHelper {
  readonly host: Locator;
  readonly toggleBtn: Locator;
  readonly continuityBtn: Locator;
  readonly violationBtn: Locator;
  readonly violationLayer: Locator;
  readonly infoCard: Locator;
  private didStabilizeOverlays = false;

  constructor(private page: Page) {
    this.host = page.locator("axiomatic-debugger");
    this.toggleBtn = this.host.locator("#toggle-btn");
    this.continuityBtn = this.host.locator("#continuity-toggle");
    this.violationBtn = this.host.locator("#violation-toggle");
    this.violationLayer = this.host.locator("#violation-layer");
    this.infoCard = this.host.locator("#info-card");
  }

  private async stabilizeOverlays() {
    if (this.didStabilizeOverlays) return;
    this.didStabilizeOverlays = true;

    // Defensive: if an Astro dev toolbar or other overlay exists, ensure it
    // never intercepts pointer events during tests.
    await this.page.addStyleTag({
      content: `
        astro-dev-toolbar {
          pointer-events: none !important;
        }
      `,
    });
  }

  async open() {
    await this.stabilizeOverlays();
    await expect(this.host).toBeAttached();
    // If not active, click it
    if (
      !(await this.toggleBtn.evaluate((el) => el.classList.contains("active")))
    ) {
      await this.toggleBtn.click();
    }
    await expect(this.toggleBtn).toHaveClass(/active/);
  }

  async runContinuityCheck() {
    await this.continuityBtn.click();

    await expect
      .poll(async () => {
        return await this.page.evaluate(() => {
          const report = (globalThis as any)
            .__AXIOMATIC_INSPECTOR_CONTINUITY__ as Array<unknown> | undefined;
          return report?.length ?? 0;
        });
      })
      .toBeGreaterThan(0);
  }

  async runViolationCheck() {
    await this.violationBtn.click();

    // Wait for analysis to publish a report.
    // `scanForViolations()` is synchronous, but in practice the UI can be
    // clicked before the inspector is fully settled, so avoid fixed sleeps.
    await expect
      .poll(
        async () => {
          return await this.page.evaluate(() => {
            const report = (globalThis as any)
              .__AXIOMATIC_INSPECTOR_VIOLATIONS__ as unknown;
            if (!Array.isArray(report)) return null;
            return report.length;
          });
        },
        { timeout: 5000 },
      )
      .not.toBeNull();
  }

  async getContinuityReport() {
    return await this.page.evaluate(() => {
      return ((globalThis as any).__AXIOMATIC_INSPECTOR_CONTINUITY__ ??
        []) as Array<{
        Tag: string;
        ID: string;
        Classes: string;
        Reason: string;
      }>;
    });
  }

  async getContinuityReasonsText() {
    const report = await this.getContinuityReport();
    return report.map((r) => r.Reason).join("\n");
  }

  async getViolations() {
    return this.violationLayer.locator(".violation-box");
  }

  async inspectElement(selector: string) {
    await this.stabilizeOverlays();
    const el = this.page.locator(selector);
    await el.hover();
    await expect(this.infoCard).toBeVisible();
    // Wait for async analysis if needed
    // The advice box has data-async attribute
    const adviceBox = this.host.locator("#advice-box");
    if ((await adviceBox.count()) > 0) {
      await expect(adviceBox).not.toHaveAttribute("data-async", "true", {
        timeout: 2000,
      });
    }

    await expect(this.host.locator("#advice-reason")).toBeVisible({
      timeout: 2000,
    });
  }

  async getAdviceReason() {
    return await this.host.locator("#advice-reason").innerText();
  }
}
