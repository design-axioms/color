<script lang="ts">
  export let surface: string;
  export let name: string;
  export let description: string = "";
  export let tint: string = "";
</script>

<div
  class="{surface} {tint} docs-p-6 docs-rounded-lg bordered transition-all duration-200"
>
  <div class="text-lg font-bold text-strong docs-mb-1">{name}</div>
  {#if description}
    <div class="text-sm text-subtle">{description}</div>
  {/if}
  <slot />
</div>
