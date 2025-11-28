import { contrastForPair } from "@algebraic-systems/color-system/math";
import { useSolvedTheme } from "../../hooks/useSolvedTheme";

interface ContrastBadgeProps {
  slug: string;
  mode: "light" | "dark";
}

export function ContrastBadge({ slug, mode }: ContrastBadgeProps) {
  const solved = useSolvedTheme();

  if (!solved) return null;

  const surface = solved.surfaces.find((s) => s.slug === slug);
  if (!surface || !surface.computed) return null;

  const bg = surface.computed[mode].background;
  const polarity = surface.polarity;

  // Logic from math.ts textLightness
  const textL =
    polarity === "page" ? (mode === "light" ? 0 : 1) : mode === "light" ? 1 : 0;

  const contrast = contrastForPair(textL, bg);
  const score = Math.round(contrast);

  let color = "var(--text-subtle-token)";
  let borderColor = "var(--border-subtle-token)";

  // APCA rough guidelines
  if (score < 45) {
    color = "#d32f2f"; // Red
    borderColor = "#ffcdd2";
  } else if (score < 60) {
    color = "#f57c00"; // Orange
    borderColor = "#ffe0b2";
  } else {
    color = "#388e3c"; // Green
    borderColor = "#c8e6c9";
  }

  return (
    <span
      style={{
        fontSize: "0.75rem",
        padding: "0.1rem 0.4rem",
        borderRadius: "4px",
        backgroundColor: "var(--surface-workspace-token)",
        color: color,
        border: `1px solid ${borderColor}`,
        marginLeft: "auto",
        fontWeight: "bold",
      }}
      title={`APCA Contrast: ${score}`}
    >
      Lc {score}
    </span>
  );
}
