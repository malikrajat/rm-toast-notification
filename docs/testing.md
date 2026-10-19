# Testing Guide

Toasts are DOM side effects, so tests need a DOM environment and control over time. This page covers
how this repository tests the library, and how you can test your own integration.

---

## This repository's setup

| Piece | Configuration |
|---|---|
| Runner | Jest 29 |
| Environment | `jest-environment-jsdom` |
| TypeScript | `ts-jest` (compiles tests on the fly) |
| Test location | `tests/**/*.test.ts` |
| Coverage source | `src/**/*.ts` |
| Coverage gate | 90% statements, branches, functions, lines |
| Commands | `pnpm test`, `pnpm run test:coverage`, `pnpm run test:watch` |

---

## Running the suite

```bash
pnpm install

pnpm test                 # run everything
pnpm run test:coverage    # run with coverage and the 90% gate
pnpm run test:watch       # watch mode while developing
pnpm test -- -t 'duration' # run a single test by name
```

Coverage output lands in `coverage/lcov-report/index.html`. In CI the numbers are written to the job
summary; no build or coverage artifacts are uploaded.

---

## Testing your own integration

### 1. Use a DOM environment

With Jest:

```ts
/** @jest-environment jsdom */
```

or set `testEnvironment: 'jsdom'` globally. With Vitest, set `environment: 'jsdom'` in
`vitest.config.ts` and install `jsdom`.

Without a DOM environment you will see `document is not defined` — that is the environment, not the
library.

### 2. Reset the DOM between tests

The container is shared per document, so clean up between test cases:

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';

let toast: ToastNotification;

describe('notifications', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    toast = new ToastNotification();
  });

  afterEach(() => {
    toast.destroy();
    jest.clearAllTimers();
    jest.useRealTimers();
  });
});
```

### 3. Control time

Auto-dismiss is a `setTimeout`, and removal after close is another one:

```ts
it('dismisses after the configured duration', () => {
  jest.useFakeTimers();
  const element = toast.showToast({ body: 'Bye', duration: 1000 });

  expect(element).not.toBeNull();
  jest.advanceTimersByTime(1000); // auto-dismiss starts the exit animation
  jest.advanceTimersByTime(300);  // exit animation finishes -> node removed

  expect(document.querySelectorAll('.toast')).toHaveLength(0);
});
```

### 4. Assert on structure, not on styles

```ts
const element = toast.showToast({ type: 'error', header: 'Failed', body: 'Try again' });

expect(element).toHaveClass('toast', 'toast-error');
expect(element?.querySelector('strong')).toHaveTextContent('Failed');
expect(document.getElementById('toast-container')).toContainElement(element);
```

Inline styles are an implementation detail and will change as the design evolves. Classes, text,
`data-*` attributes, and DOM structure are the stable contract.

### 5. Test interactions with real events

```ts
const onClick = jest.fn();
const element = toast.showToast({
  body: 'Click me',
  onClick,
  actionButton: { text: 'Undo', onClick: jest.fn() },
});

element?.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
```

Notes:

- Use `new MouseEvent('click', { bubbles: true })` so the toast-level handler can observe bubbling.
- Action button and close button handlers call `stopPropagation()`, so clicking them will not trigger
  the toast `onClick`.
- To simulate hover, dispatch `mouseover` and `mouseout` events on the toast element.

### 6. Mock the wrapper, not the DOM

In application tests, stub your own wrapper:

```ts
jest.mock('./notifications', () => ({
  notify: { success: jest.fn(), fail: jest.fn() },
}));
```

Assert that the right message was requested. DOM assertions belong in the library's own suite.

---

## What is covered in this repository

| Area | Example assertions |
|---|---|
| Construction | Container created, reused, style injected once |
| Options | Every type and position, defaults, invalid values |
| Duration | Default 3000 ms, custom, persistent, non-numeric |
| Content | Header, body, footer, logo, sanitized HTML |
| Interactions | Toast click, action button, close button, hover pause/resume |
| Lifecycle | `closeToast` idempotency, `clearAll`, `destroy` |
| Helpers | `isItHtml`, `getColor`, `getAnimation`, `getActionButtonColor` |
| Sanitizers | `sanitizeText`, `sanitizeCss`, `isSafeColor`, `isSafeUrl` |
| SSR | Constructor and `showToast` without a document |

---

## Writing tests for a bug fix

1. Add a failing test that reproduces the report.
2. Fix the code.
3. Confirm the whole suite still passes and coverage stays at or above 90%:

```bash
pnpm run test:coverage
```

4. If the fix changes behavior, update `docs/` and `CHANGELOG.md`.

---

**Previous:** [Best Practices](./best-practices.md) · **Next:** [FAQ](./faq.md) · **See also:** [Contributing](./contributing.md) · [Examples: Testing](../examples/10-testing.md) · [Back to documentation index](./README.md)
