<script lang="ts">
  import A11yMetrics from "./A11yMetrics.svelte";

  const tokens = [
    {
      name: "text-high",
      class: "",
      target: 108,
      wcag: "AAA+",
      usage: "Headings, Critical Data",
      sample: "The quick brown fox",
    },
    {
      name: "text-strong",
      class: "text-strong",
      target: 105,
      wcag: "AAA",
      usage: "Body Text, Labels",
      sample: "The quick brown fox",
    },
    {
      name: "text-subtle",
      class: "text-subtle",
      target: 85,
      wcag: "AAA",
      usage: "Secondary Text, Icons",
      sample: "The quick brown fox",
    },
    {
      name: "text-subtlest",
      class: "text-subtler",
      target: 75,
      wcag: "AA (Large) / AAA",
      usage: "Placeholders, Disabled",
      sample: "The quick brown fox",
    },
  ];
</script>

<div class="token-visualizer">
  {#each tokens as token (token.name)}
    <div class="token-card">
      <div class="card-header">
        <div class="token-info">
          <div class="token-name">
            <code>{token.name}</code>
          </div>
          <div class="token-usage">{token.usage}</div>
        </div>

        <div class="card-metrics-desktop">
          <A11yMetrics apca={token.target} wcag={token.wcag} align="end" />
        </div>
      </div>

      <div class="card-preview">
        <!-- Light Mode Preview -->
        <div class="preview-box light-theme surface-card">
          <div class="preview-content">
            <span
              class={token.class}
              style="font-size: 1.2rem; font-weight: 500;"
            >
              {token.sample}
            </span>
            <span class="theme-label">Light</span>
          </div>
        </div>

        <!-- Dark Mode Preview -->
        <div class="preview-box dark-theme surface-card">
          <div class="preview-content">
            <span
              class={token.class}
              style="font-size: 1.2rem; font-weight: 500;"
            >
              {token.sample}
            </span>
            <span class="theme-label">Dark</span>
          </div>
        </div>
      </div>

      <!-- Mobile Metrics (shown below preview on small screens) -->
      <div class="card-metrics-mobile">
        <A11yMetrics apca={token.target} wcag={token.wcag} align="start" />
      </div>
    </div>
  {/each}
</div>

<style>
  .token-visualizer {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin: 2rem 0;
  }

  .token-card {
    border: 1px solid var(--border-subtle-token);
    border-radius: 12px;
    overflow: hidden;
    background: var(--surface-token);
    box-shadow: var(--shadow-sm);
  }

  .card-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-subtle-token);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--surface-subtle-token);
  }

  .token-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .token-name code {
    font-family: var(--font-mono-token);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-strong-token);
    background: transparent;
    padding: 0;
    border: none;
  }

  .token-usage {
    font-size: 0.9rem;
    color: var(--text-subtle-token);
  }

  .card-preview {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 140px;
  }

  .preview-box {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    /* Force isolation to ensure theme variables apply correctly */
    isolation: isolate;
  }

  .light-theme {
    color-scheme: light;
  }

  .dark-theme {
    color-scheme: dark;
  }

  .preview-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .theme-label {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.5;
    color: var(--text-subtle-token);
  }

  .card-metrics-desktop {
    display: flex;
    gap: 2rem;
  }

  .card-metrics-mobile {
    display: none;
    padding: 1rem 1.5rem;
    gap: 2rem;
    background: var(--surface-token);
    border-top: 1px solid var(--border-subtle-token);
  }

  .unit {
    font-size: 0.75rem;
    color: var(--text-subtle-token);
    font-weight: 400;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .card-metrics-desktop {
      display: none;
    }

    .card-metrics-mobile {
      display: flex;
      justify-content: space-between;
    }

    .card-preview {
      grid-template-columns: 1fr;
      height: auto;
    }

    .preview-box {
      height: 100px;
    }
  }
</style>
