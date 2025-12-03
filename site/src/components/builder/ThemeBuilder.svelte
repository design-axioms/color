<script lang="ts">
  import { generateTheme, injectTheme } from "@axiomatic-design/color/runtime";
  import type { SolverConfig } from "@axiomatic-design/color/types";
  import { getContext } from "svelte";
  import { builderState } from "../../lib/state/BuilderState.svelte";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";
  import type { ThemeState } from "../../lib/state/ThemeState.svelte";
  import "./ThemeBuilder.css";

  import AnalysisView from "./AnalysisView.svelte";
  import AnchorsEditor from "./AnchorsEditor.svelte";
  import AuditView from "./AuditView.svelte";
  import HueShiftEditor from "./HueShiftEditor.svelte";
  import InspectorPane from "./InspectorPane.svelte";
  import KeyColorsEditor from "./KeyColorsEditor.svelte";
  import SurfaceManager from "./SurfaceManager.svelte";

  import Cluster from "../layout/Cluster.svelte";

  const themeState = getContext<ThemeState>("theme");
  const configState = getContext<ConfigState>("config");

  let currentMode = $derived(themeState.mode);
  let config = $derived(configState.config);

  let activeTab = $state("preview");

  let styleElement: HTMLStyleElement | undefined = undefined;

  $effect(() => {
    try {
      // Clone config to avoid mutation in solve() triggering infinite loop
      const configClone = JSON.parse(JSON.stringify(config)) as SolverConfig;
      const css = generateTheme(configClone, "#theme-builder-preview");
      // Pass undefined for target to append to head.
      styleElement = injectTheme(css, undefined, styleElement);
      styleElement.id = "theme-builder-styles";
    } catch (e: unknown) {
      console.error("Solver failed:", e);
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

<div class="theme-builder-container">
  <aside class="theme-builder-sidebar surface-workspace">
    <div class="theme-builder-header">
      <h2 class="text-strong">Axiomatic Color</h2>
      <p class="text-subtle">Customize global system parameters.</p>
      <button
        onclick={() => {
          configState.resetConfig();
        }}
        class="surface-workspace bordered text-subtle"
        style="margin-top: 0.75rem; width: 100%; padding: 0.5rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500;"
      >
        Reset to Default
      </button>
    </div>

    <div class="inspector-scroll-area">
      <InspectorPane title="Global Settings">
        <KeyColorsEditor />
      </InspectorPane>

      <InspectorPane title="Anchors & Contrast">
        <AnchorsEditor />
      </InspectorPane>

      <InspectorPane title="Hue Shift">
        <HueShiftEditor />
      </InspectorPane>

      <InspectorPane title="Surfaces">
        <SurfaceManager />
      </InspectorPane>
    </div>
  </aside>

  <main class="theme-builder-main" id="theme-builder-preview">
    <div class="surface-page theme-builder-preview-page">
      <div class="surface-card bordered theme-builder-preview-card">
        <!-- Header -->
        <div class="preview-section">
          <h1 class="text-strong" style="margin: 0 0 0.5rem 0">Preview Area</h1>
          <p class="text-subtle">
            This area is styled by the live config. Adjust the sliders on the
            left to see changes in real-time.
          </p>
          <div
            style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;"
          >
            <div>
              <p class="text-subtle" style="margin-bottom: 0.5rem;">
                Current Mode: <strong>{currentMode}</strong>
              </p>
              <button
                class="preview-button surface-action"
                onclick={() => {
                  themeState.toggle();
                }}
              >
                Toggle Mode
              </button>
            </div>

            <div class="preview-tabs">
              <Cluster gap="0.5rem">
                <button
                  class="tab-button {activeTab === 'preview' ? 'active' : ''}"
                  onclick={() => (activeTab = "preview")}
                >
                  Preview
                </button>
                <button
                  class="tab-button {activeTab === 'graph' ? 'active' : ''}"
                  onclick={() => (activeTab = "graph")}
                >
                  Analysis
                </button>
                <button
                  class="tab-button {activeTab === 'audit' ? 'active' : ''}"
                  onclick={() => (activeTab = "audit")}
                >
                  Audit
                </button>
              </Cluster>
            </div>
          </div>
        </div>

        {#if activeTab === "preview"}
          <!-- Standard Controls -->
          <div class="preview-section">
            <h3 class="text-strong">Standard Surfaces</h3>
            <Cluster gap="1rem" align="center">
              <button
                class="surface-action text-strong bordered preview-button"
              >
                Action Button
              </button>
              <button
                class="surface-workspace text-subtle bordered preview-button"
              >
                Secondary
              </button>
              <div class="surface-workspace bordered preview-input">
                <span class="text-subtle">Input Field</span>
              </div>
            </Cluster>
          </div>

          <!-- Brand Controls -->
          <div class="preview-section">
            <h3 class="text-strong">Brand Integration</h3>
            <p class="text-subtle">
              Elements using the <code
                class="surface-workspace bordered preview-code"
              >
                .hue-brand
              </code> utility.
            </p>

            <div class="hue-brand">
              <Cluster gap="1rem" align="center">
                <!-- Brand Button (Inverted) -->
                <button class="surface-spotlight text-strong preview-button">
                  Brand Button
                </button>

                <!-- Brand Card (Page Polarity + Tint) -->
                <div class="surface-card bordered preview-brand-card">
                  <span class="text-strong">Brand Tinted Card</span>
                </div>

                <!-- Brand Link -->
                <a href="#_top" class="text-link"> Brand Link </a>
              </Cluster>
            </div>
          </div>

          <!-- Typography Check -->
          <div class="preview-section">
            <div class="surface-workspace bordered preview-typography-card">
              <h3 class="text-strong">Typography & Contrast</h3>
              <p class="text-high-token">This is high-emphasis text.</p>
              <p class="text-subtle">
                This is subtle text for secondary information.
              </p>
              <p class="text-subtlest">This is subtlest text for metadata.</p>
            </div>
          </div>

          <!-- Dynamic Surface List -->
          <div class="preview-section">
            <h3 class="text-strong">All Surfaces</h3>
            {#if config.groups.length === 0 || config.groups.every((g) => g.surfaces.length === 0)}
              <div class="surface-workspace bordered preview-empty-state">
                <div class="preview-empty-icon">🎨</div>
                <div>
                  <h4 class="text-strong" style="margin: 0 0 0.5rem 0">
                    No Custom Surfaces
                  </h4>
                  <p class="text-subtle preview-empty-text">
                    Add groups and surfaces in the sidebar to see them appear
                    here. They will be generated as CSS classes like <code
                      >.surface-card</code
                    >.
                  </p>
                </div>
              </div>
            {:else}
              <div style="display: flex; flex-direction: column; gap: 2rem;">
                {#each config.groups as group (group.name)}
                  {#if group.surfaces.length > 0}
                    <div>
                      <h4 class="text-subtle preview-group-title">
                        {group.name}
                      </h4>
                      <div class="preview-surface-grid">
                        {#each group.surfaces as surface (surface.slug)}
                          <button
                            class="surface-{surface.slug} bordered preview-surface-card {builderState.selectedSurfaceId ===
                            surface.slug
                              ? 'highlight-ring'
                              : ''}"
                            onclick={() => {
                              builderState.selectSurface(surface.slug);
                            }}
                            type="button"
                          >
                            <span class="text-strong preview-surface-label">
                              {surface.label}
                            </span>
                            <code class="text-subtle preview-surface-code">
                              .surface-{surface.slug}
                            </code>
                          </button>
                        {/each}
                      </div>
                    </div>
                  {/if}
                {/each}
              </div>
            {/if}
          </div>
        {:else if activeTab === "graph"}
          <AnalysisView />
        {:else if activeTab === "audit"}
          <AuditView />
        {/if}
      </div>
    </div>
  </main>
</div>
