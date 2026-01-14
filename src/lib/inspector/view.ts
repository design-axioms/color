import {
  findAllMatchingRules,
  findWinningRule,
  formatSpecificity,
} from "./css-utils.ts";
import type { InspectionResult } from "./engine.ts";
import type { ConditionalContext, ResolvedToken } from "./types.ts";

function extractCssVarNames(value: string): string[] {
  // Extracts variable names from `var(--foo, fallback)` occurrences.
  // This is intentionally simple and robust enough for inspector diagnostics.
  const results: string[] = [];
  const re = /var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,|\))/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(value)) !== null) {
    const name = match[1];
    if (name) results.push(name);
  }
  return results;
}

function findForbiddenVar(
  value: string,
): { kind: "starlight" | "legacy-computed"; name: string } | null {
  for (const name of extractCssVarNames(value)) {
    if (name.startsWith("--sl-")) return { kind: "starlight", name };
    if (name.startsWith("--computed-"))
      return { kind: "legacy-computed", name };
  }
  return null;
}

/**
 * Render a badge indicating the conditional context state of a CSS rule.
 *
 * @param conditional - The conditional context (from CSSRuleMatch)
 * @returns HTML string for the badge, or empty string if no badge needed
 */
export function renderConditionalBadge(
  conditional?: ConditionalContext,
): string {
  if (!conditional) return "";

  if (!conditional.active && conditional.evaluated) {
    return `<span class="conditional-indicator inactive">@${conditional.type} (inactive)</span>`;
  }

  if (!conditional.evaluated) {
    return `<span class="conditional-indicator unknown">@${conditional.type} (?)</span>`;
  }

  return ""; // Active, no badge needed
}

/**
 * Get CSS class for a rule row based on its conditional context.
 *
 * @param conditional - The conditional context (from CSSRuleMatch)
 * @returns CSS class string to add to the rule row
 */
export function getRuleConditionalClass(
  conditional?: ConditionalContext,
): string {
  if (!conditional) return "";

  if (!conditional.active && conditional.evaluated) {
    return "rule-inactive";
  }

  if (!conditional.evaluated) {
    return "rule-conditional conditional-unknown";
  }

  return "rule-conditional conditional-active";
}

