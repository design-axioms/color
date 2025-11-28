# Deferred Work

## Epoch 3: Polish & Persistence

### Phase 4: Framework Integration

**Original Goal:** Create `useColorSystem` hooks for React and Vue.

**Reason for Deferral:**

- The core library does not currently depend on React or Vue.
- Adding these dependencies (even as peers) complicates the build and testing setup.
- The implementation is trivial (`useMemo(() => solve(config), [config])`) and can be easily implemented by consumers.
- We implemented `useSolvedTheme` in the demo app as a reference implementation.

**Future Plan:**

- Consider creating separate packages (e.g., `@color-system/react`, `@color-system/vue`) in a future epoch if demand exists.

## Epoch 10: Ecosystem & Interoperability

### Action Surface & Override Architecture

**Context:**
We encountered an issue where applying a brand hue to an inverted `surface-action` (which is dark in Light Mode) resulted in a very dark, almost black color because the system preserved the surface's low lightness.

**Current Solution:**

- We implemented a "Lightness Override" mechanism using `--override-surface-lightness`.
- We had to **unregister** these properties in `engine.css` to allow `var()` fallbacks to work correctly (since registered properties always have an initial value).

**Discussion Points:**

- Is unregistering properties the right approach, or does it break the "Typed CSS" philosophy?
- Should the "Brand Action" be a distinct surface type in the config rather than a CSS modifier class?
- Does the current approach scale to other surface types that might need similar overrides?
