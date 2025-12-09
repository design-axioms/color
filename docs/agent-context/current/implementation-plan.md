# Implementation Plan - Phase 5: Manual QA & Iteration

**Goal**: Final manual verification and iterative polish with the user to ensure the system meets all quality standards before the major interoperability push.

## Strategy

This phase is open-ended and driven by user feedback. We will focus on:

1.  **User Review**: The user will review the deployed site or local build.
2.  **Feedback Loop**: We will address specific visual, functional, or content issues identified by the user.
3.  **Final Polish**: Any remaining "fit and finish" tasks.

## Debugging Workflow

When visual or functional issues are identified, use the `scripts/debug-css-cascade.ts` tool to diagnose the root cause.

### Usage

```bash
# Basic usage (inspects cascade for a selector)
node scripts/debug-css-cascade.ts <url> <selector>

# Auto Mode (detects semantic violations)
node scripts/debug-css-cascade.ts <url> <selector> auto
```

### Debugging Steps

1.  **Reproduce**: Identify the URL and selector of the problematic element.
2.  **Diagnose**: Run the debug script in `auto` mode to check for semantic violations (e.g., missing surface tokens, incorrect contrast).
3.  **Inspect**: If no violations are found, check the "Cascade Report" to see which CSS rules are winning.
4.  **Fix**: Adjust the CSS (or tokens) based on the findings.
5.  **Verify**: Re-run the debug script to confirm the fix.

## Constraints

- **Explicit Sign-off**: Do **NOT** propose moving to the next phase until the user explicitly states "We are ready to move on".
- **No Assumptions**: Assume there is always more polish to be done unless told otherwise.

## Tasks

- [ ] **User Review Session**
  - [ ] Solicit feedback on the current state.
  - [ ] Identify any remaining blockers for the next epoch.
- [ ] **Remediation**
  - [ ] Address feedback item 1 (TBD)
  - [ ] Address feedback item 2 (TBD)
- [ ] **Final Verification**
  - [ ] Verify all fixes.
  - [ ] Ensure no regressions.
