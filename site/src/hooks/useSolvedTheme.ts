import { solve } from "@algebraic-systems/color-system";
import { useMemo } from "preact/hooks";
import { useConfig } from "../context/ConfigContext";

export function useSolvedTheme() {
  const { config } = useConfig();
  return useMemo(() => {
    try {
      return solve(config);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [config]);
}
