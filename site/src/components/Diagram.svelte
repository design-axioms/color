<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    style?: string | Record<string, string | number>;
  }

  let { children, class: clazz = "", style = "", ...props }: Props = $props();

  // Combine class
  const finalClass = (["not-content", clazz || ""] as string[])
    .filter((c) => !!c)
    .join(" ");

  // Handle style object or string
  function formatStyle(s: string | Record<string, string | number>): string {
    if (typeof s === "string") return s;
    return Object.entries(s)
      .map(([key, value]) => {
        const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        return `${kebabKey}: ${value}`;
      })
      .join("; ");
  }

  const finalStyle = formatStyle(style);
</script>

<div class={finalClass} style={finalStyle} {...props}>
  {@render children?.()}
</div>
