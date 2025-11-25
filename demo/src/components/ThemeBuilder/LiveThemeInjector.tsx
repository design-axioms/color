import { generateTheme, injectTheme } from "color-system/runtime";
import { useEffect, useRef } from "preact/hooks";
import { useConfig } from "../../context/ConfigContext";

export function LiveThemeInjector() {
  const { config } = useConfig();
  const styleElementRef = useRef<HTMLStyleElement | undefined>(undefined);

  useEffect(() => {
    try {
      const css = generateTheme(config, "#theme-builder-preview");
      styleElementRef.current = injectTheme(
        css,
        undefined,
        styleElementRef.current
      );
    } catch (e) {
      console.error("Solver failed:", e);
    }
  }, [config]);

  useEffect(() => {
    return () => {
      if (styleElementRef.current) {
        styleElementRef.current.remove();
      }
    };
  }, []);

  return null;
}
