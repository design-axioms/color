<script lang="ts">
  import { setContext } from "svelte";
  import { themeState } from "../lib/state/ThemeState.svelte";
  import { configState } from "../lib/state/ConfigState.svelte";

  let { children } = $props();

  // Provide the global singletons via context
  // This allows components to use getContext('theme') for dependency injection
  // while ensuring all instances share the same global state.
  setContext("theme", themeState);
  setContext("config", configState);
</script>

<!-- 
  Wrapping the children in a div with display: contents helps stabilize hydration 
  by ensuring there is a concrete element for Svelte to anchor to, 
  preventing "get_first_child" errors when the snippet renders directly.
-->
<div style="display: contents">
  {@render children()}
</div>
