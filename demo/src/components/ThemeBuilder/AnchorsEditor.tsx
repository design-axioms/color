import { useConfig } from "../../context/ConfigContext";
import { useTheme } from "../../context/ThemeContext";

export function AnchorsEditor() {
  const { config, updateAnchor } = useConfig();
  const { resolvedTheme } = useTheme();

  const renderSlider = (
    polarity: "page" | "inverted",
    mode: "light" | "dark",
    position: "start" | "end"
  ) => {
    const value = config.anchors[polarity][mode][position].background;
    const isActive = mode === resolvedTheme;

    return (
      <label
        class={isActive ? "text-strong" : "text-subtlest"}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          opacity: isActive ? 1 : 0.5,
          transition: "opacity 0.2s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ textTransform: "capitalize" }}>
            {mode} {position}
          </span>
          <span>{value.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onInput={(e) =>
            updateAnchor(
              polarity,
              mode,
              position,
              parseFloat(e.currentTarget.value)
            )
          }
        />
      </label>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h3 class="text-strong" style={{ marginBottom: "1rem" }}>
          Page Anchors
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {renderSlider("page", "light", "start")}
          {renderSlider("page", "light", "end")}
          {renderSlider("page", "dark", "start")}
          {renderSlider("page", "dark", "end")}
        </div>
      </div>

      <div>
        <h3 class="text-strong" style={{ marginBottom: "1rem" }}>
          Inverted Anchors
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {renderSlider("inverted", "light", "start")}
          {renderSlider("inverted", "light", "end")}
          {renderSlider("inverted", "dark", "start")}
          {renderSlider("inverted", "dark", "end")}
        </div>
      </div>
    </div>
  );
}
