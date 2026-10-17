# Configuration

Every toast is configured with a single `ToastOptions` object passed to `showToast()`.
This page documents each option, its type, default, and exact behavior.

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';

const toast = new ToastNotification();
toast.showToast({ type: 'success', body: 'Saved' });
```

---

## Option reference

| Option | Type | Default | Description |
|---|---|---|---|
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | Selects the default background and action button color. Unknown values fall back to `'info'`. |
| `position` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-right'` | Where the shared container is anchored. Unknown values fall back to `'top-right'`. |
| `duration` | `number` | `3000` | Milliseconds before auto-dismiss. `0` or a negative number keeps the toast on screen until it is closed. `null`/`undefined` uses the 3000 ms default. |
| `header` | `string` | — | Rendered as a bold `<strong>` **as plain text** (never parsed as HTML). |
| `footer` | `string` | — | Rendered below the body **as plain text**. |
| `body` | `string` | — | Main content. HTML is allowed but is sanitized through DOMPurify before insertion. |
| `logo` | `string` | — | Image URL rendered as a 30×30 icon. Only `http:`, `https:`, `data:`, and relative URLs are accepted. |
| `color` | `string` | per-type default | Custom background color. Must be hex (`#rgb`, `#rrggbb`, `#rrggbbaa`) or `rgb()` / `rgba()`. Invalid values are ignored. |
| `onClick` | `(event: MouseEvent) => void` | — | Fired when the toast itself is clicked (clicks on buttons are ignored). The toast then closes. |
| `actionButton` | `{ text: string; onClick: (event: MouseEvent) => void }` | — | Renders an action button. Its click does not bubble to the toast and does not close it. |
| `animation` | `boolean` | `true` | When `false`, the slide-in keyframe is skipped. Positioning and layout are unchanged. |

### Default colors

| `type` | Background | Action button |
|---|---|---|
| `success` | `#28a745` | `#218838` |
| `error` | `#dc3545` | `#c82333` |
| `warning` | `#ffc107` | `#e0a800` |
| `info` | `#0096FF` | `#007bff` |

Read them at runtime with `getColor(type)` and `getActionButtonColor(type)`.

### Animations

| `position` | CSS animation |
|---|---|
| `top-left` | `slideInFromLeft 0.5s ease-out` |
| `top-right` | `slideInFromRight 0.5s ease-out` |
| `bottom-left` | `slideInFromLeft 0.5s ease-out` |
| `bottom-right` | `slideInFromRight 0.5s ease-out` |

---

## Duration semantics

This is the option people get wrong most often, so here is the full truth table:

| Value passed | Result |
|---|---|
| omitted / `undefined` / `null` | 3000 ms auto-dismiss |
| `3000` | 3000 ms auto-dismiss |
| `0` | **persistent** — never auto-dismisses |
| `-1` (any negative) | **persistent** |
| `"3000"` (string) | **persistent** — non-numbers never schedule a timer |
| `NaN`, `Infinity` | **persistent** |

Hovering a toast pauses the timer and leaving it restarts the *full* duration; the countdown does
not resume from where it stopped.

---

## Body content rules

`body` is the only field that accepts HTML. Sanitization happens in two passes:

1. DOMPurify with an HTML profile, `ALLOW_DATA_ATTR: false`, and explicit bans on
   `style`, `class`, `id`, `onload`, `onerror`, `onclick` attributes plus
   `style`, `script`, `iframe`, `object`, `embed`, `link`, `meta`, `base`, `form` tags.
2. A defense-in-depth CSS scrub of any surviving `style` attribute.

Practical consequences:

```ts
// kept
toast.showToast({ body: '<strong>Saved</strong> — <em>all good</em>' });

// the class is stripped, the element remains
toast.showToast({ body: '<span class="my-class">Styled?</span>' });

// script tags and event handlers are removed
toast.showToast({ body: '<img src="x" onerror="alert(1)">' });
```

Style toasts with the `color` option, `logo`, and your own CSS targeting `.toast` or
`.toast-<type>` instead of inline attributes.

---

## DOM contract

Toasts are rendered into a container the library owns:

```html
<div id="toast-container" style="position: fixed; z-index: 9999; width: 500px; max-width: 100%; top: 0; right: 0;">
  <div class="toast toast-success">
    <div><!-- logo column --></div>
    <div><!-- header / body / action / footer --></div>
    <button type="button" aria-label="Close notification">×</button>
  </div>
</div>
```

Useful selectors for your own CSS:

| Selector | Matches |
|---|---|
| `#toast-container` | The shared container |
| `.toast` | Every toast |
| `.toast-success`, `.toast-error`, `.toast-warning`, `.toast-info` | Toasts by type |

The container is positioned `fixed` with `z-index: 9999`. Only the side matching the position is
set (`top`/`bottom` and `left`/`right`), so switching positions re-anchors the same element.

---

## Types

```ts
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface ToastActionButton {
  text: string;
  onClick: (event: MouseEvent) => void;
}

export interface ToastOptions {
  type?: ToastType;
  position?: ToastPosition;
  duration?: number;
  header?: string;
  footer?: string;
  body?: string;
  logo?: string;
  color?: string;
  onClick?: (event: MouseEvent) => void;
  actionButton?: ToastActionButton;
  animation?: boolean;
}
```

---

**Previous:** [Quick Start](./quick-start.md) · **Next:** [Advanced Configuration](./advanced-configuration.md) · **See also:** [API Reference](./api-reference.md) · [Back to documentation index](./README.md)
