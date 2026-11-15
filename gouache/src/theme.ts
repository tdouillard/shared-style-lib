/**
 * Theme helpers. The theme lives in a `data-theme` attribute ("dark" | "light") on <html> (or any container),
 * which the CSS tokens read. Nothing here depends on a framework.
 */

export type Theme = "dark" | "light";

/** Fired on `document` after every change, so a painted backdrop (or anything else) can follow. */
export const THEME_EVENT = "g-themechange";

const isTheme = (v: unknown): v is Theme => v === "dark" || v === "light";

export interface ThemeOptions {
  /** Where the choice is remembered. Use a different key per app. */
  storageKey?: string;
  /** Element carrying the attribute. Default: <html> */
  target?: HTMLElement;
}

const read = (key: string): Theme | null => {
  try {
    const v = localStorage.getItem(key);
    return isTheme(v) ? v : null;
  } catch {
    return null; // storage unavailable (private mode)
  }
};

/** Current theme of an element (default <html>). */
export function getTheme(target: HTMLElement = document.documentElement): Theme {
  const v = target.getAttribute("data-theme");
  return isTheme(v) ? v : "dark";
}

/** Apply a theme, optionally remember it, and notify listeners. */
export function setTheme(theme: Theme, { storageKey, target = document.documentElement }: ThemeOptions = {}): Theme {
  target.setAttribute("data-theme", theme);
  if (storageKey) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      /* the choice only lasts until reload */
    }
  }
  document.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
  return theme;
}

/** Flip dark <-> light. */
export function toggleTheme(opts: ThemeOptions = {}): Theme {
  return setTheme(getTheme(opts.target) === "dark" ? "light" : "dark", opts);
}

/**
 * Call once before the first render so there is no flash of the wrong theme.
 * Order of precedence: saved choice → `fallback` (default "dark").
 */
export function initTheme({ storageKey, target = document.documentElement, fallback = "dark" }: ThemeOptions & { fallback?: Theme } = {}): Theme {
  const theme = (storageKey ? read(storageKey) : null) ?? fallback;
  target.setAttribute("data-theme", theme);
  return theme;
}

/** Subscribe to theme changes. Returns an unsubscribe function. */
export function onThemeChange(cb: (theme: Theme) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<Theme>).detail);
  document.addEventListener(THEME_EVENT, handler);
  return () => document.removeEventListener(THEME_EVENT, handler);
}
