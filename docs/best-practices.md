# Best Practices

These are the rules that keep a toast system helpful instead of annoying. They are opinionated, and
they are all compatible with the public API.

---

## 1. Create one instance per application

```ts
// notifications.ts
export const toast = new ToastNotification();
```

Import it wherever you need it. Multiple instances share the same container anyway, so extra
instances add indirection without adding capability.

---

## 2. Wrap the library behind your own API

Application code should call `notify.success(...)`, not `toast.showToast({ type: 'success', ... })`.
The wrapper gives you:

- one place to change defaults and branding,
- one place to add logging or analytics,
- one thing to mock in tests.

```ts
export const notify = {
  success: (body: string) => toast.showToast({ type: 'success', body, duration: 2500 }),
  info: (body: string) => toast.showToast({ type: 'info', body, duration: 4000 }),
  warn: (body: string) => toast.showToast({ type: 'warning', body, duration: 6000 }),
  fail: (body: string, retry?: () => void) =>
    toast.showToast({
      type: 'error',
      body,
      duration: 0,
      actionButton: retry ? { text: 'Retry', onClick: retry } : undefined,
    }),
};
```

---

## 3. Match the message type to the action required

| Situation | Type | Duration |
|---|---|---|
| Background save succeeded | `success` | 2000–3000 ms |
| Informational, no action needed | `info` | 3000–5000 ms |
| Something needs attention soon | `warning` | 5000–8000 ms |
| Action failed, user can retry | `error` | `0` (persistent) with an action button |
| Validation error next to a form field | — | Do not use a toast; inline it |

Rule of thumb: if the user must do something, the toast should not disappear on its own.

---

## 4. Keep messages short and specific

- Good: "Invoice #1042 could not be approved. Retry."
- Bad: "An error occurred while processing your request. Please contact your administrator or try
  again later. Error code 0x8004."

Put the detail in the console, logs, or an expandable panel. A toast is a nudge, not a report.

---

## 5. Never put secrets or PII in a toast

Toasts live in the DOM and can end up in screenshots, screen shares, and recordings. Avoid tokens,
email addresses, and full server errors.

```ts
// Bad
toast.showToast({ type: 'error', body: `Login failed for ${email}: ${serverMessage}` });

// Good
toast.showToast({ type: 'error', body: 'Login failed. Check your email and password.' });
```

---

## 6. Prefer text over HTML

`body` accepts HTML, but every tag you pass is either stripped or sanitized. If you need emphasis,
the cost is a DOMPurify pass and a stricter CSP footnote. Use it deliberately:

```ts
toast.showToast({ body: '<strong>Backup complete</strong> — 1.2 GB uploaded.' });
```

Anything beyond simple emphasis belongs in a real component, not a toast.

---

## 7. Style with CSS, not with `body` attributes

`class`, `id`, and `style` are stripped from body HTML. Put your rules in a stylesheet and target the
documented selectors:

```css
.toast { border-radius: 8px; font-weight: 500; }
#toast-container .toast-success { background-color: #16a34a; }
```

---

## 8. Clean up on navigation

```ts
// Angular
constructor(private router: Router) {
  this.router.events.subscribe((event) => {
    if (event instanceof NavigationStart) this.toast.clearAll();
  });
}
```

```ts
// React
useEffect(() => () => toast.clearAll(), []);
```

Stale toasts from the previous screen are confusing, and they can leak information from a page the
user has left.

---

## 9. Make errors actionable

An error toast with no action is a dead end. Either attach a `Retry`, `Undo`, or `View details`
action, or point the user at the place where they can act.

```ts
toast.showToast({
  type: 'error',
  header: 'Sync failed',
  body: 'We could not reach the server.',
  duration: 0,
  actionButton: { text: 'Retry sync', onClick: () => sync() },
});
```

Keep destructive actions (delete, revoke) out of toasts — an accidental click on a toast is easy.

---

## 10. Test the toast layer, not the whole app

- Unit-test your wrapper (deduplication, defaults, message mapping).
- Test DOM behavior with `jest-environment-jsdom` — see [Testing Guide](./testing.md).
- Do not assert on exact inline styles; assert on classes, text, `data-*`, and structure so styling
  changes do not break tests.

---

## 11. Respect accessibility from day one

Add the `aria-live` region once, respect `prefers-reduced-motion`, keep durations long enough to
read, and never rely on color alone to communicate meaning. Full checklist in
[Accessibility](./accessibility.md).

---

## 12. Validate anything user-influenced

If a message, color, or logo comes from a remote source, pass it through the exported helpers before
it reaches `showToast()`:

```ts
import { isSafeColor, isSafeUrl, sanitizeText } from '@codewithrajat/rm-toast-notification';

toast.showToast({
  body: sanitizeText(remoteMessage),
  color: isSafeColor(remoteColor) ? remoteColor : undefined,
  logo: isSafeUrl(remoteLogo) ? remoteLogo : undefined,
});
```

---

## 13. Avoid toast-only critical information

If losing the message would put the user in a bad state (payment failed, session expired, data not
saved), persist it somewhere durable: a banner, an inline error, or a notification center. The toast
is a notification, not the record.

---

**Previous:** [Performance Optimization](./performance-optimization.md) · **Next:** [Testing Guide](./testing.md) · **See also:** [Troubleshooting](./troubleshooting.md) · [Back to documentation index](./README.md)
