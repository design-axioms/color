# Adoption Strategy: The Axiomatic Path

## Philosophy: "Think Natively"

We reject the standard "Install & Configure" model. That model assumes the user wants a "Paint Set" (a collection of static colors).
Our user wants a **Physics Engine**. They want to define _Intent_ and have the system handle the _Physics_ (Accessibility, Harmony, Adaptation).

### The Novel Axioms

1.  **The Surface is the Atom**: You don't build "Components"; you build "Surfaces".
2.  **Intent > Value**: You declare "Brand", not `#6e56cf`.
3.  **Solver > Designer**: The machine calculates contrast; the human defines constraints.
4.  **Zero is Chaos**: An unconfigured system is "broken" (unreadable).
5.  **One is Order**: The Solver restores order (readability).

---

## Phase 1: Zero-to-One (The Awakening)

**Goal**: The user goes from "Chaos" (Raw HTML) to "Order" (Axiomatic Physics) in one command.

### The "Zero" State

The user has a raw HTML file. It is ugly. It has no constraints.

- _Standard Assumption_: "I need to pick a color palette."
- _Axiomatic Reality_: "I need to define my semantic intent."

### The Process

1.  **Install**: `npm install @axiomatic-design/color`
2.  **Declare Intent**: `axiomatic init`
    - _Interactive_: "What is your primary brand color?" (e.g., `#6e56cf`)
    - _Interactive_: "Do you want a 'Vibrant' or 'Professional' vibe?" (Sets saturation/hue shift).
3.  **Solve (The Awakening)**: `axiomatic build --copy-engine`
    - The system generates the physics.
4.  **Apply**: Link the CSS.
    - _Result_: The page instantly has perfect contrast, dark mode, and high contrast support.

### The "Aha!" Moment

The user changes `<div class="surface-card">` to `<div class="surface-spotlight">`.

- _Standard_: Background changes color. Text breaks.
- _Axiomatic_: Background changes. Text _inverts_. Borders appear/disappear. The _Context_ shifted, and the physics adapted.

---

## Phase 2: One-to-Two (The Expansion)

**Goal**: The user needs to break the default rules _without_ breaking the physics.

### The "One" State

The user has a working system but needs something "custom" (e.g., a Sidebar with a specific tint, or a "Destructive" button that isn't just red).

### The Process

1.  **New Context**:
    - _Standard_: Add `.sidebar { background: #f0f0f0; }`
    - _Axiomatic_: Add a new **Surface Group** in `color-config.json`.
    - `"name": "Sidebar", "polarity": "page", "tint": "brand", "contrast": 95`
2.  **Re-Solve**: `axiomatic build`
    - The solver finds the exact shade of `#f0f0f0` that guarantees text readability against the _current_ brand color.
3.  **New Intent**:
    - _Standard_: Add `.btn-danger { background: red; }`
    - _Axiomatic_: Add a new **Key Color** (`destructive`) and a **Surface** (`surface-destructive`).
    - The system ensures `surface-destructive` works in Dark Mode (it might desaturate) and High Contrast (it might become a border).

### The "Escape Hatch" (Interoperability)

Sometimes you need to leave the physics engine (e.g., for a legacy chart library).

- **Export**: `axiomatic export --format tailwind`
- **Raw Values**: Access the resolved values via `var(--ref-...)` (Reference Tokens) instead of `var(--sys-...)` (System Tokens).

---

## Roadmap

### 1. The "Physics Debugger" (CLI Inspector)

- Instead of just "building", the CLI should allow inspecting the physics.
- `axiomatic inspect surface-card` -> Returns the exact APCA score against `text-primary` in all modes.

### 2. The "Vibe" Presets

- Pre-configured `color-config.json` files for common vibes ("Corporate", "Playful", "Brutalist").
- This lowers the cognitive load of "tuning the physics."

### 3. The "Live" Playground

- A local dev server that visualizes the `color-config.json` changes in real-time (using the Runtime API).

### 4. The "Axiomatic HUD" (Physics Tuner)

- **Concept**: A runtime overlay that lives in the browser.
- **Implementation**: `site/src/components/DebugVisualizer.svelte` (Prototype).
- **Features**:
  - **Atmosphere Tuner**: Live adjustment of `--alpha-hue`.
  - **Vibrancy Tuner**: Live adjustment of `--alpha-beta`.
  - **Time Travel**: Toggle Light/Dark mode (`--tau`).
  - **Export**: Generates `color-config.json` snippet.
- **Delivery**:
  - **Bundler**: Unplugin (`vite-plugin-axiomatic`).
  - **Vanilla**: `<script src=".../inspector.js">`.
