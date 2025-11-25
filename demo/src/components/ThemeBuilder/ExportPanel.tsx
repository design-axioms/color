import { generateTheme } from "color-system/runtime";
import { useState } from "preact/hooks";
import { useConfig } from "../../context/ConfigContext";

export function ExportPanel() {
  const { config, resetConfig } = useConfig();
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleDownloadJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "color-config.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
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

  return (
    <div>
      <h3 class="text-strong" style={{ marginBottom: "1rem" }}>
        Actions
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button
          onClick={handleDownloadJson}
          class="surface-action text-strong bordered"
          style={{
            padding: "0.75rem",
            borderRadius: "6px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Download Config (JSON)
        </button>

        <button
          onClick={handleCopyCss}
          class="surface-workspace text-subtle bordered"
          style={{
            padding: "0.75rem",
            borderRadius: "6px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          {copyFeedback || "Copy Generated CSS"}
        </button>

        <button
          onClick={resetConfig}
          class="text-subtle bordered"
          style={{
            padding: "0.75rem",
            borderRadius: "6px",
            cursor: "pointer",
            width: "100%",
            background: "transparent",
            color: "var(--hue-error)",
            borderColor: "var(--hue-error)",
          }}
        >
          Reset to Default
        </button>

        <p class="text-subtlest" style={{ fontSize: "0.85rem", margin: 0 }}>
          Use the JSON with the CLI or paste the CSS directly into your project.
        </p>
      </div>
    </div>
  );
}
