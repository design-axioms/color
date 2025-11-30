function binarySearch(
  min: number,
  max: number,
  evaluate: (candidate: number) => number,
  target: number,
  epsilon: number = 0.005,
  maxIterations: number = 40
): number {
  let low = min;
  let high = max;

  const valAtMin = evaluate(min);
  const valAtMax = evaluate(max);
  const slope = Math.sign(valAtMax - valAtMin) || 1;

  const minVal = Math.min(valAtMin, valAtMax);
  const maxVal = Math.max(valAtMin, valAtMax);

  if (target <= minVal + epsilon) return valAtMin <= valAtMax ? min : max;
  if (target >= maxVal - epsilon) return valAtMax >= valAtMin ? max : min;

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const val = evaluate(mid);
    const delta = val - target;

    if (Math.abs(delta) <= epsilon) {
      return mid;
    }

    if (delta * slope > 0) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return (low + high) / 2;
}

function cubicBezier(t: number, p1: number, p2: number): number {
  const oneMinusT = 1 - t;
  return (
    3 * oneMinusT * oneMinusT * t * p1 + 3 * oneMinusT * t * t * p2 + t * t * t
  );
}

function calculateHueShift(
  lightness: number,
  config?: {
    curve: { p1: [number, number]; p2: [number, number] };
    maxRotation: number;
  }
): number {
  if (!config) return 0;
  const { curve, maxRotation } = config;

  // Solve for t given x (lightness)
  // x(t) = cubicBezier(t, p1x, p2x)
  const t = binarySearch(
    0,
    1,
    (val) => cubicBezier(val, curve.p1[0], curve.p2[0]),
    lightness,
    0.001
  );

  // Calculate y (hue shift factor) given t
  const factor = cubicBezier(t, curve.p1[1], curve.p2[1]);
  return factor * maxRotation;
}

const config = {
  curve: { p1: [0.5, 0] as [number, number], p2: [0.5, 1] as [number, number] },
  maxRotation: 60,
};

console.log("Testing Hue Shift Calculation at L=0.25:");
console.log("Standard (0.5, 0 / 0.5, 1):", calculateHueShift(0.25, config));

// Test changing X
const configX = {
  curve: { p1: [0.1, 0] as [number, number], p2: [0.9, 1] as [number, number] },
  maxRotation: 60,
};
console.log(
  "Steep Middle (0.1, 0 / 0.9, 1):",
  calculateHueShift(0.25, configX)
);
