import ToastNotification from '../src/index';

const CONTAINER_ID = 'toast-container';

/** Resolve a CSS color the same way the DOM does, so assertions stay engine-agnostic. */
function cssColor(value: string): string {
  const probe = document.createElement('div');
  probe.style.backgroundColor = value;
  return probe.style.backgroundColor;
}

/** Resolve any CSS value through the DOM so assertions stay engine-agnostic. */
function cssValue(property: 'color' | 'opacity', value: string): string {
  const probe = document.createElement('div');
  probe.style[property] = value;
  return probe.style[property];
}

function container(): HTMLElement | null {
  return document.getElementById(CONTAINER_ID);
}

function toastElements(): NodeListOf<HTMLElement> {
  return document.querySelectorAll<HTMLElement>('.toast');
}

function keyframeStyleCount(): number {
  return Array.from(document.head.querySelectorAll('style')).filter((style) =>
    (style.textContent ?? '').includes('slideInFromLeft'),
  ).length;
}

describe('ToastNotification', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('construction', () => {
    it('creates and appends the shared container', () => {
      const toast = new ToastNotification();

      expect(toast.container).toBeInstanceOf(HTMLDivElement);
      expect(container()).toBe(toast.container);
      expect(toast.container?.style.position).toBe('fixed');
      expect(toast.container?.style.zIndex).toBe('9999');
      expect(toast.container?.style.width).toBe('500px');
      expect(toast.container?.style.maxWidth).toBe('100%');
      expect(toast.toasts).toEqual([]);
    });

    it('reuses an existing container instead of duplicating it', () => {
      const first = new ToastNotification();
      const second = new ToastNotification();

      expect(second.container).toBe(first.container);
      expect(document.querySelectorAll(`#${CONTAINER_ID}`)).toHaveLength(1);
    });

    it('injects the keyframe styles only once', () => {
      new ToastNotification();
      new ToastNotification();
      new ToastNotification();

      expect(keyframeStyleCount()).toBe(1);
    });

    it('builds a detached container when document.body is missing', () => {
      const descriptor = Object.getOwnPropertyDescriptor(document, 'body');
      Object.defineProperty(document, 'body', { configurable: true, get: () => null });

      try {
        const toast = new ToastNotification();

        expect(toast.container).toBeInstanceOf(HTMLDivElement);
        expect(toast.showToast({ body: 'no body' })).toBeNull();
        expect(() => toast.clearAll()).not.toThrow();
        expect(() => toast.destroy()).not.toThrow();
      } finally {
        if (descriptor) {
          Object.defineProperty(document, 'body', descriptor);
        } else {
          delete (document as unknown as Record<string, unknown>).body;
        }
      }
    });
  });

  describe('showToast defaults', () => {
    it('renders an info toast in the top-right corner with animation', () => {
      const toast = new ToastNotification();
      const element = toast.showToast({ body: 'Hello' });

      expect(element).toBeInstanceOf(HTMLDivElement);
      expect(element?.classList.contains('toast')).toBe(true);
      expect(element?.classList.contains('toast-info')).toBe(true);
      expect(element?.style.backgroundColor).toBe(cssColor('#0096FF'));
      expect(element?.getAttribute('style')).toContain('slideInFromRight');
      expect(toast.container?.style.top).toBe('0px');
      expect(toast.container?.style.right).toBe('0px');
      expect(toast.toasts).toContain(element);
    });

    it('returns null after destroy()', () => {
      const toast = new ToastNotification();
      toast.destroy();

      expect(toast.showToast({ body: 'gone' })).toBeNull();
    });
  });

  describe('types and positions', () => {
    it.each([
      ['success', '#28a745'],
      ['error', '#dc3545'],
      ['warning', '#ffc107'],
      ['info', '#0096FF'],
    ] as const)('applies the default color for %s', (type, color) => {
      const toast = new ToastNotification();
      const element = toast.showToast({ type, body: 'text' });

      expect(element?.classList.contains(`toast-${type}`)).toBe(true);
      expect(element?.style.backgroundColor).toBe(cssColor(color));
    });

    it('falls back to info for an unknown type', () => {
      const toast = new ToastNotification();
      const element = toast.showToast({ type: 'nope' as unknown as 'info', body: 'text' });

      expect(element?.classList.contains('toast-info')).toBe(true);
      expect(element?.style.backgroundColor).toBe(cssColor('#0096FF'));
    });

    it.each([
      ['top-left', 'slideInFromLeft', 'top', 'left'],
      ['top-right', 'slideInFromRight', 'top', 'right'],
      ['bottom-left', 'slideInFromLeft', 'bottom', 'left'],
      ['bottom-right', 'slideInFromRight', 'bottom', 'right'],
    ] as const)('positions %s correctly', (position, animation, vertical, horizontal) => {
      const toast = new ToastNotification();
      const element = toast.showToast({ position, body: 'text' });

      expect(element?.getAttribute('style')).toContain(animation);
      expect(toast.container?.style[vertical as 'top' | 'bottom']).toBe('0px');
      expect(toast.container?.style[horizontal as 'left' | 'right']).toBe('0px');
    });

    it('falls back to top-right for an unknown position', () => {
      const toast = new ToastNotification();
      const element = toast.showToast({ position: 'middle' as unknown as 'top-right' });

      expect(element?.getAttribute('style')).toContain('slideInFromRight');
      expect(toast.container?.style.right).toBe('0px');
    });

    it('disables the animation when requested', () => {
      const toast = new ToastNotification();
      const element = toast.showToast({ animation: false, body: 'calm' });

      expect(element?.style.animation).toBe('none');
    });
  });

  describe('duration handling', () => {
    it('auto-dismisses after the default 3000ms plus the exit animation', () => {
      jest.useFakeTimers();
      const toast = new ToastNotification();
      const element = toast.showToast({ body: 'timed' });

      jest.advanceTimersByTime(2999);
      expect(element?.dataset.closed).toBeUndefined();

      jest.advanceTimersByTime(1);
      expect(element?.dataset.closed).toBe('true');

      jest.advanceTimersByTime(300);
      expect(toastElements()).toHaveLength(0);
      expect(toast.toasts).toHaveLength(0);
    });

    it('honours a custom duration', () => {
      jest.useFakeTimers();
      const toast = new ToastNotification();
      const element = toast.showToast({ body: 'quick', duration: 500 });

      jest.advanceTimersByTime(500);
      expect(element?.dataset.closed).toBe('true');
    });

    it.each([
      ['zero', 0],
      ['negative', -100],
      ['string', '3000'],
      ['NaN', Number.NaN],
    ] as const)('keeps %s durations persistent', (_label, duration) => {
      jest.useFakeTimers();
      const toast = new ToastNotification();
      const element = toast.showToast({
        body: 'sticky',
        duration: duration as unknown as number,
      });

      jest.advanceTimersByTime(60_000);
      expect(element?.dataset.closed).toBeUndefined();
      expect(toastElements()).toHaveLength(1);
    });

    it('treats an explicit null duration as the 3000ms default', () => {
      jest.useFakeTimers();
      const toast = new ToastNotification();
      const element = toast.showToast({
        body: 'null duration',
        duration: null as unknown as number,
      });

      jest.advanceTimersByTime(3000);
      expect(element?.dataset.closed).toBe('true');
    });
  });

  describe('content', () => {
    it('renders header, body, footer and logo', () => {
      const toast = new ToastNotification();
      const element = toast.showToast({
        header: 'Heads up',
        body: 'Session expiring',
        footer: 'Save your work',
        logo: 'https://cdn.example.com/logo.png',
      });

      expect(element?.querySelector('strong')?.textContent).toBe('Heads up');
      expect(element?.textContent).toContain('Session expiring');
      expect(element?.textContent).toContain('Save your work');

      const image = element?.querySelector('img');
      expect(image?.getAttribute('src')).toBe('https://cdn.example.com/logo.png');
      expect(image?.getAttribute('alt')).toBe('logo');
      expect(image?.getAttribute('draggable')).toBe('false');
      expect(image?.style.width).toBe('30px');
    });

    it('renders header and footer as plain text, never HTML', () => {
      const toast = new ToastNotification();
      const element = toast.showToast({
        header: '<b>bold</b>',
        body: 'body',
        footer: '<i>italic</i>',
      });

      expect(element?.querySelector('strong')?.textContent).toBe('<b>bold</b>');
      expect(element?.querySelector('b')).toBeNull();
      expect(element?.querySelector('i')).toBeNull();
    });

    it('accepts a relative logo url', () => {
      const toast = new ToastNotification();
      const element = toast.showToast({ body: 'text', logo: '/assets/logo.svg' });

      expect(element?.querySelector('img')?.getAttribute('src')).toBe('/assets/logo.svg');
    });

    it('skips unsafe or empty logo urls', () => {
      const toast = new ToastNotification();
      const unsafe = toast.showToast({ body: 'a', logo: 'javascript:alert(1)' });
      const empty = toast.showToast({ body: 'b', logo: '   ' });

      expect(unsafe?.querySelector('img')).toBeNull();
      expect(empty?.querySelector('img')).toBeNull();
    });

    it.each(['#abc', '#aabbcc', '#aabbccdd', 'rgb(1, 2, 3)', 'rgba(1, 2, 3, 0.5)'])(
      'accepts the safe color %s',
      (color) => {
        const toast = new ToastNotification();
        const element = toast.showToast({ body: 'text', color });

        expect(element?.style.backgroundColor).toBe(cssColor(color));
      },
    );

    it('ignores an unsafe color and keeps the type default', () => {
      const toast = new ToastNotification();
      const element = toast.showToast({
        type: 'success',
        body: 'text',
        color: 'red; background: url(javascript:alert(1))',
      });

      expect(element?.style.backgroundColor).toBe(cssColor('#28a745'));
    });

    it('sanitizes HTML in the body', () => {
      const toast = new ToastNotification();
      const element = toast.showToast({
        body: '<script>alert(1)</script><strong class="x">Safe</strong><img src="x" onerror="alert(2)">',
      });

      expect(element?.querySelector('script')).toBeNull();
      expect(element?.querySelector('strong')?.textContent).toBe('Safe');
      expect(element?.querySelector('strong')?.getAttribute('class')).toBeNull();
      expect(element?.querySelector('img')?.getAttribute('onerror')).toBeNull();
    });

    it('renders an action button only when text and handler are provided', () => {
      const onClick = jest.fn();
      const toast = new ToastNotification();

      const withButton = toast.showToast({
        body: 'text',
        actionButton: { text: 'Retry', onClick },
      });
      const withoutText = toast.showToast({
        body: 'text',
        actionButton: { text: '', onClick },
      });
      const withoutHandler = toast.showToast({
        body: 'text',
        actionButton: { text: 'Retry', onClick: undefined as unknown as () => void },
      });
      const invalid = toast.showToast({
        body: 'text',
        actionButton: 'nope' as unknown as { text: string; onClick: () => void },
      });

      expect(withButton?.querySelectorAll('button')).toHaveLength(2);
      expect(withButton?.querySelector('button:not([aria-label])')?.textContent).toBe('Retry');
      expect(withoutText?.querySelectorAll('button')).toHaveLength(1);
      expect(withoutHandler?.querySelectorAll('button')).toHaveLength(1);
      expect(invalid?.querySelectorAll('button')).toHaveLength(1);
    });
  });

  describe('interactions', () => {
    it('fires onClick and closes when the toast body is clicked', () => {
      jest.useFakeTimers();
      const onClick = jest.fn();
      const toast = new ToastNotification();
      const element = toast.showToast({ body: 'clickable', duration: 0, onClick });

      element
        ?.querySelectorAll('div')[1]
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(element?.dataset.closed).toBe('true');
    });

    it('does not fire onClick when the close button is clicked', () => {
      jest.useFakeTimers();
      const onClick = jest.fn();
      const toast = new ToastNotification();
      const element = toast.showToast({ body: 'closable', duration: 0, onClick });

      element
        ?.querySelector('button[aria-label="Close notification"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(onClick).not.toHaveBeenCalled();
      expect(element?.dataset.closed).toBe('true');
    });

    it('keeps the toast open and skips onClick when the action button is clicked', () => {
      const onAction = jest.fn();
      const onClick = jest.fn();
      const toast = new ToastNotification();
      const element = toast.showToast({
        body: 'action',
        duration: 0,
        onClick,
        actionButton: { text: 'Undo', onClick: onAction },
      });

      element
        ?.querySelector('button:not([aria-label])')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
      expect(element?.dataset.closed).toBeUndefined();
    });

    it('pauses the timer on hover and restarts it on leave', () => {
      jest.useFakeTimers();
      const toast = new ToastNotification();
      const element = toast.showToast({ body: 'hover me', duration: 1000 });

      element?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      jest.advanceTimersByTime(5000);
      expect(element?.dataset.closed).toBeUndefined();

      element?.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
      jest.advanceTimersByTime(1000);
      expect(element?.dataset.closed).toBe('true');
    });

    it('applies hover styles and resets them on leave', () => {
      const toast = new ToastNotification();
      const element = toast.showToast({ body: 'hover me', duration: 0 });

      element?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      expect(element?.style.transform).toBe('scale(1.05)');
      expect(element?.style.opacity).toBe(cssValue('opacity', '0.9'));

      element?.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
      expect(element?.style.transform).toBe('scale(1)');
      expect(element?.style.opacity).toBe(cssValue('opacity', '1'));
    });

    it('applies hover feedback to the close and action buttons', () => {
      const toast = new ToastNotification();
      const element = toast.showToast({
        body: 'buttons',
        duration: 0,
        actionButton: { text: 'Undo', onClick: jest.fn() },
      });

      const close = element?.querySelector(
        'button[aria-label="Close notification"]',
      ) as HTMLButtonElement;
      const action = element?.querySelector('button:not([aria-label])') as HTMLButtonElement;

      close.dispatchEvent(new MouseEvent('mouseover'));
      expect(close.style.color).toBe(cssValue('color', '#fff'));
      close.dispatchEvent(new MouseEvent('mouseout'));
      expect(close.style.color).toBe(cssValue('color', '#000'));

      action.dispatchEvent(new MouseEvent('mouseover'));
      expect(action.style.color).toBe(cssValue('color', '#000'));
      action.dispatchEvent(new MouseEvent('mouseout'));
      expect(action.style.color).toBe(cssValue('color', '#fff'));
    });

    it('ignores hover events that originate from child elements', () => {
      const toast = new ToastNotification();
      const element = toast.showToast({ body: 'nested', duration: 0 });
      const child = element?.querySelector('strong') ?? element?.firstElementChild;

      element?.dispatchEvent(
        new MouseEvent('mouseover', { bubbles: true, relatedTarget: child as EventTarget }),
      );

      expect(element?.style.transform).toBe('');
    });
  });

  describe('lifecycle', () => {
    it('closes a single toast and removes it after the exit animation', () => {
      jest.useFakeTimers();
      const toast = new ToastNotification();
      const element = toast.showToast({ body: 'bye', duration: 0 }) as HTMLDivElement;

      toast.closeToast(element);
      expect(element.dataset.closed).toBe('true');

      jest.advanceTimersByTime(300);
      expect(toastElements()).toHaveLength(0);
      expect(toast.toasts).toHaveLength(0);
    });

    it('ignores repeated and foreign close calls', () => {
      jest.useFakeTimers();
      const toast = new ToastNotification();
      const element = toast.showToast({ body: 'once', duration: 0 }) as HTMLDivElement;
      const foreign = document.createElement('div');

      expect(() => toast.closeToast(null as unknown as HTMLDivElement)).not.toThrow();
      expect(() => toast.closeToast(foreign)).not.toThrow();

      toast.closeToast(element);
      toast.closeToast(element);

      jest.advanceTimersByTime(300);
      expect(toastElements()).toHaveLength(0);
      expect(toast.toasts).toHaveLength(0);
    });

    it('clears all toasts while keeping the container', () => {
      jest.useFakeTimers();
      const toast = new ToastNotification();
      toast.showToast({ body: 'one', duration: 0 });
      toast.showToast({ body: 'two', duration: 0 });

      toast.clearAll();
      expect(
        Array.from(toastElements()).every((element) => element.dataset.closed === 'true'),
      ).toBe(true);

      jest.advanceTimersByTime(300);
      expect(toastElements()).toHaveLength(0);
      expect(container()).not.toBeNull();
    });

    it('destroys the container and resets state', () => {
      jest.useFakeTimers();
      const toast = new ToastNotification();
      toast.showToast({ body: 'bye', duration: 0 });

      toast.destroy();
      jest.advanceTimersByTime(300);

      expect(toast.container).toBeNull();
      expect(toast.toasts).toEqual([]);
      expect(container()).toBeNull();
    });

    it('ignores closeToast calls once the container is gone', () => {
      const toast = new ToastNotification();
      const element = toast.showToast({ body: 'detached', duration: 0 }) as HTMLDivElement;

      toast.destroy();

      expect(() => toast.closeToast(element)).not.toThrow();
    });
  });

  describe('helpers', () => {
    it('detects HTML strings', () => {
      const toast = new ToastNotification();

      expect(toast.isItHtml('<strong>Hi</strong>')).toBe(true);
      expect(toast.isItHtml('plain text')).toBe(false);
      expect(toast.isItHtml('')).toBe(false);
      expect(toast.isItHtml(undefined as unknown as string)).toBe(false);
      expect(toast.isItHtml(5 as unknown as string)).toBe(false);
    });

    it('exposes defaults through the getters', () => {
      const toast = new ToastNotification();

      expect(toast.getColor('success')).toBe('#28a745');
      expect(toast.getColor('error')).toBe('#dc3545');
      expect(toast.getColor('warning')).toBe('#ffc107');
      expect(toast.getColor('info')).toBe('#0096FF');
      expect(toast.getColor('unknown')).toBe('#0096FF');

      expect(toast.getAnimation('top-left')).toBe('slideInFromLeft 0.5s ease-out');
      expect(toast.getAnimation('top-right')).toBe('slideInFromRight 0.5s ease-out');
      expect(toast.getAnimation('bottom-left')).toBe('slideInFromLeft 0.5s ease-out');
      expect(toast.getAnimation('bottom-right')).toBe('slideInFromRight 0.5s ease-out');
      expect(toast.getAnimation('unknown')).toBe('slideInFromRight 0.5s ease-out');

      expect(toast.getActionButtonColor('success')).toBe('#218838');
      expect(toast.getActionButtonColor('error')).toBe('#c82333');
      expect(toast.getActionButtonColor('warning')).toBe('#e0a800');
      expect(toast.getActionButtonColor('info')).toBe('#007bff');
      expect(toast.getActionButtonColor('unknown')).toBe('#007bff');
    });
  });
});
