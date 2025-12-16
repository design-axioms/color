# Phase Report: Transition Smoothness + RFC 011 Foundations

## Executive Summary

We eliminated a major class of perceptual “pops” during theme transitions (Starlight chrome hairlines snapping) and upgraded our snap detector to catch transition-time paint discontinuities with stronger false-positive controls. In parallel, we laid the RFC 011 groundwork for refactoring the auditing scripts toward trace-first logs and capability-based sessions.

## What’s Now Stable

- **No browser dialogs** in non-vendor code, enforced via ESLint.
- **Snaps measurement** is structured as `MeasurementSpec` → `SnapsProbe` (browser) → `Timeline` (Node analysis).
- **ObservationLog** exists as an optional artifact for recording run config + measurements.
- **Runner maintainability** improved: reduced orchestration coupling and kept lint constraints green.

## Known Open Issues

- The snaps detector still reports some late “tau-stable” border-color snaps in certain scenarios; we need to decide whether those are real late flips or detector artifacts.

## Immediate Next Steps

- Implement `Snapshot` probe and record `measure:snapshot` events.
- Add log-only replay for `snaps` (analyze from `ObservationLog` without Playwright).
- Start splitting checks into `scenario` + `analyzer` modules per RFC 011.
