# Editor Grammar Specification

## Goal

To provide a formal, deterministic specification for detecting "Class Name Contexts" across various web languages (HTML, JSX, Svelte, Vue, Astro). This specification will drive the `web-tree-sitter` queries used in the VS Code extension.

## Philosophy

Unlike Regex-based approaches which guess context based on text patterns, this grammar relies on the **Abstract Syntax Tree (AST)**. We only provide completions when we can prove, via the AST, that the cursor is inside a string literal intended to be interpreted as a CSS class list.

## Target Languages & Grammars

We will use the following Tree-sitter grammars:

- `tree-sitter-html`
- `tree-sitter-typescript` (tsx)
- `tree-sitter-svelte`
- `tree-sitter-vue`
- `tree-sitter-astro` (if available, otherwise HTML/TSX fallback)
- `tree-sitter-glimmer` (for Ember)

## Entry Points & Injections

To correctly apply the queries, we must define the "Host Grammar" for each file type and any "Injection Points" where we switch grammars.

| File Extension  | Host Grammar | Injection / Sub-Grammar Strategy                              |
| :-------------- | :----------- | :------------------------------------------------------------ |
| `.html`         | `html`       | None (Top-level)                                              |
| `.svelte`       | `svelte`     | None (Top-level is HTML-like)                                 |
| `.astro`        | `astro`      | None (Top-level is HTML-like)                                 |
| `.vue`          | `vue`        | `<template>` block is parsed as HTML/Vue-Template.            |
| `.jsx` / `.tsx` | `typescript` | JSX elements are part of the host grammar.                    |
| `.ts` / `.js`   | `typescript` | **Lit Injection**: `html` tagged templates -> `html` grammar. |
| `.hbs`          | `glimmer`    | None (Top-level)                                              |

## Context Definitions

### 1. HTML / Standard Attributes

**Pattern**: A string value assigned to an attribute named `class`.

**Languages**: HTML, Svelte, Vue, Astro, PHP, ERB.

**AST Pattern (S-Expression)**:

```scheme
(attribute
  (attribute_name) @attr_name
  (#eq? @attr_name "class")
  (quoted_attribute_value
    (attribute_value) @class_value
  )
)
```

### 2. JSX / TSX Attributes

**Pattern**: A string literal assigned to `className` or `class`.

**Languages**: React, Preact, Solid, Qwik.

**AST Pattern**:

```scheme
(jsx_attribute
  (property_identifier) @attr_name
  (#match? @attr_name "^(className|class)$")
  (string
    (string_fragment) @class_value
  )
)
```

### 3. JSX / TSX Expressions

**Pattern**: A string literal _inside_ a curly brace expression assigned to `className`.
_Example_: `className={"foo bar"}` or `className={condition ? "foo" : "bar"}`

**AST Pattern**:

```scheme
(jsx_attribute
  (property_identifier) @attr_name
  (#match? @attr_name "^(className|class)$")
  (jsx_expression
    [
      (string (string_fragment) @class_value)
      (template_string (string_fragment) @class_value)
    ]
  )
)
```

_Note_: We target `string_fragment` inside `template_string` to support `` `surface-${variant}` ``. We autocomplete the static parts.

### 4. Svelte Directives

**Pattern**: The `class:` directive.
_Example_: `class:active={isActive}` -> No completion needed (key is usually a variable or simple string).
_Example_: `class="foo {bar}"` -> Completion needed in the string parts.

**AST Pattern**:

```scheme
(attribute
  (attribute_name) @attr_name
  (#eq? @attr_name "class")
  (quoted_attribute_value
    (attribute_value) @class_value
  )
)
```

_Note_: Svelte's tree-sitter grammar handles interpolation. We target the string fragments.

### 5. Vue Bindings

**Pattern**: Object keys in `:class`.
_Example_: `:class="{ 'active': isActive, 'text-bold': isBold }"`

**AST Pattern**:

```scheme
(directive_attribute
  (directive_argument) @arg
  (#eq? @arg "class")
  (directive_value
    (expression
      (object
        (pair
          key: (string (string_fragment) @class_value)
        )
      )
    )
  )
)
```

### 6. Lit (Tagged Templates)

**Pattern**: `html` tagged templates containing HTML attributes.
_Example_: `html`<div class="foo">``

**Strategy**: Use Tree-sitter's language injection or a nested query.
**AST Pattern (JavaScript/TypeScript)**:

```scheme
(call_expression
  (identifier) @tag
  (#eq? @tag "html")
  (template_string) @template
)
```

_Note_: We will parse the content of `@template` using the HTML grammar.

### 7. Ember (Glimmer)

**Pattern**: HTML attributes in `.hbs` files.
_Example_: `<div class="foo">`

**AST Pattern (Glimmer)**:

```scheme
(attribute
  (attribute_name) @attr_name
  (#eq? @attr_name "class")
  (concat_statement
    (string_literal) @class_value
  )
)
```

## Advanced Patterns (Variables & Composition)

### 8. The Axiomatic Identity Function

**Pattern**: A function call named `axm` (or configured name) containing a string.
_Usage_: `const styles = axm("surface-card p-4");`
_Why_: Explicit marker for tooling with zero runtime overhead (inlined by bundlers).

**AST Pattern**:

```scheme
(call_expression
  (identifier) @fn_name
  (#eq? @fn_name "axm")
  (arguments
    [
      (string (string_fragment) @class_value)
      (template_string (string_fragment) @class_value)
    ]
  )
)
```

### 9. Reverse Inference (Variable Usage)

**Pattern**: A variable defined as a string, which is _later_ used in a known class attribute.
_Usage_:

```js
const base = "surface-card"; // <--- Completion here
// ...
return <div className={base} />;
```

**Strategy**:

1.  **Trigger**: When cursor is in a variable declaration string.
2.  **Search**: Find all references to this variable in the current scope.
3.  **Validate**: Check if any reference is the value of a `class`/`className` attribute (using Patterns 1-7).
4.  **Action**: If validated, treat the definition string as a class context.

## Implementation Strategy

1.  **Load Grammar**: Detect file language ID and load corresponding WASM.
2.  **Execute Query**: Run the language-specific S-expression query against the tree.
3.  **Hit Test**: Check if the cursor position falls within the range of a captured `@class_value` node.
4.  **Provide Completion**: If hit, return the Axiomatic token list.

## Edge Cases & Exclusions

- **Comments**: Tree-sitter naturally excludes comments.
- **Embedded CSS**: We do _not_ target `@apply` in `<style>` blocks initially (Tailwind handles this, and we want to avoid conflict).
- **Unknown Attributes**: We do _not_ support `data-class` or other custom attributes unless explicitly configured.
