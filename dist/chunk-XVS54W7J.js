import { DEFAULT_CONFIG } from './chunk-OJJVGUDU.js';

// src/lib/presets.ts
var PRESETS = [
  {
    id: "default",
    name: "Default",
    description: "The default configuration.",
    config: DEFAULT_CONFIG
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    description: "Maximized contrast for accessibility.",
    config: {
      ...DEFAULT_CONFIG,
      anchors: {
        ...DEFAULT_CONFIG.anchors,
        page: {
          light: {
            start: { background: 1 },
            end: { adjustable: true, background: 1 }
          },
          dark: {
            start: { background: 0 },
            end: { adjustable: true, background: 0 }
          }
        }
      }
    }
  },
  {
    id: "soft",
    name: "Soft",
    description: "Lower contrast for a gentler look.",
    config: {
      ...DEFAULT_CONFIG,
      anchors: {
        ...DEFAULT_CONFIG.anchors,
        page: {
          light: {
            start: { background: 0.98 },
            end: { adjustable: true, background: 0.85 }
          },
          dark: {
            start: { background: 0.15 },
            end: { adjustable: true, background: 0.3 }
          }
        }
      }
    }
  }
];

export { PRESETS };
//# sourceMappingURL=chunk-XVS54W7J.js.map
//# sourceMappingURL=chunk-XVS54W7J.js.map