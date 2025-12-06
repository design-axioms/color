# Axiom V: The Laws of Engineering

These axioms describe how we build the software itself, ensuring maintainability and correctness.

## 10. State is a Domain Model

We model application state using plain classes and Runes, not framework-specific boilerplate.

### Encapsulation

Logic lives in `*.svelte.ts` classes, not in UI components.

- Components are for **View**, Classes are for **Model**.
- This separation allows us to test the logic without mounting components.

### Reactivity

We use fine-grained reactivity (`$state`, `$derived`) to track changes automatically.

- We avoid manual subscriptions or event emitters where possible.
- The state graph should be a DAG (Directed Acyclic Graph) of derivations.

### Injection

State is injected via Context, avoiding global singletons.

- This ensures testability (we can inject mock state).
- It allows for multiple instances of the system on one page (e.g., a Theme Builder inside a Documentation site).

## 11. Testing is a Ratchet

We do not just maintain quality; we actively increase it with every change.

### No Regression

Coverage thresholds are a floor, not a ceiling. We never lower them.

- If a PR lowers coverage, it is blocked.

### New Code, New Tests

Every new feature or bug fix must include accompanying tests.

- We do not merge "untested prototypes" into main.

### Coverage Growth

We aim to increase test coverage over time, treating low coverage as technical debt to be paid down.

## 12. The Law of Late Binding

Color is a Function, Not a Value.

### Dynamic Resolution

Final pixel values are resolved at the last possible moment by the engine.

- We do not pre-calculate every possible combination of Surface + Text.
- We emit CSS variables that represent the **inputs** to the calculation.

### Indirection

Utilities never set properties directly; they modify the **inputs** to the engine's calculation.

- `.text-subtle` sets `--text-lightness-source`, not `color`.
- `.hue-brand` sets `--base-hue`, not `background-color`.

### Composition

Primitive tokens are exposed as class-based utilities that modify orthogonal inputs.

- This allows them to be composed naturally without conflict.
- `class="surface-card hue-brand text-subtle"` works because each class touches a different variable.
