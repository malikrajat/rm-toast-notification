# Example 4 — Filtering, Deduplication, and Queueing

The library renders exactly what you ask for, every time. In a real application that means noise:
the same error firing from three parallel requests, a poller that reports the same status every
second, or a burst of 40 uploads. This example adds the missing filtering layer.

---

## The problem

```ts
// 3 parallel requests fail -> 3 identical toasts
await Promise.allSettled([loadUsers(), loadTeams(), loadRoles()]);
```

---

## Pattern 1 — Deduplicate identical messages

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';
import type { ToastOptions } from '@codewithrajat/rm-toast-notification';

const toast = new ToastNotification();

const active = new Map<string, HTMLDivElement>();

export function showOnce(key: string, options: ToastOptions) {
  const existing = active.get(key);

  // Already on screen: refresh it instead of stacking a duplicate.
  if (existing && existing.parentElement) {
    existing.animate(
      [{ transform: 'scale(1.05)' }, { transform: 'scale(1)' }],
      { duration: 250, easing: 'ease-out' },
    );
    return existing;
  }

  const element = toast.showToast(options);
  if (element) {
    active.set(key, element);
    // Clean the registry once the toast is gone.
    window.setTimeout(() => {
      if (!element.parentElement) active.delete(key);
    }, (options.duration ?? 3000) + 500);
  }
  return element;
}
```

Usage:

```ts
const key = `load-failed:${endpoint}`;
showOnce(key, { type: 'error', header: 'Load failed', body: `Could not load ${endpoint}` });
```

---

## Pattern 2 — Cooldown per message type

Useful for pollers, websocket reconnects, and anything that fires on a schedule:

```ts
const lastShown = new Map<string, number>();

export function showThrottled(key: string, options: ToastOptions, cooldownMs = 5000) {
  const now = Date.now();
  const previous = lastShown.get(key) ?? 0;

  if (now - previous < cooldownMs) return null;

  lastShown.set(key, now);
  return toast.showToast(options);
}
```

```ts
showThrottled('reconnecting', {
  type: 'warning',
  header: 'Connection lost',
  body: 'Reconnecting…',
}, 10_000);
```

Keep the key coarse (`'reconnecting'`, not `'reconnecting:attempt:17'`) so the cooldown applies to
the condition rather than to each event.

---

## Pattern 3 — Collapse a batch into one summary

```ts
export function showBatch(items: string[], options: ToastOptions & { noun?: string } = {}) {
  const noun = options.noun ?? 'item';
  const label = items.length === 1 ? items[0] : `${items.length} ${noun}s`;

  return toast.showToast({
    ...options,
    body: items.length === 1 ? options.body ?? label : `${label} — ${options.body ?? 'see details'}`,
  });
}
```

```ts
const failed = results.filter((r) => r.status === 'rejected').map((r) => r.reason.endpoint);

if (failed.length) {
  showBatch(failed, {
    type: 'error',
    noun: 'endpoint',
    header: 'Some requests failed',
    duration: 0,
  });
}
```

---

## Pattern 4 — Priority filter

Silence low-value toasts in noisy environments (background tabs, low-priority routes):

```ts
const PRIORITY: Record<string, number> = { info: 0, success: 1, warning: 2, error: 3 };

let minimumPriority = 0;

export function setMinimumPriority(type: 'info' | 'success' | 'warning' | 'error') {
  minimumPriority = PRIORITY[type];
}

export function showFiltered(options: ToastOptions) {
  const priority = PRIORITY[options.type ?? 'info'];
  if (priority < minimumPriority) return null;
  return toast.showToast(options);
}
```

```ts
document.addEventListener('visibilitychange', () => {
  setMinimumPriority(document.hidden ? 'warning' : 'info');
});
```

---

## Pattern 5 — A real queue with a visible stack limit

If messages must not be dropped, queue them behind the visible window:

```ts
const MAX_VISIBLE = 3;
const queue: ToastOptions[] = [];

function visibleCount() {
  return toast.toasts.filter((element) => element.dataset.closed !== 'true').length;
}

function drain() {
  while (queue.length && visibleCount() < MAX_VISIBLE) {
    const next = queue.shift();
    if (!next) return;
    const element = toast.showToast(next);

    if (element) {
      const duration = next.duration ?? 3000;
      if (duration > 0) {
        window.setTimeout(drain, duration + 350);
      } else {
        // Persistent toasts only release their slot when closed.
        const observer = new MutationObserver(() => {
          if (!element.parentElement) {
            observer.disconnect();
            drain();
          }
        });
        observer.observe(toast.container ?? document.body, { childList: true });
      }
    }
  }
}

export function enqueue(options: ToastOptions) {
  queue.push(options);
  drain();
}
```

This is the point where a toast library stops being the right abstraction: if you need ordering
guarantees, persistence across reloads, or priorities with pre-emption, build a notification center
and let it render toasts as one output channel.

---

## Pattern 6 — Environment-aware silencing

```ts
const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
const isStaging = /staging/.test(location.hostname);

export function showInApp(options: ToastOptions) {
  if (isTest) return null; // keep test output clean
  if (isStaging && options.type === 'info') return null; // chit-chat off in staging
  return toast.showToast(options);
}
```

---

## Choosing a pattern

| Signal | Pattern |
|---|---|
| Identical message from several sources | Deduplicate by key |
| Same condition repeating on a timer | Cooldown |
| Many small results at once | Batch summary |
| Noisy environment, messages differ | Priority filter |
| Nothing may be lost | Queue |

All six patterns compose: `showInApp(showFiltered(showThrottled(...)))` is a legitimate pipeline.

---

**Previous:** [Example 3 — Advanced options](./03-advanced.md) · **Next:** [Example 5 — Failure handling](./05-failure-handling.md) · [Examples index](./README.md)
