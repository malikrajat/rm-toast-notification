# Advanced Configuration

The public API is deliberately small: one class, one options object. That is enough for most
applications, and it composes cleanly when you need more. This page covers the patterns that hold up
in production codebases and the internal behaviors you will eventually run into.

---

## 1. A typed preset layer

Instead of repeating options at every call site, define presets once and merge them per call:

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';
import type { ToastOptions, ToastType } from '@codewithrajat/rm-toast-notification';

const toast = new ToastNotification();

const presets = {
  success: { type: 'success', position: 'bottom-right', duration: 2500 },
  error:   { type: 'error',   position: 'top-right',    duration: 0 },
  warning: { type: 'warning', position: 'top-right',    duration: 6000 },
  info:    { type: 'info',    position: 'top-right',    duration: 4000 },
} satisfies Record<ToastType, ToastOptions>;

export function notify(type: ToastType, options: ToastOptions = {}) {
  return toast.showToast({ ...presets[type], ...options });
}
```

Because `presets` is typed as `Record<ToastType, ToastOptions>`, adding a toast type to the union
later becomes a compile-time error until every preset is defined.

---

## 2. A service wrapper (recommended for apps)

Wrapping the class keeps application code free of library details and gives you a single seam to
test, mock, or replace:

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';
import type { ToastOptions } from '@codewithrajat/rm-toast-notification';

export class Notifications {
  private readonly toast = new ToastNotification();
  private readonly brand = { color: '#6366f1', logo: '/assets/logo.svg' };

  success(body: string, options: ToastOptions = {}) {
    return this.toast.showToast({ type: 'success', body, ...this.brand, ...options });
  }

  failure(body: string, retry?: () => void) {
    return this.toast.showToast({
      type: 'error',
      header: 'Something went wrong',
      body,
      duration: 0,
      actionButton: retry ? { text: 'Retry', onClick: retry } : undefined,
    });
  }

  clear() {
    this.toast.clearAll();
  }
}
```

This is also the cleanest way to plug the library into Angular DI, a React context, or a Vue
plugin — see [Framework Integration](./frameworks.md).

---

## 3. One container, many callers

The container is looked up by id and reused, so multiple instances do not duplicate DOM:

```ts
const a = new ToastNotification();
const b = new ToastNotification();

console.log(a.container === b.container); // true
```

Consequences worth knowing:

- Every instance renders into the same container, so `position` is effectively last-write-wins for
  the container anchor. Each toast still receives the animation direction of its own position.
- `destroy()` removes the shared container and clears every toast in it, including toasts created
  by other instances.
- The keyframe `<style>` element is injected once per document, no matter how many instances exist.
- If a framework re-renders `document.body` and removes the container, existing instances keep a
  detached reference. Create a new instance to reattach.

---

## 4. Theming without inline styles

Inline `style`, `class`, and `id` attributes inside `body` HTML are stripped by design, so theming
belongs in CSS:

```css
/* your app stylesheet */
#toast-container {
  width: 420px;
}

.toast {
  font-family: Inter, system-ui, sans-serif;
  border-left: 4px solid rgba(255, 255, 255, 0.6);
}

.toast-success { background-image: linear-gradient(135deg, #16a34a, #22c55e); }
.toast-error   { background-image: linear-gradient(135deg, #dc2626, #ef4444); }
.toast-warning { color: #1f2937; }
.toast-info    { background-image: linear-gradient(135deg, #2563eb, #38bdf8); }
```

`showToast()` writes to `element.style`, so it wins over stylesheet `.toast` rules of equal
specificity. To hard-override a value, use an id-qualified rule such as
`#toast-container .toast { background-image: none; }`.

---

## 5. Reduced motion

The library does not read `prefers-reduced-motion` on your behalf — that decision belongs to your
application. Two clean options:

```ts
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

toast.showToast({ body: 'Saved', animation: !prefersReducedMotion });
```

```css
/* Or keep animation: true and neutralise it globally */
@media (prefers-reduced-motion: reduce) {
  .toast {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## 6. Announce toasts to screen readers

Toasts are not wrapped in an `aria-live` region. Add one to the shared container once the instance
exists:

```ts
const toast = new ToastNotification();

toast.container?.setAttribute('aria-live', 'polite');
toast.container?.setAttribute('aria-atomic', 'false');
toast.container?.setAttribute('role', 'status');
```

Use `'assertive'` for error toasts in applications where the message must interrupt. See
[Accessibility](./accessibility.md) for the full picture.

---

## 7. Grouping and stacking strategy

All toasts in one position stack in insertion order inside the same container. You control the
order and the density:

```ts
// newest on top, container anchored top-right
toast.container?.style.setProperty('flex-direction', 'column-reverse');

// cap the visible stack yourself
const MAX_VISIBLE = 4;
if (toast.toasts.length >= MAX_VISIBLE) {
  toast.closeToast(toast.toasts[0]); // close the oldest
}
```

`closeToast()` finishes its 300 ms exit animation before removing the node, so `toast.toasts` can
still contain an element that is already closing. Check `element.dataset.closed === 'true'` when
you need to know whether a toast is already on its way out.

---

## 8. Custom timers and pausing

Auto-dismiss is a single `setTimeout` per toast:

- `mouseover` on the toast clears the timer (pause).
- `mouseout` restarts it with the **full** configured duration.
- `relatedTarget` checks prevent child-element churn from restarting the timer repeatedly.

If you need a visible countdown or a pause button, drive it from your own timer and pass
`duration: 0`, then call `closeToast(element)` yourself:

```ts
const element = toast.showToast({ body: 'Uploading…', duration: 0 });
// later
if (element) toast.closeToast(element);
```

---

## 9. Diagnostics in development

```ts
if (import.meta.env.DEV) {
  console.debug('[toast] active toasts:', toast.toasts.length);
}
```

There is no logging, telemetry, or global error hook inside the library — nothing is written to the
console, and no timers survive a `destroy()` beyond the pending 300 ms removal callbacks.

---

## 10. Where the library intentionally stops

To keep the bundle small and the API predictable, these are out of scope. Use the wrapper layer for
them:

| Not built in | Recommended approach |
|---|---|
| Queueing / rate limiting | Filter before calling `showToast()` — see [Filtering and deduplication](../examples/04-filtering-and-deduplication.md) |
| Progress bars | Pass `duration: 0` and manage the DOM yourself |
| Promise helpers such as `toast.promise(...)` | Compose `success` / `failure` calls in your wrapper |
| Framework components | Render your own component and let the toast carry a short message |
| Sounds / haptics | Call `navigator.vibrate` or play audio from wrapper code |

---

**Previous:** [Configuration](./configuration.md) · **Next:** [API Reference](./api-reference.md) · **See also:** [Extending the Library](./extending.md) · [Back to documentation index](./README.md)
