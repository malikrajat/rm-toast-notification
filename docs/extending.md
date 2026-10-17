# Extending the Library

You do not need to fork the project to change its behavior. This page covers the supported extension
paths, from the trivial to the ones that touch source code.

---

## 1. Reuse the helpers

```ts
import { isSafeColor, isSafeUrl, sanitizeCss, sanitizeText } from '@codewithrajat/rm-toast-notification';
```

| Helper | Use it for |
|---|---|
| `sanitizeText(value)` | Any value you are about to assign with `textContent` |
| `sanitizeCss(css)` | Any CSS fragment you are about to put into a `style` attribute |
| `isSafeColor(color)` | Theme colors coming from user or tenant settings |
| `isSafeUrl(url)` | Avatars, logos, and links coming from remote data |

---

## 2. Wrap, do not patch

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';
import type { ToastOptions } from '@codewithrajat/rm-toast-notification';

export class AppToasts {
  private readonly inner = new ToastNotification();

  show(options: ToastOptions) {
    return this.inner.showToast({ animation: !prefersReducedMotion(), ...options });
  }

  capStack(maxVisible = 4) {
    const open = this.inner.toasts.filter((element) => element.dataset.closed !== 'true');
    while (open.length >= maxVisible) {
      const oldest = open.shift();
      if (oldest) this.inner.closeToast(oldest);
    }
  }

  private prefersReducedMotion() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
```

Because `container` and `toasts` are public, a wrapper can manage stacking, cleanup, and theming
without reaching into private internals.

---

## 3. Subclass to change defaults

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';
import type { ToastOptions } from '@codewithrajat/rm-toast-notification';

class BrandedToast extends ToastNotification {
  override showToast(options: ToastOptions = {}) {
    return super.showToast({
      position: 'bottom-right',
      color: '#6366f1',
      logo: '/assets/logo.svg',
      animation: true,
      ...options,
    });
  }
}

const toast = new BrandedToast();
```

`showToast`, `closeToast`, `clearAll`, `destroy`, `isItHtml`, and the three getters are all
overridable. Keep the `showToast` return contract (`HTMLDivElement | null`) intact so callers can
still pass the result to `closeToast()`.

---

## 4. Render your own content

The container is a normal element, so you can append your own markup next to a toast:

```ts
const toast = new ToastNotification();
const element = toast.showToast({ body: 'Uploading 3 files…', duration: 0 });

const progress = document.createElement('progress');
progress.max = 100;
progress.value = 0;

// Nest your element inside the toast, or place it in the container:
toast.container?.appendChild(progress);

// Drive it yourself, then close the toast when done
const interval = setInterval(() => {
  progress.value += 10;
  if (progress.value >= 100) {
    clearInterval(interval);
    progress.remove();
    if (element) toast.closeToast(element);
  }
}, 200);
```

If you go this route, remember that the library does not track your nodes — clean them up yourself.

---

## 5. Add a new toast type

Toast types are a closed union on purpose, but extending it is mechanical. In `src/index.ts`:

1. Add the literal to `ToastType`.
2. Add an entry to `DEFAULT_COLORS`.
3. Add an entry to `ACTION_BUTTON_COLORS`.
4. Add the literal to the whitelist inside `validateType`.
5. Update the docs (`docs/configuration.md`, `docs/api-reference.md`) and add tests.

```ts
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

const DEFAULT_COLORS: Record<ToastType, string> = {
  // …
  loading: '#6b7280',
};

const ACTION_BUTTON_COLORS: Record<ToastType, string> = {
  // …
  loading: '#4b5563',
};

private validateType(type: unknown): ToastType {
  const allowed: ToastType[] = ['success', 'error', 'warning', 'info', 'loading'];
  return allowed.includes(type as ToastType) ? (type as ToastType) : 'info';
}
```

TypeScript will point out every map you still need to update, which is the point of typing them as
`Record<ToastType, string>`.

---

## 6. Bundle a build without DOMPurify

If your application never passes HTML to `body` and you want to drop the only runtime dependency,
copy `src/index.ts` into your own package and replace the sanitization block:

```ts
if (body) {
  bodyElem.textContent = body; // plain text only, no dependency
}
```

Trade-off: you lose rich content and you now own the file. For most projects the dependency is
smaller than the maintenance cost.

---

## 7. Contribute upstream

If your extension is generally useful — a new option, a fix, a framework adapter — prefer opening a
pull request over maintaining a fork:

1. Read [Contributing](./contributing.md).
2. Add the behavior in `src/index.ts`.
3. Add tests that fail before your change and pass after it.
4. Keep the coverage gate at 90% or above.
5. Update the relevant page in `docs/` and, if it is user-facing behavior, `README.md`.

---

**Previous:** [Project Structure](./project-structure.md) · **Next:** [Testing Guide](./testing.md) · **See also:** [Architecture](./architecture.md) · [Back to documentation index](./README.md)
