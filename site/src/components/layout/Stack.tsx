import { type ComponentChildren } from "preact";
import "./Layout.css";

interface StackProps {
  children: ComponentChildren;
  gap?: string;
  align?: "start" | "center" | "end" | "stretch";
  className?: string;
}

export function Stack({ children, gap = "1rem", align = "stretch", className = "" }: StackProps) {
  return (
    <div 
      class={`layout-stack ${className}`} 
      style={{ gap, alignItems: align } as any}
    >
      {children}
    </div>
  );
}
