import { h, type ComponentChildren } from "preact";

export function FullScreenContainer({ children }: { children: ComponentChildren }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "var(--sl-nav-height, 3.5rem)",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        background: "var(--sl-color-bg)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
}
