# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



---

## [Unreleased]

### Added
- Documentation set under [`docs/`](./docs/README.md): prerequisites, installation, quick start,
  configuration, advanced configuration, API reference, framework integration, browser support,
  architecture, security, accessibility, performance optimization, best practices, testing,
  extending, project structure, changelog policy, contributing, FAQ, and troubleshooting.
- Examples set under [`examples/`](./examples/README.md): basic usage, async lifecycle, advanced
  composition, filtering/deduplication/queueing, failure handling, custom styling, action buttons,
  framework integration, SSR/teardown, and testing.
- README index links to every documentation page and example.
- Biome as the formatter and linter, replacing ESLint, with `format`, `format:check`, `lint`,
  `lint:fix`, `check`, `check:fix`, `check:ci`, and `typecheck` scripts.
- Jest unit test suite running in `jest-environment-jsdom`, with a 90% coverage gate on statements,
  branches, functions, and lines, plus `test:watch` and `test:coverage` scripts.
- GitHub Actions workflow covering install, format check, lint, type check, unit tests with coverage
  (Node 20 and 22), build, tarball verification, and tag-based npm publishing with provenance. The
  workflow stores no artifacts.
- Branch policy for CI: the workflow runs only on pushes to `main` and on `v*` tags whose commit is
  contained in `main`. A `gate` job rejects any other ref, pull request runs are disabled, and
  [GITHUB_ACTIONS.md](./GITHUB_ACTIONS.md) documents how to allow additional branches or tags.
- Exported `ToastType`, `ToastPosition`, `ToastActionButton`, and `ToastOptions` types for consumers
  writing their own wrappers.
- Exported `sanitizeText`, `sanitizeCss`, `isSafeColor`, and `isSafeUrl` helpers so applications can
  reuse the library's validation rules.
- `files` allow-list in `package.json` so the published tarball only contains `dist/` and metadata.

### Changed
- `fs-extra` moved from `dependencies` to `devDependencies`; it is only used by the build script.
- `destroy()` now clears the instance's container reference, and `closeToast()` tolerates a missing
  container instead of assuming one exists.

### Fixed
- Constructing `ToastNotification` without a `document` (SSR/Node) no longer throws a
  `ReferenceError`; the instance is created without touching the DOM and `showToast()` returns
  `null`.

---

## [1.0.0] - 2026-08-03

### Added
- Initial release of `@codewithrajat/rm-toast-notification`.
- Framework-agnostic, dependency-light toast notification service for JavaScript and TypeScript.
- `ToastNotification` class with `showToast`, `closeToast`, `clearAll`, and `destroy` methods.
- Four toast types: `success`, `error`, `warning`, and `info`.
- Four positions: `top-left`, `top-right`, `bottom-left`, and `bottom-right`.
- Auto-dismiss with configurable `duration` (set `0` for persistent toasts).
- Pause on hover while the toast is active.
- Optional `header`, `footer`, `logo`, and custom `color` support.
- Optional action button with a click handler.
- `onClick` handler for the toast element.
- Toggleable slide-in/out `animation`.
- Safe HTML body rendering via DOMPurify.
- Protection against CSS injection (stripped inline styles, blocked `expression()`, `url(javascript:...)`, and `@import`).
- Validated logo URLs (safe schemes only) and restricted custom color formats.
- Accessibility-friendly close button with `aria-label`.
- SSR-safe guards against missing `document` access.
- Full TypeScript typings and zero side effects for tree-shaking.
- Works with vanilla JavaScript, React, Angular, Vue, and Svelte.

---

[1.0.0]: https://github.com/malikrajat/rm-toast-notification/releases/tag/v1.0.0

## Previous Versions

For changelog entries prior to v1.0.0, please refer to the [GitHub Releases](https://github.com/malikrajat/rm-toast-notification/releases) page.
