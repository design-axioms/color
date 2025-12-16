<script lang="ts">
  // Component View: A "Kitchen Sink" of UI elements to test the theme.
</script>

<div class="stage-container">
  <div class="grid-layout">
    <!-- Main Dashboard Card -->
    <div class="surface-card bordered p-6 rounded-lg space-y-4">
      <div class="header">
        <h3>Dashboard</h3>
        <p class="text-subtle">Overview of your system status.</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <!-- Card 1 -->
        <div class="surface-workspace bordered p-4 rounded">
          <h4 class="text-sm font-bold mb-2">Revenue</h4>
          <p class="text-2xl font-mono">$12,450</p>
          <p class="text-xs text-positive">+12% from last month</p>
        </div>

        <!-- Card 2 -->
        <div class="surface-workspace bordered p-4 rounded">
          <h4 class="text-sm font-bold mb-2">Active Users</h4>
          <p class="text-2xl font-mono">1,234</p>
          <p class="text-xs text-subtle">Stable</p>
        </div>
      </div>

      <div class="form-group space-y-2">
        <label for="email" class="text-sm font-medium">Email Address</label>
        <input
          id="email"
          type="email"
          class="surface-input bordered w-full p-2 rounded"
          placeholder="you@example.com"
        />
      </div>

      <div class="actions flex gap-2">
        <button
          class="surface-action hue-brand bordered px-4 py-2 rounded font-medium"
        >
          Save Changes
        </button>
        <button
          class="surface-action hue-gray bordered px-4 py-2 rounded font-medium"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Nested Context Example (Side Column) -->
    <div class="surface-card hue-indigo bordered p-6 rounded-lg">
      <h3>Brand Context</h3>
      <p class="mb-4">This card has a brand hue applied.</p>

      <div class="surface-workspace bordered p-4 rounded">
        <p>Nested sunken surface inherits the hue.</p>
        <button
          class="surface-action hue-brand bordered px-3 py-1 rounded mt-2 text-sm"
        >
          Action
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .stage-container {
    width: 100%;
    min-height: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 4rem 2rem;
  }

  .grid-layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
    max-width: 1000px;
    width: 100%;
  }

  /* Utility classes for layout (mimicking Tailwind for speed, but using standard CSS) */
  .p-6 {
    padding: 1.5rem;
  }
  .p-4 {
    padding: 1rem;
  }
  .p-2 {
    padding: 0.5rem;
  }
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .py-2 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  .px-3 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  .py-1 {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }

  .rounded-lg {
    border-radius: 0.5rem;
  }
  .rounded {
    border-radius: 0.25rem;
  }

  .space-y-4 > * + * {
    margin-top: 1rem;
  }
  .space-y-2 > * + * {
    margin-top: 0.5rem;
  }

  .grid {
    display: grid;
  }
  .grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  .gap-4 {
    gap: 1rem;
  }

  .flex {
    display: flex;
  }
  .gap-2 {
    gap: 0.5rem;
  }

  .w-full {
    width: 100%;
  }

  .text-sm {
    font-size: 0.875rem;
  }
  .text-xs {
    font-size: 0.75rem;
  }
  .text-2xl {
    font-size: 1.5rem;
  }

  .font-bold {
    font-weight: 700;
  }
  .font-medium {
    font-weight: 500;
  }
  .font-mono {
    font-family: monospace;
  }

  .mb-2 {
    margin-bottom: 0.5rem;
  }
  .mb-4 {
    margin-bottom: 1rem;
  }
  .mt-2 {
    margin-top: 0.5rem;
  }

  /* Semantic Text Colors (assuming these exist or should exist) */
  .text-positive {
    color: var(--color-green-600);
  } /* Fallback/Placeholder */
</style>
