import { calculateHueShift } from "../src/lib/math.ts";

const config = {
  curve: { p1: [0.5, 0] as [number, number], p2: [0.5, 1] as [number, number] },
  maxRotation: 60,
};

console.log("Testing Hue Shift Calculation at L=0.25:");
console.log("Standard (0.5, 0 / 0.5, 1):", calculateHueShift(0.25, config));

// Test changing X - Steep middle, flat ends
const configX = {
  curve: { p1: [0.1, 0] as [number, number], p2: [0.9, 1] as [number, number] },
  maxRotation: 60,
};
console.log(
  "Steep Middle (0.1, 0 / 0.9, 1):",
  calculateHueShift(0.25, configX)
);

// Test changing X - Linear-ish (0,0 / 1,1)
const configLinear = {
  curve: {
    p1: [0.25, 0.25] as [number, number],
    p2: [0.75, 0.75] as [number, number],
  },
  maxRotation: 60,
};
console.log(
  "Linear (0.25, 0.25 / 0.75, 0.75):",
  calculateHueShift(0.25, configLinear)
);

// Test Asymmetric
const configAsym = {
  curve: { p1: [0.8, 0] as [number, number], p2: [0.8, 1] as [number, number] },
  maxRotation: 60,
};
console.log(
  "Asymmetric (0.8, 0 / 0.8, 1):",
  calculateHueShift(0.25, configAsym)
);
