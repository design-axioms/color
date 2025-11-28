import { h, type ComponentChildren } from "preact";
import "./Layout.css";

interface ClusterProps {
  children: ComponentChildren;
  gap?: string;
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  justify?: "start" | "center" | "end" | "space-between";
  className?: string;
}

export function Cluster({ 
  children, 
  gap = "1rem", 
  align = "center", 
  justify = "start",
  className = "" 
}: ClusterProps) {
  return (
    <div 
      class={`layout-cluster ${className}`} 
      style={{ gap, alignItems: align, justifyContent: justify } as any}
    >
      {children}
    </div>
  );
}
