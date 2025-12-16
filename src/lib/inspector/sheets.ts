export function getEffectiveStyleSheets(element: HTMLElement): CSSStyleSheet[] {
  const sheets: CSSStyleSheet[] = [];
  const root = element.getRootNode();

  if (root instanceof Document || root instanceof ShadowRoot) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (root.styleSheets) {
      for (let i = 0; i < root.styleSheets.length; i++) {
        const sheet = root.styleSheets[i];
        if (sheet) sheets.push(sheet);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (root.adoptedStyleSheets) {
      sheets.push(...root.adoptedStyleSheets);
    }
  } else {
    // Fallback for detached elements or other edge cases
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i];
      if (sheet) sheets.push(sheet);
    }
  }

  return sheets;
}
