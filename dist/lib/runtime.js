import { solve, getKeyColorStats } from '../chunk-O4WD7A7V.js';
import '../chunk-JY54TZUI.js';
import '../chunk-LBEWBWXX.js';
import { generateTokensCss } from '../chunk-33YRQ25S.js';
export { toHighContrast } from '../chunk-33YRQ25S.js';
import '../chunk-AQSKLBNK.js';
import '../chunk-LSX55S5Z.js';
import '../chunk-GEFRPWF4.js';
import '../chunk-G3PMV62Z.js';

// src/lib/runtime.ts
function generateTheme(config, selector) {
  const theme = solve(config);
  const stats = getKeyColorStats(config.anchors.keyColors);
  let css = generateTokensCss(
    config.groups,
    theme,
    config.borderTargets,
    { selector }
  );
  if (stats.chroma !== void 0 || stats.hue !== void 0) {
    const vars = [];
    if (stats.chroma !== void 0)
      vars.push(`  --chroma-brand: ${stats.chroma};`);
    if (stats.hue !== void 0) vars.push(`  --hue-brand: ${stats.hue};`);
    if (vars.length > 0) {
      const scope = selector || ":root";
      css = `${scope} {
${vars.join("\n")}
}

` + css;
    }
  }
  return css;
}
function injectTheme(css, target, existingElement) {
  const style = existingElement || document.createElement("style");
  style.textContent = css;
  if (!existingElement) {
    if (target) {
      target.appendChild(style);
    } else {
      document.head.appendChild(style);
    }
  }
  return style;
}

export { generateTheme, injectTheme };
//# sourceMappingURL=runtime.js.map
//# sourceMappingURL=runtime.js.map