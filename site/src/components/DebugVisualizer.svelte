<script lang="ts">
  import { onMount } from "svelte";

  // --- State ---
  let hue = $state(0);
  let vibrancy = $state(0.008);
  let isDark = $state(false);
  let isOpen = $state(false);
  let position = $state({ x: 20, y: 20 });

  // --- Dragging Logic ---
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  function startDrag(e: MouseEvent | TouchEvent): void {
    if ((e.target as HTMLElement).closest(".hud-controls")) return; // Don't drag if clicking controls
    isDragging = true;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragOffset = { x: clientX - position.x, y: clientY - position.y };
  }

  function onDrag(e: MouseEvent | TouchEvent): void {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    position = { x: clientX - dragOffset.x, y: clientY - dragOffset.y };
  }

  function stopDrag(): void {
    isDragging = false;
  }

  // --- Physics Engine Interface ---
  function updateEngine(): void {
    const root = document.documentElement;

    // 1. Update CSS Variables for the HUD's internal use (if any)
    root.style.setProperty("--hud-hue", hue.toString());
    root.style.setProperty("--hud-beta", vibrancy.toString());

    // 2. Brute-force override for the demo
    // We inject a style tag to override the specific surface definitions in theme.css
    let style = document.getElementById("axiomatic-hud-overrides");
    if (!style) {
      style = document.createElement("style");
      style.id = "axiomatic-hud-overrides";
      document.head.appendChild(style);
    }

    const tau = isDark ? "-1" : "1";

    // We override --alpha-hue and --alpha-beta on all surfaces to allow live tuning.
    // We also force --tau for light/dark mode switching.
    style.textContent = `
      :root, body, [class*="surface-"] {
        --alpha-hue: ${hue} !important;
        --alpha-beta: ${vibrancy} !important;
        --tau: ${tau} !important;
        color-scheme: ${isDark ? "dark" : "light"} !important;
      }
    `;
  }

  // --- Initialization ---
  onMount(() => {
    const root = getComputedStyle(document.documentElement);
    hue = parseFloat(root.getPropertyValue("--alpha-hue")) || 0;
    vibrancy = parseFloat(root.getPropertyValue("--alpha-beta")) || 0.008;
    isDark = root.getPropertyValue("--tau").trim() === "-1";

    // Listen for system changes if we haven't overridden yet
    const matcher = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = (e: MediaQueryListEvent): void => {
      if (!document.documentElement.style.getPropertyValue("--tau")) {
        isDark = e.matches;
      }
    };
    matcher.addEventListener("change", updateSystemTheme);
    isDark = matcher.matches;

    return () => {
      matcher.removeEventListener("change", updateSystemTheme);
    };
  });

  // React to state changes
  $effect(() => {
    updateEngine();
  });

  let copyNotice: string | null = null;
  let copyNoticeTimeout: ReturnType<typeof setTimeout> | null = null;

  async function copyConfig(): Promise<void> {
    const config = {
      anchors: {
        keyColors: {
          // RFC010: avoid embedding color-function strings in shipped consumer code.
          // This is still copy/paste-friendly while keeping the HUD compliant.
          brand: { space: "oklch", l: 0.6, c: vibrancy, h: hue },
        },
      },
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      copyNotice = "Copied config snippet to clipboard.";
    } catch {
      copyNotice = "Failed to copy. Check clipboard permissions.";
    }

    if (copyNoticeTimeout) clearTimeout(copyNoticeTimeout);
    copyNoticeTimeout = setTimeout(() => {
      copyNotice = null;
      copyNoticeTimeout = null;
    }, 1500);
  }
</script>

<svelte:window
  onmousemove={onDrag}
  onmouseup={stopDrag}
  ontouchmove={onDrag}
  ontouchend={stopDrag}
/>

<!-- HUD Container -->
<section
  class="axiomatic-hud not-content surface-card bordered"
  class:closed={!isOpen}
  style:transform="translate({position.x}px, {position.y}px)"
  onmousedown={startDrag}
  ontouchstart={startDrag}
  aria-label="Axiomatic Physics Tuner"
