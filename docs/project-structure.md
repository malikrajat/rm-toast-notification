# Project Structure

```
rm-toast-notification/
├── .github/
│   └── workflows/
│       └── ci.yml              # install → format → lint → typecheck → test → build → publish
├── docs/                       # long-form documentation (this folder)
├── examples/                   # copy-paste usage scenarios
├── GITHUB_ACTIONS.md           # branch/tag policy for the CI workflow
├── src/
│   └── index.ts                # the entire library
├── tests/
│   ├── toast-notification.test.ts
│   └── sanitizers.test.ts
├── biome.json                  # formatter + linter configuration
├── CHANGELOG.md                # release history
├── LICENSE                     # MIT
├── README.md                   # landing page and API summary
├── copy-extra-files.js         # copies metadata files into dist/ after a build
├── package.json                # scripts, metadata, publish configuration
├── pnpm-lock.yaml              # exact dependency versions
├── pnpm-workspace.yaml
├── tsconfig.json               # strict TypeScript configuration
├── .editorconfig               # editor defaults (2-space indent, UTF-8, LF)
├── .npmignore                  # excludes nested package.json files from the tarball
└── .gitignore
```

---

## Directory by directory

### `src/`

The whole library lives in [`src/index.ts`](../src/index.ts):

- exported types (`ToastType`, `ToastPosition`, `ToastActionButton`, `ToastOptions`)
- constants (default colors, action button colors, animations, allowed protocols, dangerous CSS
  patterns)
- helper functions (`isSafeUrl`, `isSafeColor`, `sanitizeCss`, `sanitizeText`)
- the `ToastNotification` class
- the default export plus named exports

Keeping it in one file is deliberate: there is no internal module graph to navigate, and the
published build is a single ESM file with a single declaration file.

### `tests/`

Jest tests running in `jest-environment-jsdom`. They are TypeScript, compiled on the fly by
`ts-jest`, and they live outside `src/` so the build never emits them. Coverage is collected from
`src/**/*.ts` with a 90% gate on statements, branches, functions, and lines.

### `docs/`

Narrative documentation: prerequisites, installation, configuration, architecture, security,
accessibility, performance, testing, FAQ, troubleshooting, changelog policy, and contributing
guidance. Start at [`docs/README.md`](./README.md).

### `examples/`

Self-contained scenarios with full code you can paste into a project. Start at
[`examples/README.md`](../examples/README.md).

### `.github/workflows/ci.yml`

The continuous integration pipeline. It runs **only** for pushes to `main` and for `v*` tags whose
commit is contained in `main` — other branches never start a run. See
[GITHUB_ACTIONS.md](../GITHUB_ACTIONS.md) for the policy and how to change it.

Every allowed run executes:

1. `actions/checkout`
2. `pnpm/action-setup` with the pinned pnpm version
3. `actions/setup-node` with Node.js and pnpm caching
4. the `gate` job, which rejects any ref that is not `main` or a tag reachable from `main`
5. `pnpm install --frozen-lockfile`
6. `biome format` check
7. `biome lint`
8. `tsc --noEmit` type check
9. `jest --coverage` with the 90% gate and a coverage summary in the job summary
10. `pnpm run build` and `npm pack --dry-run` to list the files that would be published

Tagged releases (`v*`) additionally authenticate with `NPM_TOKEN` and publish to npm with
provenance.

The pipeline uploads **no artifacts** — build output, coverage reports, and tarballs stay inside the
workflow run and are regenerated locally with the commands above.

---

## Build and publish pipeline

```bash
pnpm run build
```

1. `tsc` compiles `src/index.ts` to `dist/index.js` plus `dist/index.d.ts` (CommonJS-targeted
   TypeScript, `declaration: true`, `strict: true`).
2. `copy-extra-files.js` copies `README.md`, `CHANGELOG.md`, `LICENSE`, `.npmignore`, and
   `.gitignore` into `dist/`.

Publishing uses the `files` allow-list in `package.json`, so only `dist/` plus the standard metadata
files end up in the tarball. Verify what would ship with:

```bash
pnpm run build
npm pack --dry-run
```

---

## What each file is for

| File | Purpose |
|---|---|
| `package.json` | Metadata, scripts, exports, publish config, dependency list |
| `tsconfig.json` | Strict TS settings; emits declarations; excludes tests and docs |
| `biome.json` | Formatting and lint rules for `src`, `tests`, and config files |
| `copy-extra-files.js` | Post-build copy step (ESM, runs on Node 20+) |
| `pnpm-lock.yaml` | Reproducible installs — CI uses `--frozen-lockfile` |
| `CHANGELOG.md` | Human-readable release history, mirrored in [Changelog and Versioning](./changelog.md) |
| `README.md` | Landing page, quick start, API summary, links into `docs/` and `examples/` |

---

## Where to add things

| You want to… | Edit |
|---|---|
| Change runtime behavior | `src/index.ts` |
| Add or change a unit test | `tests/` |
| Add a usage scenario | `examples/` |
| Explain a concept | `docs/` |
| Change scripts or dependencies | `package.json` |
| Change linting or formatting rules | `biome.json` |
| Change the CI pipeline | `.github/workflows/ci.yml` |
| Change which branches/tags may run CI | `.github/workflows/ci.yml` + [`GITHUB_ACTIONS.md`](../GITHUB_ACTIONS.md) |
| Record a release | `CHANGELOG.md` |

---

**Previous:** [Extending the Library](./extending.md) · **Next:** [Best Practices](./best-practices.md) · **See also:** [Contributing](./contributing.md) · [Back to documentation index](./README.md)
