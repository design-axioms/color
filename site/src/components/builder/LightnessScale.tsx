import { useConfig } from "../../context/ConfigContext";

export function LightnessScale() {
  const { config } = useConfig();
  const { anchors } = config;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h4
        className="text-strong"
        style={{
          margin: "0 0 0.5rem 0",
          fontSize: "0.9rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Anchor Visualization
      </h4>

      <div
        style={{
          position: "relative",
          height: "40px",
          background: "linear-gradient(to right, black, white)",
          borderRadius: "4px",
          marginBottom: "3.5rem",
          marginTop: "3.5rem",
        }}
      >
        {/* Page Light Range */}
        <Range
          start={anchors.page.light.start.background}
          end={anchors.page.light.end.background}
          color="cyan"
          label="Page (L)"
          top
        />
        {/* Page Dark Range */}
        <Range
          start={anchors.page.dark.start.background}
          end={anchors.page.dark.end.background}
          color="blue"
          label="Page (D)"
          bottom
        />

        {/* Inverted Light Range */}
        <Range
          start={anchors.inverted.light.start.background}
          end={anchors.inverted.light.end.background}
          color="orange"
          label="Inv (L)"
          top
          offset={20}
        />
        {/* Inverted Dark Range */}
        <Range
          start={anchors.inverted.dark.start.background}
          end={anchors.inverted.dark.end.background}
          color="red"
          label="Inv (D)"
          bottom
          offset={20}
        />
      </div>
    </div>
  );
}

function Range({
  start,
  end,
  color,
  label,
  top,
  bottom,
  offset = 0,
}: {
  start: number | null;
  end: number | null;
  color: string;
  label: string;
  top?: boolean;
  bottom?: boolean;
  offset?: number;
}) {
  if (start === null || end === null) return null;

  const left = Math.min(start, end) * 100;
  const width = Math.abs(end - start) * 100;

  return (
    <div
      style={{
        position: "absolute",
        left: `${left}%`,
        width: `${width}%`,
        height: "4px",
        background: color,
        top: top ? `-${8 + offset}px` : undefined,
        bottom: bottom ? `-${8 + offset}px` : undefined,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: top ? "-16px" : undefined,
          bottom: bottom ? "-16px" : undefined,
          fontSize: "0.7rem",
          whiteSpace: "nowrap",
          color: "var(--text-subtle-token)",
        }}
      >
        {label}
      </div>
      {/* Connectors */}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: "1px",
          height: `${8 + offset}px`,
          background: color,
          top: top ? "100%" : undefined,
          bottom: bottom ? "100%" : undefined,
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          width: "1px",
          height: `${8 + offset}px`,
          background: color,
          top: top ? "100%" : undefined,
          bottom: bottom ? "100%" : undefined,
          opacity: 0.5,
        }}
      />
    </div>
  );
}
