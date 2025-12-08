<script>
  import InspectorSurface from "./inspector/InspectorSurface.svelte";
  import TokenInspector from "./inspector/TokenInspector.svelte";
</script>

<TokenInspector>
  <div class="context-visualizer docs-p-4">
    <InspectorSurface class="surface-page docs-p-8 bordered docs-rounded-lg">
      <div class="text-sm font-bold docs-mb-4 text-subtle">
        Page (Light Context)
      </div>
      <InspectorSurface
        class="surface-card docs-p-8 bordered docs-rounded-lg shadow-sm"
      >
        <div class="text-sm font-bold docs-mb-4 text-subtle">Card (Nested)</div>
        <InspectorSurface class="surface-spotlight docs-p-8 docs-rounded-lg">
          <div class="text-sm font-bold">Spotlight (Inverted Context)</div>
          <div class="docs-mt-2 text-sm text-subtle">
            This surface inverts the polarity. Text becomes light automatically.
          </div>
        </InspectorSurface>
      </InspectorSurface>
    </InspectorSurface>
  </div>
</TokenInspector>
