# API Reference

Complete reference for the public surface of `@codewithrajat/rm-toast-notification`.

```ts
import ToastNotification, {
  isSafeColor,
  isSafeUrl,
  sanitizeCss,
  sanitizeText,
} from '@codewithrajat/rm-toast-notification';

import type {
  ToastActionButton,
  ToastOptions,
  ToastPosition,
  ToastType,
} from '@codewithrajat/rm-toast-notification';
```

There is one default export (the class), four named runtime exports (sanitization helpers), and four
named type exports that erase at compile time.

---

## The ToastNotification class

### Constructor

```ts
new ToastNotification();
```

Creates the service. On construction it:

1. Reuses `<div id="toast-container">` if it already exists in the document.
2. Otherwise creates it as a `fixed`, `z-index: 9999`, 500px-wide (max 100%) element and appends it
   to `document.body`.
3. Injects the keyframe `<style>` element once per document.

In a non-DOM environment (SSR, Node, Web Worker) the constructor returns immediately without
touching the DOM. `showToast()` then returns `null` and `destroy()` is a no-op.

### Public fields

| Field | Type | Description |
|---|---|---|
| `container` | `HTMLDivElement \| null` | The shared container element, or `null` when no DOM was available or after `destroy()`. |
| `toasts` | `HTMLDivElement[]` | Active toast elements. An element stays in this array during its 300 ms exit animation. |

### `showToast(options?: ToastOptions): HTMLDivElement \| null`

Renders a toast and returns its element. Returns `null` when there is no DOM, no `document.body`, or
the instance has been destroyed. All options are validated; invalid values fall back to defaults
instead of throwing.

```ts
const element = toast.showToast({
  type: 'warning',
  position: 'bottom-left',
  duration: 5000,
  header: 'Heads up',
  body: 'Your session expires in 5 minutes.',
  footer: 'Save your work',
  logo: '/assets/warning.svg',
  color: '#f59e0b',
  animation: true,
  onClick: () => console.log('toast clicked'),
  actionButton: { text: 'Stay signed in', onClick: () => renewSession() },
});
```

### `closeToast(toast: HTMLDivElement): void`

Closes one toast: applies `transform: scale(0.9)` and `opacity: 0`, then removes the node after
300 ms. It is **idempotent** — calling it twice, or calling it with an element that is not in the
container, does nothing. A toast marked closed gets `data-closed="true"`.

```ts
if (element) toast.closeToast(element);
```

### `clearAll(): void`

Closes every active toast. The container is kept, so the next `showToast()` call is instant. Removal
happens asynchronously after the exit animation; `toasts` is emptied as each node leaves the DOM.

### `destroy(): void`

Closes all toasts, removes the container from the DOM, resets `toasts` to `[]`, and sets
`container` to `null`. Use it on SPA route changes or application teardown. Because the container is
shared, `destroy()` affects toasts created by any other instance in the same document.

### `isItHtml(str: string): boolean`

Returns `true` when the string parses into at least one element node. Useful for deciding whether a
message should be passed to a text-only field (`header`, `footer`) or to `body`.

```ts
toast.isItHtml('<strong>Hi</strong>'); // true
toast.isItHtml('Hello world'); // false
toast.isItHtml(''); // false
```

### `getColor(type: string): string`

Default background color for a toast type. Unknown types return the `info` color (`#0096FF`).

### `getAnimation(position: string): string`

CSS animation shorthand for a position. Unknown positions return the `top-right` animation.

### `getActionButtonColor(type: string): string`

Default action button color for a toast type. Unknown types return the `info` button color
(`#007bff`).

---

## Exported utility functions

These are the same helpers the library uses internally. They are pure, side-effect free, and safe to
reuse for your own markup.

### `sanitizeText(value: unknown): string`

Coerces any value to a string, mapping `null` and `undefined` to `''`. Intended for values that will
be assigned with `textContent`.

```ts
sanitizeText(undefined); // ''
sanitizeText(42); // '42'
```

### `sanitizeCss(css: string): string`

Strips dangerous CSS constructs: `expression()`, `url(javascript:…)`, `url(vbscript:…)`,
`url(data:text/html…)`, `@import`, `behavior:`, `-moz-binding`, and bare `javascript:` / `vbscript:`
payloads. `url()` values are dropped unless they are `http(s)` or relative URLs. Returns `''` for
non-strings and trims the result.

```ts
sanitizeCss('color: red'); // 'color: red'
sanitizeCss('background: url(javascript:alert(1))'); // ''
sanitizeCss('background: url(/img/bg.png)'); // 'background: url(/img/bg.png)'
```

### `isSafeColor(color: string): boolean`

Validates hex (`#rgb`, `#rrggbb`, `#rrggbbaa`) and `rgb()` / `rgba()` values. Everything else —
including named colors, `hsl()`, `var(--x)`, and injection attempts — returns `false`.

```ts
isSafeColor('#fff'); // true
isSafeColor('rgba(0,0,0,.5)'); // true
isSafeColor('red'); // false
isSafeColor('red; background:url(x)'); // false
```

### `isSafeUrl(url: string): boolean`

Allows `http:`, `https:`, `data:`, and relative URLs. Anything else (`javascript:`, `vbscript:`,
`file:`, malformed input) returns `false`.

```ts
isSafeUrl('/assets/logo.svg'); // true
isSafeUrl('https://cdn.example.com/a.png'); // true
isSafeUrl('javascript:alert(1)'); // false
```

---

## Exported types

| Type | Definition |
|---|---|
| `ToastType` | `'success' \| 'error' \| 'warning' \| 'info'` |
| `ToastPosition` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` |
| `ToastActionButton` | `{ text: string; onClick: (event: MouseEvent) => void }` |
| `ToastOptions` | All toast options — see [Configuration](./configuration.md) |

---

## Error handling contract

The library does not throw for bad input:

| Input | Behavior |
|---|---|
| Unknown `type` | Falls back to `info` colors and classes |
| Unknown `position` | Falls back to `top-right` |
| Unparseable `color` | Default type color is used |
| Unsafe `logo` | Logo is not rendered; the toast still shows |
| `actionButton` without `text` or `onClick` | Button is not rendered |
| `showToast()` in a non-DOM environment | Returns `null` |
| `closeToast()` with a foreign or missing element | No-op |

Guard rails like these mean you can pass user-influenced configuration without wrapping every call
in `try/catch`.

---

**Previous:** [Advanced Configuration](./advanced-configuration.md) · **Next:** [Framework Integration](./frameworks.md) · **See also:** [Security](./security.md) · [Back to documentation index](./README.md)
