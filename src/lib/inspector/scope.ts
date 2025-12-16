export interface ScopeEvaluation {
  isActive: boolean;
  proximity: number;
}

export function evaluateScope(
  rule: CSSScopeRule,
  element: HTMLElement,
  currentProximity: number,
): ScopeEvaluation {
  const start = rule.start;
  const end = rule.end;

  // 1. Find the scope root (start)
  const scopeRoot = start ? element.closest(start) : null;

  // 2. Check if we are excluded by the limit (end)
  const limitElement = end ? element.closest(end) : null;

  let isActive = true;

  // If there is a start selector but we aren't inside it, scope doesn't apply
  if (start && !scopeRoot) {
    isActive = false;
  }
  // If we are inside the limit element, and the limit element is inside the scope root,
  // then we are in the "hole" of the donut scope.
  else if (limitElement) {
    if (scopeRoot && scopeRoot.contains(limitElement)) {
      isActive = false;
    }
  }

  // 3. Calculate Proximity
  // If active, proximity is the distance from element to scopeRoot.
  // If no scopeRoot (e.g. inline style or root scope?), proximity might be 0?
  // Spec says: "The proximity of a scope is the number of hops up the flat tree..."
  let nextProximity = currentProximity;

  if (isActive && scopeRoot) {
    let dist = 0;
    let cur: HTMLElement | null = element;
    while (cur && cur !== scopeRoot) {
      dist++;
      cur = cur.parentElement;
    }
    nextProximity = dist;
  }

  return { isActive, proximity: nextProximity };
}
