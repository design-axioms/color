import { contrastForPair, textLightness } from "@algebraic-systems/color-system/math";
import { useConfig } from "../../context/ConfigContext";
import { useTheme } from "../../context/ThemeContext";
import { useSolvedTheme } from "../../hooks/useSolvedTheme";
import { LightnessScale } from "./LightnessScale";

interface DualRangeSliderProps {
  start: number;
  end: number;
  onStartChange: (val: number) => void;
  onEndChange: (val: number) => void;
  startLocked?: boolean;
  endLocked?: boolean;
  startLabel?: string;
  endLabel?: string;
}

function DualRangeSlider({
  start,
  end,
  onStartChange,
  onEndChange,
  startLocked,
  endLocked,
  startLabel,
  endLabel,
}: DualRangeSliderProps) {
  const minVal = Math.min(start, end);
  const maxVal = Math.max(start, end);
  const left = `${minVal * 100}%`;
  const width = `${(maxVal - minVal) * 100}%`;

  return (
    <div class="dual-range-container">
      <div class="dual-range-track" />
      <div class="dual-range-highlight" style={{ left, width }} />

      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={start}
        disabled={startLocked}
        onInput={(e) => onStartChange(parseFloat(e.currentTarget.value))}
        class="dual-range-input"
        title={startLabel || "Start"}
        style={{ zIndex: start > end ? 3 : 2 }}
      />

      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={end}
        disabled={endLocked}
        onInput={(e) => onEndChange(parseFloat(e.currentTarget.value))}
        class="dual-range-input"
        title={endLabel || "End"}
        style={{ zIndex: end > start ? 3 : 2 }}
      />
    </div>
  );
}

export function AnchorsEditor() {
  const { config, updateAnchor } = useConfig();
  const { resolvedTheme } = useTheme();
  const solved = useSolvedTheme();

  const getFailingSurfaces = (
    polarity: "page" | "inverted",
    mode: "light" | "dark"
  ) => {
    if (!solved) return 0;
    return solved.surfaces.filter((s) => {
      if (s.polarity !== polarity) return false;
      const bg = s.computed?.[mode].background;
      if (bg === undefined) return false;
      const textL = textLightness({ polarity, mode });
      const contrast = contrastForPair(textL, bg);
      return contrast < 45;
    }).length;
  };

  const getLockReason = (
    polarity: "page" | "inverted",
    position: "start" | "end"
  ) => {
    if (polarity === "inverted" && position === "end") {
      return "Locked to Brand Color lightness";
    }
    return "Locked by default configuration (editable in config)";
  };

  const renderRangeControl = (
    polarity: "page" | "inverted",
    mode: "light" | "dark"
  ) => {
    const startAnchor = config.anchors[polarity][mode].start;
    const endAnchor = config.anchors[polarity][mode].end;
    const isActive = mode === resolvedTheme;
    const failingCount = getFailingSurfaces(polarity, mode);

    const startLocked = !startAnchor.adjustable;
    const endLocked = !endAnchor.adjustable;

    return (
      <div
        style={{
          opacity: isActive ? 1 : 0.5,
          transition: "opacity 0.2s ease",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span class="text-strong" style={{ textTransform: "capitalize" }}>
            {mode}
            {failingCount > 0 && (
              <span
                title={`${failingCount} surfaces have insufficient contrast`}
                style={{ marginLeft: "0.5rem", cursor: "help" }}
              >
                ⚠️
              </span>
            )}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.85rem",
            color: "var(--text-subtle-token)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <span>Start: {startAnchor.background.toFixed(2)}</span>
            {startLocked && (
              <span
                title={getLockReason(polarity, "start")}
                style={{ cursor: "help", fontSize: "0.8rem" }}
              >
                🔒
              </span>
            )}
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <span>End: {endAnchor.background.toFixed(2)}</span>
            {endLocked && (
              <span
                title={getLockReason(polarity, "end")}
                style={{ cursor: "help", fontSize: "0.8rem" }}
              >
                🔒
              </span>
            )}
          </div>
        </div>

        <DualRangeSlider
          start={startAnchor.background}
          end={endAnchor.background}
          startLocked={startLocked}
          endLocked={endLocked}
          onStartChange={(val) => updateAnchor(polarity, mode, "start", val)}
          onEndChange={(val) => updateAnchor(polarity, mode, "end", val)}
          startLabel={`${mode} Start`}
          endLabel={`${mode} End`}
        />
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <LightnessScale />
      <div>
        <h3 class="text-strong" style={{ marginBottom: "1rem" }}>
          Page Anchors
        </h3>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {renderRangeControl("page", "light")}
          {renderRangeControl("page", "dark")}
        </div>
      </div>

      <div>
        <h3 class="text-strong" style={{ marginBottom: "1rem" }}>
          Inverted Anchors
        </h3>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {renderRangeControl("inverted", "light")}
          {renderRangeControl("inverted", "dark")}
        </div>
      </div>
    </div>
  );
}
