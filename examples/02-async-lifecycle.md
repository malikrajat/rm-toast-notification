# Example 2 — Async Lifecycle

Most toasts are triggered by work that takes time: a request, an upload, a background sync. This
example walks through the lifecycle pattern that stays readable as the number of async paths grows.

---

## The naive version (and why it hurts)

```ts
async function save() {
  toast.showToast({ type: 'info', body: 'Saving…' });
  try {
    await api.save();
    toast.showToast({ type: 'success', body: 'Saved' });
  } catch {
    toast.showToast({ type: 'error', body: 'Save failed' });
  }
}
```

Problems:

- The "Saving…" toast auto-dismisses after 3 seconds even if the save takes 12.
- Repeated clicks stack identical messages.
- There is no way to clear the in-progress toast when the request finishes.

---

## The lifecycle pattern

Keep a handle on the in-progress toast and replace it with the outcome:

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';

const toast = new ToastNotification();

async function withToast<T>(
  inProgress: string,
  success: string,
  work: () => Promise<T>,
): Promise<T> {
  const pending = toast.showToast({
    type: 'info',
    body: inProgress,
    duration: 0, // the task controls the lifetime, not the timer
  });

  try {
    const result = await work();
    if (pending) toast.closeToast(pending);
    toast.showToast({ type: 'success', body: success, duration: 2500 });
    return result;
  } catch (error) {
    if (pending) toast.closeToast(pending);
    toast.showToast({
      type: 'error',
      body: 'Something went wrong. Please try again.',
      duration: 0,
    });
    throw error;
  }
}
```

Use it:

```ts
await withToast('Saving settings…', 'Settings saved', () => api.saveSettings(payload));
```

Why it works: the pending toast has `duration: 0`, so nothing expires behind your back, and
`closeToast()` is idempotent — if the user already dismissed it, the second call is a no-op.

---

## Progress-aware variant

For long operations, update the pending toast's text instead of stacking messages:

```ts
async function upload(files: File[]) {
  const pending = toast.showToast({
    type: 'info',
    header: `Uploading ${files.length} file(s)`,
    body: 'Preparing…',
    duration: 0,
  });

  const body = pending?.querySelectorAll('div')[1]?.lastElementChild;

  for (const [index, file] of files.entries()) {
    if (body) body.textContent = `${index + 1}/${files.length} — ${file.name}`;
    await uploadOne(file);
  }

  if (pending) toast.closeToast(pending);
  toast.showToast({ type: 'success', body: `${files.length} file(s) uploaded` });
}
```

If you need a real progress bar, append your own `<progress>` element next to the toast — see
[Extending the library](../docs/extending.md).

---

## Promise-style helper

If you prefer promise chains, adapt the same idea into a small utility:

```ts
export function track<T>(promise: Promise<T>, messages: { pending: string; success: string }) {
  const pending = toast.showToast({ type: 'info', body: messages.pending, duration: 0 });

  return promise
    .then((value) => {
      if (pending) toast.closeToast(pending);
      toast.showToast({ type: 'success', body: messages.success });
      return value;
    })
    .catch((error: unknown) => {
      if (pending) toast.closeToast(pending);
      toast.showToast({ type: 'error', body: 'Request failed', duration: 0 });
      throw error;
    });
}

await track(api.reindex(), { pending: 'Reindexing…', success: 'Reindex complete' });
```

---

## Sequential workflows

For multi-step flows, keep one toast alive and update its content between steps — this avoids the
"toast rain" that happens when every step reports separately:

```ts
async function deploy() {
  const status = toast.showToast({
    type: 'info',
    header: 'Deploying',
    body: 'Building…',
    duration: 0,
  });

  const setStep = (text: string) => {
    const body = status?.querySelectorAll('div')[1]?.lastElementChild;
    if (body) body.textContent = text;
  };

  setStep('Building…');
  await build();

  setStep('Uploading artifacts…');
  await uploadArtifacts();

  setStep('Invalidating cache…');
  await invalidateCache();

  if (status) toast.closeToast(status);
  toast.showToast({ type: 'success', header: 'Deployed', body: 'Version 2.4.1 is live.' });
}
```

---

## Timing rules to remember

| Situation | What to do |
|---|---|
| Work takes an unknown amount of time | `duration: 0` and close it yourself |
| Work usually finishes in under 2 seconds | A short 1500–2500 ms success toast is enough; skip the pending toast |
| Work can partially succeed | One summary toast: "8 of 10 files uploaded" |
| Work continues after navigation | That is a job status, not a toast — use a notification center |

---

## Cancellation handling

```ts
const controller = new AbortController();
const pending = toast.showToast({
  type: 'info',
  header: 'Downloading',
  body: 'Click cancel to stop',
  duration: 0,
  actionButton: { text: 'Cancel', onClick: () => controller.abort() },
});

try {
  await download(controller.signal);
  if (pending) toast.closeToast(pending);
  toast.showToast({ type: 'success', body: 'Download complete' });
} catch (error) {
  if (pending) toast.closeToast(pending);
  if ((error as Error).name === 'AbortError') return; // user cancelled: no error toast
  toast.showToast({ type: 'error', body: 'Download failed', duration: 0 });
}
```

---

**Previous:** [Example 1 — Basic](./01-basic.md) · **Next:** [Example 3 — Advanced options](./03-advanced.md) · [Examples index](./README.md)
