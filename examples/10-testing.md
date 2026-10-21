# Example 10 — Testing Toasts

Toast behavior is DOM behavior plus timers, which makes tests straightforward once the environment is
right. This example is the setup used by this repository, adapted for application code.

---

## Jest setup

```bash
npm install --save-dev jest jest-environment-jsdom ts-jest @types/jest
```

```jsonc
// package.json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "jsdom",
    "testMatch": ["<rootDir>/tests/**/*.test.ts"],
    "collectCoverageFrom": ["src/**/*.ts"],
    "coverageThreshold": {
      "global": { "branches": 90, "functions": 90, "lines": 90, "statements": 90 }
    }
  }
}
```

`testEnvironment: 'jsdom'` is what provides `document`, `window`, `DOMParser`, and `URL`.

---

## Vitest setup

```bash
npm install --save-dev vitest jsdom
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    coverage: { provider: 'v8', include: ['src/**/*.ts'], thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 } },
  },
});
```

---

## Test harness

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';

describe('notifications', () => {
  let toast: ToastNotification;

  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.querySelectorAll('style').forEach((style) => style.remove());
    toast = new ToastNotification();
  });

  afterEach(() => {
    toast.destroy();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
});
```

Two details matter:

- **Reset `document.body`** so each test starts with a clean container.
- **Create the instance in `beforeEach`** so a destroyed instance from the previous test is not
  reused.

---

## Test: content and structure

```ts
it('renders header, body, and footer as separate pieces of text', () => {
  const element = toast.showToast({
    type: 'warning',
    header: 'Heads up',
    body: 'Session expiring',
    footer: 'Save your work',
  });

  expect(element).toHaveClass('toast', 'toast-warning');
  expect(element?.querySelector('strong')).toHaveTextContent('Heads up');
  expect(element?.textContent).toContain('Session expiring');
  expect(element?.textContent).toContain('Save your work');
  expect(document.getElementById('toast-container')).toContainElement(element);
});
```

---

## Test: auto-dismiss with fake timers

```ts
it('removes the toast after the duration plus the exit animation', () => {
  jest.useFakeTimers();

  toast.showToast({ body: 'Bye', duration: 1000 });
  expect(document.querySelectorAll('.toast')).toHaveLength(1);

  jest.advanceTimersByTime(999);
  expect(document.querySelectorAll('.toast')).toHaveLength(1);

  jest.advanceTimersByTime(1); // close starts
  jest.advanceTimersByTime(300); // exit animation completes
  expect(document.querySelectorAll('.toast')).toHaveLength(0);
});
```

---

## Test: persistent toasts

```ts
it('never auto-dismisses when duration is 0', () => {
  jest.useFakeTimers();
  toast.showToast({ body: 'Sticky', duration: 0 });

  jest.advanceTimersByTime(60_000);
  expect(document.querySelectorAll('.toast')).toHaveLength(1);
});
```

---

## Test: interactions

```ts
it('closes on close-button click without firing onClick', () => {
  jest.useFakeTimers();
  const onClick = jest.fn();

  const element = toast.showToast({ body: 'Closable', duration: 0, onClick });
  const close = element?.querySelector('button[aria-label="Close notification"]') as HTMLButtonElement;

  close.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  jest.advanceTimersByTime(300);

  expect(onClick).not.toHaveBeenCalled();
  expect(document.querySelectorAll('.toast')).toHaveLength(0);
});
```

---

## Test: sanitization

```ts
it('strips scripts and event handlers from body HTML', () => {
  const element = toast.showToast({
    body: '<script>alert(1)</script><strong>Safe</strong><img src="x" onerror="alert(2)">',
  });

  expect(element?.querySelector('script')).toBeNull();
  expect(element?.querySelector('img')?.getAttribute('onerror')).toBeNull();
  expect(element?.querySelector('strong')).toHaveTextContent('Safe');
});
```

---

## Test: helpers without the DOM

```ts
import { isSafeColor, isSafeUrl, sanitizeCss } from '@codewithrajat/rm-toast-notification';

it.each(['#fff', '#0096FF', 'rgba(0,0,0,0.5)'])('accepts safe color %s', (color) => {
  expect(isSafeColor(color)).toBe(true);
});

it.each(['red', 'url(x)', 'javascript:alert(1)'])('rejects unsafe color %s', (color) => {
  expect(isSafeColor(color)).toBe(false);
});

it('drops javascript urls', () => {
  expect(isSafeUrl('javascript:alert(1)')).toBe(false);
  expect(sanitizeCss('background: url(javascript:alert(1))')).toBe('');
});
```

---

## Mocking the wrapper instead of the DOM

In application tests, mock your own abstraction:

```ts
jest.mock('../src/ui/toast', () => ({
  notify: {
    saved: jest.fn(),
    retryable: jest.fn(),
  },
}));

import { notify } from '../src/ui/toast';

it('reports a successful save', async () => {
  await saveProfile();
  expect(notify.saved).toHaveBeenCalledWith('Profile');
});
```

This keeps component tests fast and free of DOM timing concerns.

---

## Coverage tips

- Assertions on classes, text, and structure survive styling refactors; assertions on
  `element.style` do not.
- Every `if` in the implementation needs both directions exercised: valid *and* invalid input.
- Remember the second timer: closing is a 300 ms `setTimeout` on top of the dismiss timer.
- Clean up timers in `afterEach` (`jest.useRealTimers()`) to avoid cross-test leakage.

---

## What this repository tests

See [`tests/`](../tests) for the full suite: construction and container reuse, every toast type and
position, duration semantics, content and sanitization, interactions, lifecycle methods, the three
getters, the four exported helpers, and SSR behavior.

---

**Previous:** [Example 9 — SSR and teardown](./09-ssr-and-teardown.md) · [Examples index](./README.md) · [Docs: Testing guide](../docs/testing.md)
