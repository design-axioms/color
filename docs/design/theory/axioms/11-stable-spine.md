# XI. The Law of the Stable Spine

**Keep the spine generic. Push variability to the edges.**

When a subsystem grows, the highest-risk failure mode is _glue drift_: the same intent gets re-expressed in multiple places (runner branches, repeated option plumbing, ad-hoc output formatting) and silently diverges.

This project prefers architectures with:

- **A stable spine**: a small, branch-free orchestrator that only sequences phases and wires shared context.
- **Variable edges**: modules own their own configuration derivation via small, typed hooks (builders), not orchestrator conditionals.
- **Artifacts as API**: phases communicate through explicit artifacts (logs/snapshots/records). Analysis is pure over artifacts.
- **Single owner for effects**: output and I/O policies live at the module boundary, not duplicated across runners.

Corollaries:

- Prefer **structural composition** (pick/spread/builders) over field-by-field plumbing.
- If a new check requires orchestrator branching, the design is incomplete; add/extend an edge hook instead.
