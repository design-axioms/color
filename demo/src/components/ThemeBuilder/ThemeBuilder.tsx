import { useConfig } from "../../context/ConfigContext";
import { SurfaceManager } from "./SurfaceManager";
import "./ThemeBuilder.css";

export function ThemeBuilder() {
  const { config } = useConfig();

  return (
    <div class="theme-builder-container">
      {/* Sidebar */}
      <aside class="theme-builder-sidebar surface-workspace">
        <div class="theme-builder-header">
          <h2 class="text-strong">Theme Builder</h2>
          <p class="text-subtle">Customize global system parameters.</p>
        </div>

        <SurfaceManager />
      </aside>

      {/* Main Preview Area */}
      <main class="theme-builder-main" id="theme-builder-preview">
        <div class="surface-page theme-builder-preview-page">
          <div class="surface-card bordered theme-builder-preview-card">
            {/* Header */}
            <div class="preview-section">
              <h1 class="text-strong" style={{ margin: "0 0 0.5rem 0" }}>
                Preview Area
              </h1>
              <p class="text-subtle">
                This area is styled by the live config. Adjust the sliders on
                the left to see changes in real-time.
              </p>
            </div>

            {/* Standard Controls */}
            <div class="preview-section">
              <h3 class="text-strong">Standard Surfaces</h3>
              <div class="preview-controls">
                <button class="surface-action text-strong bordered preview-button">
                  Action Button
                </button>
                <button class="surface-workspace text-subtle bordered preview-button">
                  Secondary
                </button>
                <div class="surface-workspace bordered preview-input">
                  <span class="text-subtle">Input Field</span>
                </div>
              </div>
            </div>

            {/* Brand Controls */}
            <div class="preview-section">
              <h3 class="text-strong">Brand Integration</h3>
              <p class="text-subtle">
                Elements using the{" "}
                <code class="surface-workspace bordered preview-code">
                  .hue-brand
                </code>{" "}
                utility.
              </p>

              <div class="hue-brand preview-brand-group">
                {/* Brand Button (Inverted) */}
                <button class="surface-spotlight text-strong preview-button">
                  Brand Button
                </button>

                {/* Brand Card (Page Polarity + Tint) */}
                <div class="surface-card bordered preview-brand-card">
                  <span class="text-strong">Brand Tinted Card</span>
                </div>

                {/* Brand Link */}
                <a href="#" class="text-link">
                  Brand Link
                </a>
              </div>
            </div>

            {/* Typography Check */}
            <div class="surface-workspace bordered preview-typography-card">
              <h3 class="text-strong">Typography & Contrast</h3>
              <p class="text-high-token">This is high-emphasis text.</p>
              <p class="text-subtle">
                This is subtle text for secondary information.
              </p>
              <p class="text-subtlest">This is subtlest text for metadata.</p>
            </div>

            {/* Dynamic Surface List */}
            <div class="preview-section">
              <h3 class="text-strong">All Surfaces</h3>

              {config.groups.length === 0 ||
              config.groups.every((g) => g.surfaces.length === 0) ? (
                <div class="surface-workspace bordered preview-empty-state">
                  <div class="preview-empty-icon">🎨</div>
                  <div>
                    <h4 class="text-strong" style={{ margin: "0 0 0.5rem 0" }}>
                      No Custom Surfaces
                    </h4>
                    <p class="text-subtle preview-empty-text">
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
                          <h4 class="text-subtle preview-group-title">
                            {group.name}
                          </h4>
                          <div class="preview-surface-grid">
                            {group.surfaces.map((surface) => (
                              <div
                                key={surface.slug}
                                class={`surface-${surface.slug} bordered preview-surface-card`}
                              >
                                <span class="text-strong preview-surface-label">
                                  {surface.label}
                                </span>
                                <code class="text-subtle preview-surface-code">
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
