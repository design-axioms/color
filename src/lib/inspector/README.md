# Axiomatic Inspector Architecture

The Inspector is a client-side debugging tool implemented as a Web Component (`<axiomatic-debugger>`). It is designed to visualize the "invisible" logic of the Axiomatic Color System, such as token inheritance, surface nesting, and continuity.

## Architecture

The Inspector is split into four distinct layers to separate concerns:

### 1. Controller (`overlay.ts`)

The "Shell". It handles:

- Web Component lifecycle (`connectedCallback`, `disconnectedCallback`).
- Event listeners (mouse move, click, keyboard shortcuts).
- State management (`isPinned`, `activeElement`).
- Orchestration of the Engine and View.

### 2. Engine (`engine.ts`)

The "Brain". It handles:

- **Analysis**: `inspect(element)` resolves tokens and context.
- **Auditing**: `scanForViolations()` checks the entire DOM for semantic errors.
- **Physics**: `checkContinuity()` freezes time to detect animation snaps.
- **Pure Logic**: It returns data structures, never DOM elements or HTML strings.

### 3. View (`view.ts`)

The "Face". It handles:

- **Rendering**: Pure functions that take data (from the Engine) and return HTML strings.
- **Presentation Logic**: Deciding which icons, colors, and badges to show.
- **Templates**: All HTML generation lives here.

### 4. Styles (`styles.ts`)

The "Skin". It handles:

- **CSS**: A single export containing the Shadow DOM styles.
- **Theming**: Internal variables for the debugger's own appearance.

## Usage

The debugger is automatically injected by the `StarlightHead.astro` component in the documentation site. It can be toggled with `Ctrl+Shift+X` or by clicking the floating trigger button.
