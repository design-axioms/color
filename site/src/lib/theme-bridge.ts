import { ThemeManager, type ThemeMode } from "@axiomatic-design/color/browser";
import { invertedSelectors } from "../styles/theme.generated";

const STORAGE_KEY = "starlight-theme";

type ResolvedMode = "light" | "dark";

type Listener = () => void;

const listeners = new Set<Listener>();
let manager: ThemeManager | null = null;
let initialized = false;
let systemListenerAttached = false;

const getRoot = (): HTMLElement | null => {
  if (typeof document === "undefined") return null;
  return document.documentElement;
};

const parseMode = (raw: string | null): ThemeMode => {
  // Starlight stores '' for auto, 'light' or 'dark' for explicit modes.
  if (!raw) return "system";
  return raw === "light" || raw === "dark" ? raw : "system";
};

const readPersistedMode = (): ThemeMode => {
  if (typeof localStorage === "undefined") return "system";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return parseMode(raw);
  } catch {
    return "system";
  }
};

const persistMode = (mode: ThemeMode): void => {
  if (typeof localStorage === "undefined") return;
  try {
    // Starlight stores '' for auto, 'light' or 'dark' for explicit modes.
    localStorage.setItem(STORAGE_KEY, mode === "system" ? "" : mode);
  } catch {
    // Ignore persistence failures.
  }
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
  manager = new ThemeManager({ root, invertedSelectors });
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

  persistMode(mode);
  m?.setMode(mode);

  notify();
};

export const initThemeBridge = (): void => {
  if (initialized) return;
  initialized = true;

  const root = getRoot();
  if (!root) return;

  const m = ensureThemeManager();

  // Establish an initial mode preference.
  // Priority: Starlight localStorage (starlight-theme) → system.
  const initial = readPersistedMode();

  if (m) {
    // Use ThemeManager as the single semantic writer.
    m.setMode(initial);
  }

  if (!systemListenerAttached && typeof matchMedia !== "undefined") {
    systemListenerAttached = true;
    const mediaQuery = matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", () => {
      // ThemeManager updates semantic state; we only need to notify subscribers.
      if (getThemeMode() === "system") notify();
    });
  }
};
