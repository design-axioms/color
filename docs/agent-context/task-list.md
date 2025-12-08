# Task List: Website Remediation

## Overview

This task list tracks the systematic remediation of the documentation site to ensure full compliance with Axiomatic Color principles.

## Pages

### 1. Home Page (`/`)

- [ ] **Audit**: Run `check-violations.ts /`
- [ ] **Fix**: Resolve reported violations.
  - [ ] "Try the Studio" button (Surface Mismatch / Private Token)
  - [ ] Search Button (Surface Mismatch)
  - [ ] Code Blocks (Surface Mismatch)
  - [ ] Feature Cards (Surface Mismatch)

### 2. Studio (`/studio/`)

- [ ] **Audit**: Run `check-violations.ts /studio/`
- [ ] **Fix**: Resolve reported violations.

### 3. Concepts (`/concepts/thinking-in-surfaces/`)

- [ ] **Audit**: Run `check-violations.ts /concepts/thinking-in-surfaces/`
- [ ] **Fix**: Resolve reported violations.

### 4. Reference (`/reference/tokens/`)

- [ ] **Audit**: Run `check-violations.ts /reference/tokens/`
- [ ] **Fix**: Resolve reported violations.

## Global Issues

- [ ] **Starlight Overrides**: Ensure `starlight-custom.css` correctly maps Starlight components to Axiomatic surfaces without causing "Private Token" violations.
- [ ] **Inspector Logic**: Update `resolver.ts` (and the injected script) to recognize valid adapter patterns (e.g., `.sl-link-button` owning private tokens).
