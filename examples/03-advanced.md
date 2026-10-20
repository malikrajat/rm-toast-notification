# Example 3 — Advanced Options and Composition

This example covers the patterns that keep toast usage consistent across a large application:
presets, a wrapper service, ARIA setup, stacking control, and custom timers.

---

## Step 1 — One service module

```ts
// src/ui/toast.ts
import ToastNotification from '@codewithrajat/rm-toast-notification';

export const toast = new ToastNotification();

// Announce politely, once, for the whole app.
toast.container?.setAttribute('role', 'status');
toast.container?.setAttribute('aria-live', 'polite');
toast.container?.setAttribute('aria-atomic', 'false');
```

Everything else imports `toast` from here. No component creates its own instance.

---

## Step 2 — Typed presets

```ts
import type { ToastOptions, ToastType } from '@codewithrajat/rm-toast-notification';

const presets = {
  success: { type: 'success', position: 'bottom-right', duration: 2500 },
  info: { type: 'info', position: 'bottom-right', duration: 4000 },
  warning: { type: 'warning', position: 'bottom-right', duration: 6000 },
  error: { type: 'error', position: 'bottom-right', duration: 0 },
} satisfies Record<ToastType, ToastOptions>;

export function show(type: ToastType, options: ToastOptions = {}) {
  return toast.showToast({ ...presets[type], logo: '/assets/logo.svg', ...options });
}
```

The `satisfies Record<ToastType, ToastOptions>` annotation is doing real work: if a new toast type is
added to the library, this file stops compiling until the preset is defined.

---

## Step 3 — A domain-facing API

```ts
export const notify = {
  saved: (entity: string) => show('success', { header: 'Saved', body: `${entity} saved` }),

  retryable: (message: string, retry: () => void) =>
    show('error', {
      header: 'Action failed',
      body: message,
      actionButton: { text: 'Retry', onClick: retry },
    }),

  offline: () =>
    show('warning', {
      header: 'You are offline',
      body: 'Changes will sync when the connection returns.',
      duration: 0,
    }),

  copied: () => show('success', { body: 'Copied to clipboard', duration: 1500 }),
};
```

Call sites become declarative and the copy lives in one place:

```ts
await saveProfile();
notify.saved('Profile');
```

---

## Step 4 — Cap the stack

Nothing prevents a burst of 30 toasts. Cap it in one place:

```ts
const MAX_VISIBLE = 4;

export function showCapped(type: ToastType, options: ToastOptions = {}) {
  const open = toast.toasts.filter((element) => element.dataset.closed !== 'true');
  while (open.length >= MAX_VISIBLE) {
    const oldest = open.shift();
    if (oldest) toast.closeToast(oldest);
  }
  return show(type, options);
}
```

`toasts` still contains elements that are mid-exit, which is why the filter checks `data-closed`.

---

## Step 5 — Respect reduced motion

```ts
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function accessible(type: ToastType, options: ToastOptions = {}) {
  return show(type, { animation: !prefersReducedMotion, ...options });
}
```

---

## Step 6 — Split politeness for errors

Screen reader users benefit from errors being announced promptly:

```ts
export function announceError(message: string, retry?: () => void) {
  const container = toast.container;
  container?.setAttribute('aria-live', 'assertive');

  const element = show('error', {
    body: message,
    actionButton: retry ? { text: 'Retry', onClick: retry } : undefined,
  });

  const reset = () => container?.setAttribute('aria-live', 'polite');
  element?.addEventListener('click', reset);
  if (element) setTimeout(reset, 8000);
  return element;
}
```

---

## Step 7 — Custom timers

`duration: 0` hands full control to you:

```ts
const element = toast.showToast({ type: 'info', body: 'Rate limited', duration: 0 });

let remaining = 30;

const interval = setInterval(() => {
  remaining -= 1;
  const body = element?.querySelectorAll('div')[1]?.lastElementChild;
  if (body) body.textContent = `Rate limited. Try again in ${remaining}s.`;

  if (remaining <= 0) {
    clearInterval(interval);
    if (element) toast.closeToast(element);
  }
}, 1000);
```

---

## Step 8 — Bulk operations

```ts
async function deleteSelected(ids: string[]) {
  const results = await Promise.allSettled(ids.map((id) => api.remove(id)));
  const failed = results.filter((result) => result.status === 'rejected').length;
  const ok = results.length - failed;

  if (failed === 0) {
    show('success', { header: 'Deleted', body: `${ok} item(s) removed.` });
    return;
  }

  show('error', {
    header: 'Partially completed',
    body: `${ok} deleted, ${failed} failed.`,
    duration: 0,
    actionButton: { text: 'Retry failed', onClick: () => retryFailed() },
  });
}
```

---

## Step 9 — Analytics hook

Since every call funnels through `show()`, instrumentation costs one line:

```ts
export function show(type: ToastType, options: ToastOptions = {}) {
  const element = toast.showToast({ ...presets[type], ...options });
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { type, body: options.body } }));
  return element;
}
```

---

## Step 10 — Where to stop abstracting

If your wrapper starts implementing queueing, persistence, retries, and prioritization, you have
outgrown a toast library. At that point the wrapper should own a notification center UI, and the
toast becomes one output channel of it.

---

**Previous:** [Example 2 — Async lifecycle](./02-async-lifecycle.md) · **Next:** [Example 4 — Filtering and deduplication](./04-filtering-and-deduplication.md) · [Examples index](./README.md)
