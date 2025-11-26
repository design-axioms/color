import { createContext } from "preact";
import { useContext, useEffect, useState, useMemo } from "preact/hooks";
import { ThemeManager, ThemeMode } from "color-system/browser";

type Theme = ThemeMode;
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getFaviconSvg = (color: string) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="14" fill="${color}" />
</svg>
`;

export function ThemeProvider({ children }: { children: any }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  const themeManager = useMemo(() => new ThemeManager({
    faviconGenerator: getFaviconSvg
  }), []);

  useEffect(() => {
    themeManager.setMode(theme);
    setResolvedTheme(themeManager.resolvedMode);

    // Listen for system changes if in system mode to update React state
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        setResolvedTheme(mediaQuery.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme, themeManager]);

  // Cleanup
  useEffect(() => {
    return () => themeManager.dispose();
  }, [themeManager]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
