<script>
  import InspectorSurface from './inspector/InspectorSurface.svelte';
</script>

<div class="context-visualizer p-4">
  <InspectorSurface class="surface-page p-8 border border-border-subtle rounded-lg">
    <div class="text-sm font-bold mb-4 text-text-subtle">
      Page (Light Context)
    </div>
    <InspectorSurface class="surface-card p-8 border border-border-subtle rounded-lg shadow-sm">
      <div class="text-sm font-bold mb-4 text-text-subtle">
        Card (Nested)
      </div>
      <InspectorSurface class="surface-spotlight p-8 text-white rounded-lg">
        <div class="text-sm font-bold">
          Spotlight (Inverted Context)
        </div>
        <div class="mt-2 text-sm opacity-80">
          This surface inverts the polarity. Text becomes light
          automatically.
        </div>
      </InspectorSurface>
    </InspectorSurface>
  </InspectorSurface>
</div>
