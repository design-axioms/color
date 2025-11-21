import { useEffect, useState } from "preact/hooks";

export function App() {
  const surfaces = [
    "page",
    "workspace",
    "card",
    "tinted",
    "soft-spotlight",
    "spotlight",
  ];

  const hues = [
    { name: "Monochrome", class: "hue-monochrome" },
    { name: "Brand", class: "hue-brand" },
    { name: "Blue", class: "hue-blue" },
  ];

  const [bordered, setBordered] = useState(false);

  const borderClass = bordered ? "bordered" : "";

  return (
    <div class="surface-page" style={{ minHeight: "100vh", padding: "2rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 class="fg-strong" style={{ margin: 0 }}>
          Color System Demo
        </h1>
        <ThemeSwitcher />
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Interactive Playground */}
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            checked={bordered}
            onChange={(e) => setBordered(e.currentTarget.checked)}
          />
          <span>Bordered</span>
        </label>
        <section>
          <h2
            style={{ fontSize: "2rem", fontWeight: "bold" }}
            class="text-strong"
          >
            Interactive Playground
          </h2>
          <p class="text-subtle">
            These elements respond to hover and active states with smooth
            transitions.
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <button
              class={`surface-card ${borderClass}`}
              style={{
                padding: "1rem",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Interactive Card
            </button>

            <button
              class="surface-card hue-brand"
              style={{
                padding: "1rem",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Brand Interactive
            </button>

            <button
              class="surface-card hue-blue"
              style={{
                padding: "1rem",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Blue Interactive
            </button>
          </div>
        </section>

        {/* All Surfaces Grid */}
        <section className="space-y-4">
          <h2 className="fg-strong">All Surfaces</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "2rem",
            }}
          >
            {surfaces.map((surface) => (
              <div
                key={surface}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <h3 class="fg-strong" style={{ textTransform: "capitalize" }}>
                  {surface}
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
                      class={`surface-${surface} bordered ${hue.class}`}
                      style={{ padding: "1.5rem", borderRadius: "8px" }}
                    >
                      <div class="text-strong">Strong</div>
                      <div class="text-subtle">Subtle</div>
                      <div class="text-subtler">Subtler</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* New Features Showcase */}
        <section>
          <h2 class="fg-strong">Interactive States (Card)</h2>
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
                style={{ padding: "1.5rem", borderRadius: "8px" }}
              >
                <h3 class="fg-strong">{hue.name}</h3>
                <p class="text-subtle">Hover/Active state.</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ThemeSwitcher() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.style.removeProperty("color-scheme");
    } else {
      root.style.setProperty("color-scheme", theme);
    }
  }, [theme]);

  return (
    <div
      class="surface-workspace"
      style={{
        display: "flex",
        gap: "0.5rem",
        padding: "0.5rem",
        borderRadius: "8px",
        border: "1px solid var(--computed-border-color)",
      }}
    >
      <button onClick={() => setTheme("light")} style={weight(theme)}>
        Light
      </button>
      <button onClick={() => setTheme("dark")} style={weight(theme)}>
        Dark
      </button>
      <button onClick={() => setTheme("system")} style={weight(theme)}>
        System
      </button>
    </div>
  );
}

function weight(theme: "light" | "dark" | "system") {
  return { fontWeight: theme === "light" ? "bold" : "normal" };
}
