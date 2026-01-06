# RFCs (Request for Comments)

This directory contains the consolidated RFCs for the Axiomatic Color System.

## Index

| Number                                  | Title             | Status      | Description                                            |
| --------------------------------------- | ----------------- | ----------- | ------------------------------------------------------ |
| [RFC-020](RFC-020-CONSUMER-CONTRACT.md) | Consumer Contract | Alpha-Ready | Public API surface, SemVer rules, stability guarantees |
| [RFC-021](RFC-021-INTEGRATION.md)       | Integration       | Alpha-Ready | Framework adapters, ThemeManager, bridge exports       |
| [RFC-022](RFC-022-CONFIGURATION.md)     | Configuration     | Alpha-Ready | Config schema, validation, vibes, presets              |
| [RFC-023](RFC-023-AUDITING.md)          | Auditing          | Alpha-Ready | Continuity/provenance checking framework               |
| [RFC-024](RFC-024-INSPECTOR.md)         | Inspector         | Alpha-Ready | Browser overlay, diagnostics, X-Ray debugger           |
| [RFC-025](RFC-025-CHARTS.md)            | Charts            | Alpha-Ready | Reactive data visualization                            |
| [RFC-026](RFC-026-TOKENS.md)            | Tokens            | Deferred    | Token pipeline, DTCG interop (Epoch 47)                |
| [RFC-027](RFC-027-TOOLING.md)           | Tooling           | Alpha-Ready | ESLint plugins, editor integration                     |
| [RFC-028](RFC-028-TUFTE-LAYOUT.md)      | Tufte Layout      | Deferred    | Sophisticated preprint layout system                   |

## RFC Dependency Graph

```
RFC-020-CONSUMER-CONTRACT (foundational)
  ├─→ RFC-021-INTEGRATION
  ├─→ RFC-022-CONFIGURATION
  ├─→ RFC-023-AUDITING
  │    └─→ RFC-024-INSPECTOR
  ├─→ RFC-025-CHARTS
  ├─→ RFC-026-TOKENS
  ├─→ RFC-027-TOOLING
  └─→ RFC-028-TUFTE-LAYOUT
```

## Numbering Scheme

RFCs are numbered starting at 020 to continue from the original RFC series (001-019). The numbering reflects logical dependencies:

- **020**: Foundation (Consumer Contract)
- **021-022**: Core systems (Integration, Configuration)
- **023-024**: Audit and debug tools
- **025-028**: Feature systems (Charts, Tokens, Tooling, Layout)

## Status Definitions

- **Alpha-Ready**: Implemented and ready for alpha release
- **Deferred**: Planned for a future epoch
- **Draft**: Under discussion, not yet implemented
- **Deprecated**: Superseded by another RFC
