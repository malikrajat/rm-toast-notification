# FAQ

Short answers to the questions that come up most often. For symptoms and fixes, see
[Troubleshooting](./troubleshooting.md).

---

## What is rm-toast-notification?

A lightweight, framework-agnostic toast notification service written in TypeScript. It renders
timed notifications into a shared container, validates and sanitizes every option, and works with
vanilla JavaScript, React, Angular, Vue, and Svelte.

## Does it have dependencies?

One runtime dependency: [DOMPurify](https://www.npmjs.com/package/dompurify), used to sanitize the
`body` HTML. Everything else in `package.json` is development-only.

## Which frameworks are supported?

Any framework that runs in a browser. See [Framework Integration](./frameworks.md) for recipes.

## Is it SSR-safe?

Yes. Constructing the service or calling `showToast()` where there is no `document` or
`document.body` is safe: `showToast()` returns `null` and `destroy()` is a no-op. You still need to
call `showToast()` from browser-only code paths to actually display anything.

## How do I make a toast that never disappears?

```ts
toast.showToast({ body: 'Stays until dismissed', duration: 0 });
```

`0` or any negative number is persistent. `null` and `undefined` fall back to the 3000 ms default —
they are **not** persistent.

## How do I close a toast programmatically?

```ts
const element = toast.showToast({ body: 'Bye', duration: 0 });
if (element) toast.closeToast(element);
```

`closeToast()` is idempotent: calling it twice, or on an element that is not in the container, does
nothing.

## How do I remove all toasts at once?

```ts
toast.clearAll(); // keep the container, remove the messages
toast.destroy();  // remove the container too (SPA teardown / logout)
```

## Can I have more than one toast visible at a time?

Yes. Every `showToast()` call appends a new toast to the same container, and they stack in insertion
order. There is no built-in limit, so cap the stack yourself if you expect bursts — see
[Filtering and deduplication](../examples/04-filtering-and-deduplication.md).

## Can I create multiple instances?

Yes, but they share one container (`a.container === b.container`). Creating several instances is
harmless; it is also unnecessary unless you want different wrappers or configurations.

## Is HTML in `body` safe?

It is sanitized by DOMPurify with a restrictive profile before insertion, and inline CSS is scrubbed
a second time. Rich text such as `<strong>` and `<em>` survives; `<script>` and event handlers do
not. Attribute-level styling (`class`, `id`, `style`) is stripped by design — see
[Configuration](./configuration.md) and [Security](./security.md).

## Why did my `class` or `style` attribute inside `body` disappear?

Because DOMPurify is configured to forbid `class`, `id`, and `style` on body content. This prevents
CSS injection and avoids interference with your application styles. Target the documented selectors
from your stylesheet instead (`.toast`, `.toast-error`, `#toast-container`).

## What happens when the user hovers a toast?

The auto-dismiss timer is cleared, the toast scales to 1.05 with a stronger shadow, and the timer
restarts from the full duration when the pointer leaves. Touch devices do not fire hover events, so
touch users see no pause.

## How do I attach an action button?

```ts
toast.showToast({
  type: 'error',
  body: 'Upload failed',
  duration: 0,
  actionButton: { text: 'Retry', onClick: () => retry() },
});
```

The button's click handler runs after `stopPropagation()`, so it neither closes the toast nor
triggers the toast-level `onClick`.

## How do I react to a toast being clicked?

Pass `onClick`. The handler runs and then the toast closes. Clicks originating from the close button
or the action button are ignored.

## Can I disable animations?

Yes: `animation: false` skips the slide-in keyframe. The close transition still applies unless you
neutralise it in CSS — see [Accessibility](./accessibility.md).

## Can I use my own colors?

Yes, with strict validation: hex (`#rgb`, `#rrggbb`, `#rrggbbaa`) or `rgb()` / `rgba()`. Named colors
and `hsl()` are rejected, because the validation exists to prevent CSS injection.

## Can I set the text color?

Not through the options. The toast background is set inline; text color comes from your stylesheet.
Use `.toast-warning { color: #1f2937; }` (or an id-qualified rule) for explicit control.

## Can I change the width or position of the container?

Not through options. The container is 500px wide with `max-width: 100%` and anchored to the side
implied by `position`. Override it in CSS:

```css
#toast-container { width: 380px; }
```

Because the library writes `top`/`bottom` and `left`/`right` inline, use `!important` if you need to
override the anchor itself.

## Is there a queue, retry, or promise helper?

No. Those are application concerns; the [wrapper pattern](./advanced-configuration.md) is the
intended place for them.

## Does it play sounds or vibrate?

No. Trigger `navigator.vibrate()` or audio playback from your own code.

## What browsers are supported?

Chrome 80+, Edge 80+, Firefox 75+, Safari 13+, Opera 67+, Samsung Internet 12+. Internet Explorer is
not supported. Details in [Browser Support](./browser-support.md).

## Does it work in a Web Worker or Node?

The module imports cleanly, `showToast()` returns `null`, and nothing throws. There is no DOM to
render into, so the toast is simply not displayed.

## How is the package published?

`pnpm run build` emits `dist/`, `copy-extra-files.js` copies metadata into it, and the `files`
allow-list limits the tarball to the built output plus README, CHANGELOG, and LICENSE. Tagged releases
publish through GitHub Actions with npm provenance.

## Where do I report a bug or a security issue?

- Bugs and features:
  [GitHub Issues](https://github.com/malikrajat/rm-toast-notification/issues)
- Security: email [mr.rajatmalik@gmail.com](mailto:mr.rajatmalik@gmail.com?subject=rm-toast-notification%20security)
  instead of opening a public issue

---

**Previous:** [Testing Guide](./testing.md) · **Next:** [Troubleshooting](./troubleshooting.md) · [Back to documentation index](./README.md)
