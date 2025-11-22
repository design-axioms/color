import { useEffect, useState } from "preact/hooks";
import { Showcase } from "./Showcase";
import { SolverLab } from "./components/SolverLab";
import "./app.css";

/**
 * ARCHITECTURAL NOTE:
 * This component avoids hardcoded colors (hex, rgb, etc.).
 * All color features are powered by the color system's surfaces and utilities
 * to ensure theming, accessibility, and consistency.
 */

// --- STYLE CONSTANTS ---
const styles = {
  globalControls: {
    position: "fixed" as const,
    top: "1rem",
    right: "1rem",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
    alignItems: "flex-end",
  },
  controlPanel: {
    display: "flex",
    gap: "0.5rem",
    padding: "0.5rem",
    borderRadius: "8px",
  },
  viewButton: {
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold" as const,
  },
  pageContainer: {
    minHeight: "100vh",
    padding: "2rem",
    paddingTop: "6rem" /* Add padding to prevent overlap with fixed controls */,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  heading: {
    margin: 0,
  },
  section: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "2rem",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  playgroundTitle: {
    fontSize: "2rem",
    fontWeight: "bold" as const,
  },
  playgroundButtons: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  interactiveButton: {
    padding: "1rem",
    borderRadius: "8px",
    cursor: "pointer",
  },
  grid2Col: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "2rem",
  },
  grid3Col: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
  },
  surfaceColumn: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  surfaceTitle: {
    textTransform: "capitalize" as const,
  },
  surfaceCard: {
    padding: "1.5rem",
    borderRadius: "8px",
  },
} as const;

export function App() {
  const [view, setView] = useState("showcase");

  return (
    <>
      <div style={styles.globalControls}>
        {/* View Switcher */}
        <div
          style={styles.controlPanel}
          class="surface-card surface-glass bordered"
        >
          <button
            onClick={() => setView("showcase")}
            style={styles.viewButton}
            class={
              view === "showcase" ? "surface-action text-strong" : "text-subtle"
            }
          >
            Showcase
          </button>
          <button
            onClick={() => setView("lab")}
            style={styles.viewButton}
            class={
              view === "lab" ? "surface-action text-strong" : "text-subtle"
            }
          >
            Solver Lab
          </button>
        </div>

        {/* Theme Switcher */}
        <ThemeSwitcher />
      </div>

      {view === "showcase" ? <Showcase /> : <SolverLab />}
    </>
  );
}

// Placeholder for Showcase component is removed as it is imported

function ThemeSwitcher() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.style.removeProperty("color-scheme");
    } else {
      root.style.setProperty("color-scheme", theme);
    }
  }, [theme]);

  const themeSwitcherStyles = {
    container: {
      display: "flex",
      gap: "0.5rem",
      padding: "0.5rem",
      borderRadius: "8px",
    },
    button: (active: boolean) => ({
      fontWeight: active ? ("bold" as const) : ("normal" as const),
      border: "none",
      background: "transparent",
      cursor: "pointer",
      padding: "0.25rem 0.5rem",
      borderRadius: "4px",
    }),
  };

  return (
    <div
      class="surface-card surface-glass bordered"
      style={themeSwitcherStyles.container}
    >
      <button
        onClick={() => setTheme("light")}
        style={themeSwitcherStyles.button(theme === "light")}
        class={theme === "light" ? "text-strong" : "text-subtle"}
      >
        Light
      </button>
      <button
        onClick={() => setTheme("dark")}
        style={themeSwitcherStyles.button(theme === "dark")}
        class={theme === "dark" ? "text-strong" : "text-subtle"}
      >
        Dark
      </button>
      <button
        onClick={() => setTheme("system")}
        style={themeSwitcherStyles.button(theme === "system")}
        class={theme === "system" ? "text-strong" : "text-subtle"}
      >
        System
      </button>
    </div>
  );
}
