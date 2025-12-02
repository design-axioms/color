import {
  DEFAULT_CONFIG,
  PRESETS,
  generateTheme,
  solve,
  syncDarkToLight,
} from "@axiomatic-design/color";
import type {
  AnchorValue,
  Mode,
  Mutable,
  SolverConfig,
  SurfaceConfig,
  SurfaceGroup,
} from "@axiomatic-design/color/types";

const STORAGE_KEY = "axiomatic-config";
const CUSTOM_STORAGE_KEY = "axiomatic-custom-config";
const PRESET_ID_KEY = "axiomatic-preset-id";
const SYNC_DARK_KEY = "axiomatic-sync-dark";

export class ConfigState {
  config = $state<SolverConfig>(DEFAULT_CONFIG);
  presetId = $state<string>("");
  syncDark = $state<boolean>(true);

  constructor() {
    if (
      typeof localStorage !== "undefined" &&
      typeof localStorage.getItem === "function"
    ) {
      this.loadFromStorage();
    }

    // We use $effect.root to ensure these effects run even if the class is created outside a component
    // (though in our case it will be created in StateProvider)
    $effect.root(() => {
      $effect(() => {
        if (
          typeof localStorage !== "undefined" &&
          typeof localStorage.setItem === "function"
        ) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
          } catch (e) {
            console.error("Failed to save config to localStorage", e);
          }
        }
      });

      $effect(() => {
        if (
          typeof localStorage !== "undefined" &&
          typeof localStorage.setItem === "function"
        ) {
          try {
            localStorage.setItem(PRESET_ID_KEY, this.presetId);
          } catch (e) {
            console.error("Failed to save presetId to localStorage", e);
          }
        }
      });

      $effect(() => {
        if (
          typeof localStorage !== "undefined" &&
          typeof localStorage.setItem === "function"
        ) {
          try {
            localStorage.setItem(SYNC_DARK_KEY, String(this.syncDark));
          } catch (e) {
            console.error("Failed to save syncDark to localStorage", e);
          }
        }
      });
    });
  }

  solved = $derived.by(() => {
    try {
      // Clone to avoid mutation during solve (which aligns anchors)
      // We use JSON parse/stringify as a simple way to deep clone and strip proxies
      const configClone = JSON.parse(
        JSON.stringify(this.config),
      ) as SolverConfig;
      return solve(configClone);
    } catch (e) {
      console.error(e);
      return null;
    }
  });

  css = $derived.by(() => {
    try {
      // generateTheme also calls solve internally, but we need the CSS string
      // We pass the raw config proxy; generateTheme should handle it or we clone it
      const configClone = JSON.parse(
        JSON.stringify(this.config),
      ) as SolverConfig;
      return generateTheme(configClone);
    } catch (e) {
      console.error("Failed to generate theme CSS", e);
      return "";
    }
  });

  private loadFromStorage(): void {
    try {
      const storedPresetId = localStorage.getItem(PRESET_ID_KEY);
      if (storedPresetId) {
        this.presetId = storedPresetId;
      }

      const storedSyncDark = localStorage.getItem(SYNC_DARK_KEY);
      if (storedSyncDark !== null) {
        this.syncDark = storedSyncDark === "true";
      }

      const storedConfig = localStorage.getItem(STORAGE_KEY);
      if (storedConfig) {
        const parsed = JSON.parse(storedConfig) as unknown;
        // Basic validation to prevent loading invalid state
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "anchors" in parsed &&
          "groups" in parsed
        ) {
          this.config = parsed as SolverConfig;
        }
      }
    } catch (e) {
      console.error("Failed to load config from localStorage", e);
    }
  }

  private markAsCustom(): void {
    if (this.presetId !== "") {
      this.presetId = "";
    }
  }

  resetConfig(): void {
    if (
      confirm(
        "Are you sure you want to reset to the default configuration? All changes will be lost.",
      )
    ) {
      this.config = DEFAULT_CONFIG;
      this.presetId = "";
    }
  }

  loadPreset(newPresetId: string): void {
    // 1. If currently Custom, save to Custom Storage
    if (this.presetId === "") {
      try {
        localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(this.config));
      } catch (e) {
        console.error("Failed to save custom config", e);
      }
    }

    // 2. Load new config
    if (newPresetId === "") {
      // Loading Custom
      try {
        const stored = localStorage.getItem(CUSTOM_STORAGE_KEY);
        if (stored) {
          this.config = JSON.parse(stored) as SolverConfig;
        } else {
          // Fallback if no custom config saved yet
          this.config = DEFAULT_CONFIG;
        }
      } catch (e) {
        console.error("Failed to load custom config", e);
        this.config = DEFAULT_CONFIG;
      }
    } else {
      // Loading a Preset
      const preset = PRESETS.find((p) => p.id === newPresetId);
      if (preset) {
        this.config = preset.config;
      }
    }

    // 3. Update State
    this.presetId = newPresetId;
  }

  async loadConfigFromFile(file: File): Promise<void> {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as SolverConfig;
      // TODO: Validate schema?
      this.config = parsed;
      this.presetId = ""; // Treat as custom
    } catch (e) {
      console.error("Failed to load config file", e);
      alert("Failed to load configuration file. Please check the format.");
    }
  }

  updateAnchor(
    polarity: "page" | "inverted",
    mode: "light" | "dark",
    position: "start" | "end",
    value: number,
  ): void {
    this.markAsCustom();
    // Cast to Mutable to bypass readonly check (we are the state manager, we can mutate)
    (
      this.config.anchors[polarity][mode][position] as Mutable<AnchorValue>
    ).background = value;

    // Sync Dark Mode to Light Mode
    if (this.syncDark && mode === "light") {
      // For Inverted, we adjust 'start' because 'end' is often pinned to the key color
      const adjustProperty = polarity === "inverted" ? "start" : "end";
      syncDarkToLight(this.config.anchors, polarity, adjustProperty);
    }
  }

  updateKeyColor(key: string, value: string): void {
    this.markAsCustom();
    this.config.anchors.keyColors[key] = value;
  }

  addKeyColor(key: string, value: string): void {
    this.markAsCustom();
    if (key in this.config.anchors.keyColors) {
      throw new Error(`Key color "${key}" already exists.`);
    }
    this.config.anchors.keyColors[key] = value;
  }

  removeKeyColor(key: string): void {
    this.markAsCustom();
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.config.anchors.keyColors[key];
  }

  updateHueShiftRotation(degrees: number): void {
    this.markAsCustom();
    if (this.config.hueShift) {
      this.config.hueShift.maxRotation = degrees;
    }
  }

  updateSurfaceOverride(
    surfaceId: string,
    mode: Mode,
    color: string | undefined,
  ): void {
    this.markAsCustom();
    for (const group of this.config.groups) {
      const surface = group.surfaces.find((s) => s.slug === surfaceId);
      if (surface) {
        if (!surface.override) surface.override = {};
        if (color) {
          surface.override[mode] = color;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete surface.override[mode];
        }
        return;
      }
    }
  }

  updateSurfaceContrastOffset(
    surfaceId: string,
    mode: Mode,
    offset: number,
  ): void {
    this.markAsCustom();
    for (const group of this.config.groups) {
      const surface = group.surfaces.find((s) => s.slug === surfaceId);
      if (surface) {
        if (!surface.contrastOffset) surface.contrastOffset = {};
        surface.contrastOffset[mode] = offset;
        return;
      }
    }
  }

  // --- Surface Management ---

  addGroup(name: string): void {
    this.markAsCustom();
    if (this.config.groups.some((g) => g.name === name)) {
      throw new Error(`Group "${name}" already exists.`);
    }
    this.config.groups.push({ name, surfaces: [] });
  }

  removeGroup(index: number): void {
    this.markAsCustom();
    this.config.groups.splice(index, 1);
  }

  updateGroup(index: number, group: Partial<SurfaceGroup>): void {
    this.markAsCustom();
    if (
      group.name &&
      this.config.groups.some((g, i) => i !== index && g.name === group.name)
    ) {
      throw new Error(`Group "${group.name}" already exists.`);
    }
    Object.assign(this.config.groups[index], group);
  }

  addSurface(groupIndex: number, surface: SurfaceConfig): void {
    this.markAsCustom();
    const allSurfaces = this.config.groups.flatMap((g) => g.surfaces);
    if (allSurfaces.some((s) => s.slug === surface.slug)) {
      throw new Error(`Surface slug "${surface.slug}" already exists.`);
    }
    this.config.groups[groupIndex].surfaces.push(surface);
  }

  removeSurface(groupIndex: number, surfaceIndex: number): void {
    this.markAsCustom();
    this.config.groups[groupIndex].surfaces.splice(surfaceIndex, 1);
  }

  updateSurface(
    groupIndex: number,
    surfaceIndex: number,
    surface: Partial<SurfaceConfig>,
  ): void {
    this.markAsCustom();
    if (surface.slug) {
      // Check for duplicate slug, excluding the current surface being edited
      const isDuplicate = this.config.groups.some((g, gIdx) =>
        g.surfaces.some(
          (s, sIdx) =>
            (gIdx !== groupIndex || sIdx !== surfaceIndex) &&
            s.slug === surface.slug,
        ),
      );
      if (isDuplicate) {
        throw new Error(`Surface slug "${surface.slug}" already exists.`);
      }
    }

    Object.assign(
      this.config.groups[groupIndex].surfaces[surfaceIndex],
      surface,
    );
  }

  moveSurface(
    fromGroupIndex: number,
    fromSurfaceIndex: number,
    toGroupIndex: number,
    toSurfaceIndex: number,
  ): void {
    this.markAsCustom();
    const surface =
      this.config.groups[fromGroupIndex].surfaces[fromSurfaceIndex];

    // Remove from old location
    this.config.groups[fromGroupIndex].surfaces.splice(fromSurfaceIndex, 1);

    // Adjust target index if moving within the same group and moving down
    // (because removing the item shifts subsequent items up)
    let targetIndex = toSurfaceIndex;
    if (fromGroupIndex === toGroupIndex && fromSurfaceIndex < toSurfaceIndex) {
      targetIndex -= 1;
    }

    // Insert at new location
    // Ensure targetIndex is within bounds (0 to length)
    targetIndex = Math.max(
      0,
      Math.min(targetIndex, this.config.groups[toGroupIndex].surfaces.length),
    );

    this.config.groups[toGroupIndex].surfaces.splice(targetIndex, 0, surface);
  }

  moveGroup(fromIndex: number, toIndex: number): void {
    this.markAsCustom();
    const group = this.config.groups[fromIndex];
    this.config.groups.splice(fromIndex, 1);

    let targetIndex = toIndex;
    if (fromIndex < toIndex) {
      targetIndex -= 1;
    }

    targetIndex = Math.max(0, Math.min(targetIndex, this.config.groups.length));

    this.config.groups.splice(targetIndex, 0, group);
  }
}

export const configState = new ConfigState();
