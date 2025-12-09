# Phase Task List: Algebra Page Polish (Round 3)

## Goal

Fine-tune the typography to achieve a true "Academic Paper" aesthetic, addressing the user's doubts about the font and formatting.

## Tasks

### 1. Refine Typography (The "Paper" Look)

- [ ] **Leading (Line Height)**: Reduce `line-height` from `1.8` (Web/Blog style) to `1.6` or `1.5` (Academic style).
- [ ] **Justification**: Enable `text-align: justify` and `hyphens: auto`. This is the single biggest factor in making text look like a printed paper.
- [ ] **Column Width**: Reduce `max-width` slightly (e.g., `65ch`) to accommodate justified text better.

### 2. Font Selection (Charter vs. The World)

- [ ] **Evaluate Charter**: Explain that Charter is a classic TeX font, but it might feel too "technical" or "chunky" compared to the delicate Times/Computer Modern.
- [ ] **Alternative**: Switch to a stack that prioritizes **Georgia** (screen optimized serif) or **Times New Roman** (classic academic) if Charter isn't landing.
  - _Proposal_: `font-family: "Georgia", "Times New Roman", "Charter", serif;`
  - _Reasoning_: Georgia is beautiful on screens and has the "formal" vibe without the "1990s laser printer" vibe of Charter.

### 3. Visual Hierarchy

- [ ] **Headings**: Ensure headings are serif as well, perhaps slightly closer to the text.
