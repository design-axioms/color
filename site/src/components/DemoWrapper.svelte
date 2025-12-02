<script lang="ts">
  import type { Snippet } from "svelte";
  import StateProvider from "./StateProvider.svelte";

  let { children } = $props<{ children: Snippet }>();
</script>

<StateProvider>
  {@render children()}
</StateProvider>
