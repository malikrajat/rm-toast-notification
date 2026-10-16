# Architecture

The library is a single TypeScript module (`src/index.ts`) that compiles to one ESM file. There is no
framework runtime, no virtual DOM, and no global state beyond one shared DOM container and one
injected `<style>` element.

---

## High-level view

```
        caller code
             |
             |  new ToastNotification()
             v
   +----------------------+        reuse or create
   |  ToastNotification   | ----------------------->  <div id="toast-container">  (document.body)
   |  (per-caller object) |                                    ^
   |                      |                                    | append
   |  showToast(options)  | -----------------------------------+
   +----------------------+
             |
             |- validate type / position
             |- validate + sanitize inputs (color, logo, body HTML)
             |- build DOM: logo column + content column + close button
             |- wire listeners: click, hover/pause, close, action button
             +- set one setTimeout for auto-dismiss
```

Two layers exist:

| Layer | Responsibility |
|---|---|
| `ToastNotification` instance | Validates input, builds DOM, owns timers for its own toasts, tracks `toasts[]` |
| Module-level state | The `<style>` injection flag and the container id used to find/reuse the container |

Everything else is made of pure helper functions (`isSafeUrl`, `isSafeColor`, `sanitizeCss`,
`sanitizeText`) that are exported for reuse.

---

## Lifecycle of a toast

1. **Validate** — `type` and `position` are checked against whitelists; unknown values fall back to
   `info` and `top-right`. `duration` is normalised: `null`/`undefined` becomes `3000`, positive
   numbers are kept, everything else becomes `0` (persistent).
2. **Sanitize** — `header`, `footer`, and `logo` are coerced to strings with `sanitizeText`. `color`
   passes `isSafeColor` or is dropped. `logo` passes `isSafeUrl` or is not rendered. `body` goes
   through DOMPurify plus a CSS scrub.
3. **Build** — a `div.toast.toast-<type>` is created with inline layout styles, a logo column, a
   content column (header, body, optional action button, footer), and a close button. The
   per-position slide-in animation is applied unless `animation: false`.
4. **Attach** — the container is anchored on the axis implied by `position` (`top`/`bottom`,
   `left`/`right`) and the toast is appended. The element is pushed onto `this.toasts`.
5. **Arm the timer** — a single `setTimeout` is scheduled when `duration > 0`.
6. **Pause / resume** — `mouseover` clears the timer, `mouseout` re-arms it with the full duration.
   `relatedTarget` checks ensure child elements do not trigger restart storms.
7. **Close** — the close button, a click on the toast (excluding buttons), the timer, `closeToast()`,
   `clearAll()`, or `destroy()` all funnel into `closeToast()`. It marks the element with
   `data-closed="true"`, applies a 0.9-scale fade, and removes the node 300 ms later.

The `data-closed` marker makes the close path idempotent: double clicks, a timer firing while the
user hovers, and `clearAll()` racing with a manual close all produce one removal.

---

## Why a shared container

Creating a container per instance would produce duplicate `#toast-container` elements, broken
stacking order, and duplicated style injection. Instead the constructor looks the element up by id
and only creates one when it is missing:

```ts
const existing = document.getElementById(ToastNotification.containerId);
this.container = existing instanceof HTMLDivElement ? existing : createAndAppendContainer();
```

The trade-off is that all instances share stacking and anchoring. That keeps the DOM small and the
behavior predictable for the common case (one service per app), while still allowing multiple
instances to be created freely.

---

## Timer model

| Aspect | Design choice | Consequence |
|---|---|---|
| One timer per toast | `setTimeout` captured in the `showToast` closure | Cheap; no global ticker |
| Pause on hover | `clearTimeout` on `mouseover` | Users can read long messages |
| Resume on leave | Restart with the full duration | Does not resume mid-count |
| `duration: 0` | No timer is created at all | Persistent toasts cost nothing |
| Exit animation | Fixed 300 ms `setTimeout` per close | `toasts[]` drains asynchronously |

Because the timer lives in the closure and the element carries `data-closed`, there is no shared
timer registry to leak. Once a toast is removed, nothing references it.

---

## Styling model

The library ships **no CSS file**. Instead:

1. A `<style>` element with four `@keyframes` rules is appended to `document.head` on first
   construction (`slideInFromLeft`, `slideInFromRight`, `slideOutToLeft`, `slideOutToRight`).
2. All component styles are written inline on the created elements.

Pros: zero setup, nothing to import, works in most applications.
Cons: inline styles outrank stylesheet rules, so overrides need extra specificity or `!important` —
see [Advanced Configuration](./advanced-configuration.md).

---

## Security boundary

The only untrusted input that can reach `innerHTML` is `body`, and it passes through DOMPurify with
a restrictive profile. Everything else is inserted through `textContent`, validated by a whitelist,
or validated by a regular expression. See [Security](./security.md) for details and the threat model.

---

## Extension points

| Need | Approach |
|---|---|
| Different defaults | Subclass or wrap the class |
| New toast type | Extend the union, the color maps, and `validateType` — see [Extending the Library](./extending.md) |
| Queueing / deduplication | Filter before calling `showToast()` |
| Custom markup | Build your own element and append it to `toast.container` |
| Reusing the sanitizers | Import `sanitizeCss`, `sanitizeText`, `isSafeColor`, `isSafeUrl` |

---

**Previous:** [Browser Support](./browser-support.md) · **Next:** [Security](./security.md) · **See also:** [Project Structure](./project-structure.md) · [Back to documentation index](./README.md)
