<!--
  QA: Zero to One (The Grand Simulation)
  Use this prompt to validate the system's robustness by simulating a fresh user journey.
-->

# QA: Zero to One (The Grand Simulation)

You are about to perform a "Zero to One" QA simulation. This process mimics a new user installing and using the library in a fresh environment to ensure the end-to-end flow is robust.

## The Goal

Validate that a user can go from "Zero" (no code) to "One" (a working, themed application) **by following the documentation**. This tests both the software and the instructions.

## The Personas

You will simulate the following personas during this process:

1.  **Alex (The Visual Tinkerer)**: Wants to create a unique, high-impact theme (e.g., Cyberpunk, Vaporwave). Cares about vibrancy and flexibility.
2.  **Jordan (The Accessibility Champion)**: Cares about compliance. Will run audits and check for high-contrast support.
3.  **Dr. Chen (The Color Scientist)**: Cares about correctness. Will inspect the CSS for P3 gamut support and proper interpolation.
4.  **Marcus (The System Architect)**: Cares about integration. Will check the exported tokens (Tailwind, DTCG) for structure and type safety.

## The Process

### 1. Setup the Simulation Environment

Create a clean, isolated directory for the simulation. Do not run this inside the main workspace to avoid leaking dependencies.

```bash
# 1. Pack the library locally
pnpm pack

# 2. Create the simulation directory
mkdir -p examples/grand-simulation
cd examples/grand-simulation

# 3. Initialize a fresh project
npm init -y

# 4. Install the packed library
npm install ../../axiomatic-design-color-0.1.0.tgz # Adjust version as needed
```

### 2. Follow the Documentation

**Do not use prior knowledge.** Read the "Quick Start" guide (`site/src/content/docs/guides/quick-start.mdx`) and follow the instructions exactly as written.

1.  **Read**: Read the `quick-start.mdx` file.
2.  **Execute**: Run the commands exactly as the documentation prescribes.
3.  **Observe**: If a command fails or behaves differently than described, **STOP**. This is a documentation bug. Log it in the friction log.

### 3. Configure & Push Limits (Alex)

Once the basic setup is complete (per the docs), configure a theme that pushes the system's limits.

- Edit `color-config.json`.
- Set a high target chroma (e.g., 0.3).
- Choose distinct key colors (e.g., Neon Pink, Bright Green).

### 4. Verify & Audit (Jordan & Dr. Chen)

Inspect the generated files to ensure they meet the personas' high standards.

- **Check `theme.css`**:
  - Are `oklch()` values used? (Dr. Chen)
  - Is there a `@media (prefers-contrast: more)` block? (Jordan)
  - Do the high-contrast values snap to 0/1 (Black/White)? (Jordan)
- **Check Exports**:
  - Did the documentation explain how to export? If so, verify the output.
- **Run the Audit**:
  - `npx axiomatic audit`

### 5. Report Findings

Document your findings in `docs/agent-context/qa-report.md` (or similar).

- **Successes**: What worked well?
- **Friction**: Where did you get stuck? Did the docs miss a step?
- **Bugs**: Did anything fail?
- **Axiom Violations**: Did the output violate any core design axioms?

## Checklist

- [ ] Followed `quick-start.mdx` step-by-step.
- [ ] CLI installs and runs via `npx`.
- [ ] `init` creates a valid config.
- [ ] `build` generates valid CSS with P3 support.
- [ ] `audit` passes for a reasonable config.
- [ ] High Contrast media queries are present.