>
  <!-- Header / Drag Handle -->
  <div class="hud-header surface-workspace">
    <div class="hud-title">
      <span class="icon">⚛️</span>
      <span class="text">Physics Tuner</span>
    </div>
    <button
      class="toggle-btn"
      onclick={() => (isOpen = !isOpen)}
      aria-label={isOpen ? "Minimize" : "Maximize"}
    >
      {isOpen ? "_" : "□"}
    </button>
  </div>

  {#if isOpen}
    <div class="hud-controls">
      <!-- Atmosphere (Hue) -->
      <div class="control-group">
        <label for="hud-hue">
          <span>Atmosphere</span>
          <span class="value">{Math.round(hue)}°</span>
        </label>
        <input
          id="hud-hue"
          type="range"
          min="0"
          max="360"
          bind:value={hue}
          class="hue-slider"
        />
      </div>

      <!-- Vibrancy (Beta) -->
      <div class="control-group">
        <label for="hud-vibrancy">
          <span>Vibrancy</span>
          <span class="value">{vibrancy.toFixed(3)}</span>
        </label>
        <input
          id="hud-vibrancy"
          type="range"
          min="0"
          max="0.4"
          step="0.001"
          bind:value={vibrancy}
        />
      </div>

      <!-- Time (Tau) -->
      <div class="control-group">
        <label>Time (Mode)</label>
        <div class="toggle-switch">
          <button
            class:active={!isDark}
            class:surface-card={!isDark}
            onclick={() => (isDark = false)}
            aria-label="Light Mode"
          >
            ☀️
          </button>
          <button
            class:active={isDark}
            class:surface-card={isDark}
            onclick={() => (isDark = true)}
            aria-label="Dark Mode"
          >
            🌙
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="hud-actions">
        <button
          class="action-btn surface-action text-inverse"
          onclick={copyConfig}
        >
          Export Config
        </button>
        {#if copyNotice}
          <output class="copy-notice" aria-live="polite">{copyNotice}</output>
        {/if}
      </div>
    </div>
  {/if}
</section>

<style>
  .axiomatic-hud {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    width: 280px;
    border-radius: 8px;
    font-family: system-ui, sans-serif;
    font-size: 13px;
    user-select: none;
    backdrop-filter: blur(10px);
  }

  .axiomatic-hud.closed {
    width: auto;
  }

  .hud-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid CanvasText;
    border-radius: 8px 8px 0 0;
    cursor: grab;
  }

  .copy-notice {
    margin-top: 6px;
    font-size: 12px;
    opacity: 0.85;
  }

  .axiomatic-hud.closed .hud-header {
    border-bottom: none;
    border-radius: 8px;
  }

  .hud-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  .toggle-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    font-weight: bold;
    opacity: 0.6;
  }

  .toggle-btn:hover {
    opacity: 1;
  }

  .hud-controls {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .control-group label {
    display: flex;
    justify-content: space-between;
    font-weight: 500;
    opacity: 0.8;
  }

  .value {
    font-family: monospace;
    opacity: 0.6;
  }

  input[type="range"] {
    width: 100%;
    cursor: pointer;
  }

  .hue-slider {
    background: linear-gradient(
      to right,
      red,
      orange,
      yellow,
      green,
      blue,
      purple,
      red
    );
    height: 4px;
    border-radius: 2px;
    -webkit-appearance: none;
  }

  .hue-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: Canvas;
    border: 2px solid CanvasText;
  }

  .toggle-switch {
    display: flex;
    background: Canvas;
    border-radius: 4px;
    padding: 2px;
    border: 1px solid CanvasText;
  }

  .toggle-switch button {
    flex: 1;
    border: none;
    background: none;
    padding: 6px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.2s;
  }

  .toggle-switch button.active {
    border: 1px solid CanvasText;
  }

  .hud-actions {
    margin-top: 8px;
    display: flex;
    justify-content: flex-end;
  }

  .action-btn {
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .action-btn:hover {
    opacity: 0.9;
  }
</style>
