import { useConfig } from "../../context/ConfigContext";

export function KeyColorsEditor() {
  const { config, updateKeyColor } = useConfig();

  return (
    <div>
      <h3 class="text-strong" style={{ marginBottom: "1rem" }}>
        Key Colors
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {Object.entries(config.anchors.keyColors).map(([key, value]) => (
          <label
            key={key}
            class="text-subtle"
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <span style={{ textTransform: "capitalize" }}>{key}</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="color"
                value={value}
                onInput={(e) => updateKeyColor(key, e.currentTarget.value)}
                style={{
                  width: "40px",
                  height: "40px",
                  padding: 0,
                  border: "none",
                  cursor: "pointer",
                }}
              />
              <input
                type="text"
                value={value}
                onInput={(e) => updateKeyColor(key, e.currentTarget.value)}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid var(--border-subtle-token)",
                  background: "transparent",
                  color: "var(--text-high-token)",
                }}
              />
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
