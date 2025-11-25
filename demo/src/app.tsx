import { useState } from "preact/hooks";
import { Showcase } from "./Showcase";
import "./app.css";
import { ExperienceLab } from "./components/ExperienceLab";
import { SystemVerifier } from "./components/SystemVerifier";
import { ThemeBuilder } from "./components/ThemeBuilder/ThemeBuilder";
import { ConfigProvider } from "./context/ConfigContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

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
  return (
    <ThemeProvider>
      <ConfigProvider>
        <AppContent />
      </ConfigProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const [view, setView] = useState("showcase");
  const { theme, setTheme } = useTheme();

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
            System Verifier
          </button>
          <button
            onClick={() => setView("experience")}
            style={styles.viewButton}
            class={
              view === "experience"
                ? "surface-action text-strong"
                : "text-subtle"
            }
          >
            Experience Lab
          </button>
          <button
            onClick={() => setView("builder")}
            style={styles.viewButton}
            class={
              view === "builder" ? "surface-action text-strong" : "text-subtle"
            }
          >
            Theme Builder
          </button>
        </div>

        {/* Theme Switcher */}
        <ThemeSwitcher theme={theme} setTheme={setTheme} />
      </div>

      {view === "showcase" ? (
        <Showcase />
      ) : view === "lab" ? (
        <SystemVerifier />
      ) : view === "experience" ? (
        <ExperienceLab />
      ) : (
        <ThemeBuilder />
      )}
    </>
  );
}

interface ThemeSwitcherProps {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
}

function ThemeSwitcher({ theme, setTheme }: ThemeSwitcherProps) {
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
