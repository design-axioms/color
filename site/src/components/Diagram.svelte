<script lang="ts">
  let { children, class: clazz = "", style = "", ...props } = $props();

  // Combine class
  const finalClass = ["not-content", clazz].filter(Boolean).join(" ");

  // Handle style object or string
  function formatStyle(s: any) {
    if (typeof s === "string") return s;
    if (typeof s === "object" && s !== null) {
      return Object.entries(s)
        .map(([key, value]) => {
          const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
          return `${kebabKey}: ${value}`;
        })
        .join("; ");
    }
    return "";
  }

  const finalStyle = formatStyle(style);
</script>

<div class={finalClass} style={finalStyle} {...props}>
  {@render children?.()}
</div>
