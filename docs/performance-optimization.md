# Performance Optimization

Toasts are a small part of an application's performance budget, but they are usually triggered on
the slow paths — errors, retries, and background syncs. Keeping them cheap matters at scale.

---

## What the library already does well

| Optimization | Detail |
|---|---|
| Tiny surface | One module, one class, four helpers, no framework runtime |
| Single container | Reused by id instead of one container per instance |
| Single style injection | Keyframes are added once per document, guarded by a static flag |
| No global ticker | One `setTimeout` per toast, and none at all when `duration` is 0 |
| Tree-shakable | `sideEffects: false`, ESM output, named exports |
| No polling, no observers | No `MutationObserver`, `setInterval`, or `requestAnimationFrame` loops |
| Idempotent close | Duplicate close calls cannot queue extra removals |

---

## Bundle size guidance

The library itself is a few kilobytes of JavaScript. The larger cost is
[DOMPurify](https://www.npmjs.com/package/dompurify), the single runtime dependency used to sanitize
`body` HTML. Two practical consequences:

1. **Import once.** Always import from the package root; do not hand-copy `src/index.ts` into your
   app, because that bypasses tree-shaking and the published build.
2. **Use plain text when you can.** If you never pass HTML, you still pay for DOMPurify — it is
   imported unconditionally. See [Extending the Library](./extending.md) if you want a build without
   HTML support.

Measure with your own bundler:

```bash
npx vite build --mode production
npx source-map-explorer dist/assets/*.js
```

---

## Keep the instance long-lived

```ts
// Good: one instance, created once
export const toast = new ToastNotification();
```

```ts
// Avoid: a new instance per call
function notify(body: string) {
  return new ToastNotification().showToast({ body });
}
```

Each construction performs a `getElementById` lookup. That is cheap, but creating instances inside
render loops or event handlers is unnecessary work and makes teardown harder to reason about.

---

## High-frequency toasts

The library has no queue and no rate limiting by design, so N calls produce N DOM nodes and N
timers. At high frequency, throttle yourself:

```ts
const recent = new Map<string, number>();

function notifyOnce(key: string, body: string, cooldownMs = 3000) {
  const last = recent.get(key) ?? 0;
  const now = Date.now();
  if (now - last < cooldownMs) return null;
  recent.set(key, now);
  return toast.showToast({ body, duration: cooldownMs });
}
```

See [Filtering and deduplication](../examples/04-filtering-and-deduplication.md) for a fuller version
that also caps the visible stack.

---

## Long lists and background jobs

- Prefer **one summary toast** over one toast per item. "12 files failed to upload" beats twelve
  toasts that bury the screen.
- Use `duration: 0` only when the message needs an explicit decision; persistent toasts accumulate.
- On route changes, call `clearAll()` so old messages do not linger into a new page.

```ts
router.afterEach(() => toast.clearAll());
```

---

## Sanitization cost

`DOMPurify.sanitize()` parses and rebuilds HTML. For a toast body it takes microseconds, but if you
render hundreds of toasts per second the cost is measurable. Options:

- Pass plain text (no HTML tags) whenever possible — sanitization still runs, but the DOM stays
  trivial.
- Cache sanitized output for repeated messages:

```ts
const cache = new Map<string, string>();

function sanitizeOnce(body: string) {
  const cached = cache.get(body);
  if (cached) return cached;
  const result = DOMPurify.sanitize(body, { USE_PROFILES: { html: true } });
  cache.set(body, result);
  return result;
}
```

Only do this when the same message repeats often, and clear the cache if messages can be large.

---

## Timers and hover behavior

- `duration: 0` allocates no timer. Use it for persistent toasts instead of a huge duration.
- Hover restarts the full duration, so a user idling over a stack can keep many timers alive. That
  is bounded by the number of visible toasts and is harmless, but capping the stack keeps it tidy.
- `clearAll()` cancels nothing directly: each toast is closed, and its pending timer is discarded
  with the closure once the element is removed.

---

## Teardown

```ts
window.addEventListener('beforeunload', () => toast.destroy());
```

`destroy()` removes the container, empties `toasts`, and nulls the instance's container reference.
It does **not** remove the injected `<style>` element, because other instances may still be using
it. The style element is a few hundred bytes of keyframes.

---

## Measuring your own setup

| Metric | Suggested budget |
|---|---|
| Time from `showToast()` to first paint of the toast | < 16 ms |
| DOM nodes per toast | ~10 (container + toast + 2 columns + header/body/footer/button) |
| Timers per visible toast | 0 or 1 |
| Visible toasts at any time | ≤ 4 |

Use the Performance panel in DevTools with a recording that triggers `showToast()` to confirm the
toast is not causing layout thrash in your specific page.

---

**Previous:** [Accessibility](./accessibility.md) · **Next:** [Best Practices](./best-practices.md) · **See also:** [Project Structure](./project-structure.md) · [Back to documentation index](./README.md)
