import * as parsel from "parsel-js";

export function calculateSpecificity(selector: string): number {
  // parsel.specificity returns [A, B, C]
  // We need to convert it to a number for easy comparison: A * 10000 + B * 100 + C
  // Note: parsel handles :where, :is, :not, nesting correctly.
  const spec = parsel.specificity(selector);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!spec) return 0;
  const [a = 0, b = 0, c = 0] = spec;
  return a * 10000 + b * 100 + c;
}

export function formatSpecificity(specificity: number): string {
  if (specificity >= 999999) return "Inline Style";
  const ids = Math.floor(specificity / 10000);
  const classes = Math.floor((specificity % 10000) / 100);
  const tags = specificity % 100;
  return `(${ids}, ${classes}, ${tags})`;
}
