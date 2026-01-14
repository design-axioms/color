import type { SolverConfig } from "@axiomatic-design/color";
import {
  AxiomaticDebugger,
  AxiomaticTheme,
  generateTokensCss,
  solve,
} from "@axiomatic-design/color";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import demoConfig from "../color-config.json";
import { createVercelConfig } from "./vercel-config";

// Ensure the debugger is registered (prevent tree-shaking)
void AxiomaticDebugger;

// Demo contract: default to light mode deterministically.
// Engine transitions can start from tau=0; force tau=1 before tests sample styles.
if (typeof document !== "undefined") {
  const root = document.documentElement;
  const prevTransition = root.style.getPropertyValue("transition");
  const prevPriority = root.style.getPropertyPriority("transition");
  root.style.setProperty("transition", "none", "important");
  root.style.setProperty("--tau", "1");
  root.style.colorScheme = "light";
  root.setAttribute("data-theme", "light");
  requestAnimationFrame(() => {
    if (prevTransition) {
      root.style.setProperty("transition", prevTransition, prevPriority);
    } else {
      root.style.removeProperty("transition");
    }
  });
}

// Register the custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "axiomatic-debugger": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

/**
 * DI Pattern: Create and provide theme instance via React Context.
 * This showcases the recommended pattern for framework integration.
 */
const ThemeContext = createContext<AxiomaticTheme | null>(null);

function useTheme(): AxiomaticTheme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return theme;
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Create a single theme instance for the app lifetime.
  // Using useMemo to ensure stability across re-renders.
  const theme = useMemo(() => new AxiomaticTheme(), []);
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

function AppContent() {
  const theme = useTheme();
  const keyColors = (demoConfig as any)?.anchors?.keyColors ?? {};
  const defaultBrandColor = keyColors.brand;
  if (typeof defaultBrandColor !== "string") {
    throw new Error("Demo config missing anchors.keyColors.brand");
  }

  const presetBlue = keyColors.brand;
  const presetWarning = keyColors.warning;
  const presetPurple = keyColors.violet;

  const [brandColor, setBrandColor] = useState(String(defaultBrandColor));
  const [isDark, setIsDark] = useState(theme.getState().tau === -1);

  // 1. Construct the Config
  const solverConfig: SolverConfig = useMemo(
    () => createVercelConfig(brandColor),
    [brandColor],
  );

  // 2. Run the Solver & Generator (synchronously for deterministic rendering/tests)
  const tokensCss = useMemo(() => {
    try {
      const solved = solve(solverConfig);
      return generateTokensCss(
        solverConfig.groups,
        solved,
        solverConfig.borderTargets,
        {
          selector: ":root",
          prefix: "axm",
        },
      );
    } catch (e) {
      console.error("Solver failed:", e);
      return "";
    }
  }, [solverConfig]);

  // 3. Sync with AxiomaticTheme (DI: using injected theme instance)
  useEffect(() => {
    return theme.subscribe((state) => {
      setIsDark(state.tau === -1);
    });
  }, [theme]);

  return (
    <div className="surface-page min-h-screen p-8 transition-colors duration-200">
      <style id="dynamic-theme">{tokensCss}</style>
      <div className="surface-card p-6 rounded-lg bordered shadow-lg max-w-md mx-auto transition-colors duration-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-strong text-2xl font-bold">Axiomatic Demo</h1>
          <button onClick={() => theme.toggle()} className="p-2 rounded">
            {isDark ? "🌙" : "☀️"}
          </button>
        </div>

        <p className="text-base mb-6 text-subtle">
          This isn't just a theme. It's a <strong>Physics Engine</strong>{" "}
          running in your browser.
        </p>

        <p className="text-sm mb-6 text-subtle">
          Pick any color. The system automatically solves for{" "}
          <strong>APCA Contrast</strong>,<strong>Gamut Safety</strong>, and{" "}
          <strong>Dark Mode</strong> adaptation in real-time.
        </p>

        <div className="mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-strong mb-2">
              Input: Brand Hue
            </label>
            <div className="flex gap-3 mb-4">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="h-10 w-20 rounded cursor-pointer bordered"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="flex-1 px-3 py-2 rounded bordered bg-transparent font-mono text-strong"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (typeof presetBlue === "string") setBrandColor(presetBlue);
                }}
                className="surface-action-secondary bordered text-xs px-2 py-1 rounded"
              >
                Vercel Blue
              </button>
              <button
                onClick={() => {
                  if (typeof presetWarning === "string")
                    setBrandColor(presetWarning);
                }}
                className="surface-action-secondary bordered text-xs px-2 py-1 rounded"
              >
                Tricky Yellow
              </button>
              <button
                onClick={() => {
                  if (typeof presetPurple === "string")
                    setBrandColor(presetPurple);
                }}
                className="surface-action-secondary bordered text-xs px-2 py-1 rounded"
              >
                Deep Purple
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="surface-action px-4 py-2 rounded-lg font-medium transition-all">
            Deploy
          </button>
          <button className="surface-action-secondary bordered px-4 py-2 rounded-lg text-strong font-medium transition-all">
            Cancel
          </button>
        </div>

        <div className="mt-8 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
          <div className="flex gap-2 text-xs text-subtlest font-mono">
            <span>H: {solverConfig.anchors.keyColors.brand}</span>
            <span>•</span>
            <span>Mode: {isDark ? "Dark" : "Light"}</span>
          </div>
        </div>
      </div>
      <axiomatic-debugger />
    </div>
  );
}

/**
 * App component wrapped in ThemeProvider.
 * This demonstrates the DI pattern: creating an AxiomaticTheme instance
 * and providing it through React context.
 */
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
