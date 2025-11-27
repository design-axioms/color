import "../../../css/index.css";
import { ConfigProvider } from "@demo/context/ConfigContext";
import { ThemeProvider } from "@demo/context/ThemeContext";

export function SystemDemo({ children }: { children: any }) {
  return (
    <ConfigProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </ConfigProvider>
  );
}
