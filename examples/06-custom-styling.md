# Example 6 — Custom Styling and Branding

The library sets a background color and layout inline, and exposes everything else through CSS. This
example shows how far you can push that without fighting the implementation.

---

## Level 1 — Per-toast color and logo

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';

const toast = new ToastNotification();

toast.showToast({
  type: 'success',
  header: 'Payment received',
  body: 'Invoice #1042 was paid.',
  color: '#0f766e',
  logo: '/assets/brand-mark.svg',
});
```

`color` must be hex (`#rgb`, `#rrggbb`, `#rrggbbaa`) or `rgb()` / `rgba()`. Anything else is ignored
and the type default is used.

---

## Level 2 — Brand palette for all types

```css
/* toast-theme.css */
:root {
  --toast-success: linear-gradient(135deg, #059669, #10b981);
  --toast-error: linear-gradient(135deg, #b91c1c, #ef4444);
  --toast-warning: linear-gradient(135deg, #d97706, #fbbf24);
  --toast-info: linear-gradient(135deg, #1d4ed8, #38bdf8);
}

#toast-container {
  width: 420px;
  font-family: Inter, system-ui, -apple-system, sans-serif;
}

#toast-container .toast {
  border-radius: 12px;
  padding: 1rem 1.25rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.25);
}

#toast-container .toast-success { background: var(--toast-success); }
#toast-container .toast-error { background: var(--toast-error); }
#toast-container .toast-warning { background: var(--toast-warning); color: #1f2937; }
#toast-container .toast-info { background: var(--toast-info); }
```

Id-qualified selectors (`#toast-container .toast-error`) are needed because the toast background is
written as an inline style, which outranks plain class rules.

---

## Level 3 — Dark mode

```css
@media (prefers-color-scheme: dark) {
  #toast-container .toast {
    color: #e5e7eb;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  }

  #toast-container .toast-warning {
    color: #111827; /* keep contrast on a light background */
  }
}

/* Class-based dark mode (Tailwind, Angular, custom) */
.dark #toast-container .toast { color: #e5e7eb; }
```

---

## Level 4 — The close button

```css
#toast-container button[aria-label='Close notification'] {
  color: currentColor;
  opacity: 0.7;
  font-size: 22px;
  line-height: 1;
  padding: 6px;
  border-radius: 50%;
}

#toast-container button[aria-label='Close notification']:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.12);
}

#toast-container button[aria-label='Close notification']:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

The library writes `color` on this button for hover feedback, so overriding it with `currentColor`
keeps the toast text color while still looking deliberate.

---

## Level 5 — Action button per type

```css
#toast-container .toast-success button:not([aria-label]) { background: #065f46; }
#toast-container .toast-error button:not([aria-label]) { background: #7f1d1d; }
#toast-container .toast-warning button:not([aria-label]) { background: #92400e; }
#toast-container .toast-info button:not([aria-label]) { background: #1e3a8a; }
```

The action button has no distinguishing attribute, so `:not([aria-label])` is the practical way to
select it: the close button always carries `aria-label="Close notification"`.

---

## Level 6 — Positioning and width

```css
#toast-container {
  width: 380px;
  max-width: calc(100vw - 2rem);
  top: auto !important;
  bottom: 1rem;
  right: 1rem;
  left: auto !important;
}

@media (max-width: 480px) {
  #toast-container {
    width: 100%;
    right: 0;
    bottom: 0;
    padding: 0 0.5rem 0.5rem;
  }
}
```

`top`/`bottom` and `left`/`right` are set inline by `showToast()`, so `!important` is required to
override the anchor axis.

---

## Level 7 — Stacking order and gaps

```css
#toast-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Newest first when anchored to the bottom */
#toast-container.reverse { flex-direction: column-reverse; }
```

---

## Level 8 — Rich content without inline styles

Because `style`, `class`, and `id` are stripped from `body` HTML, give your markup semantic tags and
style those tags:

```ts
toast.showToast({
  type: 'info',
  body: '<strong>Migration scheduled</strong> — tonight at 22:00 UTC, no downtime expected.',
});
```

```css
#toast-container .toast strong { display: block; margin-bottom: 0.25rem; }
```

---

## Level 9 — Animation tuning

```css
#toast-container .toast {
  animation-duration: 250ms !important;
  transition: transform 150ms ease, opacity 150ms ease !important;
}

@media (prefers-reduced-motion: reduce) {
  #toast-container .toast {
    animation: none !important;
    transition: none !important;
  }
}
```

The exit delay is 300 ms in code, so the node stays in the DOM for that long even if the visual
transition is faster.

---

## Level 10 — A theme switcher

```ts
import type { ToastOptions } from '@codewithrajat/rm-toast-notification';

type Theme = 'brand' | 'neutral';

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.toastTheme = theme;
}

export function themed(options: ToastOptions): ToastOptions {
  const brand = document.documentElement.dataset.toastTheme === 'brand';
  return { ...options, color: brand ? options.color : undefined };
}
```

```css
html[data-toast-theme='neutral'] #toast-container .toast { filter: saturate(0.25); }
html[data-toast-theme='brand'] #toast-container .toast { filter: none; }
```

---

## Checklist

- [ ] Custom colors validated (`isSafeColor`) if they come from data
- [ ] Overrides use `#toast-container` or `!important` where inline styles win
- [ ] Warning and error text colors checked for contrast
- [ ] `prefers-reduced-motion` respected
- [ ] Close button has a visible focus state
- [ ] Mobile widths checked below 480px

---

**Previous:** [Example 5 — Failure handling](./05-failure-handling.md) · **Next:** [Example 7 — Action buttons](./07-action-buttons.md) · [Examples index](./README.md)
