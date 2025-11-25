import type { SurfaceConfig } from "color-system/types";
import { useState } from "preact/hooks";
import { useConfig } from "../../context/ConfigContext";

export function SurfaceManager() {
  const {
    config,
    addGroup,
    removeGroup,
    updateGroup,
    addSurface,
    removeSurface,
    updateSurface,
  } = useConfig();
  const [newGroupName, setNewGroupName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleError = (fn: () => void) => {
    try {
      fn();
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      handleError(() => {
        addGroup(newGroupName.trim());
        setNewGroupName("");
      });
    }
  };

  return (
    <div>
      <h3 class="text-strong" style={{ marginBottom: "1rem" }}>
        Surfaces
      </h3>

      {error && (
        <div
          style={{
            padding: "0.75rem",
            marginBottom: "1rem",
            borderRadius: "6px",
            background: "var(--hue-error)",
            color: "white",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {config.groups.length === 0 && (
          <div
            class="surface-workspace bordered"
            style={{
              padding: "2rem",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <p class="text-subtle" style={{ margin: 0 }}>
              No groups yet.
            </p>
            <p
              class="text-subtlest"
              style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}
            >
              Create a group to start adding surfaces.
            </p>
          </div>
        )}

        {config.groups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            class="surface-card bordered"
            style={{ padding: "1rem", borderRadius: "8px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <input
                type="text"
                value={group.name}
                onInput={(e) =>
                  handleError(() =>
                    updateGroup(groupIndex, { name: e.currentTarget.value })
                  )
                }
                class="text-strong"
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  width: "100%",
                }}
              />
              <button
                onClick={() => removeGroup(groupIndex)}
                class="text-subtle"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
                title="Remove Group"
              >
                &times;
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {group.surfaces.map((surface, surfaceIndex) => (
                <SurfaceRow
                  key={surfaceIndex}
                  surface={surface}
                  onUpdate={(s) =>
                    handleError(() =>
                      updateSurface(groupIndex, surfaceIndex, s)
                    )
                  }
                  onRemove={() => removeSurface(groupIndex, surfaceIndex)}
                />
              ))}

              <button
                onClick={() =>
                  handleError(() =>
                    addSurface(groupIndex, {
                      slug: `new-surface-${Date.now()}`,
                      label: "New Surface",
                      polarity: "page",
                    })
                  )
                }
                class="surface-action text-strong bordered"
                style={{
                  padding: "0.5rem",
                  borderRadius: "4px",
                  marginTop: "0.5rem",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                + Add Surface
              </button>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            value={newGroupName}
            onInput={(e) => setNewGroupName(e.currentTarget.value)}
            placeholder="New Group Name"
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid var(--border-subtle-token)",
              background: "transparent",
              color: "var(--text-high-token)",
            }}
          />
          <button
            onClick={handleAddGroup}
            class="surface-action text-strong bordered"
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add Group
          </button>
        </div>
      </div>
    </div>
  );
}

function SurfaceRow({
  surface,
  onUpdate,
  onRemove,
}: {
  surface: SurfaceConfig;
  onUpdate: (s: Partial<SurfaceConfig>) => void;
  onRemove: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      class="surface-workspace bordered"
      style={{ borderRadius: "6px", overflow: "hidden" }}
    >
      <div
        style={{
          padding: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          cursor: "pointer",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span
          style={{
            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          ▶
        </span>
        <span class="text-strong" style={{ flex: 1 }}>
          {surface.label}
        </span>
        <span class="text-subtle" style={{ fontSize: "0.8rem" }}>
          {surface.slug}
        </span>
      </div>

      {isExpanded && (
        <div
          style={{
            padding: "0.75rem",
            borderTop: "1px solid var(--border-subtle-token)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <label
            class="text-subtle"
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            Label
            <input
              type="text"
              value={surface.label}
              onInput={(e) => onUpdate({ label: e.currentTarget.value })}
              style={{
                padding: "0.4rem",
                borderRadius: "4px",
                border: "1px solid var(--border-subtle-token)",
                background: "transparent",
                color: "var(--text-high-token)",
              }}
            />
          </label>
          <label
            class="text-subtle"
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            Slug
            <input
              type="text"
              value={surface.slug}
              onInput={(e) => onUpdate({ slug: e.currentTarget.value })}
              style={{
                padding: "0.4rem",
                borderRadius: "4px",
                border: "1px solid var(--border-subtle-token)",
                background: "transparent",
                color: "var(--text-high-token)",
              }}
            />
          </label>
          <label
            class="text-subtle"
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            Polarity
            <select
              value={surface.polarity}
              onChange={(e) =>
                onUpdate({ polarity: e.currentTarget.value as any })
              }
              style={{
                padding: "0.4rem",
                borderRadius: "4px",
                border: "1px solid var(--border-subtle-token)",
                background: "var(--surface-token)",
                color: "var(--text-high-token)",
              }}
            >
              <option value="page">Page</option>
              <option value="inverted">Inverted</option>
            </select>
          </label>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "0.5rem",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              class="text-subtle"
              style={{
                color: "var(--hue-error)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Delete Surface
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
