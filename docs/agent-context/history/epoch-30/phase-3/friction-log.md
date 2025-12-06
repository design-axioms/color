# Friction Log - Epoch 29: Zero-to-One Review

This log records friction points, confusion, and errors encountered during the "Zero-to-One" simulation.

## Phase 1: Installation & Initialization

| Step  | Issue                      | Severity     | Notes                                                                                                                                                                           |
| ----- | -------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Init  | `pnpm create vite` failure | Minor        | Likely due to monorepo context/environment, not library issue.                                                                                                                  |
| Build | Prefix Mismatch            | **Critical** | \`color-config.json\` defaults to \`color-sys\`, but CSS generator outputs \`--axm-\` while TS exporter outputs \`--color-sys-\`. Result: Broken tokens. **Fixed in Epoch 29.** |

## Phase 2: Basic Usage

| Step | Issue | Severity | Notes |
| ---- | ----- | -------- | ----- |
|      |       |          |       |

## Phase 2: Fresh Eyes Review

| Component | Issue                    | Severity | Notes                                                                             |
| --------- | ------------------------ | -------- | --------------------------------------------------------------------------------- |
| CLI       | Invalid command handling | Minor    | `axiomatic foo` tries to read config from `foo` instead of showing help or error. |
| Docs      | -                        | -        | Concepts are clear.                                                               |
| Builder   | -                        | -        | Luminance Spectrum implementation looks correct.                                  |
