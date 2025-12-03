<script lang="ts">
  import ContextGraph from "./ContextGraph.svelte";
  import LuminanceSpectrum from "./LuminanceSpectrum.svelte";
</script>

<div
  class="surface-workspace bordered"
  style="padding: 1.5rem; border-radius: 6px;"
>
  <LuminanceSpectrum />
  <ContextGraph showPage={false} />
</div>
