# Example 5 — Failure and Error Handling

Errors are the toasts users actually remember. This example collects the patterns that separate a
useful error message from a dead end.

---

## Rule 1 — Errors that need a decision are persistent

```ts
toast.showToast({
  type: 'error',
  header: 'Payment failed',
  body: 'Your card was declined.',
  duration: 0, // do not disappear before the user can read it
  actionButton: { text: 'Update card', onClick: () => openBilling() },
});
```

If the user must act, the toast must not auto-dismiss.

---

## Rule 2 — Translate errors before showing them

Never surface a raw exception. Map it to something a person can act on:

```ts
function describe(error: unknown): { header: string; body: string; retryable: boolean } {
  const status = (error as { status?: number })?.status;

  if (!navigator.onLine) {
    return { header: 'You are offline', body: 'Check your connection and try again.', retryable: true };
  }
  if (status === 401) {
    return { header: 'Session expired', body: 'Please sign in again.', retryable: false };
  }
  if (status === 403) {
    return { header: 'Not permitted', body: 'You do not have access to this resource.', retryable: false };
  }
  if (status === 429) {
    return { header: 'Too many requests', body: 'Please wait a moment and try again.', retryable: true };
  }
  if (status && status >= 500) {
    return { header: 'Server error', body: 'Our service is having trouble. Try again shortly.', retryable: true };
  }
  return { header: 'Something went wrong', body: 'The action could not be completed.', retryable: true };
}
```

Log the raw error; show the translation:

```ts
async function safeRun<T>(work: () => Promise<T>, retry?: () => void) {
  try {
    return await work();
  } catch (error) {
    console.error('[app] action failed', error);
    const { header, body, retryable } = describe(error);
    toast.showToast({
      type: 'error',
      header,
      body,
      duration: 0,
      actionButton: retryable && retry ? { text: 'Retry', onClick: retry } : undefined,
    });
    return undefined;
  }
}
```

---

## Rule 3 — Retry with feedback

A retry button that looks dead is worse than no button:

```ts
function retryable(message: string, action: () => Promise<unknown>) {
  const element = toast.showToast({
    type: 'error',
    header: 'Action failed',
    body: message,
    duration: 0,
    actionButton: {
      text: 'Retry',
      async onClick(event) {
        const button = event.currentTarget as HTMLButtonElement;
        button.disabled = true;
        button.textContent = 'Retrying…';

        try {
          await action();
          if (element) toast.closeToast(element);
          toast.showToast({ type: 'success', body: 'It worked this time.' });
        } catch {
          button.disabled = false;
          button.textContent = 'Retry';
          toast.showToast({ type: 'error', body: 'Still failing. Please try later.', duration: 0 });
        }
      },
    },
  });
}
```

---

## Rule 4 — Special-case offline

```ts
window.addEventListener('offline', () => {
  toast.showToast({
    type: 'warning',
    header: 'Offline',
    body: 'Changes are saved locally and will sync automatically.',
    duration: 0,
  });
});

window.addEventListener('online', () => {
  toast.clearAll();
  toast.showToast({ type: 'success', header: 'Back online', body: 'Syncing your changes…' });
});
```

---

## Rule 5 — Catch what you did not expect

```ts
window.addEventListener('unhandledrejection', (event) => {
  console.error('[app] unhandled rejection', event.reason);
  toast.showToast({
    type: 'error',
    header: 'Unexpected error',
    body: 'We logged the problem. Try again, or reload the page.',
    duration: 0,
  });
});

window.addEventListener('error', (event) => {
  console.error('[app] runtime error', event.error);
  toast.showToast({
    type: 'error',
    header: 'Unexpected error',
    body: 'The page hit an unexpected problem.',
    duration: 0,
  });
});
```

Keep these handlers quiet in production if you have a dedicated error boundary: one clear message
beats three stacked ones.

---

## Rule 6 — Never toast what belongs inline

| Situation | Right pattern |
|---|---|
| Field validation (`email is required`) | Inline message next to the field |
| Form submission failed validation | Inline summary + focus the first invalid field |
| Background sync failed | Toast with retry |
| Session expired | Toast + redirect on acknowledge |
| Permission denied on a page | Inline empty state |
| Network error on a save button | Toast, because the user clicked something |

---

## Rule 7 — Do not leak sensitive details

```ts
// Bad: server internals or user data in the DOM
toast.showToast({ type: 'error', body: `${error.name}: ${error.message}` });

// Good: a stable, user-facing message; details in the console/log
toast.showToast({ type: 'error', body: 'We could not complete that request.' });
```

This matters because toasts are visible in screenshots, recordings, and shared screens.

---

## Rule 8 — Consistency of tone

Pick one voice and keep it: full sentences, same person, same level of detail. Errors should say
what happened, why (when known), and what to do next — in that order:

> **Could not save** · The connection dropped mid-upload. Retry, or export your work first.

---

## Rule 9 — Fail soft in development

In development, make failures loud and precise; in production, keep them short:

```ts
const isDev = import.meta.env.DEV;

toast.showToast({
  type: 'error',
  header: isDev ? `DEV: ${errorName}` : 'Something went wrong',
  body: isDev ? errorMessage : 'Please try again.',
  duration: isDev ? 0 : 6000,
});
```

---

## Rule 10 — Test the failure path

```ts
it('shows a retryable error toast when the request fails', async () => {
  jest.useFakeTimers();
  api.save = jest.fn().mockRejectedValue(new Error('boom'));

  await save();

  const toastElement = document.querySelector('.toast-error');
  expect(toastElement).toHaveTextContent('Something went wrong');
  expect(toastElement?.querySelector('button:not([aria-label])')).toHaveTextContent('Retry');
});
```

See [Example 10 — Testing](./10-testing.md) for the full test setup.

---

**Previous:** [Example 4 — Filtering and deduplication](./04-filtering-and-deduplication.md) · **Next:** [Example 6 — Custom styling](./06-custom-styling.md) · [Examples index](./README.md)
