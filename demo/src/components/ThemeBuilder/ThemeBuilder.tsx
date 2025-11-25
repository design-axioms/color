import { useConfig } from "../../context/ConfigContext";
import { AnchorsEditor } from "./AnchorsEditor";
import { ExportPanel } from "./ExportPanel";
import { HueShiftEditor } from "./HueShiftEditor";
import { KeyColorsEditor } from "./KeyColorsEditor";
import { LiveThemeInjector } from "./LiveThemeInjector";
import { SurfaceManager } from "./SurfaceManager";

export function ThemeBuilder() {
  const { config } = useConfig();

  return (
    <div style={{ display: "flex", height: "100vh", paddingTop: "4rem" }}>
      <LiveThemeInjector />

      {/* Sidebar */}
      <aside
        style={{
          width: "350px",
          padding: "1.5rem",
          borderRight: "1px solid var(--border-subtle-token)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "3rem",
        }}
        class="surface-workspace"
      >
        <div>
          <h2 class="text-strong" style={{ margin: "0 0 0.5rem 0" }}>
            Theme Builder
          </h2>
          <p class="text-subtle" style={{ margin: 0, fontSize: "0.9rem" }}>
            Customize global system parameters.
          </p>
        </div>

        <KeyColorsEditor />
        <AnchorsEditor />
        <HueShiftEditor />
        <SurfaceManager />
        <ExportPanel />
      </aside>

      {/* Main Preview Area */}
      <main
        style={{ flex: 1, padding: "0", overflowY: "auto" }}
        id="theme-builder-preview"
      >
        <div
          class="surface-page"
          style={{ minHeight: "100%", padding: "2rem" }}
        >
          <div
            class="surface-card bordered"
            style={{
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "800px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            {/* Header */}
            <div>
              <h1 class="text-strong" style={{ margin: "0 0 0.5rem 0" }}>
                Preview Area
              </h1>
              <p class="text-subtle" style={{ margin: 0 }}>
                This area is styled by the live config. Adjust the sliders on
                the left to see changes in real-time.
              </p>
            </div>

            {/* Standard Controls */}
            <div>
              <h3 class="text-strong" style={{ marginBottom: "1rem" }}>
                Standard Surfaces
              </h3>
              <div
                style={{ display: "flex", gap: "1rem", alignItems: "center" }}
              >
                <button
                  class="surface-action text-strong bordered"
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Action Button
                </button>
                <button
                  class="surface-workspace text-subtle bordered"
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Secondary
                </button>
                <div
                  class="surface-workspace bordered"
                  style={{ padding: "0.5rem 1rem", borderRadius: "6px" }}
                >
                  <span class="text-subtle">Input Field</span>
                </div>
              </div>
            </div>

            {/* Brand Controls */}
            <div>
              <h3 class="text-strong" style={{ marginBottom: "1rem" }}>
                Brand Integration
              </h3>
              <p class="text-subtle" style={{ marginBottom: "1rem" }}>
                Elements using the{" "}
                <code
                  class="surface-workspace bordered"
                  style={{ padding: "0.2rem 0.4rem", borderRadius: "4px" }}
                >
                  .hue-brand
                </code>{" "}
                utility.
              </p>

              <div
                class="hue-brand"
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {/* Brand Button (Inverted) */}
                <button
                  class="surface-spotlight text-strong"
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    border: "none",
                  }}
                >
                  Brand Button
                </button>

                {/* Brand Card (Page Polarity + Tint) */}
                <div
                  class="surface-card bordered"
                  style={{ padding: "1rem", borderRadius: "8px" }}
                >
                  <span class="text-strong">Brand Tinted Card</span>
                </div>

                {/* Brand Link */}
                <a href="#" class="text-link">
                  Brand Link
                </a>
              </div>
            </div>

            {/* Typography Check */}
            <div
              class="surface-workspace bordered"
              style={{ padding: "1.5rem", borderRadius: "8px" }}
            >
              <h3 class="text-strong" style={{ marginTop: 0 }}>
                Typography & Contrast
              </h3>
              <p class="text-high-token">This is high-emphasis text.</p>
              <p class="text-subtle">
                This is subtle text for secondary information.
              </p>
              <p class="text-subtlest">This is subtlest text for metadata.</p>
            </div>

            {/* Dynamic Surface List */}
            <div>
              <h3 class="text-strong" style={{ marginBottom: "1rem" }}>
                All Surfaces
              </h3>

              {config.groups.length === 0 ||
              config.groups.every((g) => g.surfaces.length === 0) ? (
                <div
                  class="surface-workspace bordered"
                  style={{
                    padding: "3rem",
                    borderRadius: "8px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div style={{ fontSize: "2rem", opacity: 0.5 }}>🎨</div>
                  <div>
                    <h4 class="text-strong" style={{ margin: "0 0 0.5rem 0" }}>
                      No Custom Surfaces
                    </h4>
                    <p
                      class="text-subtle"
                      style={{ margin: 0, maxWidth: "400px" }}
                    >
                      Add groups and surfaces in the sidebar to see them appear
                      here. They will be generated as CSS classes like{" "}
                      <code>.surface-card</code>.
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                  }}
                >
                  {config.groups.map(
                    (group) =>
                      group.surfaces.length > 0 && (
                        <div key={group.name}>
                          <h4
                            class="text-subtle"
                            style={{
                              margin: "0 0 0.5rem 0",
                              fontSize: "0.9rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {group.name}
                          </h4>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fill, minmax(200px, 1fr))",
                              gap: "1rem",
                            }}
                          >
                            {group.surfaces.map((surface) => (
                              <div
                                key={surface.slug}
                                class={`surface-${surface.slug} bordered`}
                                style={{
                                  padding: "1.5rem",
                                  borderRadius: "8px",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.5rem",
                                }}
                              >
                                <span
                                  class="text-strong"
                                  style={{ fontWeight: "bold" }}
                                >
                                  {surface.label}
                                </span>
                                <code
                                  class="text-subtle"
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  .surface-{surface.slug}
                                </code>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
