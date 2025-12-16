/**
 * Declarative DOM wiring helpers.
 *
 * Goal: allow integrations to apply stable class tokens / structural wrappers
 * to vendor-owned markup without bespoke imperative glue.
 *
 * This module is intentionally agnostic to palettes, CSS variables, and engine internals.
 */

export type DomWiringRule = {
  /** CSS selector to target elements within the provided root. */
  selector: string;

  /** Class tokens to add (idempotent). */
  addClasses?: string[];

  /** Ensure some class with a prefix exists; otherwise add a fallback token. */
  ensureClassPrefix?: {
    prefix: string;
    fallbackClass: string;
  };

  /** Ensure a direct child wrapper exists; optionally move all existing children into it. */
  ensureDirectChildWrapper?: {
    /** Wrapper tag name to create when missing. Defaults to `div`. */
    tagName?: keyof HTMLElementTagNameMap;

    /** Selector for the wrapper relative to the host (direct child). Ex: `.axm-starlight-sidebar`. */
    selector: string;

    /** Class tokens to add to the wrapper (idempotent). */
    addClasses?: string[];

    /**
     * If true, moves all host children into the wrapper before appending it.
     * This is safe only when the integration “owns” the host's child structure.
     */
    moveHostChildrenIntoWrapper?: boolean;
  };

  /** Nested rules applied within each matched element. */
  descendants?: DomWiringRule[];
};

export type ApplyDomWiringOptions = {
  /** If true, also apply the rules to the root element itself if it matches. Defaults to true. */
  includeRootIfMatches?: boolean;
};

export function applyDomWiring(
  root: Document | Element,
  rules: DomWiringRule[],
  options: ApplyDomWiringOptions = {},
): void {
  const includeRootIfMatches = options.includeRootIfMatches ?? true;

  for (const rule of rules) {
    const targets: Element[] = [];

    if (
      includeRootIfMatches &&
      isElement(root) &&
      root.matches(rule.selector)
    ) {
      targets.push(root);
    }

    const found = root.querySelectorAll(rule.selector);
    for (const el of Array.from(found)) targets.push(el);

    for (const el of targets) {
      applyRuleToElement(el, rule);
    }
  }
}

export type DomWiringObserverOptions = {
  /** Root element whose subtree should be observed (usually `document.body`). */
  observeRoot: Node;

  /** Wiring rules to apply to added subtrees. */
  rules: DomWiringRule[];

  /** Apply once immediately to the observeRoot subtree. Defaults to true. */
  applyInitial?: boolean;

  /**
   * Scheduler used to batch mutation processing.
   * Default: requestAnimationFrame, falling back to queueMicrotask.
   */
  schedule?: (cb: () => void) => void;

  /**
   * Allows injection for testing.
   * Default: globalThis.MutationObserver.
   */
  MutationObserverCtor?: typeof MutationObserver;
};

export type DomWiringObserverHandle = {
  dispose: () => void;
};

export function observeDomWiring(
  opts: DomWiringObserverOptions,
): DomWiringObserverHandle {
  const {
    observeRoot,
    rules,
    applyInitial = true,
    schedule = defaultSchedule,
    MutationObserverCtor = typeof MutationObserver !== "undefined"
      ? MutationObserver
      : undefined,
  } = opts;

  if (!MutationObserverCtor) {
    // SSR / non-browser environment.
    if (applyInitial && isQueryRoot(observeRoot)) {
      applyDomWiring(observeRoot, rules);
    }
    return { dispose: () => {} };
  }

  if (applyInitial && isQueryRoot(observeRoot)) {
    applyDomWiring(observeRoot, rules);
  }

  const pendingRoots = new Set<Element>();
  let scheduled = false;

  const flush = (): void => {
    scheduled = false;

    // Copy-and-clear: allows reentrancy if new mutations arrive during apply.
    const batch = Array.from(pendingRoots);
    pendingRoots.clear();

    for (const el of batch) {
      applyDomWiring(el, rules);
    }
  };

  const requestFlush = (): void => {
    if (scheduled) return;
    scheduled = true;
    schedule(flush);
  };

  const observer = new MutationObserverCtor((mutations) => {
    for (const m of mutations) {
      if (m.type !== "childList") continue;

      for (const n of Array.from(m.addedNodes)) {
        if (!isElement(n)) continue;
        pendingRoots.add(n);
      }
    }

    if (pendingRoots.size > 0) requestFlush();
  });

  observer.observe(observeRoot, {
    childList: true,
    subtree: true,
  });

  return {
    dispose: () => {
      observer.disconnect();
    },
  };
}

function isElement(value: unknown): value is Element {
  return typeof Element !== "undefined" && value instanceof Element;
}

function isQueryRoot(value: unknown): value is Document | Element {
  if (isElement(value)) return true;
  return typeof Document !== "undefined" && value instanceof Document;
}

function applyRuleToElement(el: Element, rule: DomWiringRule): void {
  if (rule.addClasses && rule.addClasses.length > 0) {
    el.classList.add(...rule.addClasses);
  }

  if (rule.ensureClassPrefix) {
    const { prefix, fallbackClass } = rule.ensureClassPrefix;
    const hasPrefixed = Array.from(el.classList).some((c) =>
      c.startsWith(prefix),
    );
    if (!hasPrefixed) el.classList.add(fallbackClass);
  }

  if (rule.ensureDirectChildWrapper && el instanceof HTMLElement) {
    ensureDirectChildWrapper(el, rule.ensureDirectChildWrapper);
  }

  if (rule.descendants && rule.descendants.length > 0) {
    applyDomWiring(el, rule.descendants);
  }
}

function ensureDirectChildWrapper(
  host: HTMLElement,
  cfg: NonNullable<DomWiringRule["ensureDirectChildWrapper"]>,
): HTMLElement {
  const tagName = cfg.tagName ?? "div";

  const directSelector = cfg.selector.trim().startsWith(":scope")
    ? cfg.selector.trim()
    : `:scope > ${cfg.selector.trim()}`;

  const existing = host.querySelector(directSelector);
  if (existing instanceof HTMLElement) {
    if (cfg.addClasses && cfg.addClasses.length > 0) {
      existing.classList.add(...cfg.addClasses);
    }
    return existing;
  }

  const wrapper = document.createElement(tagName);
  if (cfg.addClasses && cfg.addClasses.length > 0) {
    wrapper.classList.add(...cfg.addClasses);
  }

  if (cfg.moveHostChildrenIntoWrapper) {
    while (host.firstChild) wrapper.appendChild(host.firstChild);
  }

  host.appendChild(wrapper);
  return wrapper;
}

function defaultSchedule(cb: () => void): void {
  if (typeof requestAnimationFrame !== "undefined") {
    requestAnimationFrame(() => {
      cb();
    });
    return;
  }
  queueMicrotask(cb);
}