export function renderAdvice(
  result: InspectionResult,
  element: HTMLElement,
  continuityViolation?: string,
  interactionMode: "diagnose" | "experiment" = "diagnose",
): string {
  if (!result.hasMismatch && !continuityViolation) return "";

  const { bgToken } = result;
  const fgToken = result.tokens.find((t) => t.intent === "Final Text Color");
  const actualFgToken = result.tokens.find(
    (t) => t.intent === "Actual Text Color",
  );

  const surfaceToken = result.tokens.find((t) => t.intent === "Surface Color");
  const hasSurfaceMismatch =
    !!surfaceToken && !!bgToken && surfaceToken.value !== bgToken.value;

  const hasTextMismatch =
    !!fgToken && !!actualFgToken && fgToken.value !== actualFgToken.value;

  // If both background and text are mismatched, prioritize text: it's usually
  // the most actionable (and least likely to be a stacking/UA-default artifact).
  const mismatchProperty: "background-color" | "color" = hasTextMismatch
    ? "color"
    : hasSurfaceMismatch
      ? "background-color"
      : "background-color";

  const classList = Array.from(element.classList);
  const utilityClasses =
    mismatchProperty === "background-color"
      ? classList.filter((c) => c.startsWith("bg-"))
      : classList.filter((c) => c.startsWith("text-"));

  // Filter for classes that are likely to affect layout or color
  // This is a heuristic, but it's better than showing everything
  const RELEVANT_PREFIXES = [
    "bg-",
    "text-",
    "border-",
    "shadow-",
    "opacity-",
    "visible-",
    "invisible-",
    "fixed",
    "absolute",
    "relative",
    "sticky",
    "z-",
    "isolate",
  ];

  const otherClasses = classList.filter(
    (c) =>
      !c.startsWith("bg-") &&
      !c.startsWith("text-") &&
      !c.startsWith("surface-") &&
      !c.startsWith("theme-") &&
      RELEVANT_PREFIXES.some((prefix) => c.startsWith(prefix) || c === prefix),
  );

  const hasInlineStyle =
    element.style.getPropertyValue(mismatchProperty) !== "";
  const hasImportant =
    element.style.getPropertyPriority(mismatchProperty) === "important";

  const winningRule = result.hasMismatch
    ? findWinningRule(element, mismatchProperty)
    : null;
  const forbidden = winningRule ? findForbiddenVar(winningRule.value) : null;

  let reason = "";
  let isAsync = false;
  let title = "Axiom Violation";
  let description = hasSurfaceMismatch
    ? "The background color does not match the Surface token."
    : hasTextMismatch
      ? "The text color does not match the Text token."
      : "This element is violating the Axioms.";

  if (continuityViolation) {
    title = "Continuity Violation";
    description =
      "This element changes color instantly between modes, bypassing the Time Engine.";
    reason = continuityViolation;
  } else if (forbidden?.kind === "starlight") {
    reason = `Foreign token detected: ${forbidden.name}. This is a Starlight variable and should not be used to style authored components.`;
  } else if (forbidden?.kind === "legacy-computed") {
    reason = `Legacy computed variable detected: ${forbidden.name}. Use class tokens instead of addressing engine internals via variables.`;
  } else if (hasInlineStyle) {
    reason = `Inline \`style\` attribute detected for ${mismatchProperty}${hasImportant ? " (!important)" : ""}.`;
  } else if (utilityClasses.length > 0) {
    reason = `Utility classes detected: ${utilityClasses.join(", ")}.`;
  } else if (otherClasses.length > 0) {
    reason = `Custom CSS classes detected: ${otherClasses.join(", ")}. Check your stylesheets.`;
  } else {
    reason = `<span class="analyzing">Analyzing CSS rules...</span>`;
    isAsync = true;
  }

  const surfaceName = result.surfaceToken
    ? result.surfaceToken.sourceValue
    : "surface-default";

  const utilitiesStr = utilityClasses.join(",");

  const actions = `
      <div class="advice-actions" style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
        <button id="copy-recipe-text-btn" class="inspector-btn">Copy Recipe</button>
        <button id="copy-recipe-json-btn" class="inspector-btn">Copy JSON</button>
        ${
          interactionMode === "experiment"
            ? `<button id="apply-temp-btn" class="inspector-btn">Apply Temp</button>`
            : ""
        }
      </div>
  `;

  return `
    <div class="advice-box" id="advice-box" data-async="${isAsync}" data-surface="${surfaceName}" data-bg-utilities="${utilitiesStr}" data-property="${mismatchProperty}">
      <span class="advice-title">${title}</span>
      ${description}
      <br><br>
      <strong>Cause:</strong> <span id="advice-reason">${reason}</span>
      <br><br>
      <strong>Remediation:</strong> Remove the override. If needed, wrap content in a Surface context.
      ${actions}
    </div>
  `;
}

