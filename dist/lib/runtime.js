import { generateTokensCss } from '../chunk-EB6GU2YN.js';
import { solve, getKeyColorStats } from '../chunk-OKL7NJMK.js';
import '../chunk-LBEWBWXX.js';
import '../chunk-7LUK7J7M.js';

// src/lib/runtime.ts
function generateTheme(config, selector) {
  const { backgrounds } = solve(config);
  const stats = getKeyColorStats(config.anchors.keyColors);
  let css = generateTokensCss(
    config.groups,
    backgrounds,
    config.hueShift,
    config.borderTargets,
    selector
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