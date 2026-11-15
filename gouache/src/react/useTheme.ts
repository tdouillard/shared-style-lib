import { useCallback, useSyncExternalStore } from "react";
import { getTheme, onThemeChange, setTheme, toggleTheme, type Theme, type ThemeOptions } from "../theme.ts";

/** Reactive current theme + setters. `options.storageKey` makes the choice persistent. */
export function useTheme(options: ThemeOptions = {}) {
  const theme = useSyncExternalStore<Theme>(
    (cb) => onThemeChange(cb),
    () => getTheme(options.target),
    () => "dark",
  );
  const { storageKey, target } = options;
  const set = useCallback((t: Theme) => setTheme(t, { storageKey, target }), [storageKey, target]);
  const toggle = useCallback(() => toggleTheme({ storageKey, target }), [storageKey, target]);
  return { theme, setTheme: set, toggleTheme: toggle };
}
