import { SURFACES } from "color-system/constants";
import { useState } from "preact/hooks";

export function SolverLab() {
  const hues = [
    { name: "Monochrome", class: "hue-monochrome" },
    { name: "Brand", class: "hue-brand" },
    { name: "Blue", class: "hue-blue" },
  ];

  const [bordered, setBordered] = useState(true);
  const borderClass = bordered ? "bordered" : "";

  return (
    <div
      class="surface-page"
      style={{ padding: "2rem", paddingTop: "6rem", minHeight: "100vh" }}
    >
      <header style={{ marginBottom: "2rem" }}>
        <h1
          class="text-strong"
          style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
        >
          Solver Lab
        </h1>
        <p class="text-subtle">
          Test grid for verifying solver output and color system behavior
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
        {/* Controls */}
        <section>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={bordered}
              onChange={(e) => setBordered(e.currentTarget.checked)}
            />
            <span class="text-strong">Show Borders</span>
          </label>
        </section>

        {/* All Surfaces Grid */}
        <section>
          <h2
            class="text-strong"
            style={{ fontSize: "1.5rem", marginBottom: "1rem" }}
          >
            All Surfaces × Hues
          </h2>
          <p class="text-subtle" style={{ marginBottom: "1.5rem" }}>
            Each surface rendered with monochrome, brand, and blue hues. Text
            shows contrast levels (Strong/Subtle/Subtler).
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "2rem",
            }}
          >
            {SURFACES.map((surface) => (
              <div key={surface}>
                <h3
                  class="text-strong"
                  style={{
                    textTransform: "capitalize",
                    marginBottom: "0.75rem",
                    fontSize: "1.1rem",
                  }}
                >
                  {surface}
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "0.75rem",
                  }}
                >
                  {hues.map((hue) => (
                    <div
                      key={hue.name}
                      class={`surface-${surface} ${borderClass} ${hue.class}`}
                      style={{
                        padding: "1.25rem",
                        borderRadius: "8px",
                        minHeight: "100px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                      }}
                    >
                      <div
                        class="text-strong"
                        style={{ fontSize: "0.9rem", fontWeight: 600 }}
                      >
                        {hue.name}
                      </div>
                      <div class="text-subtle" style={{ fontSize: "0.8rem" }}>
                        Subtle
                      </div>
                      <div class="text-subtler" style={{ fontSize: "0.8rem" }}>
                        Subtler
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive States */}
        <section>
          <h2
            class="text-strong"
            style={{ fontSize: "1.5rem", marginBottom: "1rem" }}
          >
            Interactive States
          </h2>
          <p class="text-subtle" style={{ marginBottom: "1.5rem" }}>
            Hover and active states for card and action surfaces. These should
            transition smoothly.
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            <div>
              <h3 class="text-strong" style={{ marginBottom: "0.75rem" }}>
                Card (Hover/Active)
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "1rem",
                }}
              >
                {hues.map((hue) => (
                  <div
                    key={hue.name}
                    class={`surface-card bordered ${hue.class}`}
                    style={{
                      padding: "1.5rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <h4 class="text-strong">{hue.name}</h4>
                    <p class="text-subtle" style={{ fontSize: "0.85rem" }}>
                      Hover for lighter state
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 class="text-strong" style={{ marginBottom: "0.75rem" }}>
                Action (Hover/Active)
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "1rem",
                }}
              >
                {hues.map((hue) => (
                  <button
                    key={hue.name}
                    class={`surface-action ${hue.class}`}
                    style={{
                      padding: "1.5rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <h4 class="text-strong">{hue.name}</h4>
                    <p class="text-subtle" style={{ fontSize: "0.85rem" }}>
                      Click for active state
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Glassmorphism Test */}
        <section>
          <h2
            class="text-strong"
            style={{ fontSize: "1.5rem", marginBottom: "1rem" }}
          >
            Glassmorphism
          </h2>
          <p class="text-subtle" style={{ marginBottom: "1.5rem" }}>
            Glass surfaces with backdrop blur over a colorful gradient
            background.
          </p>
          <div
            style={{
              background:
                "linear-gradient(135deg, oklch(0.7 0.15 150), oklch(0.6 0.2 270))",
              borderRadius: "12px",
              padding: "3rem",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
            }}
          >
            {["page", "card", "action"].map((surface) => (
              <div
                key={surface}
                class={`surface-${surface} surface-glass bordered`}
                style={{
                  padding: "2rem",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <h3
                  class="text-strong"
                  style={{
                    textTransform: "capitalize",
                    marginBottom: "0.5rem",
                  }}
                >
                  {surface}
                </h3>
                <p class="text-subtle" style={{ fontSize: "0.85rem" }}>
                  Glass effect
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
