import { useState } from "preact/hooks";

export function IntentPlayground() {
  // Intent State (Class-based)
  const [hueClass, setHueClass] = useState("hue-brand");
  const [surfaceClass, setSurfaceClass] = useState("surface-card");
  const [textClass, setTextClass] = useState("text-subtle");

  return (
    <section>
      <div style={{ marginBottom: "2rem" }}>
        <h2 className="text-strong" style={{ margin: 0 }}>
          1. The Intent Playground
        </h2>
        <p className="text-subtle" style={{ margin: "0.5rem 0 0 0" }}>
          "I Feel Understood" — You describe the <em>what</em>, the system
          handles the <em>how</em>.
        </p>
      </div>

      <div
        className="surface-card bordered"
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
          {/* Hue Control */}
          <div>
            <label
              className="text-strong"
              style={{ display: "block", marginBottom: "0.5rem" }}
            >
              Hue Intent
            </label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {[
                { label: "Brand", value: "hue-brand" },
                { label: "Success", value: "hue-success" },
                { label: "Warning", value: "hue-warning" },
                { label: "Error", value: "hue-error" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setHueClass(opt.value)}
                  className={`surface-action bordered ${
                    hueClass === opt.value ? "state-selected" : ""
                  }`}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    flex: "1 0 40%",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Elevation Control */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "0.5rem",
              }}
            >
              <label className="text-strong" style={{ display: "block" }}>
                Elevation Intent
              </label>
              <code className="text-subtle" style={{ fontSize: "0.8rem" }}>
                .{surfaceClass}
              </code>
            </div>

            <div style={{ position: "relative", padding: "0 0.5rem" }}>
              <input
                type="range"
                min="0"
                max="6"
                step="1"
                value={
                  surfaceClass === "surface-workspace"
                    ? 0
                    : surfaceClass === "surface-page"
                    ? 1
                    : surfaceClass === "surface-tinted"
                    ? 2
                    : surfaceClass === "surface-card"
                    ? 3
                    : surfaceClass === "surface-action"
                    ? 4
                    : surfaceClass === "surface-soft-spotlight"
                    ? 5
                    : 6
                }
                onInput={(e) => {
                  const val = Number(e.currentTarget.value);
                  const cls =
                    val === 0
                      ? "surface-workspace"
                      : val === 1
                      ? "surface-page"
                      : val === 2
                      ? "surface-tinted"
                      : val === 3
                      ? "surface-card"
                      : val === 4
                      ? "surface-action"
                      : val === 5
                      ? "surface-soft-spotlight"
                      : "surface-spotlight";
                  setSurfaceClass(cls);
                }}
                style={{
                  width: "100%",
                  cursor: "pointer",
                  marginBottom: "0.5rem",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.65rem",
                }}
                className="text-subtler"
              >
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => setSurfaceClass("surface-workspace")}
                >
                  workspace
                </span>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => setSurfaceClass("surface-page")}
                >
                  page
                </span>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => setSurfaceClass("surface-tinted")}
                >
                  tinted
                </span>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => setSurfaceClass("surface-card")}
                >
                  card
                </span>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => setSurfaceClass("surface-action")}
                >
                  action
                </span>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => setSurfaceClass("surface-soft-spotlight")}
                >
                  soft
                </span>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => setSurfaceClass("surface-spotlight")}
                >
                  spot
                </span>
              </div>
            </div>
          </div>

          {/* Prominence Control */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "0.5rem",
              }}
            >
              <label className="text-strong" style={{ display: "block" }}>
                Prominence Intent
              </label>
              <code className="text-subtle" style={{ fontSize: "0.8rem" }}>
                .{textClass}
              </code>
            </div>

            <div style={{ position: "relative", padding: "0 0.5rem" }}>
              <input
                type="range"
                min="0"
                max="2"
                step="1"
                value={
                  textClass === "text-subtler"
                    ? 0
                    : textClass === "text-subtle"
                    ? 1
                    : 2
                }
                onInput={(e) => {
                  const val = Number(e.currentTarget.value);
                  const cls =
                    val === 0
                      ? "text-subtler"
                      : val === 1
                      ? "text-subtle"
                      : "text-strong";
                  setTextClass(cls);
                }}
                style={{
                  width: "100%",
                  cursor: "pointer",
                  marginBottom: "0.5rem",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                }}
                className="text-subtler"
              >
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => setTextClass("text-subtler")}
                >
                  Subtler
                </span>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => setTextClass("text-subtle")}
                >
                  Subtle
                </span>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => setTextClass("text-strong")}
                >
                  Strong
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div
          className="surface-workspace bordered"
          style={{
            borderRadius: "12px",
            padding: "3rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* The Composition */}
          <div
            className={`${surfaceClass} ${hueClass} bordered`}
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "2rem",
              borderRadius: "16px",
              textAlign: "center",
              transition: "all 0.3s ease",
            }}
          >
            <div
              className={`surface-action ${hueClass}`}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                margin: "0 auto 1.5rem auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
              }}
            >
              {hueClass === "hue-success"
                ? "✓"
                : hueClass === "hue-error"
                ? "!"
                : hueClass === "hue-warning"
                ? "⚠"
                : "★"}
            </div>

            <h3 className="text-strong" style={{ margin: "0 0 0.5rem 0" }}>
              Intent-Driven Design
            </h3>

            <p className={textClass} style={{ margin: "0 0 2rem 0" }}>
              This card is composed entirely of semantic classes. No hardcoded
              colors, no manual dark mode adjustments.
            </p>

            <button
              className={`surface-action ${hueClass} text-strong`}
              style={{
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Confirm Action
            </button>
          </div>
        </div>
      </div>

      {/* Educational Tooltip / Context */}
      <div
        className="surface-tinted bordered"
        style={{
          marginTop: "1rem",
          padding: "1rem",
          borderRadius: "8px",
          fontSize: "0.9rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <div
          className="surface-spotlight"
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            flexShrink: 0,
          }}
        >
          ?
        </div>
        <div>
          <strong className="text-strong">Why is this color here?</strong>
          <p className="text-subtle" style={{ margin: "0.25rem 0 0 0" }}>
            The system combined <code>.{surfaceClass}</code> (Lightness) with{" "}
            <code>.{hueClass}</code> (Context) to generate the result. The text
            color <code>.{textClass}</code> automatically adjusted its contrast
            ratio to be accessible on that specific background.
          </p>
        </div>
      </div>
    </section>
  );
}
