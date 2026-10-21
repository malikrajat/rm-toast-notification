import DOMPurify from 'dompurify';

/**
 * Allowed toast types.
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Allowed toast positions.
 */
export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * Action button configuration.
 */
export interface ToastActionButton {
  text: string;
  onClick: (event: MouseEvent) => void;
}

/**
 * Options for showing a toast.
 */
export interface ToastOptions {
  type?: ToastType;
  position?: ToastPosition;
  duration?: number;
  header?: string;
  footer?: string;
  body?: string;
  logo?: string;
  color?: string;
  onClick?: (event: MouseEvent) => void;
  actionButton?: ToastActionButton;
  animation?: boolean;
}

/**
 * Default toast colors per type.
 */
const DEFAULT_COLORS: Record<ToastType, string> = {
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107',
  info: '#0096FF',
};

/**
 * Default action button colors per type.
 */
const ACTION_BUTTON_COLORS: Record<ToastType, string> = {
  success: '#218838',
  error: '#c82333',
  warning: '#e0a800',
  info: '#007bff',
};

/**
 * Slide-in animations per position.
 */
const ANIMATIONS: Record<ToastPosition, string> = {
  'top-left': 'slideInFromLeft 0.5s ease-out',
  'top-right': 'slideInFromRight 0.5s ease-out',
  'bottom-left': 'slideInFromLeft 0.5s ease-out',
  'bottom-right': 'slideInFromRight 0.5s ease-out',
};

/**
 * Whitelist of allowed URL protocols for the logo.
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:', 'data:'];

/**
 * Validates that a URL only uses an allowed protocol.
 * Prevents `javascript:`, `vbscript:`, and other dangerous URIs.
 */
function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    // Relative URLs (no protocol) are safe.
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) === false) return true;
    const base = typeof window !== 'undefined' ? window.location.href : undefined;
    const parsed = new URL(trimmed, base);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validates a hex or rgb/rgba color string to prevent CSS injection.
 */
function isSafeColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false;
  const trimmed = color.trim();
  const hexPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
  const rgbPattern = /^rgba?\(\s*[\d.%\s,/-]+\s*\)$/i;
  return hexPattern.test(trimmed) || rgbPattern.test(trimmed);
}

/**
 * Dangerous CSS patterns that enable script execution or data exfiltration.
 * - `expression()`        : IE-only script execution
 * - `url(javascript:...)` : script execution via CSS
 * - `url(data:text/html)` : HTML injection via CSS
 * - `url(vbscript:...)`   : script execution via CSS
 * - `@import`             : external resource loading / data exfiltration
 * - `behavior`            : IE-only HTC script binding
 * - `-moz-binding`        : Firefox XBL script binding
 */
