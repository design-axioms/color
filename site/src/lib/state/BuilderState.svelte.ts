type ViewMode = "component" | "abstract" | "audit";
type InspectorMode = "global" | "surface";

const STORAGE_KEY = "axiomatic-builder-state";

interface StoredBuilderState {
  viewMode?: ViewMode;
  inspectorMode?: InspectorMode;
  sidebarWidth?: number;
  inspectorWidth?: number;
  isSidebarOpen?: boolean;
  isInspectorOpen?: boolean;
  selectedSurfaceId?: string | null;
}

export class BuilderState {
  // Selection
  selectedSurfaceId = $state<string | null>(null);
  hoveredSurfaceId = $state<string | null>(null);

  // View State
  viewMode = $state<ViewMode>("component");
  inspectorMode = $state<InspectorMode>("global");

  // Layout State (for resizable panes, future proofing)
  sidebarWidth = $state<number>(300);
  inspectorWidth = $state<number>(350);
  isSidebarOpen = $state<boolean>(true);
  isInspectorOpen = $state<boolean>(true);

  constructor() {
    if (typeof localStorage !== "undefined") {
      this.loadFromStorage();
    }

    $effect.root(() => {
      $effect(() => {
        this.saveToStorage();
      });
    });
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as StoredBuilderState;
        if (data.viewMode) this.viewMode = data.viewMode;
        if (data.inspectorMode) this.inspectorMode = data.inspectorMode;
        if (data.sidebarWidth) this.sidebarWidth = data.sidebarWidth;
        if (data.inspectorWidth) this.inspectorWidth = data.inspectorWidth;
        if (typeof data.isSidebarOpen === "boolean")
          this.isSidebarOpen = data.isSidebarOpen;
        if (typeof data.isInspectorOpen === "boolean")
          this.isInspectorOpen = data.isInspectorOpen;
        if (data.selectedSurfaceId)
          this.selectedSurfaceId = data.selectedSurfaceId;
      }
    } catch (e) {
      console.error("Failed to load builder state", e);
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === "undefined") return;
    const data: StoredBuilderState = {
      viewMode: this.viewMode,
      inspectorMode: this.inspectorMode,
      sidebarWidth: this.sidebarWidth,
      inspectorWidth: this.inspectorWidth,
      isSidebarOpen: this.isSidebarOpen,
      isInspectorOpen: this.isInspectorOpen,
      selectedSurfaceId: this.selectedSurfaceId,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save builder state", e);
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleInspector(): void {
    this.isInspectorOpen = !this.isInspectorOpen;
  }

  selectSurface(id: string | null): void {
    this.selectedSurfaceId = id;
    if (id) {
      this.inspectorMode = "surface";
    } else {
      this.inspectorMode = "global";
    }
  }

  hoverSurface(id: string | null): void {
    this.hoveredSurfaceId = id;
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
  }

  setInspectorMode(mode: InspectorMode): void {
    this.inspectorMode = mode;
  }
}

export const builderState = new BuilderState();
