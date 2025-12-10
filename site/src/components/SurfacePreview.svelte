<script lang="ts">
  export let surface: string;
  export let name: string;
  export let description: string = "";
  export let tint: string = "";
</script>

<div
  class="{surface} {tint} bordered"
  style="padding: 1.5rem; border-radius: 0.5rem; transition: all 0.2s;"
>
  <div
    class="text-strong"
    style="font-size: 1.125rem; font-weight: bold; margin-bottom: 0.25rem;"
  >
    {name}
  </div>
  {#if description}
    <div class="text-subtle" style="font-size: 0.875rem;">{description}</div>
  {/if}
  <slot />
</div>
