# RFC 017: Inspector Overlay Remediation Recipes (Strawman)

- **Author**: (audit agent)
- **Status**: Draft (strawman)
- **Audience**: Users + maintainers
- **Scope**: Inspector overlay remediation workflow and exported artifacts

## 1. Purpose

The Inspector overlay is a debugging tool that can:

- detect token/paint mismatches,
- attribute a likely cause (winning CSS rule / inline override / utility class), and
- export a deterministic **remediation recipe** for manual source edits.

This RFC defines the _user programming model_ for remediation:

- debugging is allowed to mutate the live DOM **only** as an explicit experiment,
- the only “real fix” is a reproducible change in source, and
- recipes are the bridge between diagnosis and source edits.

## 2. Non-goals (hard boundaries)

The overlay must not:

- claim it can infer and apply the correct “new surface boundary” (e.g. add `surface-*` classes) as a root-cause fix,
- write or recommend consumer writes to engine variables (`--axm-*`, `--_axm-*`) as integration/remediation,
- become a configuration editor.

## 3. Interaction modes

The overlay has two explicit modes:

- **Diagnose** (default on every reload): read-only; produces remediation recipes.
- **Experiment**: allows temporary DOM patches for visual confirmation; resets on reload.

Mode must not be persisted across reloads.

### 3.1 Diagnose mode actions

- **Scan violations**: find mismatch candidates across the document.
- **Per-element**:
  - **Copy Recipe** (text checklist)
  - **Copy JSON** (structured recipe)
- **Batch**:
  - `Shift+Click` in violation mode generates recipes for all violations and copies JSON.

### 3.2 Experiment mode actions

All Diagnose actions, plus:

- **Apply Temp** (per-element): perform a reversible, local patch (e.g. remove conflicting `bg-*`/`text-*` utilities and/or an inline property override).

This is not a “fix.” It is a confidence check: “If I remove this likely culprit in source, does the mismatch disappear?”

## 4. The remediation workflow (what users do)

1. **Inspect or scan** to locate a mismatch.
2. **Diagnose** the likely cause (overlay shows the winning rule / inline override / utility culprit).
3. **Copy Recipe** (text or JSON).
4. **Edit source** using the recipe:
   - remove the conflicting utility class,
   - remove the inline style override,
   - and/or edit the cited CSS rule (selector + file hint) to remove/replace the conflicting declaration.
5. **Reload + rescan**. A recipe is “done” only when a clean rescan confirms it.

Optional:

- In **Experiment** mode, click **Apply Temp** first to quickly validate the hypothesis before touching source.

## 5. Recipe payload

A recipe is intentionally conservative and focuses on the _remove/undo_ operations that unblock the Axiomatic contract.

### 5.1 Text checklist

Text output is a stable checklist (good for PR descriptions).

### 5.2 JSON output (draft)

Draft shape (not yet a formal published API):

```ts
export type InspectorRecipe = {
  version: 1;
  createdAt: string; // ISO
  target: {
    selector?: string; // best-effort
    tagName: string;
    textSnippet?: string;
  };
  mismatch: {
    property: "color" | "background-color";
    expectedToken?: string; // e.g. surface/text token
    expectedSurfaceClass?: string;
    actualValue: string;
  };
  evidence?: {
    winningRule?: {
      selectorText: string;
      fileHint?: string;
      value: string;
      important?: boolean;
      specificity?: string;
    };
    inlineStyle?: {
      property: "color" | "background-color";
      value: string;
    };
    conflictingClasses?: string[];
    referencedVars?: string[];
  };
  edits: Array<
    | { kind: "removeClass"; className: string }
    | { kind: "removeInlineStyle"; property: "color" | "background-color" }
    | {
        kind: "editCssRule";
        selectorText: string;
        fileHint?: string;
        removeDeclaration: "color" | "background-color";
      }
  >;
};
```

### 5.3 Determinism constraints

- Recipe generation must be deterministic given a stable DOM + computed styles.
- Any “file hint” is best-effort (CSSOM provenance); it must be treated as guidance, not a guarantee.

## 6. Published globals (automation + tooling)

The overlay publishes artifacts for automation and external tooling:

- `globalThis.__AXIOMATIC_INSPECTOR_VIOLATIONS__`
- `globalThis.__AXIOMATIC_INSPECTOR_CONTINUITY__`
- `globalThis.__AXIOMATIC_INSPECTOR_ACTIVE_ELEMENT__`
- `globalThis.__AXIOMATIC_INSPECTOR_ELEMENT_DIAGNOSTICS__`
- `globalThis.__AXIOMATIC_INSPECTOR_RECIPES__` (batch)
- `globalThis.__AXIOMATIC_INSPECTOR_LAST_RECIPE__` (per-element)

For compatibility, the overlay may also publish an “experiments log” to the historical name:

- `globalThis.__AXIOMATIC_INSPECTOR_APPLIED_FIXES__` (contains non-persistent experiments; name is legacy)

## 7. UX copy requirements

- Avoid the word “Fix” for any action that does not write source.
- Prefer:
  - “Copy recipe”
  - “Apply temp (experiment)”
  - “Generate recipes for all”

## 8. Open Questions

- Should recipes be promoted to a versioned, documented API contract (e.g. `InspectorRecipe@v1`), or stay as a best-effort debug payload?
- Should a future Chrome extension consume the globals and manage a “queue of source edits” outside the overlay UI?
