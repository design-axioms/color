import { PRESETS } from "color-system";
import { generateTheme } from "color-system/runtime";
import {
  BarChart,
  Box,
  Copy,
  Download,
  Layout,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Settings,
  Sun,
  TestTube,
  Upload,
} from "lucide-preact";
import { useRef, useState } from "preact/hooks";
import { Link, useLocation } from "wouter";
import { useConfig } from "../context/ConfigContext";
import { useTheme } from "../context/ThemeContext";
import { AnchorsEditor } from "./ThemeBuilder/AnchorsEditor";
import { HueShiftEditor } from "./ThemeBuilder/HueShiftEditor";
import { KeyColorsEditor } from "./ThemeBuilder/KeyColorsEditor";

export function Toolbar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { config, resetConfig, loadPreset, presetId, loadConfigFromFile } =
    useConfig();
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const handleDownloadJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "color-config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleCopyCss = async () => {
    try {
      const css = generateTheme(config);
      await navigator.clipboard.writeText(css);
      setCopyFeedback("Copied!");
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) {
      console.error("Failed to copy CSS", err);
      setCopyFeedback("Failed");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      loadConfigFromFile(target.files[0]);
      target.value = ""; // Reset so same file can be selected again
    }
  };

  return (
    <>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1.5rem",
          borderBottom: "1px solid var(--border-subtle-token)",
          backdropFilter: "blur(10px)",
          backgroundColor: "var(--surface-token)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          gap: "1rem",
        }}
        class="surface-workspace"
      >
        {/* Navigation */}
        <nav style={{ display: "flex" }}>
          <NavButton
            href="/"
            icon={Layout}
            label="Showcase"
            active={isActive("/")}
          />
          <NavButton
            href="/builder"
            icon={Palette}
            label="Builder"
            active={isActive("/builder")}
          />
          <NavButton
            href="/lab"
            icon={TestTube}
            label="Verifier"
            active={isActive("/lab")}
          />
          <NavButton
            href="/experience"
            icon={Monitor}
            label="Experience"
            active={isActive("/experience")}
          />
          <NavButton
            href="/primitives"
            icon={Box}
            label="Primitives"
            active={isActive("/primitives")}
          />
          <NavButton
            href="/dataviz"
            icon={BarChart}
            label="Data Viz"
            active={isActive("/dataviz")}
          />
        </nav>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {/* Presets */}
          <div
            class="surface-card bordered"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0.25rem 0.75rem",
              borderRadius: "6px",
              gap: "0.5rem",
              height: "36px",
            }}
          >
            <span class="text-subtle" style={{ fontSize: "0.8rem" }}>
              Preset:
            </span>
            <select
              value={presetId}
              onChange={(e) => {
                const val = (e.target as HTMLSelectElement).value;
                loadPreset(val);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-strong-token)",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "0.9rem",
                outline: "none",
              }}
            >
              <option value="">Custom</option>
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.5rem", position: "relative" }}>
            <button
              class={`surface-card bordered ${
                settingsOpen ? "surface-action" : ""
              }`}
              title="Theme Settings"
              // @ts-ignore
              popovertarget="settings-popover"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.5rem",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                // @ts-ignore
                anchorName: "--settings-btn",
              }}
            >
              <Settings size={18} />
            </button>

            <div
              id="settings-popover"
              // @ts-ignore
              popover="auto"
              // @ts-ignore
              onToggle={(e) => setSettingsOpen(e.newState === "open")}
              class="surface-card bordered"
              style={{
                margin: 0,
                padding: "1rem",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                width: "420px",
                maxHeight: "80vh",
                overflowY: "auto",
                position: "fixed",
                inset: "auto",
                // @ts-ignore
                positionAnchor: "--settings-btn",
                top: "anchor(bottom)",
                right: "anchor(right)",
                marginTop: "0.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3
                    class="text-strong"
                    style={{ margin: 0, fontSize: "1rem" }}
                  >
                    Global Settings
                  </h3>
                  <button
                    // @ts-ignore
                    popovertarget="settings-popover"
                    popovertargetaction="hide"
                    class="text-subtle"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                      padding: "0 0.5rem",
                    }}
                  >
                    &times;
                  </button>
                </div>
                <KeyColorsEditor />
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "var(--border-subtle-token)",
                  }}
                />
                <AnchorsEditor />
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "var(--border-subtle-token)",
                  }}
                />
                <HueShiftEditor />
              </div>
            </div>
            <div
              style={{
                width: "1px",
                height: "24px",
                backgroundColor: "var(--border-subtle-token)",
                margin: "0 0.5rem",
              }}
            />
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".json"
              onChange={handleFileChange}
            />
            <ActionButton
              icon={Upload}
              onClick={handleUploadClick}
              title="Load JSON"
            />
            <ActionButton
              icon={Download}
              onClick={handleDownloadJson}
              title="Download JSON"
            />
            <ActionButton
              icon={Copy}
              onClick={handleCopyCss}
              title={copyFeedback || "Copy CSS"}
              active={!!copyFeedback}
            />
            <ActionButton
              icon={RotateCcw}
              onClick={resetConfig}
              title="Reset to Default"
              danger
            />
          </div>

          {/* Theme Switcher */}
          <div
            style={{
              display: "flex",
              gap: "0.25rem",
              padding: "0.25rem",
              borderRadius: "6px",
              backgroundColor: "var(--surface-token)",
              border: "1px solid var(--border-subtle-token)",
            }}
            class="surface-card"
          >
            <ThemeButton
              active={theme === "light"}
              onClick={() => setTheme("light")}
              icon={Sun}
              label="Light"
            />
            <ThemeButton
              active={theme === "dark"}
              onClick={() => setTheme("dark")}
              icon={Moon}
              label="Dark"
            />
            <ThemeButton
              active={theme === "system"}
              onClick={() => setTheme("system")}
              icon={Monitor}
              label="System"
            />
          </div>
        </div>
      </div>
    </>
  );
}

function ActionButton({
  icon: Icon,
  onClick,
  title,
  active,
  danger,
}: {
  icon: any;
  onClick: () => void;
  title: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      class={`surface-card bordered ${active ? "surface-action" : ""}`}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.5rem",
        borderRadius: "6px",
        cursor: "pointer",
        color: danger ? "var(--hue-error)" : undefined,
        borderColor: danger ? "var(--hue-error)" : undefined,
        transition: "all 0.2s ease",
      }}
    >
      <Icon size={18} />
    </button>
  );
}

function NavButton({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: any;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      class={active ? "surface-action text-strong" : "text-subtle"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 0.75rem",
        borderRadius: "6px",
        textDecoration: "none",
        fontSize: "0.9rem",
        fontWeight: active ? "bold" : "normal",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={18} />
      <span class="nav-label">{label}</span>
    </Link>
  );
}

function ThemeButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      class={active ? "surface-action text-strong" : "text-subtle"}
      title={label}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.4rem",
        borderRadius: "4px",
        border: "none",
        cursor: "pointer",
        background: active ? "var(--surface-token)" : "transparent",
      }}
    >
      <Icon size={16} />
    </button>
  );
}
