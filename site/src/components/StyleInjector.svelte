<script lang="ts">
  import { injectTheme } from "@axiomatic-design/color";
  import { configState } from "../lib/state/ConfigState.svelte";

  let styleElement: HTMLStyleElement | undefined;

  $effect(() => {
    if (configState.css) {
      styleElement = injectTheme(configState.css, undefined, styleElement);
    }
  });

  $effect(() => {
    return () => {
      if (styleElement) {
        styleElement.remove();
      }
    };
  });
</script>
