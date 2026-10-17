# Browser Support

## Supported browsers

| Browser | Minimum version | Support level |
|---|---|---|
| Chrome | 80+ | Full |
| Edge (Chromium) | 80+ | Full |
| Firefox | 75+ | Full |
| Safari (macOS) | 13+ | Full |
| iOS Safari | 13+ | Full |
| Opera | 67+ | Full |
| Samsung Internet | 12+ | Full |
| Chrome for Android | 80+ | Full |

## Not supported

- Internet Explorer (all versions)
- Legacy EdgeHTML (Edge 18 and older)
- Browsers released before 2019 without `Element.prototype.dataset`, `Node.contains`, or `URL`

The library does not ship a legacy bundle or polyfills. If you must support an old browser, transpile
and polyfill it in your own build pipeline.

---

## Web platform features used

| Feature | Used for | Baseline availability |
|---|---|---|
| ES modules (`import` / `export`) | Package format | Chrome 61+, Firefox 60+, Safari 11+, Edge 16+ |
| `const` / `let`, arrow functions, template literals | Build output (ES2019 target) | All supported browsers |
| Optional chaining / nullish coalescing | Not required by the library; safe in your own code on these targets | Chrome 80+, Firefox 74+, Safari 13.1+ |
| `Object.assign`-style spread in your own wrappers | Preset merging patterns | All supported browsers |
| Flexbox | Toast layout (logo column + content column) | All supported browsers |
| CSS `@keyframes` + `animation` | Slide-in/slide-out transitions | All supported browsers |
| CSS `transform`, `opacity`, `transition` | Hover scale and exit animation | All supported browsers |
| `Element.dataset` | `data-closed` marker | All supported browsers |
| `Node.contains` | Idempotent close + hover child checks | All supported browsers |
| `URL` constructor | Logo URL validation | Chrome 32+, Firefox 26+, Safari 7+, Edge 12+ |
| `DOMParser` | `isItHtml()` | All supported browsers |
| `setTimeout` / `clearTimeout` | Auto-dismiss and pause/resume | Universal |
| `DOMPurify` | HTML sanitization of `body` | Works in all supported browsers |

---

## Mobile considerations

- The container is `position: fixed` and 500px wide with `max-width: 100%`, so it fits small
  viewports without horizontal scrolling.
- There is no `mouseover`/`mouseout` on touch devices, so the auto-dismiss timer is never paused by
  touch. Tapping the toast closes it; tapping the action button keeps it open.
- Safe-area insets are not applied automatically. On notched devices, add your own padding:

```css
@media (max-width: 480px) {
  #toast-container {
    padding: env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) 0 env(safe-area-inset-left, 0);
  }
}
```

- Toasts are rendered into `document.body`, above the page but below native OS overlays and any
  application element with a higher `z-index` than 9999.

---

## Feature detection snippet

```ts
const canToast = typeof document !== 'undefined'
  && Boolean(document.body)
  && typeof URL === 'function'
  && typeof DOMParser === 'function';
```

---

## Testing matrix in this repository

CI runs the unit suite on Node.js 20 and 22 (LTS) with `jest-environment-jsdom`, which mirrors the
DOM API surface of a modern evergreen browser. Real-browser verification is done through the
[StackBlitz playground](https://stackblitz.com/edit/vitejs-vite-22yb4jvh) linked from the README.

---

**Previous:** [Framework Integration](./frameworks.md) · **Next:** [Architecture](./architecture.md) · **See also:** [Troubleshooting](./troubleshooting.md) · [Back to documentation index](./README.md)
