# Troubleshooting

Each entry follows the same shape: **symptom → cause → fix**. If your case is not here, open an issue
with a minimal reproduction and the package version.

---

## Nothing appears when I call `showToast()`

**Cause 1 — no DOM.** In SSR, Node, or a Web Worker, `showToast()` returns `null` by design.

*Fix:* call it from browser-only code, or wrap it:

```ts
if (typeof document !== 'undefined' && document.body) {
  toast.showToast({ body: 'Rendered on the client' });
}
```

**Cause 2 — `document.body` was replaced.** Frameworks that re-render `<body>` (or tests that reset
`document.body.innerHTML`) remove the container. An existing instance keeps a reference to a node
that is no longer in the document.

*Fix:* create a new instance after the DOM is replaced, or keep the container:

```ts
document.body.innerHTML = ''; // container is gone
toast = new ToastNotification(); // reattaches
```

**Cause 3 — stacking context.** The container is `position: fixed; z-index: 9999`, but an ancestor
with `transform`, `filter`, `perspective`, or `will-change` can create a containing block that traps
it, and an element with a higher `z-index` can cover it.

*Fix:* check `document.getElementById('toast-container')` in DevTools and raise the z-index:

```css
#toast-container { z-index: 2147483647; }
```

---

## `document is not defined` during tests or SSR

**Cause:** the code runs in a Node environment with no DOM, and something calls into the library
before the guard.

*Fix (tests):* use `jest-environment-jsdom` (or Vitest's `environment: 'jsdom'`). *Fix (SSR):* only
call `showToast()` from client-side code. The constructor and `showToast()` themselves are guarded —
this error usually comes from code that reads or writes DOM around the call.

---

## The toast disappears immediately

**Cause 1 — a very short duration.** `duration: 100` closes after 100 ms.

**Cause 2 — a non-numeric duration.** Strings, `NaN`, and `Infinity` are treated as persistent, and
a value like `'3000'` is *not* coerced. If you store duration in an environment variable, convert it:

```ts
const duration = Number(import.meta.env.VITE_TOAST_DURATION ?? 3000);
```

**Cause 3 — a click closes it.** Any click on the toast body (excluding buttons) closes the toast.

---

## The toast never disappears

**Cause:** `duration` is `0`, negative, non-numeric, or the pointer is resting on the toast.

*Fix:* pass a positive number, and remember that hovering resets the timer to the full duration.

---

## The logo does not render

**Cause:** the URL did not pass `isSafeUrl` — for example `javascript:`, `blob:` in strict contexts, a
malformed value, or an empty string. Unsafe and empty logos are silently skipped so the toast still
shows.

*Fix:*

```ts
import { isSafeUrl } from '@codewithrajat/rm-toast-notification';

console.log(isSafeUrl(myLogo)); // debug the value
```

Relative paths (`/assets/logo.svg`) and `http(s)` URLs always work. `data:` URLs work if the value is
well formed.

---

## My custom color is ignored

**Cause:** `color` failed validation. Only `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb(...)`, and `rgba(...)`
are accepted. Named colors (`red`), `hsl()`, CSS variables, and anything with extra characters are
rejected and the type default is used instead.

*Fix:*

```ts
import { isSafeColor } from '@codewithrajat/rm-toast-notification';

const color = isSafeColor(candidate) ? candidate : undefined;
```

If you need a CSS variable, set it on the toast element after creation:

```ts
const element = toast.showToast({ body: 'Themed' });
element?.style.setProperty('background-color', 'var(--brand)');
```

---

## Inline styles inside `body` are stripped

**Cause:** intended behavior. `style`, `class`, and `id` are forbidden in body HTML to prevent CSS
injection.

*Fix:* move presentation to your stylesheet and target `.toast`, `.toast-<type>`, or your own
wrapper class applied to the toast element after creation:

```ts
const element = toast.showToast({ body: 'Hello' });
element?.classList.add('my-toast');
```

---

## The action button does not appear

**Cause:** both `text` and `onClick` are required. `{ onClick }` alone, `{ text: '' }`, or a
non-function `onClick` results in no button.

*Fix:*

```ts
actionButton: { text: 'Retry', onClick: () => retry() }
```

---

## Two containers exist in the DOM

**Cause 1 — two copies of the library.** Different versions or duplicated bundles each create their
own module scope, so the id-based reuse fails.

*Fix:* dedupe the dependency in your bundler (`resolve.dedupe` in Vite, `resolutions` in
package.json, or a single lockfile entry).

**Cause 2 — the container was removed and a new instance created while the old one still existed.**

*Fix:* keep one instance per application and call `clearAll()` instead of `destroy()` when you only
want to clear messages.

---

## Toasts appear in the wrong corner

**Cause:** the container is shared, so the most recent `position` call re-anchors it for every toast
currently on screen. Toasts created earlier keep their own animation direction, which can look
inconsistent.

*Fix:* use one position per application, or pass the same position everywhere in your wrapper.

---

## Animations do not play

**Cause 1 — `animation: false`.**

**Cause 2 — the keyframes were removed.** If something strips the injected `<style>` element from
`document.head`, animation names no longer resolve.

**Cause 3 — reduced motion CSS.** A `prefers-reduced-motion: reduce` rule with `animation: none` has
priority.

*Fix:* pass `animation: true`, check `document.head.querySelector('style')`, and check your media
queries.

---

## Hover pauses the timer forever

**Cause:** `mouseout` never fired — the window lost focus while the pointer was over the toast, or a
child element was removed during the hover.

*Fix:* most cases resolve when the pointer moves again. For critical messages use `duration: 0` with
an explicit close or action button instead of relying on hover timing.

---

## TypeScript cannot find the types

**Cause:** the package resolves but `types`/`moduleResolution` settings point elsewhere, or you are
importing a deep path that does not exist.

*Fix:* import from the package root only, and use a modern resolution mode:

```jsonc
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2020", "DOM"]
  }
}
```

Missing `DOM` in `lib` produces errors about `MouseEvent` and `HTMLDivElement`.

---

## `pnpm install` fails on an older Node version

**Cause:** `engines` requires Node `>= 20.19.0`.

*Fix:* upgrade Node (`nvm install 20 && nvm use 20`, or `fnm`) or, for consumers only, use a package
manager that ignores engine hints — the runtime code itself works on Node 18 as well.

---

## Coverage drops below 90%

**Cause:** a new branch in `src/index.ts` has no test.

*Fix:* run `pnpm run test:coverage`, open `coverage/lcov-report/index.html`, and add tests for the
uncovered lines. Unreachable-by-design branches (the second half of the SSR guard in
`injectStyles`) are documented; everything else is expected to be exercised.

---

## Still stuck?

1. Reproduce with the [StackBlitz playground](https://stackblitz.com/edit/vitejs-vite-22yb4jvh).
2. Search [existing issues](https://github.com/malikrajat/rm-toast-notification/issues).
3. Open a new issue with: package version, browser/Node version, a minimal reproduction, expected
   vs. actual behavior, and a screenshot if the problem is visual.

---

**Previous:** [FAQ](./faq.md) · **Next:** [Changelog and Versioning](./changelog.md) · **See also:** [Browser Support](./browser-support.md) · [Back to documentation index](./README.md)
