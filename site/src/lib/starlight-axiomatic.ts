import "@axiomatic-design/color/inspector";
import { ThemeManager } from "@axiomatic-design/color/browser";
import {
  applyDomWiring,
  observeDomWiring,
  type DomWiringObserverHandle,
  type DomWiringRule,
} from "@axiomatic-design/color";

// IMPORTANT: Per RFC 013 / RFC 010 enforcement, this integration module MUST NOT reference
// foreign palette variables or engine/bridge CSS variables.
// All palette mapping / paint overrides live exclusively in:
// `site/src/styles/starlight-custom.css`.

const STARLIGHT_CHROME_WIRING: DomWiringRule[] = [
  {
    selector: ".page.sl-flex",
    addClasses: ["axm-starlight-page", "surface-page"],
  },
  {
    selector: "header.header, .page > .header",
    addClasses: ["axm-starlight-header", "surface-page"],
    ensureClassPrefix: { prefix: "text-", fallbackClass: "text-body" },
  },
  {
    selector: "#starlight__sidebar",
    addClasses: ["axm-starlight-sidebar-host"],
    // Wrap sidebar contents so the wrapper (not the Starlight host) paints the surface.
    // This prevents Starlight's chrome styles from forcing a mode-dependent background.
    ensureDirectChildWrapper: {
      selector: ".axm-starlight-sidebar",
      addClasses: ["axm-starlight-sidebar", "surface-workspace", "text-body"],
      moveHostChildrenIntoWrapper: true,
    },
  },
  {
    selector: ".right-sidebar-panel",
    ensureClassPrefix: { prefix: "text-", fallbackClass: "text-subtle" },
    descendants: [
      {
        selector: "h2",
        ensureClassPrefix: { prefix: "text-", fallbackClass: "text-high" },
      },
    ],
  },
];

const ensureDebugger = (): void => {
  if (!document.body) return;
  if (document.querySelector("axiomatic-debugger")) return;
  const el = document.createElement("axiomatic-debugger");
  document.body.appendChild(el);
};

const initAxiomaticThemeManagerBridge = (): void => {
  const root = document.documentElement;
  const manager = new ThemeManager({ root });

  const publishTheme = (raw: string | null): void => {
    const mode = raw === "dark" || raw === "light" ? raw : "system";

    // Publish vendor-observable theme state + Axiomatic semantic state.
    // With `data-axm-motion="tau"`, the engine will not independently
    // transition bridge/computed outputs; `--tau` is the sole motion driver.
    if (mode === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);

    manager.setMode(mode);
  };

  // Initial sync from any preexisting Starlight state (no event to intercept).
  {
    const theme = root.getAttribute("data-theme");
    manager.setMode(theme === "dark" || theme === "light" ? theme : "system");
  }

  // Starlight may set `data-theme` during boot without going through the picker.
  // Keep Axiomatic semantic state consistent with the vendor-observable theme signal.
  // This does NOT touch CSS variables; it only replays the mode into ThemeManager.
  if (typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type !== "attributes" || m.attributeName !== "data-theme")
          continue;
        const theme = root.getAttribute("data-theme");
        manager.setMode(
          theme === "dark" || theme === "light" ? theme : "system",
        );
      }
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }

  // Take over the Starlight theme picker so there is a single theme writer.
  document.addEventListener(
    "change",
    (e) => {
      const target = e.target;
      if (!(target instanceof HTMLSelectElement)) return;
      if (!target.closest("starlight-theme-select")) return;

      // Prevent Starlight from doing a competing theme commit.
      e.preventDefault();
      e.stopImmediatePropagation();

      publishTheme(target.value);
    },
    { capture: true },
  );
};

export const initStarlightAxiomatic = (): void => {
  // Theme bridge should run as early as possible to avoid animating from
  // default mode into the user's preferred theme.
  initAxiomaticThemeManagerBridge();

  const w = window as unknown as {
    __axmStarlightWiring?: DomWiringObserverHandle;
  };

  const domReady = (): void => {
    ensureDebugger();

    // Initial pass: wire whatever exists at DOM ready.
    applyDomWiring(document, STARLIGHT_CHROME_WIRING);

    // Mutation-based upkeep: re-wire only added subtrees.
    // This avoids re-scanning the entire document on every route change.
    if (!w.__axmStarlightWiring && document.body) {
      w.__axmStarlightWiring = observeDomWiring({
        observeRoot: document.body,
        rules: STARLIGHT_CHROME_WIRING,
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", domReady, { once: true });
  } else {
    domReady();
  }
};
