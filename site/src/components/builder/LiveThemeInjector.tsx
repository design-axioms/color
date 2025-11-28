import {
  generateTheme,
  injectTheme,
  toHighContrast,
} from "@algebraic-systems/color-system/runtime";
import { useEffect, useRef } from "preact/hooks";
import { useConfig } from "../../context/ConfigContext";

export function LiveThemeInjector({
  simulateHighContrast = false,
  selector = ":root",
}: {
  simulateHighContrast?: boolean;
  selector?: string;
}) {
  const { config } = useConfig();
  const styleElementRef = useRef<HTMLStyleElement | undefined>(undefined);

  useEffect(() => {
    try {
      let css = generateTheme(config, selector);

      if (simulateHighContrast) {
        const hcConfig = toHighContrast(config);
        const hcCss = generateTheme(hcConfig, selector);
        css = hcCss;
      }

      styleElementRef.current = injectTheme(
        css,
        undefined,
        styleElementRef.current
      );
    } catch (e) {
      console.error("Solver failed:", e);
    }
  }, [config, simulateHighContrast, selector]);

  useEffect(() => {
    return () => {
      if (styleElementRef.current) {
        styleElementRef.current.remove();
      }
    };
  }, []);

  return null;
}
