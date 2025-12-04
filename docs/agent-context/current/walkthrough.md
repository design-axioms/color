# Epoch 28 Walkthrough: Code Review & Hardening

## Overview

This epoch focused on a comprehensive "Context-Aware Code Review" of the changes introduced in Epoch 27 (Docs Polish & Infrastructure). The goal was to ensure alignment with the project's Axioms and Decisions, specifically checking for "Source of Truth" violations and runtime performance risks.

## Review Findings

The review identified two significant issues:

1.  **Critical Source of Truth Violation**: `site/src/styles/starlight-custom.css` contained a hardcoded copy of the system tokens (e.g., `--axm-surface-token`), which had drifted from the authoritative generated file `css/theme.css`. This meant the documentation site was not accurately reflecting the system's current state.
2.  **Runtime Performance Risk**: The `ThemeManager` class in `src/lib/browser.ts` used a `MutationObserver` that scanned the entire document (`document.querySelectorAll`) on every DOM mutation, posing a performance risk for large pages or dynamic content.

## Remediation

### 1. Fixing the Source of Truth

We removed the manual token definitions from `site/src/styles/starlight-custom.css` and updated the Starlight configuration (`site/astro.config.mjs`) to load the generated `css/theme.css` directly. We also deleted a stale copy of `theme.css` found in the site's source folder.

**Changes:**

- Modified `site/astro.config.mjs` to import `../css/theme.css`.
- Refactored `site/src/styles/starlight-custom.css` to map Starlight variables (`--sl-*`) to Axiomatic variables (`--axm-*`) on the `body` selector, ensuring they resolve correctly against the generated theme.

### 2. Optimizing Runtime

We refactored the `ThemeManager` in `src/lib/browser.ts` to use a more efficient observation strategy. Instead of rescanning the entire DOM when a mutation occurs, the observer now collects only the added nodes (and their descendants) that match the inverted surface selectors and updates them specifically.

**Changes:**

- Updated `setupObserver` to iterate through `addedNodes` and check for matches against `invertedSelectors`.
- Replaced the full-document scan in the mutation callback with a targeted update of only the affected elements.

## Verification

- **Build**: `pnpm --filter site build` passed successfully, confirming that the CSS changes and configuration updates are valid.
- **Logic**: The optimized observer logic preserves the "Hard Flip" functionality while significantly reducing overhead.
