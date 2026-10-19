# rm-toast-notification Documentation

Welcome to the documentation for **`@codewithrajat/rm-toast-notification`** — a lightweight,
framework-agnostic, TypeScript-first toast notification service for the web.

This folder is the long-form companion to the [project README](../README.md). If you only have
thirty seconds, start with [Quick Start](./quick-start.md); if you are evaluating the library for
production, read [Architecture](./architecture.md) and [Performance Optimization](./performance-optimization.md).

---

## Navigate the documentation

### Getting started

| Guide | What it covers |
|---|---|
| [Prerequisites](./prerequisites.md) | Runtime, tooling, and environment requirements before you install |
| [Installation](./installation.md) | npm, pnpm, yarn, CDN/ESM usage, and TypeScript setup |
| [Quick Start](./quick-start.md) | The smallest possible working example, then the first five things you will want to change |

### Reference

| Guide | What it covers |
|---|---|
| [Configuration](./configuration.md) | Every option, its type, default value, and behavior |
| [Advanced Configuration](./advanced-configuration.md) | Shared defaults, wrapper services, theming, reduced motion, and diagnostics |
| [API Reference](./api-reference.md) | Classes, methods, exported types, and exported utility functions |
| [Framework Integration](./frameworks.md) | Vanilla JS, TypeScript, React, Angular, Vue, and Svelte |
| [Browser Support](./browser-support.md) | Supported browsers, required web platform features, and legacy notes |

### Concepts and internals

| Guide | What it covers |
|---|---|
| [Architecture](./architecture.md) | How the service, container, timers, and rendering pipeline fit together |
| [Extending the Library](./extending.md) | Subclassing, wrapping, adding toast types, and shipping your own build |
| [Project Structure](./project-structure.md) | Folder-by-folder map of the repository and the publish pipeline |

### Quality, security, and operations

| Guide | What it covers |
|---|---|
| [Security](./security.md) | XSS, CSS injection, URL and color validation, and the sanitization pipeline |
| [Accessibility](./accessibility.md) | Keyboard, screen reader, and reduced-motion guidance |
| [Performance Optimization](./performance-optimization.md) | Bundle size, timer strategy, DOM reuse, and high-frequency toasts |
| [Best Practices](./best-practices.md) | Opinionated rules for real applications |
| [Testing Guide](./testing.md) | How to test toasts in Jest, Vitest, and jsdom, and how this repo hits 90% coverage |

### Help

| Guide | What it covers |
|---|---|
| [FAQ](./faq.md) | Short answers to the questions that come up most often |
| [Troubleshooting](./troubleshooting.md) | Symptom → cause → fix for real-world failures |
| [Changelog and Versioning](./changelog.md) | SemVer policy and how releases are documented |
| [Contributing](./contributing.md) | Local setup, quality gates, and the pull request checklist |

---

## Examples

Runnable, copy-paste-friendly scenarios live in the [examples folder](../examples/README.md):

- [Basic usage](../examples/01-basic.md)
- [Async lifecycle](../examples/02-async-lifecycle.md)
- [Advanced options](../examples/03-advanced.md)
- [Filtering, deduplication, and queueing](../examples/04-filtering-and-deduplication.md)
- [Failure and error handling](../examples/05-failure-handling.md)
- [Custom styling and branding](../examples/06-custom-styling.md)
- [Action buttons and interactions](../examples/07-action-buttons.md)
- [Framework integration](../examples/08-framework-integration.md)
- [SSR, teardown, and cleanup](../examples/09-ssr-and-teardown.md)
- [Testing toasts](../examples/10-testing.md)

---

## Documentation conventions

- **`duration: 0`** (or any negative number) means *persistent*. A missing or `null` duration
  falls back to the default of `3000` ms.
- Code samples are written in TypeScript unless the title says JavaScript. The same calls work in
  plain JavaScript — just drop the type annotations.
- Import paths in samples use the published package name. When working inside this repository,
  import from `../src/index.ts` instead.
- Every behavior described here is covered by the test suite in [`tests/`](../tests). If you find a
  mismatch, the test suite is the source of truth — and a bug report is very welcome.

---

[Back to project README](../README.md)
