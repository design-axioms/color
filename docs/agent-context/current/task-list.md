# Phase Task List: Algebra Page Polish (Round 2)

## Goal

Address user feedback regarding the "Algebra of Color Design" page: fix broken links, ensure math blocks are centered, and refine the academic typography.

## Tasks

### 1. Fix Broken Link

- [ ] **Changelog Link**: The link to the changelog in `plan-outline.md` (or wherever it was added) is broken. It points to `history/completed-epochs.md` which might not exist or is the wrong path.
  - _Action_: Verify the path and fix the link.

### 2. Math Alignment

- [ ] **Center Block Equations**: The screenshot shows the equation $\Psi(K, T) \rightarrow \dots$ is left-aligned.
  - _Investigation_: Inspect `site/src/content/docs/theory/algebra.mdx` and the CSS. It seems my previous attempt to center `.katex-display` didn't take, or there's a specificity issue.
  - _Action_: Force centering on `.katex-display` or the wrapper div.

### 3. Typography Refinement

- [ ] **Font Selection**: The user dislikes `Erewhon Math` for body text.
  - _Goal_: "Vibe of an academic paper".
  - _Suggestion_: `Charter` (great screen serif), `Crimson Pro` (Google Font, very academic), or `EB Garamond`.
  - _Action_: Update the font stack in `algebra.mdx`.
