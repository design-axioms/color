<script lang="ts">
  import StateProvider from "./StateProvider.svelte";

  let { children } = $props();
</script>

<StateProvider>
  {@render children()}
</StateProvider>
