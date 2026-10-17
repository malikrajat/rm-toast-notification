# Framework Integration

The library is framework-agnostic: it only needs a DOM. That means integration is about *where* you
keep the instance and *when* you clean it up, not about a special adapter.

---

## Vanilla JavaScript

```html
<button id="save">Save</button>

<script type="module">
  import ToastNotification from '@codewithrajat/rm-toast-notification';

  const toast = new ToastNotification();

  document.getElementById('save').addEventListener('click', () => {
    toast.showToast({ type: 'success', header: 'Saved', body: 'Preferences updated.' });
  });
</script>
```

---

## TypeScript

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';
import type { ToastOptions } from '@codewithrajat/rm-toast-notification';

export const toast = new ToastNotification();

export function showError(body: string, options: ToastOptions = {}) {
  return toast.showToast({ type: 'error', body, duration: 0, ...options });
}
```

Because `ToastOptions`, `ToastType`, and `ToastPosition` are exported, you can type your own wrappers
without re-declaring the shapes.

---

## React

Keep one instance per app and expose it through a context so components do not re-create it:

```tsx
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import ToastNotification from '@codewithrajat/rm-toast-notification';
import type { ToastOptions } from '@codewithrajat/rm-toast-notification';

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useMemo(() => new ToastNotification(), []);

  useEffect(() => {
    toast.container?.setAttribute('aria-live', 'polite');
    return () => toast.clearAll(); // keep the container, drop the messages
  }, [toast]);

  const notify = (options: ToastOptions) => {
    toast.showToast(options);
  };

  return <ToastContext.Provider value={notify}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error('useToast must be used inside <ToastProvider>');
  return notify;
}
```

Notes specific to React:

- Do **not** wrap the toast container in a React root — the library appends it to `document.body`.
- Call `clearAll()` on unmount, not `destroy()`, if the provider may remount; call `destroy()` when
  the application itself is tearing down.
- In React 18 StrictMode, effects run twice in development. Creating the instance in `useMemo` (or
  module scope) keeps that harmless.

---

## Angular

The wrapper maps naturally onto a root-provided service:

```ts
import { Injectable, OnDestroy } from '@angular/core';
import ToastNotification from '@codewithrajat/rm-toast-notification';
import type { ToastOptions } from '@codewithrajat/rm-toast-notification';

@Injectable({ providedIn: 'root' })
export class ToastService implements OnDestroy {
  private readonly toast = new ToastNotification();

  success(body: string, options: ToastOptions = {}) {
    return this.toast.showToast({ type: 'success', body, ...options });
  }

  clear() {
    this.toast.clearAll();
  }

  ngOnDestroy() {
    this.toast.destroy();
  }
}
```

Notes specific to Angular:

- Register the service at root level so the container is created once.
- Angular Universal / SSR: the constructor is safe to call during server rendering;
  `showToast()` returns `null` there. Guard user feedback behind platform checks if you need it
  server-side.
- With zone-less or `OnPush` setups, the library needs no change detection because it manipulates
  the DOM directly.

---

## Vue

```ts
// toast.ts
import ToastNotification from '@codewithrajat/rm-toast-notification';
import type { App, ToastOptions } from '@codewithrajat/rm-toast-notification';

const toast = new ToastNotification();

export const ToastPlugin = {
  install(app: App) {
    app.config.globalProperties.$toast = (options: ToastOptions) => toast.showToast(options);
    app.provide('toast', (options: ToastOptions) => toast.showToast(options));
  },
};
```

```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import { ToastPlugin } from './toast';

createApp(App).use(ToastPlugin).mount('#app');
```

---

## Svelte

```ts
// toast.ts
import ToastNotification from '@codewithrajat/rm-toast-notification';

export const toast = new ToastNotification();

export function notifySuccess(body: string) {
  toast.showToast({ type: 'success', body });
}
```

```svelte
<script lang="ts">
  import { notifySuccess } from './toast';
</script>

<button on:click={() => notifySuccess('Saved')}>Save</button>

<svelte:window on:beforeunload={() => toast.clearAll()} />
```

---

## Server-side rendering checklist

| Framework | What to do |
|---|---|
| Next.js (App Router) | Import the library in a client component (`'use client'`) or in an event handler |
| Next.js (Pages Router) | Call `showToast()` inside `useEffect` or event handlers, never during render |
| Nuxt | Guard with `import.meta.client` before calling |
| Angular Universal | Call only from browser-only code paths |
| SvelteKit | Guard with `browser` from `$app/environment` |

The defensive part is already handled for you: constructing the service or calling `showToast()` on
the server is safe and returns `null`. What SSR cannot do is render a toast into a document that
does not exist yet.

---

**Previous:** [API Reference](./api-reference.md) · **Next:** [Browser Support](./browser-support.md) · **See also:** [Examples: Framework integration](../examples/08-framework-integration.md) · [Back to documentation index](./README.md)
