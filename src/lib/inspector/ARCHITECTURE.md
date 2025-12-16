# CSS Inspector Architecture

The CSS Inspector is a modular engine designed to replicate the browser's CSS Cascade and Selection logic in JavaScript. It is used to determine the "winning" rule for a given element and property, enabling the "Hard Flip" demo and other advanced debugging features.

## Core Modules

### 1. `css-utils.ts` (Entry Point)

The public API for the inspector.

- **`findWinningRule(element, property)`**: The main function.
  1.  Checks inline styles (`element.style`).
  2.  Calls `collectMatchingRules`.
  3.  Sorts matches using `compareRules`.
  4.  Returns the winner.

### 2. `collector.ts` (Orchestrator)

Traverses the CSSOM to find all rules that match the element.

- **Recursive Traversal**: Handles nested rules (`@media`, `@supports`, `@layer`, `@scope`).
- **Context Tracking**: Passes down `isLayered` and `scopeProximity` state during recursion.
- **Delegation**: Uses `sheets.ts` for access and `scope.ts` for evaluation.

### 3. `cascade.ts` (Sorting Logic)

Implements the CSS Cascade Level 5 & 6 sorting algorithm.

- **Precedence Order**:
  1.  **Importance**: `!important` > Normal.
  2.  **Layers**:
      - Normal: Unlayered > Layered.
      - Important: Layered > Unlayered.
  3.  **Scope**: Closer proximity wins.
  4.  **Specificity**: Higher weight wins.
  5.  **Order**: Later source order wins.

### 4. `specificity.ts` (Weight Calculation)

Calculates the specificity of a selector.

- **Engine**: Uses `parsel-js` for standard-compliant parsing.
- **Features**: Correctly handles `:where`, `:is`, `:not`, and nesting.
- **Output**: Returns a number (`A*10000 + B*100 + C`) for efficient comparison.

### 5. `scope.ts` (Scope Evaluation)

Evaluates `@scope` rules.

- **Logic**:
  - Checks if element is within the scope root.
  - Checks if element is excluded by the scope limit (donut scope).
  - Calculates "Proximity" (distance to scope root).

### 6. `sheets.ts` (Data Access)

Abstracts the retrieval of stylesheets.

- **Sources**: `document.styleSheets` and `shadowRoot.adoptedStyleSheets`.
- **Resilience**: Handles CORS errors and detached elements.

## Design Decisions

### Why `parsel-js`?

Regex-based specificity calculation is fragile and fails on modern selectors like `:is(.a, #b)`. `parsel-js` provides a robust AST-based approach.

### Why Modular?

The logic for `@scope` and `@layer` is complex. Splitting it into focused modules (`scope.ts`, `cascade.ts`) makes the code testable and easier to extend (e.g., adding Container Queries).

### Why Native ESM?

The test harness uses Vite to serve these files directly, ensuring that the code running in tests is identical to the code running in the browser, without ad-hoc bundling artifacts.

## Technical Risks & Considerations

### `sheets.ts` Resilience

- **CORS Errors**: Accessing `sheet.cssRules` on a stylesheet loaded from a different domain without `crossorigin="anonymous"` will throw a security error. The collector must wrap access in `try/catch` blocks to prevent the entire inspector from crashing.

### `collector.ts` Matching Strategy

- **Native `element.matches()`**: The collector relies on the browser's native `element.matches(selector)` for matching logic. We do **not** attempt to parse and match selectors manually in JavaScript, as the browser engine is faster and always 100% compliant with supported features.
