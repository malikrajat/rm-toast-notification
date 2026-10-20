# Example 1 — Basic Usage

The smallest useful setup: one instance, one toast, and the four options you will actually use.

---

## Minimal example

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';

const toast = new ToastNotification();

toast.showToast({
  type: 'info',
  body: 'Hello from rm-toast-notification',
});
```

This renders a blue toast in the top-right corner that disappears after 3 seconds.

---

## All four types

```ts
toast.showToast({ type: 'success', header: 'Saved', body: 'Your changes were saved.' });
toast.showToast({ type: 'error', header: 'Failed', body: 'We could not save your changes.' });
toast.showToast({ type: 'warning', header: 'Careful', body: 'Your session expires in 5 minutes.' });
toast.showToast({ type: 'info', header: 'Heads up', body: 'A new version is available.' });
```

Each type has its own default background and action-button color:

| Type | Background | Best used for |
|---|---|---|
| `success` | `#28a745` | Completed actions |
| `error` | `#dc3545` | Failed actions |
| `warning` | `#ffc107` | Something needs attention |
| `info` | `#0096FF` | Neutral information |

---

## All four positions

```ts
toast.showToast({ body: 'Top left', position: 'top-left' });
toast.showToast({ body: 'Top right (default)', position: 'top-right' });
toast.showToast({ body: 'Bottom left', position: 'bottom-left' });
toast.showToast({ body: 'Bottom right', position: 'bottom-right' });
```

The container is shared, so the position of the most recent call anchors all toasts that are
currently visible. Pick one per application and stay consistent.

---

## Adding context: header, body, footer, logo

```ts
toast.showToast({
  type: 'warning',
  header: 'Session expiring',
  body: 'You will be signed out in 5 minutes.',
  footer: 'Save your work to continue where you left off.',
  logo: '/assets/warning.svg',
  position: 'bottom-right',
  duration: 8000,
});
```

- `header` renders bold at the top and is always plain text.
- `footer` renders below the body and is always plain text.
- `logo` must be a relative, `http:`, `https:`, or `data:` URL — otherwise it is skipped silently.

---

## Emphasizing part of a message

`body` accepts sanitized HTML:

```ts
toast.showToast({
  type: 'success',
  body: '<strong>Deployment complete</strong> — version 2.4.1 is live.',
});
```

Allowed content is limited on purpose: `<script>`, event handlers, `<iframe>`, `<form>`, and any
`style` / `class` / `id` attributes are removed. If you need a custom look, style from your
stylesheet instead (see [Example 6](./06-custom-styling.md)).

---

## Persistent toast with a custom color

```ts
toast.showToast({
  type: 'info',
  header: 'Maintenance window',
  body: 'We are upgrading the database tonight at 22:00 UTC.',
  color: '#4f46e5',
  duration: 0, // stays until closed
});
```

`duration: 0` (or a negative number) means the toast never auto-dismisses. `null` or `undefined` is
**not** persistent — it falls back to 3000 ms.

---

## Wiring it to a button

```html
<button id="save">Save</button>
```

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';

const toast = new ToastNotification();

document.getElementById('save')?.addEventListener('click', async () => {
  await saveSettings();
  toast.showToast({ type: 'success', header: 'Saved', body: 'Settings updated.' });
});
```

---

## A quick sanity check

```ts
toast.getColor('success'); // '#28a745'
toast.getAnimation('bottom-left'); // 'slideInFromLeft 0.5s ease-out'
toast.getActionButtonColor('error'); // '#c82333'
```

Useful when you are building your own styles and want to match the library defaults.

---

**Next:** [Example 2 — Async lifecycle](./02-async-lifecycle.md) · [Examples index](./README.md) · [Docs](../docs/README.md)
