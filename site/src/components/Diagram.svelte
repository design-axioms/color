<script lang="ts">
  let { children, class: className = "", ...props } = $props();
</script>

<div class={`not-content ${className}`} {...props}>
  {@render children?.()}
</div>
