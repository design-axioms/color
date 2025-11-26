import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import "./app.css";
import { DataVizShowcase } from "./components/DataVizShowcase";
import { ExperienceLab } from "./components/ExperienceLab";
import { PrimitivesShowcase } from "./components/PrimitivesShowcase";
import { SystemVerifier } from "./components/SystemVerifier";
import { ThemeBuilder } from "./components/ThemeBuilder/ThemeBuilder";
import { Toolbar } from "./components/Toolbar";
import { ConfigProvider } from "./context/ConfigContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Showcase } from "./Showcase";

import { LiveThemeInjector } from "./components/ThemeBuilder/LiveThemeInjector";

export function App() {
  return (
    <ThemeProvider>
      <ConfigProvider>
        <LiveThemeInjector />
        <Router hook={useHashLocation}>
          <AppContent />
        </Router>
      </ConfigProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Toolbar />
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Switch>
          <Route path="/builder" component={ThemeBuilder} />

          <Route path="/">
            <div style={{ height: "100%", overflowY: "auto" }}>
              <Showcase />
            </div>
          </Route>

          <Route path="/lab">
            <div style={{ height: "100%", overflowY: "auto" }}>
              <SystemVerifier />
            </div>
          </Route>

          <Route path="/experience">
            <div style={{ height: "100%", overflowY: "auto" }}>
              <ExperienceLab />
            </div>
          </Route>

          <Route path="/primitives">
            <div style={{ height: "100%", overflowY: "auto" }}>
              <PrimitivesShowcase />
            </div>
          </Route>

          <Route path="/dataviz">
            <div style={{ height: "100%", overflowY: "auto" }}>
              <DataVizShowcase />
            </div>
          </Route>
        </Switch>
      </div>
    </div>
  );
}
