<script lang="ts">
  let count = 0;
  function increment(): void {
    count += 1;
  }
</script>

<div style="padding: 2rem; border: 2px dashed blue;">
  <h3>Debug Component (Legacy)</h3>
  <button onclick={increment}>
    Count is {count}
  </button>
</div>
