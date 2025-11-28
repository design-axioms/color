import { createContext, type ComponentChildren } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";

type Theme = "light" | "dark";

interface ThemeContextType {
  resolvedTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ComponentChildren }) {
  const [resolvedTheme, setResolvedTheme] = useState<Theme>("light");

  useEffect(() => {
    const updateTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      if (theme === "dark") {
        setResolvedTheme("dark");
      } else {
        setResolvedTheme("light");
      }
    };

    // Initial check
    updateTheme();

    // Observer for Starlight theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          updateTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <ThemeContext.Provider value={{ resolvedTheme }}>
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
