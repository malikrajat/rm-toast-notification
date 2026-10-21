# Example 9 — SSR, Teardown, and Cleanup

Toasts are client-only. This example shows how to import safely during server rendering and how to
clean up correctly on route changes, logout, and app teardown.

---

## What is SSR-safe

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';

const serverInstance = new ToastNotification(); // safe: no DOM access
const result = serverInstance.showToast({ body: 'Ignored on the server' }); // null
serverInstance.destroy(); // no-op
```

Guarantees on the server:

- the constructor does not touch `document`
- `showToast()` returns `null`
- `clearAll()` and `destroy()` do not throw
- no timers are scheduled
- importing the module has no side effects

---

## Next.js — App Router

```tsx
'use client';

import { useEffect, useMemo } from 'react';
import ToastNotification from '@codewithrajat/rm-toast-notification';

export function ToastHost() {
  const toast = useMemo(() => new ToastNotification(), []);

  useEffect(() => {
    toast.container?.setAttribute('aria-live', 'polite');
    return () => toast.clearAll();
  }, [toast]);

  return null;
}
```

Client components are the right home for the service; event handlers in server components cannot
reach the DOM anyway.

---

## Next.js — Pages Router

```tsx
useEffect(() => {
  const toast = new ToastNotification();
  toast.showToast({ type: 'success', body: 'Signed in' });
  return () => toast.clearAll();
}, []);
```

---

## Nuxt

```ts
// plugins/toast.client.ts  (.client suffix = browser only)
import ToastNotification from '@codewithrajat/rm-toast-notification';

export default defineNuxtPlugin(() => {
  const toast = new ToastNotification();
  return { provide: { toast } };
});
```

```vue
<script setup lang="ts">
const { $toast } = useNuxtApp();
$toast.showToast({ body: 'Client-only toast' });
</script>
```

---

## Angular Universal

```ts
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

notify(body: string) {
  if (!this.isBrowser) return null;
  return this.service.showToast({ body });
}
```

---

## Hydration mismatch avoidance

A toast rendered during the first client render can cause a hydration mismatch if your framework
manages the DOM tree. Because the container is appended to `document.body` outside your framework's
root, it is normally safe — but the call that triggers it must not run during render:

```ts
// Wrong: runs during render
if (error) toast.showToast({ type: 'error', body: error.message });

// Right: runs after commit
useEffect(() => {
  if (error) toast.showToast({ type: 'error', body: error.message });
}, [error]);
```

---

## Route changes

```ts
router.afterEach(() => toast.clearAll());
```

`clearAll()` keeps the container, so the next toast renders instantly. Prefer it over `destroy()` on
navigation — otherwise you pay a container creation (and a style injection round, if the style
element was also removed) on every page.

---

## Logout and session end

```ts
async function logout() {
  toast.clearAll();
  await api.logout();
  toast.destroy(); // remove the container entirely
  router.push('/login');
}
```

If the app is a SPA that never reloads, `destroy()` is the cleanest way to guarantee that no
authenticated content is left in the DOM.

---

## Multi-instance safety

Two instances share one container:

```ts
const a = new ToastNotification();
const b = new ToastNotification();

console.log(a.container === b.container); // true

a.destroy(); // removes the shared container
console.log(b.container?.isConnected); // false - detached
b.showToast({ body: 'Invisible' }); // renders into a detached node
```

Rules:

- Keep one instance per application.
- If you must create a second one, only use `clearAll()` on the first.
- After `destroy()`, create a new instance before showing anything else.

---

## Framework unmount vs. application teardown

| Event | Call |
|---|---|
| Component unmounts (may remount) | `clearAll()` |
| Provider unmounts | `clearAll()` |
| Route change | `clearAll()` |
| Logout / app shutdown | `destroy()` |
| Test teardown | `destroy()` |

---

## Testing SSR safety

```ts
it('does not throw when there is no document', () => {
  const original = globalThis.document;
  Object.defineProperty(globalThis, 'document', { value: undefined, configurable: true });

  try {
    const toast = new ToastNotification();
    expect(toast.showToast({ body: 'nope' })).toBeNull();
    expect(() => toast.destroy()).not.toThrow();
  } finally {
    Object.defineProperty(globalThis, 'document', {
      value: original,
      configurable: true,
      writable: true,
    });
  }
});
```

See [Example 10 — Testing](./10-testing.md) for the surrounding setup.

---

**Previous:** [Example 8 — Framework integration](./08-framework-integration.md) · **Next:** [Example 10 — Testing](./10-testing.md) · [Examples index](./README.md)
