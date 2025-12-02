import { converter } from "culori";

const oklchToP3 = converter("p3");
const oklchToRgb = converter("rgb");

export function getMaxChroma(
  l: number,
  h: number,
  mode: "p3" | "rgb" = "p3",
): number {
  // Binary search for max chroma
  let min = 0;
  let max = 0.4; // Reasonable max for OKLCH
  let result = 0;

  const convert = mode === "p3" ? oklchToP3 : oklchToRgb;

  for (let i = 0; i < 10; i++) {
    const mid = (min + max) / 2;
    const color = convert({ mode: "oklch", l, c: mid, h }) as
      | { r: number; g: number; b: number }
      | undefined;

    if (color && inGamut(color)) {
      result = mid;
      min = mid;
    } else {
      max = mid;
    }
  }
  return result;
}

function inGamut(color: { r: number; g: number; b: number }): boolean {
  return (
    color.r >= 0 &&
    color.r <= 1 &&
    color.g >= 0 &&
    color.g <= 1 &&
    color.b >= 0 &&
    color.b <= 1
  );
}
