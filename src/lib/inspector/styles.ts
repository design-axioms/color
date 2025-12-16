export const STYLES = `
  :host {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 99999;
    font-family: system-ui, -apple-system, sans-serif;
    display: block;
    
    --color-local: #00ff9d;
    --color-ancestor-1: #00ccff;
    --color-ancestor-2: #ffcc00;
    --color-ancestor-3: #ff66cc;
    --color-ancestor-4: #cc66ff;
  }

  #highlight-layer, #violation-layer, #source-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .highlight-box {
    position: absolute;
    border: 2px solid #ff00ff;
    background-color: rgba(255, 0, 255, 0.05);
    pointer-events: none;
    box-sizing: border-box;
    z-index: 10;
  }

  .source-box {
    position: absolute;
    border: 2px dashed;
    pointer-events: none;
    box-sizing: border-box;
    z-index: 5;
    opacity: 0.4;
    transition: opacity 0.2s, border-width 0.2s;
  }

  .source-box.active-source {
    opacity: 1;
    border-width: 3px;
    z-index: 20;
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .source-label {
    position: absolute;
    top: -20px;
    left: 0;
    background: #1a1a1a;
    color: #fff;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    display: flex;
    gap: 4px;
    white-space: nowrap;
    border: 1px solid currentColor;
    z-index: 21;
  }

  .violation-box {
    position: absolute;
    border: 2px dashed #ff4444;
    background-color: rgba(255, 68, 68, 0.2);
    pointer-events: none;
    box-sizing: border-box;
  }

  #info-card {
    position: fixed;
    background: #1a1a1a;
    color: #fff;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border: 1px solid #333;
    font-size: 12px;
    line-height: 1.4;
    max-width: 420px;
    pointer-events: auto;
    display: none;
    backdrop-filter: blur(8px);
    
    /* Anchor Positioning */
    position-anchor: --inspector-target;
    position-area: bottom span-right;
    position-try-fallbacks: flip-block, flip-inline;
    margin: 0;
    
    /* Reset popover defaults */
    inset: auto;

    /* Anchor-positioned clamp (JS sets nudge vars as needed) */
    transform: translate(
      var(--_inspector-nudge-x, 0px),
      var(--_inspector-nudge-y, 0px)
    );
  }

  #info-card:popover-open {
    display: block;
  }

  /* Fallback for browsers without anchor positioning */
  @supports not (position-area: bottom center) {
    #info-card {
      /* JS positioning will override this */
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #333;
  }

  .card-actions {
    margin-left: auto;
    display: flex;
    gap: 6px;
  }

  .card-action-btn {
    padding: 2px 6px;
    font-size: 10px;
    line-height: 1.2;
  }

  .card-action-btn.active {
    background: #00ccff;
    border-color: #00ccff;
    color: #000;
  }

  .badge {
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 10px;
    text-transform: uppercase;
  }

  .badge-surface { background: #333; color: #fff; }
  .badge-light { background: #fff; color: #000; }
  .badge-dark { background: #000; color: #fff; border: 1px solid #333; }

  .token-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .token-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 8px;
    border-radius: 4px;
    cursor: default;
    white-space: nowrap;
  }

  .token-row:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .token-name { color: #888; }
  .token-name-row { display: flex; align-items: center; gap: 6px; }
  .status-icon-slot { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; flex-shrink: 0; }
  .token-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
  .token-subtitle { font-size: 9px; opacity: 0.5; font-weight: normal; font-family: system-ui, sans-serif; margin-left: 20px; }
  .token-value-group { display: flex; align-items: center; gap: 6px; margin-left: auto; flex-shrink: 0; }
  .token-value { font-family: monospace; color: #00ff9d; }
  .token-value.type-specified { color: #ffffff; font-weight: 700; text-shadow: 0 0 8px rgba(255, 255, 255, 0.2); }
  .token-value.type-derived { color: #888888; }
  .token-value.type-source { color: #ffcc00; }
  .token-value.warning { color: #ff4444; font-weight: bold; }
  .token-swatch {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    border: 1px solid #333;
    display: inline-block;
  }
  
  .token-hue-swatch {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid #333;
    display: inline-block;
  }
  
  .token-chroma-bar {
    width: 20px;
    height: 6px;
    background: #333;
    border-radius: 2px;
    overflow: hidden;
    display: inline-block;
  }
  
  .token-chroma-fill {
    height: 100%;
    background: #00ff9d;
  }

  .token-empty { color: #666; font-style: italic; text-align: center; padding: 8px 0; }

  .token-source-icon {
    font-size: 10px;
    width: 16px;
    text-align: center;
    cursor: help;
    opacity: 0.7;
  }
  
  .token-source-pill {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid currentColor;
    margin-top: 5px;
  }
  
  .token-source-label {
    font-size: 10px;
    opacity: 0.6;
    font-family: monospace;
    text-align: left;
    margin-top: 1px;
  }
  
  /* Source indicators */
  .source-local { color: #00ff9d; --source-color: #00ff9d; }
  .source-ancestor-1 { color: #00ccff; --source-color: #00ccff; }
  .source-ancestor-2 { color: #ffcc00; --source-color: #ffcc00; }
  .source-ancestor-3 { color: #ff66cc; --source-color: #ff66cc; }
  .source-ancestor-4 { color: #cc66ff; --source-color: #cc66ff; }
  
  .token-name.source-local, .token-name.source-ancestor-1, 
  .token-name.source-ancestor-2, .token-name.source-ancestor-3, 
  .token-name.source-ancestor-4 {
    color: var(--source-color);
    opacity: 0.9;
  }
  
  .token-source-pill.source-local, .token-source-pill.source-ancestor-1,
  .token-source-pill.source-ancestor-2, .token-source-pill.source-ancestor-3,
  .token-source-pill.source-ancestor-4 {
    background-color: var(--source-color);
    box-shadow: 0 0 4px var(--source-color);
  }

  .advice-box {
    margin-top: 12px;
    padding: 8px;
    background: rgba(255, 68, 68, 0.1);
    border: 1px solid #ff4444;
    border-radius: 4px;
    color: #ffaaaa;
    font-size: 11px;
  }
  .advice-title { font-weight: bold; margin-bottom: 4px; display: block; color: #ff4444; }

  .inspector-btn {
    background: #333;
    border: 1px solid #444;
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 10px;
    transition: background 0.2s;
  }
  
  .inspector-btn:hover {
    background: #444;
    border-color: #555;
  }
  
  .inspector-btn:active {
    background: #222;
  }

  #controls {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
    z-index: 100000;
    pointer-events: auto;
  }

  #controls-secondary {
    display: flex;
    gap: 10px;
    pointer-events: auto;
  }

  #toggle-btn {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #1a1a1a;
    border: 1px solid #333;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
    pointer-events: auto;
  }

  #toggle-btn:hover {
    background: #333;
    transform: scale(1.05);
  }

  #toggle-btn.active {
    background: #00ff9d;
    color: #000;
    border-color: #00ff9d;
  }

  #toggle-btn.dirty::after {
    content: '';
    position: absolute;
    top: 2px;
    right: 2px;
    width: 10px;
    height: 10px;
    background: #ffcc00;
    border: 2px solid #1a1a1a;
    border-radius: 50%;
    box-shadow: 0 0 4px rgba(255, 204, 0, 0.5);
  }

  #violation-toggle {
    position: relative;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #1a1a1a;
    border: 1px solid #333;
    color: #888;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    pointer-events: auto;
    opacity: 0;
    transform: translateY(20px) scale(0.8);
    pointer-events: none;
  }

  #continuity-toggle {
    position: relative;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #1a1a1a;
    border: 1px solid #333;
    color: #888;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    pointer-events: auto;
    opacity: 0;
    transform: translateY(20px) scale(0.8);
    pointer-events: none;
  }

  #continuity-toggle.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  #continuity-toggle.active {
    background: #ffcc00;
    color: #000;
    border-color: #ffcc00;
  }

  #violation-toggle.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  #violation-toggle.active {
    background: #ff4444;
    color: #fff;
    border-color: #ff4444;
  }

  .highlight-box.pinned {
    border-color: #00ff9d;
    background-color: rgba(0, 255, 157, 0.1);
  }

  #reset-btn {
    position: relative;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #1a1a1a;
    border: 1px solid #333;
    color: #888;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    pointer-events: auto;
    opacity: 0;
    transform: translateY(20px) scale(0.8);
    pointer-events: none;
  }

  #reset-btn.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  #reset-btn.active {
    background: #ffcc00;
    color: #000;
    border-color: #ffcc00;
  }

  #reset-btn.visible:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  #theme-toggle-main {
    position: relative;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #1a1a1a;
    border: 1px solid #333;
    color: #888;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    pointer-events: auto;
    opacity: 0;
    transform: translateY(20px) scale(0.8);
    pointer-events: none;
  }

  #theme-toggle-main.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  #theme-toggle-main:hover {
    background: #333;
    color: #fff;
  }

  
`;
