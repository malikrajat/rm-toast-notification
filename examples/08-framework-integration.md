# Example 8 — Framework Integration

One file per framework, each complete enough to paste in. The pattern is always the same: create the
service once, expose it through the framework's idiom, clean up on teardown.

---

## Vanilla + Vite

```ts
// src/toast.ts
import ToastNotification from '@codewithrajat/rm-toast-notification';

export const toast = new ToastNotification();

export function notify(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
  return toast.showToast({ type, body: message });
}
```

```ts
// src/main.ts
import { notify } from './toast';

document.querySelector('#save')?.addEventListener('click', async () => {
  try {
    await save();
    notify('Saved', 'success');
  } catch {
    notify('Save failed', 'error');
  }
});
```

---

## React — provider and hook

```tsx
// src/ui/ToastProvider.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import ToastNotification from '@codewithrajat/rm-toast-notification';
import type { ToastOptions } from '@codewithrajat/rm-toast-notification';

type Notify = (options: ToastOptions) => HTMLDivElement | null;

const ToastContext = createContext<Notify | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useMemo(() => new ToastNotification(), []);

  useEffect(() => {
    toast.container?.setAttribute('role', 'status');
    toast.container?.setAttribute('aria-live', 'polite');
    return () => toast.clearAll();
  }, [toast]);

  const notify = useCallback<Notify>((options) => toast.showToast(options), [toast]);

  return <ToastContext.Provider value={notify}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error('useToast must be used inside <ToastProvider>');
  return notify;
}
```

```tsx
// src/features/ProfileForm.tsx
import { useToast } from '../ui/ToastProvider';

export function ProfileForm() {
  const notify = useToast();

  async function onSubmit() {
    const pending = notify({ type: 'info', body: 'Saving…', duration: 0 });
    try {
      await api.saveProfile();
      if (pending) close(pending); // hide the pending toast, then report the outcome
      notify({ type: 'success', body: 'Profile saved', duration: 2500 });
    } catch {
      if (pending) close(pending);
      notify({ type: 'error', body: 'Could not save the profile.', duration: 0 });
    }
  }

  return <button onClick={onSubmit}>Save</button>;
}
```

Expose `closeToast` and `clearAll` through the same context so consumers never touch the library
directly:

```tsx
type Notify = (options: ToastOptions) => HTMLDivElement | null;
type Api = { notify: Notify; close: (element: HTMLDivElement) => void; clear: () => void };
```

---

## Angular — injectable service

```ts
// src/app/core/toast.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import ToastNotification from '@codewithrajat/rm-toast-notification';
import type { ToastOptions } from '@codewithrajat/rm-toast-notification';

@Injectable({ providedIn: 'root' })
export class ToastService implements OnDestroy {
  private readonly service = new ToastNotification();

  show(options: ToastOptions) {
    return this.service.showToast(options);
  }

  success(body: string) {
    return this.service.showToast({ type: 'success', body, duration: 2500 });
  }

  failure(body: string, retry?: () => void) {
    return this.service.showToast({
      type: 'error',
      body,
      duration: 0,
      actionButton: retry ? { text: 'Retry', onClick: retry } : undefined,
    });
  }

  clear() {
    this.service.clearAll();
  }

  ngOnDestroy() {
    this.service.destroy();
  }
}
```

```ts
// src/app/app.component.ts
this.router.events.subscribe((event) => {
  if (event instanceof NavigationStart) this.toast.clear();
});
```

---

## Vue 3 — plugin

```ts
// src/plugins/toast.ts
import type { App, InjectionKey } from 'vue';
import ToastNotification from '@codewithrajat/rm-toast-notification';
import type { ToastOptions } from '@codewithrajat/rm-toast-notification';

export const toast = new ToastNotification();
export const toastKey: InjectionKey<(options: ToastOptions) => HTMLDivElement | null> = Symbol('toast');

export const ToastPlugin = {
  install(app: App) {
    app.provide(toastKey, (options: ToastOptions) => toast.showToast(options));
    app.config.globalProperties.$toast = (options: ToastOptions) => toast.showToast(options);
  },
};
```

```vue
<script setup lang="ts">
import { inject } from 'vue';
import { toastKey } from '../plugins/toast';

const notify = inject(toastKey)!;

async function save() {
  try {
    await api.save();
    notify({ type: 'success', body: 'Saved' });
  } catch {
    notify({ type: 'error', body: 'Save failed', duration: 0 });
  }
}
</script>

<template>
  <button @click="save">Save</button>
</template>
```

---

## Svelte — module-level store

```ts
// src/lib/toast.ts
import ToastNotification from '@codewithrajat/rm-toast-notification';
import type { ToastOptions } from '@codewithrajat/rm-toast-notification';

export const toast = new ToastNotification();

export function notify(options: ToastOptions) {
  return toast.showToast(options);
}
```

```svelte
<script lang="ts">
  import { onDestroy } from 'svelte';
  import { notify, toast } from '$lib/toast';

  onDestroy(() => toast.clearAll());

  async function save() {
    try {
      await api.save();
      notify({ type: 'success', body: 'Saved' });
    } catch {
      notify({ type: 'error', body: 'Save failed', duration: 0 });
    }
  }
</script>

<button on:click={save}>Save</button>
```

---

## Any framework — a framework-free core

If you support more than one framework, keep one framework-free module and thin adapters:

```
src/notifications/core.ts      <- ToastNotification + presets + filtering
src/notifications/react.tsx    <- provider + hook
src/notifications/angular.ts   <- @Injectable service
src/notifications/vue.ts       <- plugin
```

The core owns the behavior; adapters only decide *when* to call it and *where* it is injected.

---

## SSR reminders

| Framework | Rule |
|---|---|
| Next.js App Router | Import inside a `'use client'` file |
| Next.js Pages Router | Call from `useEffect` or a handler, never during render |
| Nuxt | Guard with `import.meta.client` |
| Angular Universal | Call only from browser-only code |
| SvelteKit | Guard with `browser` from `$app/environment` |

---

**Previous:** [Example 7 — Action buttons](./07-action-buttons.md) · **Next:** [Example 9 — SSR and teardown](./09-ssr-and-teardown.md) · [Examples index](./README.md)
