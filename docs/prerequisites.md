# Prerequisites

`@codewithrajat/rm-toast-notification` is intentionally small, but it still has a few environment
requirements. Read this page before installing so you do not fight your toolchain later.

---

## Runtime requirements

### The browser

The library runs in any evergreen browser. Toast rendering, auto-dismiss, hover handling, and
sanitization all depend on:

- A DOM (`document`, `document.body`, `document.head`)
- `Element.appendChild`, `Element.removeChild`, `Node.contains`
- `dataset` on elements
- `URL` (used to validate logo URLs)
- `DOMParser` (used by `isItHtml`)
- CSS keyframes and flexbox for animations and layout

See [Browser Support](./browser-support.md) for exact versions.

### Node.js

| Requirement | Version | Why |
|---|---|---|
| Node.js | `>= 20.19.0` | Declared in `engines` and used by the build/test toolchain |
| npm | `>= 10.0.0` | Declared in `engines` |
| pnpm (recommended) | `10.11.1` (pinned in `packageManager`) | The repository ships a `pnpm-lock.yaml` |

`yarn` and `npm` work for consumers. The repository itself is developed with pnpm.

---

## Consumer prerequisites

You need a project that can resolve ESM packages:

- **Bundlers:** Vite, webpack 5, Rollup, esbuild, Parcel, Turbopack — all fine.
- **TypeScript:** `>= 4.7` recommended (the published types use standard ESM syntax). This
  repository compiles with TypeScript `5.7`.
- **Bundler resolution:** the package is ESM (`"type": "module"`) with `module` and `main`
  pointing at `dist/index.js`. If you are on CommonJS-only tooling, enable `esModuleInterop`-style
  interop or upgrade to a bundler with ESM support.

### Runtime dependency

The library has exactly one runtime dependency:

| Package | Purpose |
|---|---|
| [`dompurify`](https://www.npmjs.com/package/dompurify) | Sanitizes the `body` HTML before insertion |

Everything else you see in `package.json` (Jest, Biome, TypeScript, `fs-extra`) is development-only.

---

## Contributor prerequisites

To work on this repository you need:

1. **Node.js 20.19+** — `node -v`
2. **pnpm 10+** — `pnpm -v` (enable it with `corepack enable pnpm`, or install it globally)
3. **Git** with a fork or write access to `malikrajat/rm-toast-notification`
4. Optional but recommended: an editor that respects [`.editorconfig`](../.editorconfig)

Then:

```bash
pnpm install
pnpm run check        # Biome lint + format check
pnpm run typecheck    # tsc --noEmit
pnpm run test:coverage # Jest with a 90% coverage gate
pnpm run build        # emits dist/ and copies metadata files
```

### jsdom is required for tests

Toast behavior is DOM-driven. Unit tests therefore run in `jest-environment-jsdom`, which supplies
`document`, `window`, `DOMParser`, and `URL`. Running the suite in a plain `node` environment will
fail with `document is not defined` — see [Testing Guide](./testing.md).

---

## Not required

- ❌ No CSS file to import — the service injects a single `<style>` tag for keyframes on first use.
- ❌ No framework adapter — the same class works everywhere.
- ❌ No polyfills for evergreen browsers (the build targets ES2019 syntax).
- ❌ No build step of your own — the package ships compiled JavaScript and `.d.ts` types.

---

**Next:** [Installation](./installation.md) · [Quick Start](./quick-start.md) · [Back to documentation index](./README.md)