export async function updateAdviceWithAnalysis(
  element: HTMLElement,
  adviceBox: HTMLElement,
): Promise<void> {
  const reasonSpan = adviceBox.querySelector("#advice-reason");
  if (!reasonSpan) return;

  // Yield to main thread to allow UI to render "Analyzing..."
  await new Promise((resolve) => setTimeout(resolve, 0));

  const property = adviceBox.dataset.property || "background-color";
  const winningRule = findWinningRule(element, property);
  const allRules = findAllMatchingRules(element, property);
  let reason = "";

  if (winningRule) {
    const forbidden = findForbiddenVar(winningRule.value);
    if (winningRule.selector === "element.style") {
      adviceBox.dataset.isInline = "true";
      if (forbidden?.kind === "starlight") {
        reason = `Foreign token detected: ${forbidden.name} (inline style).`;
      } else if (forbidden?.kind === "legacy-computed") {
        reason = `Legacy computed variable detected: ${forbidden.name} (inline style).`;
      } else {
        reason = `Inline \`style\` attribute (${property}).`;
      }
    } else {
      const file = winningRule.stylesheet
        ? winningRule.stylesheet.split("/").pop()
        : "unknown file";
      const specificity = formatSpecificity(winningRule.specificity);
      const conditionalBadge = renderConditionalBadge(winningRule.conditional);
      if (forbidden?.kind === "starlight") {
        reason = `Foreign token detected: <code>${forbidden.name}</code> via <code title="Specificity: ${specificity}">${winningRule.selector}</code> in ${file}.${conditionalBadge ? ` ${conditionalBadge}` : ""}`;
      } else if (forbidden?.kind === "legacy-computed") {
        reason = `Legacy computed variable detected: <code>${forbidden.name}</code> via <code title="Specificity: ${specificity}">${winningRule.selector}</code> in ${file}.${conditionalBadge ? ` ${conditionalBadge}` : ""}`;
      } else {
        reason = `CSS Rule: <code title="Specificity: ${specificity}">${winningRule.selector}</code> (${property}) in ${file}.${conditionalBadge ? ` ${conditionalBadge}` : ""}`;
      }

      // Store rule info for the fix button
      adviceBox.dataset.ruleSelector = winningRule.selector;
      adviceBox.dataset.ruleFile = file;
    }
  } else {
    const tagName = element.tagName.toLowerCase();
    reason = `User Agent default style (e.g. <code>&lt;${tagName}&gt;</code>) or inherited value.`;
  }

  // If there are inactive conditional rules, show them for debugging
  const inactiveConditionalRules = allRules.filter(
    (r) => r.conditional && !r.conditional.active,
  );

  if (inactiveConditionalRules.length > 0) {
    const inactiveList = inactiveConditionalRules
      .map((r) => {
        const conditionalBadge = renderConditionalBadge(r.conditional);
        const rowClass = getRuleConditionalClass(r.conditional);
        return `<div class="token-row ${rowClass}" style="margin-top: 4px; padding: 4px; font-size: 10px;">
          <code>${r.selector}</code> ${conditionalBadge}
        </div>`;
      })
      .join("");
    reason += `<div style="margin-top: 8px;"><strong>Inactive conditional rules:</strong>${inactiveList}</div>`;
  }

  reasonSpan.innerHTML = reason;
  adviceBox.removeAttribute("data-async");
}

export function renderTokenList(
  tokens: ResolvedToken[],
  showInternals: boolean,
  hasMismatch: boolean,
  sourceList: HTMLElement[],
): string {
  const visibleTokens = tokens.filter((t) => showInternals || !t.isPrivate);

  if (visibleTokens.length === 0) {
    return `<div class="token-empty">No axiomatic tokens found</div>`;
  }

  const PRIORITY: Record<string, number> = {
    "Text Source": 1,
    "Surface Color": 2,
    "Context Hue": 3,
    "Context Chroma": 4,
    "Actual Background": 5,
    "Final Text Color": 6,
  };

  visibleTokens.sort((a, b) => {
    const pA = PRIORITY[a.intent] || 99;
    const pB = PRIORITY[b.intent] || 99;
    return pA - pB;
  });

  const baseHueToken = tokens.find((t) => t.intent === "Context Hue");
  const baseHue = baseHueToken ? parseFloat(baseHueToken.value) : 0;

  return visibleTokens
    .map((t) => renderTokenRow(t, hasMismatch, baseHue, sourceList))
    .join("");
}

