import type {
  SolverConfig,
  SurfaceConfig,
  SurfaceGroup,
} from "color-system/types";
import { createContext } from "preact";
import { useContext, useState } from "preact/hooks";
import { DEFAULT_CONFIG } from "../../../src/cli/default-config";

interface ConfigContextType {
  config: SolverConfig;
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
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: any }) {
  const [config, setConfig] = useState<SolverConfig>(DEFAULT_CONFIG);

  const resetConfig = () => {
    if (
      confirm(
        "Are you sure you want to reset to the default configuration? All changes will be lost."
      )
    ) {
      setConfig(DEFAULT_CONFIG);
    }
  };

  const updateAnchor = (
    polarity: "page" | "inverted",
    mode: "light" | "dark",
    position: "start" | "end",
    value: number
  ) => {
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
    if (config.groups.some((g) => g.name === name)) {
      throw new Error(`Group "${name}" already exists.`);
    }
    setConfig((prev) => ({
      ...prev,
      groups: [...prev.groups, { name, surfaces: [] }],
    }));
  };

  const removeGroup = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index),
    }));
  };

  const updateGroup = (index: number, group: Partial<SurfaceGroup>) => {
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
