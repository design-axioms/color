import { describe, expect, it } from "vitest";
import { DTCGImporter } from "../dtcg.ts";

describe("DTCGImporter", () => {
  it("rejects non-object root", () => {
    const importer = new DTCGImporter();
    expect(() => importer.parse("[]")).toThrow(/expects a JSON object/);
  });

  it("rejects neutral tokens that are not parseable colors", () => {
    const importer = new DTCGImporter();
    const json = JSON.stringify({
      color: {
        neutral: {
          50: { $type: "color", $value: "not-a-color" },
          900: { $type: "color", $value: "also-not-a-color" },
        },
      },
    });

    expect(() => importer.parse(json)).toThrow(
      /neutral-scale tokens but none were parseable/i,
    );
  });

  it("rejects selected key colors that are not parseable colors", () => {
    const importer = new DTCGImporter();
    const json = JSON.stringify({
      color: {
        brand: {
          main: { $type: "color", $value: "not-a-color" },
        },
      },
    });

    expect(() => importer.parse(json)).toThrow(/Key color brand/i);
  });
});
