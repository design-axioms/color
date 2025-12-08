# LLM Context Strategy

**Goal**: Provide a standardized, high-quality context file (`llms.txt`) for Large Language Models to understand the Axiomatic Color system, enabling them to generate correct code and configuration.

## 1. The "LLM Persona"

We should treat the LLM as a **Junior Developer** who:

- Knows general coding (React, CSS, TS).
- Does **not** know our specific library APIs.
- Needs clear "Rules of the Road" (Axioms).
- Benefits from "Few-Shot" examples.

## 2. Content Structure

The `llms.txt` should be composed of the following sections:

### A. The Constitution (Axioms)

- **Source**: `docs/design/theory/axioms.md`
- **Purpose**: Establish the fundamental constraints (e.g., "Never hardcode colors", "Always use semantic tokens").

### B. Core Concepts

- **Source**: `docs/concepts/thinking-in-surfaces.mdx`, `docs/design/architecture/reactive-pipeline.md`
- **Purpose**: Explain the mental model (Surfaces, Context, Late-Binding).

### C. Configuration Schema

- **Source**: `color-config.schema.json` (or a simplified TS definition)
- **Purpose**: Teach the LLM how to write valid `color-config.json`.

### D. Token Reference

- **Source**: Generated from `tokens.json` or `src/lib/defaults.ts`
- **Purpose**: List available tokens (`--axm-text-high`, etc.) and their intended usage.

### E. Examples (Few-Shot)

- **Source**: `examples/` or curated snippets.
- **Purpose**: Show correct usage in React, Svelte, and HTML.

## 3. Generation Pipeline

We will create a script `scripts/generate-llms-txt.ts` that:

1.  Reads a manifest of source files.
2.  Strips frontmatter and irrelevant UI components (like `<Tabs>`).
3.  Concatenates them with clear headers.
4.  Writes to `site/public/llms.txt`.

## 4. Maintenance

- The `llms.txt` should be regenerated on every build.
- We should add a test to verify its content (e.g., ensuring it contains specific keywords).
