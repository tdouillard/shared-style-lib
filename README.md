# shared-style-lib

Versioned, shared front-end style libraries. Any JS/TS project can depend on this repo straight from git and import the parts it needs.

| Import | What |
|---|---|
| `shared-style-lib/gouache` | Framework-agnostic API (theme, backdrop, range helpers) |
| `shared-style-lib/gouache/react` | Optional React bindings |
| `shared-style-lib/gouache/styles.css` | All Gouache CSS |
| `shared-style-lib/gouache/tokens.css` | Design tokens only |

See [gouache/README.md](gouache/README.md) for the design system itself.

## Install

Pin a version by git tag:

```bash
# pnpm
pnpm add github:tdouillard/shared-style-lib#v0.1.0
# npm
npm install github:tdouillard/shared-style-lib#v0.1.0
# yarn
yarn add tdouillard/shared-style-lib#v0.1.0
```

Or in `package.json`:

```json
{ "dependencies": { "shared-style-lib": "github:tdouillard/shared-style-lib#v0.1.0" } }
```

Semver ranges also work with the tag form: `github:tdouillard/shared-style-lib#semver:^0.1.0`.

For a private repository the machine installing it needs git access to GitHub (SSH key or token).

## Use

```ts
import "shared-style-lib/gouache/styles.css";
import { initTheme } from "shared-style-lib/gouache";
import { Backdrop, ScrollList, useTheme } from "shared-style-lib/gouache/react"; // React is optional

initTheme({ storageKey: "my-app-theme", fallback: "dark" });
```

The package ships TypeScript and CSS source with no build step, so the consuming project needs a bundler that handles `.ts`/`.tsx` and `.css` imports (Vite, webpack, esbuild, Next.js, etc.). TypeScript consumers need `"moduleResolution": "Bundler"` (or `NodeNext`) so the `exports` map is honoured. Importing the `.css` files needs a CSS module declaration: Vite projects already get it from `vite/client`, otherwise add `declare module "*.css";` to a `.d.ts` file.

## Releasing a new version

```bash
# bump "version" in package.json, then:
git commit -am "release: v0.2.0"
git tag v0.2.0
git push origin main --tags
```

Consumers upgrade by changing the tag in their dependency.

## Develop

```bash
pnpm install
pnpm typecheck
```

Open `gouache/demo/index.html` in a browser to see every component.
