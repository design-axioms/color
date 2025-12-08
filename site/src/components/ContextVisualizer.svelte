<script>
  import InspectorSurface from "./inspector/InspectorSurface.svelte";
  import TokenInspector from "./inspector/TokenInspector.svelte";
</script>

<TokenInspector>
  <div class="context-visualizer p-4 overflow-x-auto">
    <div class="min-w-[600px]">
      <InspectorSurface
        class="surface-page p-8 border border-border-subtle rounded-lg"
      >
        <div class="text-sm font-bold mb-4 text-text-subtle">
          Page (Light Context)
        </div>
        <InspectorSurface
          class="surface-card p-8 border border-border-subtle rounded-lg shadow-sm"
        >
          <div class="text-sm font-bold mb-4 text-text-subtle">
            Card (Nested)
          </div>
          <InspectorSurface class="surface-spotlight p-8 text-white rounded-lg">
            <div class="text-sm font-bold text-strong">
              Spotlight (Inverted Context)
            </div>
            <div class="mt-2 text-sm text-subtle">
              This surface inverts the polarity. Text becomes light
              automatically.
            </div>
          </InspectorSurface>
        </InspectorSurface>
      </InspectorSurface>
    </div>
  </div>
</TokenInspector>
