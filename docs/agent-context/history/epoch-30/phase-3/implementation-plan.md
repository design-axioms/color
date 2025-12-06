# Implementation Plan - Epoch 30: Developer Tooling

**Goal**: Empower developers with tools to understand, debug, and leverage the Axiomatic Color system effectively, focusing on "Editor DX" and "CI Safety".

## Phase 1: AI Context (`llms.txt`) (Completed)

**Goal**: Create a standardized context file for AI coding assistants.

- [x] **Content Aggregation**: `scripts/generate-llms-txt.ts`.
- [x] **Summarization**: `public/llms.txt`.
- [x] **Verification**: Tested with LLM.

## Phase 2: The CI Gatekeeper (`axiomatic audit`) (Completed)

**Goal**: Harden the `audit` command for CI/CD.

- [x] **Schema Validation**: Integrated `ajv`.
- [x] **Exit Codes**: Proper 0/1 exit codes.
- [x] **Reporting**: Human-readable output.

## Phase 3: The Editor Companion (VS Code Extension) (Completed)

**Goal**: Provide immediate feedback and autocomplete within the editor.

- [x] **Grammar Spec**: Defined Tree-sitter queries.
- [x] **Scaffold**: Initialized `packages/vscode-extension`.
- [x] **Infrastructure**: Set up `web-tree-sitter` and WASM.
- [x] **Language Server**: Implemented `CompletionItemProvider`.
- [x] **Autocomplete**: Token completion.
- [x] **Decorators**: Color swatches.

## Phase 4: The Runtime Debugger (Active)

**Goal**: Provide a "X-Ray" view of the Axiomatic system in the browser, visualizing the invisible context (Polarity, Mode, Surface) that drives the reactive pipeline.

- [ ] **Inspector Component**: Create a standalone `ContextInspector` component (Svelte 5) that can be dropped into any app.
- [ ] **Context Sensing**: Implement logic to read "Indirection Variables" (`--text-lightness-source`, `--bg-surface`) and computed values from the hovered element.
- [ ] **Visual Overlay**: Render a tooltip/overlay showing:
  - **Surface**: Current surface lightness/token.
  - **Context**: Polarity (Page/Inverted), Mode (Light/Dark).
  - **Intent**: Current intent color.
- [ ] **Integration**: Integrate into the Documentation site with a "Debug Mode" toggle (e.g., `Ctrl+Shift+D`).
