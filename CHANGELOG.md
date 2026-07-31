# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



---

## [1.0.0] - 2026-08-03

### Added
- Initial release of `@codewithrajat/rm-toast-notification`.
- Framework-agnostic, dependency-light toast notification service for JavaScript and TypeScript.
- `ToastNotification` class with `showToast`, `closeToast`, `clearAll`, and `destroy` methods.
- Four toast types: `success`, `error`, `warning`, and `info`.
- Four positions: `top-left`, `top-right`, `bottom-left`, and `bottom-right`.
- Auto-dismiss with configurable `duration` (set `0` for persistent toasts).
- Pause on hover while the toast is active.
- Optional `header`, `footer`, `logo`, and custom `color` support.
- Optional action button with a click handler.
- `onClick` handler for the toast element.
- Toggleable slide-in/out `animation`.
- Safe HTML body rendering via DOMPurify.
- Protection against CSS injection (stripped inline styles, blocked `expression()`, `url(javascript:...)`, and `@import`).
- Validated logo URLs (safe schemes only) and restricted custom color formats.
- Accessibility-friendly close button with `aria-label`.
- SSR-safe guards against missing `document` access.
- Full TypeScript typings and zero side effects for tree-shaking.
- Works with vanilla JavaScript, React, Angular, Vue, and Svelte.

---

[1.0.0]: https://github.com/malikrajat/rm-toast-notification/releases/tag/v1.0.0

## Previous Versions

For changelog entries prior to v6.0.0, please refer to the [GitHub Releases](https://github.com/malikrajat/rm-toast-notification/releases) page.
