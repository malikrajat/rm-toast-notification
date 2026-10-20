# Example 7 — Action Buttons and Interactions

Action buttons turn a notification into a decision point. This example covers the three interaction
surfaces — the toast click, the action button, and the close button — and how they interact.

---

## The three handlers

| Handler | Fires when | Side effects |
|---|---|---|
| `onClick` | The toast body is clicked (not a button) | Runs your handler, then closes the toast |
| `actionButton.onClick` | The action button is clicked | Runs your handler; the toast stays open |
| (close button) | The `×` is clicked | Closes the toast |

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';

const toast = new ToastNotification();

toast.showToast({
  type: 'info',
  header: 'New comment',
  body: 'Rajat replied to your review.',
  duration: 0,
  onClick: () => openThread(),
  actionButton: { text: 'Reply', onClick: () => openReplyBox() },
});
```

Clicking the toast opens the thread and closes the toast. Clicking **Reply** opens the reply box and
leaves the toast in place. Clicking `×` just closes it.

---

## Retry

```ts
function showRetry(message: string, action: () => Promise<void>) {
  const element = toast.showToast({
    type: 'error',
    header: 'Upload failed',
    body: message,
    duration: 0,
    actionButton: {
      text: 'Retry',
      async onClick() {
        if (element) toast.closeToast(element);
        toast.showToast({ type: 'info', body: 'Uploading again…', duration: 0 });
        await action();
      },
    },
  });
}
```

---

## Undo

Undo buttons should be fast and forgiving: perform the destructive action optimistically, keep the
toast alive long enough to reverse it, and roll back if the server call fails.

```ts
function deleteWithUndo(id: string) {
  const snapshot = store.remove(id); // optimistic delete

  toast.showToast({
    type: 'warning',
    header: 'Item deleted',
    body: 'You can undo this for the next 8 seconds.',
    duration: 8000,
    actionButton: {
      text: 'Undo',
      onClick: () => {
        store.restore(snapshot);
        toast.showToast({ type: 'success', body: 'Item restored', duration: 2000 });
      },
    },
  });

  return api.delete(id).catch((error) => {
    store.restore(snapshot);
    toast.showToast({ type: 'error', body: 'Delete failed. Item restored.', duration: 0 });
    throw error;
  });
}
```

---

## Confirm-then-act

For actions that are not reversible, ask first:

```ts
toast.showToast({
  type: 'warning',
  header: 'Revoke API key?',
  body: 'Applications using this key will stop working immediately.',
  duration: 0,
  actionButton: {
    text: 'Revoke key',
    async onClick() {
      await api.revokeKey(keyId);
      toast.clearAll();
      toast.showToast({ type: 'success', body: 'Key revoked.' });
    },
  },
});
```

---

## Navigating from a toast

```ts
toast.showToast({
  type: 'info',
  header: 'Report ready',
  body: 'Your export finished.',
  duration: 0,
  actionButton: {
    text: 'Download',
    onClick: () => window.open(downloadUrl, '_blank', 'noopener,noreferrer'),
  },
});
```

Note the `noopener,noreferrer` — the library does not open links for you, so the safety of any
navigation is your responsibility.

---

## Progress action

```ts
const element = toast.showToast({
  type: 'info',
  header: 'Syncing 240 records',
  body: 'Starting…',
  duration: 0,
  actionButton: {
    text: 'Pause',
    onClick(event) {
      const button = event.currentTarget as HTMLButtonElement;
      const paused = button.textContent === 'Pause';
      button.textContent = paused ? 'Resume' : 'Pause';
      syncControl.setPaused(paused);
      void element;
    },
  },
});
```

---

## Disable an action while it runs

```ts
actionButton: {
  text: 'Send',
  async onClick(event) {
    const button = event.currentTarget as HTMLButtonElement;
    button.disabled = true;
    button.style.opacity = '0.6';
    try {
      await send();
    } finally {
      button.disabled = false;
      button.style.opacity = '1';
    }
  },
}
```

`event.currentTarget` is the button, so you can mutate it directly — no extra querying needed.

---

## Multiple actions

There is exactly one action button per toast by design. For more, either stack two toasts (rarely a
good idea) or render your own markup inside the container:

```ts
const element = toast.showToast({ body: 'Choose an option', duration: 0 });
const actions = document.createElement('div');

for (const [label, handler] of [['Keep', keep], ['Discard', discard]] as const) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.addEventListener('click', () => {
    handler();
    if (element) toast.closeToast(element);
  });
  actions.appendChild(button);
}

element?.appendChild(actions);
```

---

## Keyboard and focus

- Both buttons are real `<button type="button">` elements, so Tab reaches them and Enter/Space
  activates them.
- The toast element itself is not focusable; if it has an `onClick`, keyboard-only users cannot
  reach it. Give the same capability to the action button:

```ts
toast.showToast({
  body: 'New message from support',
  onClick: () => openInbox(),
  actionButton: { text: 'Open inbox', onClick: () => openInbox() },
});
```

---

## Testing interactions

```ts
it('does not close the toast when the action button is clicked', () => {
  const onSubmit = jest.fn();
  const onClick = jest.fn();

  const element = toast.showToast({
    body: 'Confirm',
    duration: 0,
    onClick,
    actionButton: { text: 'Send', onClick: onSubmit },
  });

  const action = element?.querySelector('button:not([aria-label])') as HTMLButtonElement;
  action.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(onClick).not.toHaveBeenCalled();
  expect(element?.dataset.closed).toBeUndefined();
});
```

---

**Previous:** [Example 6 — Custom styling](./06-custom-styling.md) · **Next:** [Example 8 — Framework integration](./08-framework-integration.md) · [Examples index](./README.md)
