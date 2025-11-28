import { HueShiftVisualizer } from "@demo/components/HueShiftVisualizer";
import { ThemeProvider } from "@demo/context/ThemeContext";

export function HueShiftDemo() {
  return (
    <ThemeProvider>
      <HueShiftVisualizer />
    </ThemeProvider>
  );
}
