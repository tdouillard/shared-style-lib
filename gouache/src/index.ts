/** Gouache – framework-agnostic API. (Styles: import "shared-style-lib/gouache/styles.css". React bindings: "shared-style-lib/gouache/react".) */
export { getTheme, setTheme, toggleTheme, initTheme, onThemeChange, THEME_EVENT } from "./theme.ts";
export type { Theme, ThemeOptions } from "./theme.ts";
export { paintBackdrop, renderBackdrop, registerPalette } from "./backdrop.ts";
export type { BackdropOptions, Palette } from "./backdrop.ts";
export { setRangeFill } from "./range.ts";
