# Quick Start

## 1. Create one service instance

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';

const toast = new ToastNotification();
```

The constructor creates (or reuses) a single fixed-position container with the id `toast-container`
and injects the keyframe animations once per document. Creating the instance does not render
anything until you call `showToast()`.

## 2. Show your first toast

```ts
toast.showToast({
  type: 'success',
  header: 'Saved',
  body: 'Your changes were saved successfully.',
  position: 'top-right',
  duration: 3000,
});
```

`showToast()` returns the created `HTMLDivElement` — or `null` when the DOM is unavailable (SSR) or
after the instance has been destroyed.

## 3. Use the shortcut you will actually type all day

```ts
toast.showToast({ type: 'info', body: 'Hello from rm-toast-notification' });
```

Everything except `body` is optional. Defaults:

| Option | Default |
|---|---|
| `type` | `'info'` |
| `position` | `'top-right'` |
| `duration` | `3000` ms |
| `animation` | `true` |

---

## The five things people change first

### Put the toast somewhere else

```ts
toast.showToast({ body: 'Bottom left this time', position: 'bottom-left' });
```

Available positions: `top-left`, `top-right`, `bottom-left`, `bottom-right`.

### Make it stay until dismissed

```ts
toast.showToast({
  type: 'warning',
  body: 'This toast stays until you close it.',
  duration: 0, // 0 or any negative number = persistent
});
```

### Add an action button

```ts
toast.showToast({
  type: 'error',
  header: 'Upload failed',
  body: 'The connection dropped while uploading.',
  duration: 0,
  actionButton: {
    text: 'Retry',
    onClick: () => retryUpload(),
  },
});
```

### Brand it

```ts
toast.showToast({
  type: 'info',
  body: 'Deployment finished.',
  color: '#6366f1',
  logo: '/assets/logo.svg',
});
```

`color` accepts hex (`#fff`, `#ffffff`, `#ffffffff`) and `rgb()` / `rgba()`. `logo` accepts
`http:`, `https:`, `data:`, and relative URLs.

### Control the lifecycle

```ts
const element = toast.showToast({ type: 'success', body: 'Closable' });

if (element) toast.closeToast(element); // close one toast
toast.clearAll();                       // close everything, keep the container
toast.destroy();                        // remove the container too
```

---

## Reading the defaults programmatically

```ts
toast.getColor('warning');           // '#ffc107'
toast.getAnimation('bottom-left');   // 'slideInFromLeft 0.5s ease-out'
toast.getActionButtonColor('error'); // '#c82333'
toast.isItHtml('<strong>Hi</strong>'); // true
```

---

## Next steps

- [Configuration](./configuration.md) — every option in one table
- [Advanced Configuration](./advanced-configuration.md) — wrappers, presets, theming
- [Examples](../examples/README.md) — copy-paste scenarios from basic to advanced

---

**Previous:** [Installation](./installation.md) · **Next:** [Configuration](./configuration.md) · [Back to documentation index](./README.md)
