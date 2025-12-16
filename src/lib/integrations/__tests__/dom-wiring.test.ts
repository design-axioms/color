// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";
import {
  applyDomWiring,
  observeDomWiring,
  type DomWiringRule,
} from "../dom-wiring.ts";

describe("dom wiring", () => {
  it("adds classes idempotently", () => {
    document.body.innerHTML = `<div id="a"></div>`;

    const rules: DomWiringRule[] = [{ selector: "#a", addClasses: ["x", "y"] }];

    applyDomWiring(document, rules);
    applyDomWiring(document, rules);

    const el = document.querySelector("#a") as HTMLElement;
    expect(el.classList.contains("x")).toBe(true);
    expect(el.classList.contains("y")).toBe(true);
    expect(Array.from(el.classList).filter((c) => c === "x").length).toBe(1);
  });

  it("ensures class prefix with fallback", () => {
    document.body.innerHTML = `<div id="a" class="foo"></div>`;

    const rules: DomWiringRule[] = [
      {
        selector: "#a",
        ensureClassPrefix: { prefix: "text-", fallbackClass: "text-body" },
      },
    ];

    applyDomWiring(document, rules);

    const el = document.querySelector("#a") as HTMLElement;
    expect(el.classList.contains("text-body")).toBe(true);

    // If a text-* class already exists, do not add the fallback.
    el.className = "text-high";
    applyDomWiring(document, rules);
    expect(el.classList.contains("text-body")).toBe(false);
  });

  it("creates a direct child wrapper and moves children once", () => {
    document.body.innerHTML = `<div id="host"><span id="c1"></span><span id="c2"></span></div>`;

    const rules: DomWiringRule[] = [
      {
        selector: "#host",
        ensureDirectChildWrapper: {
          selector: ".wrap",
          addClasses: ["wrap", "surface-workspace"],
          moveHostChildrenIntoWrapper: true,
        },
      },
    ];

    applyDomWiring(document, rules);

    const host = document.querySelector("#host") as HTMLElement;
    const wrapper = host.querySelector(":scope > .wrap") as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.classList.contains("surface-workspace")).toBe(true);
    expect(wrapper.querySelector("#c1")).toBeTruthy();
    expect(wrapper.querySelector("#c2")).toBeTruthy();

    // Idempotent: re-apply should not create a second wrapper.
    applyDomWiring(document, rules);
    expect(host.querySelectorAll(":scope > .wrap").length).toBe(1);
  });

  it("observer batches and applies to added subtrees", () => {
    document.body.innerHTML = `<div id="root"></div>`;

    const scheduleQueue: Array<() => void> = [];
    const schedule = (cb: () => void) => scheduleQueue.push(cb);

    let observerCallback: ((mutations: MutationRecord[]) => void) | null = null;

    class FakeObserver {
      constructor(cb: MutationCallback) {
        observerCallback = (mutations) => cb(mutations, {} as MutationObserver);
      }
      observe() {}
      disconnect() {}
    }

    const rules: DomWiringRule[] = [
      { selector: ".target", addClasses: ["wired"] },
    ];

    observeDomWiring({
      observeRoot: document.body,
      rules,
      schedule,
      MutationObserverCtor: FakeObserver as unknown as typeof MutationObserver,
      applyInitial: false,
    });

    const subtree = document.createElement("div");
    subtree.innerHTML = `<span class="target" id="t"></span>`;

    // Simulate many mutations within one tick; expect a single scheduled flush.
    const cb = observerCallback as unknown as
      | ((mutations: MutationRecord[]) => void)
      | null;
    cb?.([
      {
        type: "childList",
        addedNodes: [subtree] as any,
        removedNodes: [] as any,
      } as MutationRecord,
      {
        type: "childList",
        addedNodes: [subtree] as any,
        removedNodes: [] as any,
      } as MutationRecord,
    ]);

    expect(scheduleQueue.length).toBe(1);

    // Run the batch.
    scheduleQueue[0]?.();

    const t = subtree.querySelector("#t") as HTMLElement;
    expect(t.classList.contains("wired")).toBe(true);
  });
});
