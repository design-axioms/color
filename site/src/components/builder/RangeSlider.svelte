<script lang="ts">
  interface Props {
    start: number;
    end: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    label?: string;
    trackClass?: string;
    fillClass?: string;
    handleClass?: string;
    startHandleShape?: "circle" | "square" | "pill";
    endHandleShape?: "circle" | "square" | "pill";
    startHandleLabel?: string;
    endHandleLabel?: string;
    onChange?: (start: number, end: number) => void;
  }

  let {
    start,
    end,
    min = 0,
    max = 1,
    step = 0.01,
    disabled = false,
    label = "Range",
    trackClass = "",
    fillClass = "surface-action",
    handleClass = "surface-action",
    startHandleShape = "circle",
    endHandleShape = "circle",
    startHandleLabel = "",
    endHandleLabel = "",
    onChange,
  }: Props = $props();

  let trackElement: HTMLElement | undefined = $state();
  let dragging = $state<{
    handle: "start" | "end" | "range";
    startX: number;
    initialStart: number;
    initialEnd: number;
  } | null>(null);

  function getPercentage(value: number): number {
    return ((value - min) / (max - min)) * 100;
  }

  function getValueFromClientX(clientX: number): number {
    if (!trackElement) return 0;
    const rect = trackElement.getBoundingClientRect();
    const percentage = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width),
    );
    const rawValue = min + percentage * (max - min);
    // Round to step
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  }

  function handlePointerDown(
    e: PointerEvent,
    handle: "start" | "end" | "range",
  ): void {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();

    // Capture initial state
    dragging = {
      handle,
      startX: e.clientX,
      initialStart: start,
      initialEnd: end,
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  function handlePointerMove(e: PointerEvent): void {
    if (!dragging || !trackElement) return;

    if (dragging.handle === "range") {
      const rect = trackElement.getBoundingClientRect();
      const deltaPixels = e.clientX - dragging.startX;
      const deltaValue = (deltaPixels / rect.width) * (max - min);

      let newStart = dragging.initialStart + deltaValue;
      let newEnd = dragging.initialEnd + deltaValue;

      // Clamp to bounds while maintaining width
      if (newStart < min) {
        newEnd += min - newStart;
        newStart = min;
      }
      if (newEnd > max) {
        newStart -= newEnd - max;
        newEnd = max;
      }

      // Safety clamp
      newStart = Math.max(min, Math.min(max, newStart));
      newEnd = Math.max(min, Math.min(max, newEnd));

      // Round to step
      newStart = Math.round(newStart / step) * step;
      newEnd = Math.round(newEnd / step) * step;

      onChange?.(newStart, newEnd);
    } else {
      const newValue = getValueFromClientX(e.clientX);

      if (dragging.handle === "start") {
        // Allow crossing? The design says "Non-Crossing" logic is handled by the parent or constraints.
        // But for a generic RangeSlider, usually min <= max.
        // However, the design doc says "Dark Surface < Dark Ink" (Start < End).
        // So we should enforce start <= end.
        const newStart = Math.min(newValue, end);
        onChange?.(newStart, end);
      } else {
        const newEnd = Math.max(newValue, start);
        onChange?.(start, newEnd);
      }
    }
  }

  function handlePointerUp(): void {
    dragging = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }

  let startPercent = $derived(getPercentage(start));
  let endPercent = $derived(getPercentage(end));
  let left = $derived(Math.min(startPercent, endPercent));
  let width = $derived(Math.abs(endPercent - startPercent));
</script>

<div class="range-slider {disabled ? 'disabled' : ''}" bind:this={trackElement}>
  <!-- Track Background (Optional, can be passed via slot or CSS) -->
  <div class="track {trackClass}"></div>

  <!-- Range Fill (Draggable) -->
  <button
    class="range-fill {fillClass}"
    type="button"
    style="left: {left}%; width: {width}%;"
    onpointerdown={(e) => {
      handlePointerDown(e, "range");
    }}
    aria-label="{label} Range"
    aria-disabled={disabled}
  ></button>

  <!-- Start Handle -->
  <button
    class="handle start {handleClass} shape-{startHandleShape}"
    type="button"
    style="left: {startPercent}%"
    onpointerdown={(e) => {
      handlePointerDown(e, "start");
    }}
    aria-label="{label} Start"
    aria-disabled={disabled}
  >
    {#if startHandleLabel}
      <span class="handle-label">{startHandleLabel}</span>
    {/if}
  </button>

  <!-- End Handle -->
  <button
    class="handle end {handleClass} shape-{endHandleShape}"
    type="button"
    style="left: {endPercent}%"
    onpointerdown={(e) => {
      handlePointerDown(e, "end");
    }}
    aria-label="{label} End"
    aria-disabled={disabled}
  >
    {#if endHandleLabel}
      <span class="handle-label">{endHandleLabel}</span>
    {/if}
  </button>
</div>

<style>
  .range-slider {
    position: relative;
    width: 100%;
    height: 100%;
    touch-action: none;
  }

  .range-slider.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .track {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 4px;
    transform: translateY(-50%);
    background-color: rgba(128, 128, 128, 0.2);
    border-radius: 2px;
  }

  .range-fill {
    position: absolute;
    top: 50%;
    height: 2px; /* Thinner tether as requested */
    transform: translateY(-50%);
    cursor: grab;
    border: none;
    padding: 0;
    border-radius: 1px;
    opacity: 1; /* Make it solid */
  }

  .range-fill:active {
    cursor: grabbing;
  }

  .handle {
    position: absolute;
    top: 50%;
    width: 24px; /* Larger handles */
    height: 24px;
    transform: translate(-50%, -50%);
    cursor: col-resize;
    /* background-color: var(--surface-1);  Let the handleClass control the background */
    border: 2px solid var(--border-interactive);
    box-shadow: var(--shadow-sm);
    padding: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: bold;
    color: var(--text-subtle);
  }

  .handle.shape-circle {
    border-radius: 50%;
  }

  .handle.shape-square {
    border-radius: 4px;
  }

  .handle.shape-pill {
    width: auto;
    min-width: 60px;
    height: 32px;
    border-radius: 16px;
    padding: 0 12px;
  }

  .handle:hover {
    transform: translate(-50%, -50%) scale(1.1);
    z-index: 3;
    border-color: var(--border-active);
  }

  .handle:active {
    transform: translate(-50%, -50%) scale(1.1);
    cursor: grabbing;
    border-color: var(--border-active);
  }

  .handle-label {
    pointer-events: none;
  }
</style>
