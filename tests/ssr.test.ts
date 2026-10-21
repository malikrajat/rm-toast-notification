/**
 * @jest-environment node
 *
 * These tests run in a plain Node environment, which is the closest analogue to server-side
 * rendering: `document`, `window`, and `HTMLElement` do not exist.
 */
import ToastNotification, { isSafeUrl } from '../src/index';

describe('server-side rendering safety', () => {
  it('constructs without touching the DOM', () => {
    const toast = new ToastNotification();

    expect(toast.container).toBeNull();
    expect(toast.toasts).toEqual([]);
  });

  it('returns null from showToast instead of throwing', () => {
    const toast = new ToastNotification();

    expect(toast.showToast({ body: 'server-side' })).toBeNull();
    expect(toast.showToast()).toBeNull();
  });

  it('keeps clearAll and destroy safe no-ops', () => {
    const toast = new ToastNotification();

    expect(() => toast.clearAll()).not.toThrow();
    expect(() => toast.destroy()).not.toThrow();
    expect(toast.container).toBeNull();
  });

  it('still resolves absolute urls without a window base', () => {
    expect(isSafeUrl('https://cdn.example.com/logo.png')).toBe(true);
    expect(isSafeUrl('/relative/logo.png')).toBe(true);
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
  });
});
