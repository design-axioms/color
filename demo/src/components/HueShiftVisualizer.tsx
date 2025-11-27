import { calculateHueShift, solveForegroundLightness } from "color-system/math";
import { useEffect, useRef, useState } from "preact/hooks";
import { useTheme } from "../context/ThemeContext";

export function HueShiftVisualizer() {
  // Configuration State
  const [baseHue, setBaseHue] = useState(250); // Blueish
  const [contrastTarget, setContrastTarget] = useState(105); // Standard Strong
  const [hueShiftAmount, setHueShiftAmount] = useState(5); // System Default

  // Theme State
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Constants

  // Constants
  const cardLight = 0.92;
  const cardDark = 0.2;
  const currentBg = isDark ? cardDark : cardLight;
  const currentFg = solveForegroundLightness(currentBg, contrastTarget);

  // Ref to the preview container to apply CSS variables
  const previewRef = useRef<HTMLDivElement>(null);

  // Live Solver Logic
  useEffect(() => {
    if (!previewRef.current) return;

    const container = previewRef.current;

    // 1. Solve Foreground Text
    // Light Mode
    const lightTextL = solveForegroundLightness(cardLight, contrastTarget);
    const darkTextL = solveForegroundLightness(cardDark, contrastTarget);

    // 2. Calculate Hue Shifts
    const hueShiftConfig = {
      curve: {
        p1: [0.5, 0] as [number, number],
        p2: [0.5, 1] as [number, number],
      },
      maxRotation: hueShiftAmount,
    };

    const lightShift = calculateHueShift(cardLight, hueShiftConfig);
    const darkShift = calculateHueShift(cardDark, hueShiftConfig);

    // 3. Apply to CSS Variables
    const chroma = 0.05; // Moderate chroma

    const lightSurfaceColor = `oklch(${cardLight} ${chroma} ${
      baseHue + lightShift
    })`;
    const darkSurfaceColor = `oklch(${cardDark} ${chroma} ${
      baseHue + darkShift
    })`;

    container.style.setProperty(
      "--playground-surface",
      `light-dark(${lightSurfaceColor}, ${darkSurfaceColor})`
    );

    // Text Token
    const textChroma = 0.01;
    const lightTextColor = `oklch(${lightTextL} ${textChroma} ${baseHue})`;
    const darkTextColor = `oklch(${darkTextL} ${textChroma} ${baseHue})`;

    container.style.setProperty(
      "--playground-text",
      `light-dark(${lightTextColor}, ${darkTextColor})`
    );
  }, [baseHue, contrastTarget, hueShiftAmount]);

  return (
    <section
      className="surface-card bordered"
      style={{ padding: "2rem", borderRadius: "12px" }}
    >
      <header style={{ marginBottom: "2rem" }}>
        <h2 className="text-strong" style={{ fontSize: "1.5rem", margin: 0 }}>
          Hue Shift Visualizer
        </h2>
        <p className="text-subtle" style={{ marginTop: "0.5rem" }}>
          See how the solver derives token values from your configuration.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "2rem",
        }}
      >
        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Config Section */}
          <div>
            <h4
              className="text-strong"
              style={{
                margin: "0 0 1rem 0",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Configuration
            </h4>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div>
                <label
                  className="text-subtle"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                  }}
                >
                  Base Hue ({baseHue}°)
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={baseHue}
                  onInput={(e) => setBaseHue(Number(e.currentTarget.value))}
                  style={{ width: "100%" }}
                />
                <div
                  style={{
                    height: "4px",
                    marginTop: "0.5rem",
                    borderRadius: "2px",
                    background: `oklch(0.6 0.2 ${baseHue})`,
                  }}
                />
              </div>

              <div>
                <label
                  className="text-subtle"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                  }}
                >
                  Target Contrast ({contrastTarget} APCA)
                </label>
                <input
                  type="range"
                  min="60"
                  max="110"
                  step="1"
                  value={contrastTarget}
                  onInput={(e) =>
                    setContrastTarget(Number(e.currentTarget.value))
                  }
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <label
                    className="text-subtle"
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    Hue Shift Intensity ({hueShiftAmount}°)
                  </label>
                  <button
                    onClick={() => setHueShiftAmount(5)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-token)",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      textDecoration: "underline",
                      padding: 0,
                    }}
                  >
                    Reset to Default (5°)
                  </button>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={hueShiftAmount}
                  onInput={(e) =>
                    setHueShiftAmount(Number(e.currentTarget.value))
                  }
                  style={{ width: "100%" }}
                />
                <p
                  className="text-subtle"
                  style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}
                >
                  The system defaults to a subtle 5° shift to add natural warmth
                  or coolness without changing the perceived color.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview & Code */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {/* Visual Preview */}
          <div
            ref={previewRef}
            className="bordered"
            style={{
              background: "var(--playground-surface)",
              color: "var(--playground-text)",
              padding: "3rem",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              minHeight: "200px",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            <h3
              style={{
                fontSize: "2rem",
                margin: "0 0 0.5rem 0",
                fontWeight: 800,
              }}
            >
              Adaptive Text
            </h3>
            <p style={{ opacity: 0.8 }}>
              This color is mathematically solved to hit APCA {contrastTarget}.
            </p>
          </div>

          {/* Hue Shift Visualization */}
          <div>
            <h4
              className="text-strong"
              style={{
                margin: "0 0 1rem 0",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Hue Shift Curve Visualization
            </h4>
            <div
              style={{
                display: "flex",
                height: "60px",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid var(--border-dec-token)",
              }}
            >
              {Array.from({ length: 21 }, (_, i) => i / 20).map((l) => {
                const shift = calculateHueShift(l, {
                  curve: { p1: [0.5, 0], p2: [0.5, 1] },
                  maxRotation: hueShiftAmount,
                });
                // Use higher chroma (0.15) to make the hue obvious
                const color = `oklch(${l} 0.15 ${baseHue + shift})`;
                return (
                  <div
                    key={l}
                    style={{ flex: 1, background: color }}
                    title={`L: ${l}, Shift: ${Math.round(shift)}°`}
                  />
                );
              })}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "0.5rem",
                fontSize: "0.8rem",
                color: "var(--text-subtle)",
              }}
            >
              <span>L=0</span>
              <span>L=1</span>
            </div>
            <p
              className="text-subtle"
              style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}
            >
              The hue shift rotates the base hue as lightness increases,
              creating dynamic color relationships across the lightness
              spectrum.
            </p>
          </div>

          {/* The Programming Model (Code Inspector) */}
          <div
            className="surface-tinted bordered"
            style={{
              padding: "2rem",
              borderRadius: "8px",
              fontFamily: "monospace",
              fontSize: "0.9rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "0.5rem 2rem",
                width: "100%",
                maxWidth: "280px",
              }}
            >
              <div style={{ color: "var(--text-subtle)" }}>Background L</div>
              <div style={{ textAlign: "right", color: "var(--chart-4)" }}>
                {currentBg}
              </div>

              <div style={{ color: "var(--text-subtle)" }}>Target APCA</div>
              <div style={{ textAlign: "right", color: "var(--chart-4)" }}>
                {contrastTarget}
              </div>

              {/* Arithmetic Line */}
              <div
                style={{
                  gridColumn: "1 / -1",
                  height: "2px",
                  background: "var(--text-subtlest)",
                  marginTop: "0.25rem",
                }}
              />

              <div style={{ color: "var(--text-token)", fontWeight: "bold" }}>
                Foreground L
              </div>
              <div
                style={{
                  textAlign: "right",
                  color: "var(--chart-3)",
                  fontWeight: "bold",
                }}
              >
                {currentFg.toFixed(4)}
              </div>
            </div>

            {/* CSS Output */}
            <div
              style={{
                marginTop: "2rem",
                paddingTop: "1rem",
                borderTop: "1px dashed var(--border-dec-token)",
                width: "100%",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "var(--text-subtle)",
                  fontSize: "0.75rem",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Generated CSS
              </div>
              <div>
                <span style={{ color: "var(--chart-8)" }}>--text-token</span>:
                oklch(
                <span style={{ color: "var(--chart-3)", fontWeight: "bold" }}>
                  {currentFg.toFixed(4)}
                </span>{" "}
                0.01 <span style={{ color: "var(--chart-4)" }}>{baseHue}</span>)
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
