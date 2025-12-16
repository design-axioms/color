export type PaintProperty =
  | "color"
  | "background-color"
  | "border-top-color"
  | "border-left-color"
  | "border-right-color"
  | "border-bottom-color"
  | "border-left-width"
  | "border-right-width"
  | "border-bottom-width"
  | "outline-color"
  | "outline-width"
  | "outline-style"
  | "outline-offset"
  | "box-shadow";

export type MeasurementPlan = {
  primarySelectors: string[];
  elementCap: number;
  visibleSampleAlphaCutoff: number;
  includeFocusProbeSelector: boolean;
  properties: PaintProperty[];
  watchVars: string[];
};

export class MeasurementSpec {
  private readonly plan: MeasurementPlan;

  private constructor(plan: MeasurementPlan) {
    this.plan = plan;
  }

  static forSnapsDocsChrome(): MeasurementSpec {
    return new MeasurementSpec({
      primarySelectors: [
        "body",
        ".page.sl-flex",
        ".page > .header",
        "#starlight__sidebar",
        "#starlight__sidebar > .axm-starlight-sidebar",
        ".sl-markdown-content",
        ".expressive-code .frame.has-title > .header > .title",
        "starlight-theme-select select",
      ],
      elementCap: 180,
      visibleSampleAlphaCutoff: 0.02,
      includeFocusProbeSelector: true,
      properties: [
        "color",
        "background-color",
        "border-top-color",
        "border-left-color",
        "border-right-color",
        "border-bottom-color",
        "border-left-width",
        "border-right-width",
        "border-bottom-width",
        "outline-color",
        "outline-width",
        "outline-style",
        "outline-offset",
        "box-shadow",
      ],
      watchVars: [
        "--sl-color-hairline",
        "--sl-color-gray-6",
        "--sl-color-gray-5",
      ],
    });
  }

  validate(): void {
    if (this.plan.elementCap <= 0) throw new Error("elementCap must be > 0");
    if (
      !Number.isFinite(this.plan.visibleSampleAlphaCutoff) ||
      this.plan.visibleSampleAlphaCutoff < 0 ||
      this.plan.visibleSampleAlphaCutoff > 1
    ) {
      throw new Error("visibleSampleAlphaCutoff must be within [0,1]");
    }
    if (this.plan.primarySelectors.length === 0) {
      throw new Error("primarySelectors must be non-empty");
    }
    if (this.plan.properties.length === 0) {
      throw new Error("properties must be non-empty");
    }
  }

  toPlan(): MeasurementPlan {
    this.validate();
    return { ...this.plan };
  }
}
