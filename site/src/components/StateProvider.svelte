<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import { themeState } from "../lib/state/ThemeState.svelte";
  import { configState } from "../lib/state/ConfigState.svelte";

  let { children } = $props<{ children: Snippet }>();

  // Provide the global singletons via context
  // This allows components to use getContext('theme') for dependency injection
  // while ensuring all instances share the same global state.
  setContext("theme", themeState);
  setContext("config", configState);
</script>

{@render children()}
