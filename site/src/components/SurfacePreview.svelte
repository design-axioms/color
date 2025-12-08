<script lang="ts">
  export let surface: string;
  export let name: string;
  export let description: string = "";
  export let tint: string = "";
</script>

<div
  class="{surface} {tint} p-6 rounded-lg border border-border-subtle transition-all duration-200"
>
  <div class="text-lg font-bold text-text-strong mb-1">{name}</div>
  {#if description}
    <div class="text-sm text-text-subtle">{description}</div>
  {/if}
  <slot />
</div>
