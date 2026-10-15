# Accessibility

Toast notifications are easy to get wrong for assistive technology: they appear and disappear without
user action, and they usually sit outside the normal reading order. This page describes what the
library does, what it does not do, and the small amount of code that closes the gap.

---

## What is built in

| Feature | Implementation |
|---|---|
| Semantic close control | A real `<button type="button">` with `aria-label="Close notification"` |
| Keyboard operable close | The close button is focusable and activates with Enter/Space (native button behavior) |
| Decorative logo | The logo `<img>` always carries `alt="logo"` and `draggable="false"` |
| No layout trap | The container is `position: fixed`, so it does not shift document flow |
| Motion opt-out | `animation: false` disables slide-in movement |
| Readable defaults | Default type colors keep at least AA contrast against black body text (the red `error` color is the tightest at roughly 4.6:1) |

---

## What is not built in

| Gap | Why | How to close it |
|---|---|---|
| `role="status"` / `aria-live` region | The container is created by the library and the correct politeness level is an application decision | Set it once after constructing the service (below) |
| `role="alert"` for errors | Same reason — urgency is context-dependent | Use an assertive region for error toasts |
| Escape-to-dismiss | The toast is not a dialog and does not capture focus | Add a `keydown` listener on the returned element |
| Focus management | Toasts must never steal focus | Nothing to do — the library never calls `focus()` |
| Automatic reduced-motion detection | Requires `matchMedia`, which is an application concern | Pass `animation: !prefersReducedMotion` |

---

## Recommended setup

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';

const toast = new ToastNotification();

// Announce politely; messages are read when the user is idle.
toast.container?.setAttribute('role', 'status');
toast.container?.setAttribute('aria-live', 'polite');
toast.container?.setAttribute('aria-atomic', 'false');

const prefersReducedMotion =
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function announce(body: string) {
  return toast.showToast({
    type: 'info',
    body,
    animation: !prefersReducedMotion,
  });
}

export function announceError(body: string) {
  // Errors interrupt: flip the politeness level for as long as the error is on screen.
  toast.container?.setAttribute('aria-live', 'assertive');
  const element = toast.showToast({ type: 'error', body, animation: !prefersReducedMotion });
  if (element) {
    element.addEventListener('click', () => toast.container?.setAttribute('aria-live', 'polite'));
  }
  return element;
}
```

### Escape to dismiss

```ts
const element = toast.showToast({ type: 'warning', body: 'Press Escape to dismiss', duration: 0 });

if (element) {
  element.tabIndex = 0; // make the toast reachable by keyboard
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') toast.closeToast(element);
  });
}
```

---

## Color and contrast guidance

The library sets a background color and leaves text color to your stylesheet, so the rendered text is
usually the page's default (black in light themes, white in dark themes). Two consequences:

- In a **dark theme**, inheriting white text on `warning` (`#ffc107`) fails contrast. Set an explicit
  text color for that type:

```css
.toast-warning { color: #1f2937; }
```

- In a **light theme**, the default `error` red is right at the AA boundary. Darkening it slightly
  improves readability:

```css
.toast-error { background-color: #b91c1c; color: #fff; }
```

Because inline styles win, use an id-qualified selector to override the background:

```css
#toast-container .toast-error { background-color: #b91c1c; }
```

---

## Motion

```css
@media (prefers-reduced-motion: reduce) {
  .toast {
    animation: none !important;
    transition: none !important;
  }
}
```

This keeps `animation: true` in your call sites while respecting the user's system setting. The
0.3 s exit fade is also disabled by `transition: none`, but the 300 ms removal delay stays — the
toast disappears immediately rather than animating out.

---

## Touch and small screens

- Touch devices do not fire `mouseover`, so auto-dismiss is never paused by touch; keep durations
  long enough to read.
- The close button is 20 px of glyph inside a small hit area. For mobile-heavy applications,
  enlarge it:

```css
#toast-container button[aria-label='Close notification'] {
  font-size: 24px;
  padding: 8px;
  line-height: 1;
}
```

- The container is capped at `max-width: 100%`, so it never forces horizontal scrolling.

---

## Checklist for a compliant toast system

- [ ] Container has `role="status"` and `aria-live="polite"`.
- [ ] Errors use `aria-live="assertive"` (or a separate alert region).
- [ ] Messages are short and self-contained; no "click here" without context.
- [ ] Critical errors use `duration: 0` so they are not missed.
- [ ] Action buttons have descriptive labels ("Retry upload", not "OK").
- [ ] Reduced motion is respected.
- [ ] Text contrast passes AA against the toast background.
- [ ] Toasts never steal focus and never block the rest of the page.

---

**Previous:** [Security](./security.md) · **Next:** [Performance Optimization](./performance-optimization.md) · **See also:** [Best Practices](./best-practices.md) · [Back to documentation index](./README.md)
