import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThemeManager } from '../browser.ts';

describe('ThemeManager', () => {
  let mockRoot: any;
  let mockMatchMedia: any;
  let mockMediaQueryList: any;

  beforeEach(() => {
    // Mock DOM
    mockRoot = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
      style: {
        setProperty: vi.fn(),
        removeProperty: vi.fn(),
      },
    };

    global.document = {
      documentElement: mockRoot,
      querySelector: vi.fn(),
      createElement: vi.fn(() => ({ setAttribute: vi.fn() })),
      head: { appendChild: vi.fn() },
      body: { style: {} }
    } as any;

    global.getComputedStyle = vi.fn(() => ({ backgroundColor: 'red', color: 'blue' })) as any;
    
    mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    mockMatchMedia = vi.fn(() => mockMediaQueryList);
    global.window = {
      matchMedia: mockMatchMedia,
    } as any;

    global.requestAnimationFrame = (cb) => cb(0) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (global as any).document;
    delete (global as any).window;
    delete (global as any).getComputedStyle;
    delete (global as any).requestAnimationFrame;
  });

  it('should initialize with system mode by default', () => {
    const manager = new ThemeManager();
    expect(manager.mode).toBe('system');
  });

  it('should set mode to light', () => {
    const manager = new ThemeManager();
    manager.setMode('light');
    expect(manager.mode).toBe('light');
    expect(mockRoot.style.setProperty).toHaveBeenCalledWith('color-scheme', 'light');
  });

  it('should set mode to dark', () => {
    const manager = new ThemeManager();
    manager.setMode('dark');
    expect(manager.mode).toBe('dark');
    expect(mockRoot.style.setProperty).toHaveBeenCalledWith('color-scheme', 'dark');
  });

  it('should use custom classes if provided', () => {
    const manager = new ThemeManager({
      lightClass: 'light-theme',
      darkClass: 'dark-theme',
    });

    manager.setMode('light');
    expect(mockRoot.classList.add).toHaveBeenCalledWith('light-theme');
    expect(mockRoot.style.setProperty).not.toHaveBeenCalledWith('color-scheme', 'light');

    manager.setMode('dark');
    expect(mockRoot.classList.add).toHaveBeenCalledWith('dark-theme');
    expect(mockRoot.style.setProperty).not.toHaveBeenCalledWith('color-scheme', 'dark');
  });

  it('should resolve system mode correctly', () => {
    const manager = new ThemeManager();
    
    // Mock system dark mode
    mockMediaQueryList.matches = true;
    expect(manager.resolvedMode).toBe('dark');

    // Mock system light mode
    mockMediaQueryList.matches = false;
    expect(manager.resolvedMode).toBe('light');
  });
});
