# Examples

Copy-paste scenarios for `@codewithrajat/rm-toast-notification`, ordered from "hello world" to
"production patterns". Every example is complete enough to run; nothing is pseudocode.

| # | Example | What you will learn |
|---|---|---|
| 1 | [Basic usage](./01-basic.md) | Create a service, show a toast, change the essentials |
| 2 | [Async lifecycle](./02-async-lifecycle.md) | Wrap `fetch`/promises with loading → success/failure toasts |
| 3 | [Advanced options](./03-advanced.md) | Presets, wrappers, custom timers, stacking, ARIA setup |
| 4 | [Filtering and deduplication](./04-filtering-and-deduplication.md) | Throttle noise, dedupe identical messages, cap the visible stack |
| 5 | [Failure handling](./05-failure-handling.md) | Retryable errors, validation errors, offline queues, global handlers |
| 6 | [Custom styling](./06-custom-styling.md) | Brand colors, gradients, CSS overrides, dark mode, motion |
| 7 | [Action buttons and interactions](./07-action-buttons.md) | Retry, undo, dismiss-on-click, per-type action coloring |
| 8 | [Framework integration](./08-framework-integration.md) | React context, Angular service, Vue plugin, Svelte store |
| 9 | [SSR, teardown, and cleanup](./09-ssr-and-teardown.md) | Next.js/Nuxt/Angular Universal, route changes, app teardown |
| 10 | [Testing toasts](./10-testing.md) | Jest/Vitest setup, fake timers, interaction and SSR tests |

---

## Conventions

- Imports use the published package name. Inside this repository, import from `../src/index.ts`.
- TypeScript samples omit types when they are obvious; JavaScript users can drop them entirely.
- Where a snippet uses `console.log`, it stands in for your real handler.

## Shared mental model

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';

const toast = new ToastNotification();          // 1. one instance
toast.showToast({ type: 'success', body: 'Hi' }); // 2. render
toast.clearAll();                                // 3. clean up
```

That is the whole API surface you need for the basic cases. The rest of these examples are about
**where** the calls live and **how** you keep them sane.

---

[Back to project README](../README.md) · [Documentation index](../docs/README.md)
