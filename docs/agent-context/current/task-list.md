# Phase: Visual QA & Remediation

## 1. Infrastructure & Tooling (Complete)

- [x] **Screenshot Automation**
  - [x] Update `scripts/qa-screenshots.ts` to capture "Debug/Violations" mode.
  - [x] Implement file reorganization script (`scripts/reorganize-qa.ts`).
  - [x] Execute reorganization to `qa-audit/<page>/<viewport>/<theme>/`.

## 2. Home Page (`index`) (Complete)

- [x] **Visual Analysis**
  - [x] Upload & Analyze `desktop/light` screenshots.
  - [x] Upload & Analyze `desktop/dark` screenshots.
  - [x] Upload & Analyze `mobile/light` screenshots.
  - [x] Upload & Analyze `mobile/dark` screenshots.
  - [x] Update `qa-audit/index/.../description.md`.
  - [x] Finalize `qa-audit/index/audit-report.md`.
- [x] **Remediation**
  - [x] Fix Desktop Hero: Missing H1 title (Fixed via `color-scheme` and `z-index`).
  - [x] Fix Desktop Hero: Missing Action buttons (Fixed via `color-scheme`).
  - [x] Fix Dark Mode: Code block contrast/visibility (Fixed via `.astro-code` override).
  - [x] Fix Starlight UI Leaks: Address issues found in debug mode (Fixed Sidebar active color).
- [x] **Verification**
  - [x] Re-run screenshots to verify fixes.

## 3. Concepts Page (`concepts`) (Complete)

- [x] **Preparation**
  - [x] Create `qa-audit/concepts/expectations.md`.
- [x] **Visual Analysis**
  - [x] Upload & Analyze `desktop/light` screenshots.
  - [x] Upload & Analyze `desktop/dark` screenshots.
  - [x] Upload & Analyze `mobile/light` screenshots.
  - [x] Upload & Analyze `mobile/dark` screenshots.
  - [x] Create `qa-audit/concepts/.../description.md`.
  - [x] Generate `qa-audit/concepts/audit-report.md`.
- [x] **Remediation**
  - [x] Fix "Ghost Text" in `ContextVisualizer` (Used `.text-strong`).
  - [x] Fix Mobile Layout (Added horizontal scrolling).
  - [x] Improve Visual Density (Increased grid gaps).
  - [x] Improve Example Differentiation (Updated `SurfacePreview`).

## 4. Tokens Page (`tokens`) (Complete)

- [x] **Preparation**
  - [x] Create `qa-audit/tokens/expectations.md`.
- [x] **Visual Analysis**
  - [x] Upload & Analyze `desktop/light` screenshots.
  - [x] Upload & Analyze `desktop/dark` screenshots.
  - [x] Upload & Analyze `mobile/light` screenshots.
  - [x] Upload & Analyze `mobile/dark` screenshots.
  - [x] Create `qa-audit/tokens/.../description.md`.
  - [x] Generate `qa-audit/tokens/audit-report.md`.
- [x] **Remediation**
  - [x] Fix Unreadable Tables on Mobile (Wrapped in `.surface-card` and renamed to `.mdx`).
