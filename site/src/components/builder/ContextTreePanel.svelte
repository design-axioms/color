<script lang="ts">
  import ContextTree from "./ContextTree.svelte";
  import VibePicker from "./VibePicker.svelte";
</script>

<div class="panel surface-workspace">
  <VibePicker />
  <div class="tree-container">
    <h2>Context Tree</h2>
    <ContextTree />
  </div>
</div>

<style>
  .panel {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .tree-container {
    padding: 1rem;
    overflow-y: auto;
    flex: 1;
  }
</style>
