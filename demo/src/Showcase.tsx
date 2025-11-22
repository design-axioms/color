import { useState } from "preact/hooks";

/**
 * ARCHITECTURAL NOTE:
 * This component avoids hardcoded colors (hex, rgb, etc.).
 * All color features are powered by the color system's surfaces and utilities
 * to ensure theming, accessibility, and consistency.
 */

export function Showcase() {
  const [selectedId, setSelectedId] = useState<string | null>("card-1");

  return (
    <div
      className="surface-page"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* Navbar: Spotlight Surface */}
      <nav
        className="surface-spotlight bordered"
        style={{
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          className="text-strong"
          style={{ fontWeight: "bold", fontSize: "1.2rem" }}
        >
          Color System
        </div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <span className="text-subtle text-link">Dashboard</span>
          <span className="text-strong text-link">Showcase</span>
          <span className="text-subtle text-link">Settings</span>
        </div>
      </nav>

      {/* Hero: Soft Spotlight */}
      <header
        className="surface-soft-spotlight"
        style={{ padding: "4rem 2rem", textAlign: "center" }}
      >
        <h1
          className="text-strong"
          style={{ fontSize: "2.5rem", marginBottom: "1rem" }}
        >
          Semantic & Adaptive
        </h1>
        <p
          className="text-subtle"
          style={{
            fontSize: "1.2rem",
            maxWidth: "600px",
            margin: "0 auto 2rem",
          }}
        >
          A color system that adapts to your needs. Built for accessibility,
          designed for composition.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            className="surface-action text-strong bordered"
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              fontWeight: "bold",
            }}
          >
            Get Started
          </button>
          <button
            className="surface-card text-strong bordered"
            style={{ padding: "0.75rem 1.5rem", borderRadius: "8px" }}
          >
            Documentation
          </button>
        </div>
      </header>

      {/* Main Content: Page Surface */}
      <main
        style={{
          padding: "4rem 2rem",
          flex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          {/* Card 1: Selected State */}
          <div
            className={`surface-card bordered ${
              selectedId === "card-1" ? "state-selected" : ""
            }`}
            onClick={() => setSelectedId("card-1")}
            aria-selected={selectedId === "card-1"}
            style={{ padding: "2rem", borderRadius: "12px", cursor: "pointer" }}
          >
            <h3 className="text-strong" style={{ marginTop: 0 }}>
              Interactive Card
            </h3>
            <p className="text-subtle">
              This card is selectable. Click to see the "Selected" state (System
              Highlight).
            </p>
            <div style={{ marginTop: "1rem" }}>
              <span className="text-link">Learn more &rarr;</span>
            </div>
          </div>

          {/* Card 2: Standard */}
          <div
            className={`surface-card bordered ${
              selectedId === "card-2" ? "state-selected" : ""
            }`}
            onClick={() => setSelectedId("card-2")}
            aria-selected={selectedId === "card-2"}
            style={{ padding: "2rem", borderRadius: "12px", cursor: "pointer" }}
          >
            <h3 className="text-strong" style={{ marginTop: 0 }}>
              Standard Card
            </h3>
            <p className="text-subtle">
              A standard card with subtle text. Notice how the border adapts to
              the surface.
            </p>
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <button
                className="surface-action text-strong bordered"
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                }}
              >
                Action
              </button>
              <button
                className="surface-action text-strong bordered state-disabled"
                disabled
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                }}
              >
                Disabled
              </button>
            </div>
          </div>

          {/* Card 3: Nested Surface */}
          <div
            className="surface-card bordered"
            style={{ padding: "2rem", borderRadius: "12px" }}
          >
            <h3 className="text-strong" style={{ marginTop: 0 }}>
              Nested Surfaces
            </h3>
            <p className="text-subtle" style={{ marginBottom: "1rem" }}>
              Surfaces can be nested infinitely.
            </p>

            <div
              className="surface-tinted bordered"
              style={{ padding: "1.5rem", borderRadius: "8px" }}
            >
              <h4
                className="text-strong"
                style={{ marginTop: 0, fontSize: "1rem" }}
              >
                Tinted Area
              </h4>
              <p className="text-subtler">
                This is a tinted surface inside a card. The text contrast is
                automatically recalculated.
              </p>
            </div>
          </div>
        </div>

        {/* Semantic Composition Section */}
        <div style={{ marginTop: "4rem" }}>
          <h2 className="text-strong" style={{ marginBottom: "2rem" }}>
            Semantic Composition
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            {/* Success Card */}
            <div
              className="surface-card hue-success bordered"
              style={{ padding: "2rem", borderRadius: "12px" }}
            >
              <h3 className="text-strong" style={{ marginTop: 0 }}>
                Success State
              </h3>
              <p className="text-subtle">
                Composed using <code>.surface-card.hue-success</code>.
              </p>
              <div style={{ marginTop: "1rem" }}>
                <button
                  className="surface-action text-strong bordered"
                  style={{ padding: "0.5rem 1rem", borderRadius: "6px" }}
                >
                  Confirm
                </button>
              </div>
            </div>

            {/* Warning Card */}
            <div
              className="surface-card hue-warning bordered"
              style={{ padding: "2rem", borderRadius: "12px" }}
            >
              <h3 className="text-strong" style={{ marginTop: 0 }}>
                Warning State
              </h3>
              <p className="text-subtle">
                Composed using <code>.surface-card.hue-warning</code>.
              </p>
              <div style={{ marginTop: "1rem" }}>
                <button
                  className="surface-action text-strong bordered"
                  style={{ padding: "0.5rem 1rem", borderRadius: "6px" }}
                >
                  Review
                </button>
              </div>
            </div>

            {/* Error Card */}
            <div
              className="surface-card hue-error bordered"
              style={{ padding: "2rem", borderRadius: "12px" }}
            >
              <h3 className="text-strong" style={{ marginTop: 0 }}>
                Error State
              </h3>
              <p className="text-subtle">
                Composed using <code>.surface-card.hue-error</code>.
              </p>
              <div style={{ marginTop: "1rem" }}>
                <button
                  className="surface-action text-strong bordered"
                  style={{ padding: "0.5rem 1rem", borderRadius: "6px" }}
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