const DANGEROUS_CSS_PATTERNS: RegExp[] = [
  /expression\s*\(/i,
  /url\s*\(\s*['"]?\s*(javascript|vbscript|data\s*:\s*text\/html|livescript|mocha)/i,
  /@import/i,
  /behavior\s*:/i,
  /-moz-binding/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
];

/**
 * Sanitizes a raw CSS string by stripping dangerous constructs.
 * Use this for any user-supplied CSS values that will be injected via
 * `style` attributes or `<style>` tags.
 *
 * @returns A sanitized CSS string, or '' if the input is unsafe.
 */
function sanitizeCss(css: string): string {
  if (!css || typeof css !== 'string') return '';
  let result = css;
  for (const pattern of DANGEROUS_CSS_PATTERNS) {
    if (pattern.test(result)) {
      // Strip the offending declaration entirely.
      result = result.replace(pattern, '');
    }
  }
  // Remove any remaining `url()` that points to non-http(s) protocols.
  result = result.replace(/url\s*\(\s*['"]?\s*([^'")]+?)\s*['"]?\s*\)/gi, (match, url: string) => {
    const trimmed = url.trim();
    if (/^https?:/i.test(trimmed) || !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
      return match; // http(s) or relative URL — keep
    }
    return ''; // drop everything else
  });
  return result.trim();
}

/**
 * Sanitizes a plain string for safe insertion as text content.
 */
function sanitizeText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

class ToastNotification {
  container: HTMLDivElement | null = null;
  toasts: HTMLDivElement[] = [];
  private static styleInjected = false;
  private static containerId = 'toast-container';

  constructor() {
    // SSR guard: never touch the DOM when document/body is unavailable.
    // `showToast()` returns `null` in that environment and `destroy()`
    // stays a no-op, so importing the library during SSR is safe.
    if (typeof document === 'undefined') {
      return;
    }

    if (!document.body) {
      this.container = document.createElement('div');
      return;
    }

    // Reuse an existing container if one already exists (avoid duplicates).
    const existing = document.getElementById(ToastNotification.containerId);
    if (existing && existing instanceof HTMLDivElement) {
      this.container = existing;
    } else {
      this.container = document.createElement('div');
      this.container.id = ToastNotification.containerId;
      this.container.style.position = 'fixed';
      this.container.style.zIndex = '9999';
      this.container.style.width = '500px';
      this.container.style.maxWidth = '100%';
      document.body.appendChild(this.container);
    }

    // Inject the global animation styles only once.
    ToastNotification.injectStyles();
  }

  /**
   * Injects the keyframe animations into the document head (once).
   */
  private static injectStyles(): void {
    if (ToastNotification.styleInjected) return;
    if (typeof document === 'undefined' || !document.head) return;

    const style: HTMLStyleElement = document.createElement('style');
    style.textContent = `

/* Toast slide-in from left */
@keyframes slideInFromLeft {
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

/* Toast slide-in from right */
@keyframes slideInFromRight {
  0% { transform: translateX(100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

/* Toast slide-out to left */
@keyframes slideOutToLeft {
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(-100%); opacity: 0; }
}

/* Toast slide-out to right */
@keyframes slideOutToRight {
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
}
`;
    document.head.appendChild(style);
    ToastNotification.styleInjected = true;
  }

  /**
   * Validates and normalizes the toast type.
   */
  private validateType(type: unknown): ToastType {
    const allowed: ToastType[] = ['success', 'error', 'warning', 'info'];
    return allowed.includes(type as ToastType) ? (type as ToastType) : 'info';
  }

  /**
   * Validates and normalizes the toast position.
   */
  private validatePosition(position: unknown): ToastPosition {
    const allowed: ToastPosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    return allowed.includes(position as ToastPosition) ? (position as ToastPosition) : 'top-right';
  }

  showToast(options: ToastOptions = {}): HTMLDivElement | null {
    // SSR guard: return without any DOM work when there is no document,
    // no body, or the instance was created in a non-DOM environment.
    if (typeof document === 'undefined' || !document.body || !this.container) return null;
    const container = this.container;

    const type = this.validateType(options.type);
    const position = this.validatePosition(options.position);
    // duration: null/undefined => default 3000; 0 or negative => persistent.
    const rawDuration = options.duration;
    const duration =
      rawDuration === null || rawDuration === undefined
        ? 3000
        : typeof rawDuration === 'number' && rawDuration > 0
          ? rawDuration
          : 0;
    const header = sanitizeText(options.header);
    const footer = sanitizeText(options.footer);
    const body = sanitizeText(options.body);
    const logo = sanitizeText(options.logo);
    const color = isSafeColor(options.color || '') ? (options.color as string) : '';
    const onClick = typeof options.onClick === 'function' ? options.onClick : null;
    const actionButton =
      options.actionButton && typeof options.actionButton === 'object'
        ? options.actionButton
        : null;
    const animation = options.animation !== false;

    const toast: HTMLDivElement = document.createElement('div');
    // type is validated against a whitelist, so interpolation is safe.
    toast.className = `toast toast-${type}`;
    toast.style.position = 'relative';
    toast.style.padding = '1em';
    toast.style.margin = '0.5em';
    toast.style.backgroundColor = color || DEFAULT_COLORS[type];
    toast.style.borderRadius = '5px';
    toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    toast.style.animation = animation ? ANIMATIONS[position] : 'none';
    toast.style.display = 'flex';
    toast.style.flexDirection = 'row';
    toast.style.alignItems = 'center';
    toast.style.justifyContent = 'flex-start';
    toast.style.transition = 'transform 0.3s ease, background-color 0.3s ease';

    // Use relatedTarget checks so hover handlers do not fire on child elements.
    const isEnter = (e: MouseEvent) => !toast.contains(e.relatedTarget as Node | null);

    const handleMouseEnter = () => {
      toast.style.transform = 'scale(1.05)';
      toast.style.opacity = '0.90';
      toast.style.boxShadow = '0 4px 10px rgba(0,0,0,0.5)';
    };

    const handleMouseLeave = () => {
      toast.style.transform = 'scale(1)';
      toast.style.opacity = '1';
      toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    };

    const handleMouseOver = (e: MouseEvent) => {
      if (isEnter(e)) handleMouseEnter();
    };
    const handleMouseOut = (e: MouseEvent) => {
      if (isEnter(e)) handleMouseLeave();
    };

    toast.addEventListener('mouseover', handleMouseOver);
    toast.addEventListener('mouseout', handleMouseOut);

    // Close button — uses textContent (no innerHTML) and aria-label for a11y.
    const closeButton: HTMLButtonElement = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = '\u00D7'; // ×
    closeButton.setAttribute('aria-label', 'Close notification');
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.border = 'none';
    closeButton.style.background = 'transparent';
    closeButton.style.fontSize = '20px';
    closeButton.style.color = '#000';
    closeButton.style.cursor = 'pointer';
    closeButton.style.zIndex = '1001';
    closeButton.style.transition = 'color 0.3s ease';

    closeButton.addEventListener('mouseover', () => {
      closeButton.style.color = '#fff';
    });
    closeButton.addEventListener('mouseout', () => {
      closeButton.style.color = '#000';
    });

    // Left column (logo).
    const leftColumn: HTMLDivElement = document.createElement('div');
    leftColumn.style.flex = '0 0 auto';
    leftColumn.style.marginRight = '15px';

    if (logo && isSafeUrl(logo)) {
      const logoImg: HTMLImageElement = document.createElement('img');
      logoImg.src = logo;
      logoImg.alt = 'logo';
      logoImg.style.width = '30px';
      logoImg.style.height = '30px';
      logoImg.style.objectFit = 'contain';
      logoImg.draggable = false;
      leftColumn.appendChild(logoImg);
    }

    // Right column (header, body, action, footer).
    const rightColumn: HTMLDivElement = document.createElement('div');
    rightColumn.style.flex = '1 1 auto';
    rightColumn.style.display = 'flex';
    rightColumn.style.flexDirection = 'column';
    rightColumn.style.justifyContent = 'center';

    if (header) {
      const headerElem: HTMLElement = document.createElement('strong');
      headerElem.textContent = header; // safe
      rightColumn.appendChild(headerElem);
    }

    const bodyElem: HTMLDivElement = document.createElement('div');
    if (body) {
      // Sanitize HTML through DOMPurify.
      // - FORBID_ATTR: ['style'] strips inline style attributes to prevent
      //   CSS injection (e.g. `style="background:url(javascript:...)"`).
      // - FORBID_TAGS: ['style'] strips <style> blocks that could carry
      //   `@import` or `expression()` payloads.
      // - USE_PROFILES: { html: true } restricts output to HTML only.
      const sanitized = DOMPurify.sanitize(body, {
        USE_PROFILES: { html: true },
        FORBID_ATTR: ['style', 'class', 'id', 'onload', 'onerror', 'onclick'],
        FORBID_TAGS: [
          'style',
          'script',
          'iframe',
          'object',
          'embed',
          'link',
          'meta',
          'base',
          'form',
        ],
        ALLOW_DATA_ATTR: false,
      });
      bodyElem.innerHTML = sanitized;
      // Defense-in-depth: scrub any inline styles that slipped through.
      bodyElem.querySelectorAll('[style]').forEach((el) => {
        const styleValue = el.getAttribute('style') || '';
        const cleaned = sanitizeCss(styleValue);
        if (cleaned) {
          el.setAttribute('style', cleaned);
        } else {
          el.removeAttribute('style');
        }
      });
    }
    rightColumn.appendChild(bodyElem);

    if (actionButton?.text && typeof actionButton.onClick === 'function') {
      const button: HTMLButtonElement = document.createElement('button');
      button.type = 'button';
      button.textContent = sanitizeText(actionButton.text); // safe
      button.style.width = 'fit-content';
      button.style.maxWidth = '150px';
      button.style.padding = '0.5em 1em';
      button.style.marginTop = '10px';
      button.style.backgroundColor = ACTION_BUTTON_COLORS[type];
      button.style.color = '#FFF';
      button.style.border = 'none';
      button.style.borderRadius = '5px';
      button.style.cursor = 'pointer';
      button.style.display = 'block';
      button.style.transition = 'background-color 0.3s ease';
      button.style.zIndex = '1000';

      button.addEventListener('mouseover', () => {
        button.style.color = '#000';
      });
      button.addEventListener('mouseout', () => {
        button.style.color = '#fff';
      });

      // Stop propagation so the toast-level onClick does not also fire.
      button.addEventListener('click', (event: MouseEvent) => {
        event.stopPropagation();
        actionButton.onClick(event);
      });
      rightColumn.appendChild(button);
    }

    if (footer) {
      const footerElem: HTMLDivElement = document.createElement('div');
      footerElem.textContent = footer; // safe
      rightColumn.appendChild(footerElem);
    }

    toast.appendChild(leftColumn);
    toast.appendChild(rightColumn);

    // Timer management — single timeout, restart-safe.
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const clearTimer = () => {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
    };
    const startTimer = () => {
      clearTimer();
      if (duration > 0) {
        timeout = setTimeout(() => {
          this.closeToast(toast);
        }, duration);
      }
    };

    // Pause on hover, resume on leave.
    toast.addEventListener('mouseover', clearTimer);
    toast.addEventListener('mouseout', startTimer);

    // Toast-level click. Ignore clicks that originate from buttons.
    toast.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target?.closest('button')) return;
      if (onClick) onClick(event);
      this.closeToast(toast);
    });

    // Close button click — stop propagation, then close.
    closeButton.addEventListener('click', (event: MouseEvent) => {
      event.stopPropagation();
      this.closeToast(toast);
    });

    toast.appendChild(closeButton);

    // Position the container (validated position).
    container.style[position.includes('top') ? 'top' : 'bottom'] = '0px';
    container.style[position.includes('right') ? 'right' : 'left'] = '0px';
    container.appendChild(toast);
    this.toasts.push(toast);

    startTimer();

    return toast;
  }

  /**
   * Detects whether a string contains HTML markup.
   */
  isItHtml(str: string): boolean {
    if (!str || typeof str !== 'string') return false;
    const doc: Document = new DOMParser().parseFromString(str, 'text/html');
    return Array.from(doc.body.childNodes).some((node) => node.nodeType === 1);
  }

  /**
   * Closes and removes a toast. Idempotent — safe to call multiple times.
   */
  closeToast(toast: HTMLDivElement): void {
    const container = this.container;
    if (!toast || !container?.contains(toast)) return;
    // Prevent double-close.
    if (toast.dataset.closed === 'true') return;
    toast.dataset.closed = 'true';

    toast.style.transform = 'scale(0.9)';
    toast.style.opacity = '0';

    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
        const index: number = this.toasts.indexOf(toast);
        if (index !== -1) {
          this.toasts.splice(index, 1);
        }
      }
    }, 300);
  }

  /**
   * Removes all active toasts.
   */
  clearAll(): void {
    // Clone the array because closeToast mutates it.
    [...this.toasts].forEach((toast) => {
      this.closeToast(toast);
    });
  }

  /**
   * Destroys the toast container and all toasts. Useful for SPA route changes.
   */
  destroy(): void {
    this.clearAll();
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.toasts = [];
  }

  getColor(type: string): string {
    return DEFAULT_COLORS[this.validateType(type) as ToastType] || DEFAULT_COLORS.info;
  }

  getAnimation(position: string): string {
    return ANIMATIONS[this.validatePosition(position) as ToastPosition] || ANIMATIONS['top-right'];
  }

  getActionButtonColor(type: string): string {
    return ACTION_BUTTON_COLORS[this.validateType(type) as ToastType] || ACTION_BUTTON_COLORS.info;
  }
}

export default ToastNotification;
export { isSafeColor, isSafeUrl, sanitizeCss, sanitizeText };
