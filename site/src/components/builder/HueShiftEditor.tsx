import { useConfig } from "../../context/ConfigContext";

export function HueShiftEditor() {
  const { config, updateHueShiftRotation } = useConfig();

  if (!config.hueShift) return null;

  return (
    <div>
      <h3 class="text-strong" style={{ marginBottom: "1rem" }}>
        Hue Shift
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label
          class="text-subtle"
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Max Rotation</span>
            <span>{config.hueShift.maxRotation}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="180"
            step="1"
            value={config.hueShift.maxRotation}
            onInput={(e) =>
              updateHueShiftRotation(parseFloat(e.currentTarget.value))
            }
          />
        </label>
        <p class="text-subtlest" style={{ fontSize: "0.85rem" }}>
          Controls how much the hue rotates as lightness changes.
        </p>
      </div>
    </div>
  );
}