function renderTokenRow(
  t: ResolvedToken,
  hasMismatch: boolean,
  baseHue: number,
  sourceList: HTMLElement[],
): string {
  const isColor =
    t.value.startsWith("oklch") ||
    t.value.startsWith("#") ||
    t.value.startsWith("rgb");
  let swatch = isColor
    ? `<div class="token-swatch" style="background-color: ${t.value}"></div>`
    : "";

  if (t.intent === "Context Hue") {
    const hue = parseFloat(t.value);
    if (!isNaN(hue)) {
      swatch = `<div class="token-hue-swatch" style="background-color: oklch(0.7 0.15 ${hue})"></div>`;
    }
  } else if (t.intent === "Context Chroma") {
    const chroma = parseFloat(t.value);
    if (!isNaN(chroma)) {
      const width = Math.min(100, (chroma / 0.4) * 100);
      swatch = `<div class="token-chroma-bar"><div class="token-chroma-fill" style="width: ${width}%"></div></div>`;
    }
  }

  const isWarning = hasMismatch && t.intent === "Actual Background";
  const warningIcon = isWarning
    ? `<span title="Mismatch with Surface Color">⚠️</span>`
    : "";

  let statusIcon = "";
  let statusTooltip = "";
  let subtitle = "";
  let roleColor = "";
  let isResult = false;

  const inputIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;

  if (t.intent === "Final Text Color") {
    statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><path d="M12 12v6"/></svg>`;
    subtitle = "Result";
    roleColor = "#00ff9d";
    isResult = true;
  } else if (t.intent === "Actual Background") {
    statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
    subtitle = "Result";
    roleColor = isWarning ? "#ff4444" : "#00ff9d";
    isResult = true;
  } else if (t.intent === "Text Source") {
    statusIcon = inputIcon;
    subtitle = "Input: Lightness";
    roleColor = "#ffffff";
  } else if (t.intent === "Surface Color") {
    statusIcon = inputIcon;
    subtitle = "Input: Context";
    roleColor = "#ffffff";
  } else if (t.intent === "Context Hue") {
    statusIcon = inputIcon;
    subtitle = "Input: Context Hue";
    roleColor = "#ffffff";
  } else if (t.intent === "Context Chroma") {
    statusIcon = inputIcon;
    subtitle = "Input: Context Chroma";
    roleColor = "#ffffff";
  } else if (t.isPrivate && !t.responsibleClass && !t.isInline) {
    statusIcon = "🔒";
    statusTooltip = "Private Token";
  } else if (t.isDefault) {
    statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.7;"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`;
    statusTooltip = "System Default";
  }

  let valueType = "";
  let valueStyle = "";

  if (t.intent === "Text Source") {
    valueType = "type-specified";
  } else if (t.intent === "Final Text Color") {
    valueStyle = `color: ${roleColor}; font-weight: bold;`;
  } else if (t.intent === "Actual Background") {
    valueStyle = `color: ${roleColor}; font-weight: bold;`;
  } else if (t.intent === "Surface Color") {
    valueType = "type-derived";
  } else if (t.intent === "Context Hue") {
    if (!isNaN(baseHue)) {
      valueStyle = `color: oklch(0.8 0.14 ${baseHue}); font-weight: bold;`;
    } else {
      valueType = "type-source";
    }
  } else if (t.intent === "Context Chroma") {
    const chroma = parseFloat(t.value);
    if (!isNaN(baseHue) && !isNaN(chroma)) {
      valueStyle = `color: oklch(0.8 ${chroma} ${baseHue}); font-weight: bold;`;
    } else {
      valueType = "type-source";
    }
  }

  const valueClass = isWarning
    ? "token-value warning"
    : `token-value ${valueType}`;

  const statusIndicator = `<span class="status-icon-slot" title="${statusTooltip}" style="${roleColor ? `color: ${roleColor}; opacity: 1;` : ""}">${statusIcon}</span>`;
  const subtitleHtml = subtitle
    ? `<span class="token-subtitle">${subtitle}</span>`
    : "";

  // Source visualization
  let sourceClass = "";
  let sourcePill = "";
  let sourceTitle = "";
  let sourceIndex: number = -1;
  let responsibleClassLabel = "";

  if (t.isDefault) {
    sourceClass = "source-system";
    sourceTitle = "System Default";
    const pillStyle = roleColor
      ? `background-color: ${roleColor}; box-shadow: 0 0 4px ${roleColor}; border: none;`
      : `border: 1px solid #666; background: #333; opacity: 0.8;`;

    sourcePill = `<span class="token-source-pill" style="${pillStyle}" title="${sourceTitle}"></span>`;
    responsibleClassLabel = `<span class="token-source-label" style="color: #aaa;">${sourceTitle}</span>`;

    if (t.element) {
      sourceIndex = sourceList.indexOf(t.element);
    }
  } else if (t.element) {
    sourceIndex = sourceList.indexOf(t.element);
    if (t.isLocal) {
      sourceClass = "source-local";
      sourceTitle = "Local Element";
      const pillClass = roleColor ? "" : `source-local`;
      const pillStyle = roleColor
        ? `background-color: ${roleColor}; box-shadow: 0 0 4px ${roleColor};`
        : "";
      sourcePill = `<span class="token-source-pill ${pillClass}" style="${pillStyle}" title="${sourceTitle}"></span>`;
    } else {
      sourceClass = `source-ancestor-${(sourceIndex % 4) + 1}`;
      const tagName = t.element.tagName.toLowerCase();
      const idStr = t.element.id ? `#${t.element.id}` : "";
      sourceTitle = `Inherited from ${tagName}${idStr}`;

      const pillClass = roleColor ? "" : sourceClass;
      const pillStyle = roleColor
        ? `background-color: ${roleColor}; box-shadow: 0 0 4px ${roleColor};`
        : "";
      sourcePill = `<span class="token-source-pill ${pillClass}" style="${pillStyle}" title="${sourceTitle}"></span>`;
    }

    if (t.responsibleClass) {
      // eslint-disable-next-line @axiomatic-design/no-raw-tokens
      responsibleClassLabel = `<span class="token-source-label" style="color: ${roleColor || "var(--source-color)"}">${t.responsibleClass}</span>`;
    } else if (t.isInline) {
      // eslint-disable-next-line @axiomatic-design/no-raw-tokens
      responsibleClassLabel = `<span class="token-source-label" style="color: ${roleColor || "var(--source-color)"}; font-style: italic;">inline style</span>`;
    } else {
      const tagName = t.element.tagName.toLowerCase();
      const idStr = t.element.id ? `#${t.element.id}` : "";
      // eslint-disable-next-line @axiomatic-design/no-raw-tokens
      responsibleClassLabel = `<span class="token-source-label" style="color: ${roleColor || "var(--source-color)"}; opacity: 0.6;">${tagName}${idStr}</span>`;
    }
  }

  const nameStyle = roleColor
    ? `color: ${roleColor}; opacity: 1; font-weight: ${isResult ? "bold" : "normal"};`
    : "";

  const rowStyle = isResult
    ? `
    margin-top: 8px; 
    padding-top: 8px; 
    border-top: 1px solid #333; 
    background: ${isWarning ? "rgba(255, 68, 68, 0.1)" : "rgba(0, 255, 157, 0.05)"};
    ${isWarning ? "border: 1px solid #ff4444;" : ""}
  `
    : "";

  if (isResult) {
    responsibleClassLabel = "";
  }

  if (
    t.intent === "Text Source" &&
    responsibleClassLabel.includes(t.sourceValue)
  ) {
    if (t.isDefault) {
      responsibleClassLabel = `<span class="token-source-label" style="color: #666; font-style: italic;">(default)</span>`;
    } else {
      responsibleClassLabel = "";
    }
  }

  return `
    <div class="token-row" data-source-index="${sourceIndex}" style="${rowStyle}">
        ${sourcePill}
        <div class="token-info">
          <div class="token-name-row">
            ${statusIndicator}
            <span class="token-name ${roleColor ? "" : sourceClass}" style="${nameStyle}">${t.intent}</span>
          </div>
          ${subtitleHtml}
        </div>
        ${responsibleClassLabel}
      <div class="token-value-group">
        ${warningIcon}
        ${swatch}
        <span class="${valueClass}" style="${valueStyle}" title="${t.value}">${t.sourceValue}</span>
      </div>
    </div>
  `;
}
