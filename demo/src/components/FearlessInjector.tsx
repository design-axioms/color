import { generateTheme, injectTheme } from "color-system/runtime";
import type { SolverConfig } from "color-system/types";
import { useEffect, useRef, useState } from "preact/hooks";

export function FearlessInjector() {
  // Brand State
  const [brandColor, setBrandColor] = useState("#3b82f6"); // Default Blue
  const [isChaos, setIsChaos] = useState(false);
  const [chaosIndex, setChaosIndex] = useState(0);

  // We use a ref to track the style element created by the runtime
  const styleElementRef = useRef<HTMLStyleElement | undefined>(undefined);

  const hostileColors = [
    "#ffff00", // Neon Yellow
    "#000000", // Pure Black
    "#ff00ff", // Hot Pink
    "#00ff00", // Lime Green
    "#ffffff", // Pure White
    "#1a1a1a", // Almost Black
  ];

  // Chaos Mode Logic
  useEffect(() => {
    if (!isChaos) return;

    const interval = setInterval(() => {
      setChaosIndex((prev) => (prev + 1) % hostileColors.length);
    }, 800);

    return () => clearInterval(interval);
  }, [isChaos]);

  // Apply Chaos Color
  useEffect(() => {
    if (!isChaos) return;
    setBrandColor(hostileColors[chaosIndex]);
  }, [chaosIndex, isChaos]);

  // The "Live Solver" System
  useEffect(() => {
    // 1. Construct Solver Config
    // We define a "micro-system" just for this brand color.
    const config: SolverConfig = {
      anchors: {
        page: {
          light: { start: { background: 1 }, end: { background: 0.9 } },
          dark: { start: { background: 0.1 }, end: { background: 0.2 } },
        },
        inverted: {
          // These will be aligned to the key color by the solver
          light: { start: { background: 0.5 }, end: { background: 0.5 } },
          dark: { start: { background: 0.5 }, end: { background: 0.5 } },
        },
        keyColors: {
          brand: brandColor,
        },
      },
      groups: [
        {
          name: "Brand Group",
          surfaces: [
            {
              slug: "brand-dynamic",
              label: "Dynamic Brand Surface",
              polarity: "inverted",
            },
          ],
        },
      ],
      borderTargets: {
        decorative: 15,
        interactive: 30,
        critical: 50,
      },
    };

    try {
      // 2. Generate Theme (Solver + Generator)
      const css = generateTheme(config);

      // 3. Inject CSS (Update existing element if it exists)
      styleElementRef.current = injectTheme(
        css,
        undefined,
        styleElementRef.current
      );
    } catch (e) {
      console.error("Solver failed:", e);
    }
  }, [brandColor]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (styleElementRef.current) {
        styleElementRef.current.remove();
      }
    };
  }, []);

  return (
    <section>
      <div style={{ marginBottom: "2rem" }}>
        <h2 className="text-strong" style={{ margin: 0 }}>
          2. The Fearless Injector
        </h2>
        <p className="text-subtle" style={{ margin: "0.5rem 0 0 0" }}>
          "I Feel Empowered" — The <strong>Actual Solver Engine</strong> running
          live in your browser.
        </p>
      </div>

      <div
        className="surface-workspace bordered"
        style={{
          padding: "2rem",
          borderRadius: "16px",
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "3rem",
        }}
      >
        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div>
            <label
              className="text-strong"
              style={{ display: "block", marginBottom: "0.5rem" }}
            >
              Brand Color
            </label>
            <div
              style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
            >
              <input
                type="color"
                value={brandColor}
                onInput={(e) => {
                  setIsChaos(false);
                  setBrandColor(e.currentTarget.value);
                }}
                style={{ width: "100%", height: "40px", cursor: "pointer" }}
              />
            </div>
            <p className="text-subtler" style={{ fontSize: "0.85rem" }}>
              The system accepts <em>any</em> color and mathematically
              guarantees accessible tokens.
            </p>
          </div>

          <div
            style={{
              marginTop: "auto",
              paddingTop: "2rem",
              borderTop: "1px solid var(--border-dec-token)",
            }}
          >
            <button
              onClick={() => setIsChaos(!isChaos)}
              className={`surface-action text-strong bordered ${
                isChaos ? "hue-error" : ""
              }`}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "8px",
                cursor: "pointer",
                border: isChaos ? "2px solid red" : undefined,
              }}
            >
              {isChaos ? "Stop Chaos Mode" : "Start Chaos Mode"}
            </button>
            <p
              className="text-subtler"
              style={{
                fontSize: "0.85rem",
                marginTop: "0.5rem",
                textAlign: "center",
              }}
            >
              Cycles through hostile colors to prove resilience.
            </p>
          </div>
        </div>

        {/* Preview */}
        <div
          className="surface-workspace bordered"
          style={{
            borderRadius: "12px",
            padding: "3rem",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Component 1: The Generated Surface */}
          <div style={{ textAlign: "center" }}>
            {/* We use the class generated by the solver: .surface-brand-dynamic */}
            <button
              className="surface-brand-dynamic text-strong"
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
                border: "none",
              }}
            >
              Generated Surface
            </button>
            <div
              className="text-subtler"
              style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}
            >
              Uses <code>.surface-brand-dynamic</code>
            </div>
          </div>

          {/* Component 2: Outlined Card (using border tokens from the generated surface) */}
          <div
            className="surface-brand-dynamic bordered"
            style={{
              padding: "1.5rem",
              borderRadius: "12px",
              textAlign: "center",
              // We want to show the "surface" color here, which might be the brand color itself
            }}
          >
            <h3 className="text-strong" style={{ margin: "0 0 0.5rem 0" }}>
              Accessible Card
            </h3>
            <p className="text-subtle" style={{ margin: 0 }}>
              Text and borders are solved for this specific brand color.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
