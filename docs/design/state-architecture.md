# State Management Architecture

## Context

We are migrating the application from a React/Preact-based architecture (using `Context` and `useState`) to Svelte 5. We need a robust pattern for managing global state (Theme, Configuration) that aligns with the project's philosophy of simplicity and the author's mental model (Glimmer/Ember reactivity).

## Decision: Classes with Runes + Context Injection

We have chosen to use **Svelte 5 Runes** inside standard TypeScript classes, injected via Svelte's Context API.

### The Pattern

State logic is encapsulated in plain TypeScript classes (using the `.svelte.ts` extension to enable Runes). These classes act as "Domain Models" or "Services".

```typescript
// src/lib/state/ThemeState.svelte.ts
export class ThemeState {
  // 1. Root state is marked with $state (analogous to @tracked)
  mode = $state<"light" | "dark">("light");
  config = $state<SolverConfig>(defaultConfig);

  // 2. Computed properties are standard getters
  // (Auto-tracked, use $derived for memoization if needed)
  get isDark() {
    return this.mode === "dark";
  }

  // 3. Actions are standard methods
  toggle() {
    this.mode = this.mode === "light" ? "dark" : "light";
  }
}
```

### Dependency Injection (Services)

We avoid global singletons to ensure testability and support potential future requirements (like SSR with request-scoped state). Instead, we use Svelte's `setContext` and `getContext` to pass these instances down the component tree.

**Analogy to Ember Services**:
We treat `getContext()` calls similarly to injecting a Service in Ember. These state objects are intended to be **app-wide singletons** (scoped to the root component tree), available to any component that needs them.

**Rule**:

- **Default**: Register state classes at the App/Layout root.
- **Exception**: Only scope state to a subtree if there is a specific, documented reason (e.g., a transient wizard flow or isolated demo instance).

```svelte
<!-- Root Layout -->
<script>
  import { setContext } from 'svelte';
  import { ThemeState } from './ThemeState.svelte';

  // Registered once at the root, available everywhere
  setContext('theme', new ThemeState());
</script>
```

```svelte
<!-- Child Component -->
<script>
  import { getContext } from 'svelte';
  const theme = getContext<ThemeState>('theme');
</script>

<button onclick={() => theme.toggle()}>
  {theme.isDark ? 'Dark' : 'Light'}
</button>
```

## Rationale

1.  **"It's Just JavaScript"**: This pattern minimizes framework-specific boilerplate. There are no `writable()` stores, no `$` auto-subscriptions to manage manually, and no complex reducers. It looks and behaves like standard object-oriented programming.
2.  **Auto-Tracking**: Like Glimmer/Ember, Svelte 5's fine-grained reactivity automatically tracks dependencies. Accessing a property in a template or a `$derived` creates a subscription. This eliminates the mental overhead of dependency arrays.
3.  **Encapsulation**: Logic lives in the class, not in the component. This makes the state logic portable and easy to unit test in isolation.
4.  **Universal**: These classes can be used anywhere in the application, providing a consistent way to model domain logic.

## Comparison to Alternatives

- **Svelte 4 Stores (`writable`)**: verbose, requires manual subscription handling (`$store`), less intuitive for complex nested state.
- **Global Singletons**: Harder to test, harder to reset state between tests, problematic for SSR.
- **Redux/Zustand-style External Stores**: Unnecessary complexity given Svelte 5's built-in reactivity primitives.
