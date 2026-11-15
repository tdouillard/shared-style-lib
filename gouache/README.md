# Gouache

A painterly, **neumorphic** design system: soft raised and pressed surfaces over a painted backdrop of flat, angular paint strokes. Dark and light themes.

- **Framework-agnostic**: plain CSS classes and CSS variables.
- **Optional React bindings** for the parts with behaviour (scroll rail, slider, switch, backdrop).
- **Offline**: no fonts, no images, no build step. Textures are inline SVG.

Open `demo/index.html` in a browser to see every component.

## Usage

**Plain HTML**

```html
<link rel="stylesheet" href="node_modules/shared-style-lib/gouache/src/css/index.css">
<html data-theme="dark">
<body class="g-page">
  <section class="g-card"><h3 class="g-label">Title</h3><button class="g-btn g-btn--primary">OK</button></section>
```

**Bundler (after installing, see the root README)**

```ts
import "shared-style-lib/gouache/styles.css";
import { initTheme } from "shared-style-lib/gouache";
initTheme({ storageKey: "my-app-theme", fallback: "dark" }); // call before the first render
```

**React** (optional peer dependency)

```tsx
import { Backdrop, ScrollList, RangeSlider, Switch, useTheme } from "shared-style-lib/gouache/react";

function App() {
  const { theme, toggleTheme } = useTheme({ storageKey: "my-app-theme" });
  return (
    <div className="g-page">
      <Backdrop />
      <button className="g-btn" onClick={toggleTheme}>{theme}</button>
    </div>
  );
}
```

## Depth

Surfaces share the page colour. Depth comes only from shadows (light from the top-left):

- **raised**: bars, cards, rows, buttons. Helpers `.g-raised`, `.g-raised-sm`, token `var(--g-raise)`.
- **pressed**: selected items, inputs, wells, toggled buttons. Helpers `.g-pressed`, `.g-pressed-sm`, token `var(--g-press)`.

`--g-depth` scales all shadows (0.6 on small screens).

## Components

| Class | What |
|---|---|
| `g-page`, `g-bar`, `g-card`, `g-section`, `g-well` | Page, header strip, panels, inset area |
| `g-row` | List item (`is-selected`, `g-row--clickable`) |
| `g-btn` | Button: `--primary --ok --danger --info --violet`, `--sm --lg --icon --round --block`, `is-on` |
| `g-input`, `g-select`, `g-range`, `g-check`, `g-switch` | Form controls |
| `g-tabs`/`g-tab`, `g-sidenav`, `g-chip`, `g-segmented` | Navigation (`is-active`) |
| `g-tag`, `g-alert`, `g-banner`, `g-dot`, `g-spinner`, `g-led` | Status and feedback |
| `g-scroll`, `g-hscroll` | Lists with an on-screen scroll rail (for touch panels) |
| `g-label`, `g-title`, `g-muted`, `g-hint`, `g-code`, `g-log`, `g-kv` | Typography |
| `g-cluster`, `g-stack`, `g-grow`, `g-mt-*` | Layout utilities |

Naming: `g-block`, `g-block__part`, `g-block--variant`, `is-state`.

## Theming

Themes are CSS variables on `[data-theme]` (on `<html>` or any container). Copy a block from `src/css/tokens.css` and change the colours:

```css
[data-theme="my-theme"] {
  --g-bg: #1d2b2a; --g-text: #e7f2ef; --g-mute: #94aca6;
  --g-accent: #7fe3c6; --g-accent-2: #f3b07a;
  --g-lo: rgba(0, 0, 0, .6); --g-hi: rgba(255, 255, 255, .08);
}
```

For a matching backdrop: `registerPalette("my-theme", { … })`, then `paintBackdrop(svg, { theme: "my-theme" })`. The backdrop is seeded and static. On slow devices pass `rough: false`.

## Files

```
src/css/     tokens, base, surfaces, button, form, nav, scroll, feedback (index.css imports all)
src/theme.ts     theme get/set/toggle/init
src/backdrop.ts  painted backdrop
src/react/       React components and hooks
demo/            every component on one page
```
