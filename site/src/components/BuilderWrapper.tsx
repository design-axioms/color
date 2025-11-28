import { ConfigProvider } from "../context/ConfigContext";
import { ThemeProvider } from "../context/ThemeContext";
import { FullScreenContainer } from "./FullScreenContainer";
import { ThemeBuilder } from "./builder/ThemeBuilder";

export function BuilderWrapper() {
  return (
    <ConfigProvider>
      <ThemeProvider>
        <FullScreenContainer>
          <ThemeBuilder />
        </FullScreenContainer>
      </ThemeProvider>
    </ConfigProvider>
  );
}
