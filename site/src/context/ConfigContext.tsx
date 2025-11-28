import { DEFAULT_CONFIG, PRESETS } from "@algebraic-systems/color-system";
import type {
  SolverConfig,
  SurfaceConfig,
  SurfaceGroup,
} from "@algebraic-systems/color-system/types";
import { createContext, type ComponentChildren } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";

const STORAGE_KEY = "color-system-config";
const CUSTOM_STORAGE_KEY = "color-system-custom-config";
const PRESET_ID_KEY = "color-system-preset-id";

interface ConfigContextType {
  config: SolverConfig;
  presetId: string;
  setConfig: (config: SolverConfig) => void;
  updateAnchor: (
    polarity: "page" | "inverted",
    mode: "light" | "dark",
    position: "start" | "end",
    value: number
  ) => void;
  updateKeyColor: (key: string, value: string) => void;
  updateHueShiftRotation: (degrees: number) => void;

  // Surface Management
  addGroup: (name: string) => void;
  removeGroup: (index: number) => void;
  updateGroup: (index: number, group: Partial<SurfaceGroup>) => void;
  addSurface: (groupIndex: number, surface: SurfaceConfig) => void;
  removeSurface: (groupIndex: number, surfaceIndex: number) => void;
  updateSurface: (
    groupIndex: number,
    surfaceIndex: number,
    surface: Partial<SurfaceConfig>
  ) => void;
  resetConfig: () => void;
  loadPreset: (presetId: string) => void;
  loadConfigFromFile: (file: File) => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ComponentChildren }) {
  const [presetId, setPresetId] = useState<string>(() => {
    try {
      if (typeof localStorage !== "undefined" && localStorage?.getItem) {
        return localStorage.getItem(PRESET_ID_KEY) || "";
      }
    } catch {}
    return "";
  });

  const [config, setConfig] = useState<SolverConfig>(() => {
    try {
      if (typeof localStorage !== "undefined" && localStorage?.getItem) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch {}
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error("Failed to save config to localStorage", e);
    }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(PRESET_ID_KEY, presetId);
    } catch (e) {
      console.error("Failed to save presetId to localStorage", e);
    }
  }, [presetId]);

  // Helper to mark as custom when modified
  const markAsCustom = () => {
    if (presetId !== "") {
      setPresetId("");
    }
  };

  const resetConfig = () => {
    if (
      confirm(
        "Are you sure you want to reset to the default configuration? All changes will be lost."
      )
    ) {
      setConfig(DEFAULT_CONFIG);
      setPresetId("");
    }
  };

  const loadPreset = (newPresetId: string) => {
    // 1. If currently Custom, save to Custom Storage
    if (presetId === "") {
      try {
        localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(config));
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
          setConfig(JSON.parse(stored));
        } else {
          // Fallback if no custom config saved yet
          setConfig(DEFAULT_CONFIG);
        }
      } catch (e) {
        console.error("Failed to load custom config", e);
        setConfig(DEFAULT_CONFIG);
      }
    } else {
      // Loading a Preset
      const preset = PRESETS.find((p) => p.id === newPresetId);
      if (preset) {
        setConfig(preset.config);
      }
    }

    // 3. Update State
    setPresetId(newPresetId);
  };

  const loadConfigFromFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      // TODO: Validate schema?
      setConfig(parsed);
      setPresetId(""); // Treat as custom
    } catch (e) {
      console.error("Failed to load config file", e);
      alert("Failed to load configuration file. Please check the format.");
    }
  };

  const updateAnchor = (
    polarity: "page" | "inverted",
    mode: "light" | "dark",
    position: "start" | "end",
    value: number
  ) => {
    markAsCustom();
    setConfig((prev) => ({
      ...prev,
      anchors: {
        ...prev.anchors,
        [polarity]: {
          ...prev.anchors[polarity],
          [mode]: {
            ...prev.anchors[polarity][mode],
            [position]: {
              ...prev.anchors[polarity][mode][position],
              background: value,
            },
          },
        },
      },
    }));
  };

  const updateKeyColor = (key: string, value: string) => {
    markAsCustom();
    setConfig((prev) => ({
      ...prev,
      anchors: {
        ...prev.anchors,
        keyColors: {
          ...prev.anchors.keyColors,
          [key]: value,
        },
      },
    }));
  };

  const updateHueShiftRotation = (degrees: number) => {
    markAsCustom();
    setConfig((prev) => ({
      ...prev,
      hueShift: {
        ...prev.hueShift!,
        maxRotation: degrees,
      },
    }));
  };

  // --- Surface Management ---

  const addGroup = (name: string) => {
    markAsCustom();
    if (config.groups.some((g) => g.name === name)) {
      throw new Error(`Group "${name}" already exists.`);
    }
    setConfig((prev) => ({
      ...prev,
      groups: [...prev.groups, { name, surfaces: [] }],
    }));
  };

  const removeGroup = (index: number) => {
    markAsCustom();
    setConfig((prev) => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index),
    }));
  };

  const updateGroup = (index: number, group: Partial<SurfaceGroup>) => {
    markAsCustom();
    if (
      group.name &&
      config.groups.some((g, i) => i !== index && g.name === group.name)
    ) {
      throw new Error(`Group "${group.name}" already exists.`);
    }
    setConfig((prev) => ({
      ...prev,
      groups: prev.groups.map((g, i) => (i === index ? { ...g, ...group } : g)),
    }));
  };

  const addSurface = (groupIndex: number, surface: SurfaceConfig) => {
    markAsCustom();
    const allSurfaces = config.groups.flatMap((g) => g.surfaces);
    if (allSurfaces.some((s) => s.slug === surface.slug)) {
      throw new Error(`Surface slug "${surface.slug}" already exists.`);
    }
    setConfig((prev) => ({
      ...prev,
      groups: prev.groups.map((g, i) =>
        i === groupIndex ? { ...g, surfaces: [...g.surfaces, surface] } : g
      ),
    }));
  };

  const removeSurface = (groupIndex: number, surfaceIndex: number) => {
    markAsCustom();
    setConfig((prev) => ({
      ...prev,
      groups: prev.groups.map((g, i) =>
        i === groupIndex
          ? { ...g, surfaces: g.surfaces.filter((_, j) => j !== surfaceIndex) }
          : g
      ),
    }));
  };

  const updateSurface = (
    groupIndex: number,
    surfaceIndex: number,
    surface: Partial<SurfaceConfig>
  ) => {
    markAsCustom();
    if (surface.slug) {
      // Check for duplicate slug, excluding the current surface being edited
      const isDuplicate = config.groups.some((g, gIdx) =>
        g.surfaces.some(
          (s, sIdx) =>
            (gIdx !== groupIndex || sIdx !== surfaceIndex) &&
            s.slug === surface.slug
        )
      );
      if (isDuplicate) {
        throw new Error(`Surface slug "${surface.slug}" already exists.`);
      }
    }

    setConfig((prev) => ({
      ...prev,
      groups: prev.groups.map((g, i) =>
        i === groupIndex
          ? {
              ...g,
              surfaces: g.surfaces.map((s, j) =>
                j === surfaceIndex ? { ...s, ...surface } : s
              ),
            }
          : g
      ),
    }));
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        presetId,
        setConfig,
        updateAnchor,
        updateKeyColor,
        updateHueShiftRotation,
        addGroup,
        removeGroup,
        updateGroup,
        addSurface,
        removeSurface,
        updateSurface,
        resetConfig,
        loadPreset,
        loadConfigFromFile,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}
