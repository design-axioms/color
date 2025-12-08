# Project Learnings & User Preferences

This document captures critical "soft" knowledge, design principles, and user preferences established during the "Experience Lab" refactor.

## 1. The "System-Native" Mandate

**Core Principle:** Do not "fake" system behavior in demos.

- **Bad:** Manually setting `style={{ backgroundColor: ... }}` to mimic a token.
- **Good:** Applying the actual class `.surface-card` and letting the global CSS handle it.
- **Why:** The demo exists to _prove_ the system's architecture, not just to look good. If the system can't do it natively, the system needs to change, not the demo.

## 2. Terminology Precision

**User Preference:** Expose the _actual API names_ in developer tools/playgrounds.

- **Context:** In the `IntentPlayground`, we initially used abstract labels like "Raised" or "Sunken".
- **Correction:** The user explicitly requested using the exact token names: `workspace`, `page`, `card`, `spotlight`.
- **Takeaway:** Developers using this tool need to learn the system's vocabulary. Don't abstract it away; expose the raw token names so they learn the API.

## 3. Global Theme Truth

**Architecture Rule:** No local theme toggles.

- **Rule:** Components should never have their own "Dark Mode" switch.
- **Mechanism:** They must strictly respond to the global `color-scheme` property (via `light-dark()` in CSS).
- **Why:** This ensures the system works reliably as a whole and prevents "theme desync" bugs.

## 4. The "Live Solver" Pattern

**Architectural Validation:**

- We successfully ran the _entire_ TypeScript solver engine (`solve()`, `generateTokensCss()`) in the browser.
- This proves the solver logic (`math.ts`, `index.ts`) is isomorphic and dependency-free (except for `culori`/`apca-w3`).
- **Future Implication:** We can build powerful client-side tooling (theme editors, accessibility checkers) that use the exact same logic as the build-time tools.

## 5. "Experience Lab" Narrative

**Design Goal:** Demos should target emotional states.

- **Intuition:** "I feel understood" (The Intent Playground).
- **Empowerment:** "I feel safe/powerful" (The Fearless Injector).
- **Unburdening:** "I feel lighter" (The Context Portal - _deprecated but the goal remains_).
