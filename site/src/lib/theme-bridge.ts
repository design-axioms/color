import { ThemeManager, type ThemeMode } from "@axiomatic-design/color/browser";

const STORAGE_KEY = "theme";

type ResolvedMode = "light" | "dark";

type Listener = () => void;

const listeners = new Set<Listener>();
let manager: ThemeManager | null = null;
let initialized = false;
let isApplying = false;

const getRoot = (): HTMLElement | null => {
  if (typeof document === "undefined") return null;
  return document.documentElement;
};

const parseMode = (raw: string | null): ThemeMode => {
  return raw === "light" || raw === "dark" ? raw : "system";
};

const readPersistedMode = (): ThemeMode | null => {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseMode(raw);
  } catch {
    return null;
  }
};

const persistMode = (mode: ThemeMode): void => {
  if (typeof localStorage === "undefined") return;
  try {
    if (mode === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Ignore persistence failures.
  }
};

const applyVendorThemeSignal = (mode: ThemeMode): void => {
  const root = getRoot();
  if (!root) return;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
};

const notify = (): void => {
  for (const fn of listeners) fn();
};

export const subscribeTheme = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const ensureThemeManager = (): ThemeManager | null => {
  if (manager) return manager;
  const root = getRoot();
  if (!root) return null;
  manager = new ThemeManager({ root });
  return manager;
};

export const getThemeMode = (): ThemeMode => {
  const root = getRoot();
  if (!root) return "system";
  return parseMode(root.getAttribute("data-axm-mode"));
};

export const getResolvedThemeMode = (): ResolvedMode => {
  const root = getRoot();
  if (!root) return "light";

  const raw = root.getAttribute("data-axm-resolved-mode");
  if (raw === "dark" || raw === "light") return raw;

  if (typeof matchMedia !== "undefined") {
    return matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return "light";
};

export const setThemeMode = (mode: ThemeMode): void => {
  const m = ensureThemeManager();

  isApplying = true;
  try {
    applyVendorThemeSignal(mode);
    persistMode(mode);
    m?.setMode(mode);
  } finally {
    isApplying = false;
  }

  notify();
};

export const initThemeBridge = (): void => {
  if (initialized) return;
  initialized = true;

  const root = getRoot();
  if (!root) return;

  const m = ensureThemeManager();

  // Establish an initial mode preference.
  // Priority: localStorage (consumer examples) → Starlight's vendor signal (data-theme).
  const persisted = readPersistedMode();
  const vendor = parseMode(root.getAttribute("data-theme"));
  const initial = persisted ?? vendor;

  if (m) {
    // Use ThemeManager as the single semantic writer.
    m.setMode(initial);
    applyVendorThemeSignal(initial);
  }

  // Keep in sync if Starlight or other code touches the vendor signal.
  if (typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver((mutations) => {
      if (isApplying) return;
      for (const mutation of mutations) {
        if (mutation.type !== "attributes") continue;

        if (mutation.attributeName === "data-theme") {
          const next = parseMode(root.getAttribute("data-theme"));
          if (m) m.setMode(next);
          persistMode(next);
          notify();
        }

        if (
          mutation.attributeName === "data-axm-mode" ||
          mutation.attributeName === "data-axm-resolved-mode"
        ) {
          notify();
        }
      }
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: [
        "data-theme",
        "data-axm-mode",
        "data-axm-resolved-mode",
      ],
    });
  }
};
