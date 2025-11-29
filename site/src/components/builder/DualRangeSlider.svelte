<script lang="ts">
  interface Props {
    start: number;
    end: number;
    startLocked?: boolean;
    endLocked?: boolean;
    startLabel?: string;
    endLabel?: string;
    onStartChange: (val: number) => void;
    onEndChange: (val: number) => void;
  }

  let {
    start,
    end,
    startLocked = false,
    endLocked = false,
    startLabel = "Start",
    endLabel = "End",
    onStartChange,
    onEndChange
  }: Props = $props();

  let minVal = $derived(Math.min(start, end));
  let maxVal = $derived(Math.max(start, end));
  let left = $derived(`${minVal * 100}%`);
  let width = $derived(`${(maxVal - minVal) * 100}%`);
  
  // Determine z-index based on value to allow clicking the one on top
  let startZ = $derived(start > end ? 3 : 2);
  let endZ = $derived(end > start ? 3 : 2);
</script>

<div class="dual-range-container">
  <div class="dual-range-track"></div>
  <div class="dual-range-highlight" style:left={left} style:width={width}></div>

  <input
    type="range"
    min="0"
    max="1"
    step="0.01"
    value={start}
    disabled={startLocked}
    oninput={(e) => onStartChange(parseFloat(e.currentTarget.value))}
    class="dual-range-input"
    title={startLabel}
    style:z-index={startZ}
  />

  <input
    type="range"
    min="0"
    max="1"
    step="0.01"
    value={end}
    disabled={endLocked}
    oninput={(e) => onEndChange(parseFloat(e.currentTarget.value))}
    class="dual-range-input"
    title={endLabel}
    style:z-index={endZ}
  />
</div>
