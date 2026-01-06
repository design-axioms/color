import { AxiomaticError } from "../errors.ts";

export function parseNumberOrThrow(raw: string, context: string): number {
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) {
    throw new AxiomaticError(
      "INSPECTOR_INVALID_NUMBER",
      `Expected numeric value, got ${JSON.stringify(raw)} (${context}).`,
      { value: raw, context },
    );
  }
  return parsed;
}
