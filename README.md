# @codewithrajat/rm-toast-notification

<p align="left">
  <img src="https://img.shields.io/npm/v/@codewithrajat/rm-toast-notification.svg" alt="npm version">
  <img src="https://img.shields.io/badge/TypeScript-strict-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/SSR-safe-success" alt="SSR safe">
  <img src="https://img.shields.io/badge/Security-XSS%20%2B%20CSS%20hardening-success" alt="Security hardened">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license">
  <img src="https://img.shields.io/npm/dt/@codewithrajat/rm-toast-notification" alt="npm downloads">
  <img src="https://img.shields.io/badge/Stability-production--ready-success" alt="Production ready">
  <img src="https://img.shields.io/badge/TypeScript-strict-blue" alt="Strict TS">
  <img src="https://img.shields.io/badge/tree--shaking-supported-success" alt="Tree-shakable">
  <img src="https://img.shields.io/badge/Side%20Effects-none-blue" alt="No side effects">
  <img src="https://img.shields.io/badge/Linting-enabled-success" alt="Linting">
  <img src="https://img.shields.io/badge/Tests-covered-blue" alt="Tests">
  <img src="https://img.shields.io/badge/Coverage-90%25-success" alt="Coverage">
  <img src="https://img.shields.io/badge/A11y-WCAG%202.1-success" alt="Accessibility compliant">
  <img src="https://img.shields.io/badge/Dependencies-none-success" alt="No dependencies">
  <img src="https://img.shields.io/npm/last-update/@codewithrajat/rm-toast-notification" alt="Last update">
  <img src="https://img.shields.io/badge/Maintained-yes-success" alt="Maintained">
  <img src="https://img.shields.io/badge/SemVer-compliant-blue" alt="SemVer">
</p>


---

## See It In Action

<div align="center">
  <img src="https://github.com/malikrajat/rm-pushnotify/blob/main/assets/demo.png" alt="rm-pushnotify Demo" width="800"/>
  <br/>
  <img src="https://github.com/malikrajat/rm-pushnotify/blob/main/assets/demo-1.png" alt="rm-pushnotify Demo" width="800"/>

  <p><em>A lightweight, customizable, and secure toast notification library for web applications with auto-dismiss, custom colors, logos, action buttons, and built-in XSS protection.</em></p>
</div>

---

## Overview

**@codewithrajat/rm-toast-notification** is a lightweight, framework-agnostic toast notification library for modern web applications. It provides a zero-config, fully typed TypeScript API that works seamlessly with plain JavaScript, TypeScript, React, Angular, Vue, and Svelte.

Built with security and accessibility as first-class concerns, the library sanitizes all HTML content through DOMPurify, guards against XSS and CSS injection attacks, validates logo URLs and custom colors, and ships an accessible close button with proper ARIA labels.

---

## Table of Contents

- [Features](#features)
- [Live Demo & Playground](#live-demo--playground)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
- [API](#api)
- [Security](#security)
- [FAQ](#faq)
- [Browser Support](#browser-support)
- [Changelog](#changelog)
- [License](#license)
- [Support & Community](#support--community)
- [Author](#author)
- [Other Libraries](#other-libraries)

---

## Live Demo & Playground

<div align="center">
  <table>
    <tr>
      <td align="center" width="50%">
        <a href="https://stackblitz.com/edit/vitejs-vite-22yb4jvh" target="_blank">
          <img src="https://img.shields.io/badge/StackBlitz_Demo-1976D2?style=for-the-badge&logo=stackblitz&logoColor=white" alt="StackBlitz Demo"/>
        </a>
        <br/><br/>
        <sub><b>Interactive Playground</b></sub><br/>
        <sub>Try all features live in your browser</sub>
      </td>
      <td align="center" width="50%">
        <a href="#quick-start" target="_blank">
          <img src="https://img.shields.io/badge/Code_Examples-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Examples"/>
        </a>
        <br/><br/>
        <sub><b>Complete Examples</b></sub><br/>
        <sub>Copy-paste ready code samples</sub>
      </td>
    </tr>
    <tr>
      <td align="center" width="50%">
        <a href="https://www.npmjs.com/package/@codewithrajat/rm-toast-notification" target="_blank">
          <img src="https://img.shields.io/badge/npm_Package-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm Package"/>
        </a>
        <br/><br/>
        <sub><b>npm Registry</b></sub><br/>
        <sub>Install and view package details</sub>
      </td>
      <td align="center" width="50%">
        <a href="https://github.com/malikrajat/rm-toast-notification" target="_blank">
          <img src="https://img.shields.io/badge/GitHub_Repo-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repository"/>
        </a>
        <br/><br/>
        <sub><b>Source Code</b></sub><br/>
        <sub>Star, fork, and contribute</sub>
      </td>
    </tr>
  </table>
</div>

---

## Features

- Framework-agnostic and dependency-light
- Fully typed with TypeScript
- SSR-safe: no crash when the document is unavailable
- Auto-dismiss with configurable duration
- Pause on hover while the toast is active
- Four toast types: success, error, warning, info
- Four positions: top-left, top-right, bottom-left, bottom-right
- Custom background color support
- Optional logo image support
- Optional action button with click handler
- Safe HTML body rendering via DOMPurify
- CSS injection protection for body content and style values
- Accessibility-friendly close button with aria label
- Clear-all and destroy helpers for app teardown




### Key Capabilities

- **4 toast types** — `success`, `error`, `warning`, and `info`, each with a distinct default color
- **4 screen positions** — `top-left`, `top-right`, `bottom-left`, and `bottom-right`
- **Auto-dismiss** — configurable duration with a restart-safe timer; set `duration: 0` for persistent toasts
- **Pause on hover** — the auto-dismiss timer pauses while the mouse is over a toast and resumes on leave, giving users time to read longer messages
- **Rich content** — optional header, body, footer, and custom logo image per toast
- **Action buttons** — attach a custom action button with its own click handler that never triggers the toast-level click
- **Custom styling** — per-toast background colors with strict hex/rgb/rgba validation
- **Toast-level click handling** — trigger a callback when the toast itself is clicked (button clicks are automatically excluded)
- **Animated transitions** — slide-in/slide-out animations per position, toggleable via the `animation` option
- **Hover feedback** — subtle scale and shadow effects on hover to signal interactivity
- **Programmatic control** — `closeToast()`, `clearAll()`, and `destroy()` for full lifecycle management, ideal for SPA route changes and app teardown

### Security Features

- **XSS protection** — body HTML is sanitized through DOMPurify, stripping dangerous tags (`script`, `iframe`, `object`, `embed`, `link`, `meta`, `base`, `form`, `style`), inline style/class/id and event-handler attributes, and disabling data attributes
- **CSS injection protection** — inline styles and `<style>` blocks are scrubbed; dangerous patterns such as `expression()`, `url(javascript:...)`, `@import`, `behavior`, and `-moz-binding` are removed
- **URL validation** — logo URLs are restricted to `http:`, `https:`, and `data:` protocols only
- **Color validation** — custom colors must match strict hex or rgb/rgba patterns
- **Safe DOM insertion** — text fields (header, footer, close button, action button) use `textContent` rather than `innerHTML`

### SSR & Compatibility

- **SSR-safe** — gracefully no-ops when `document` or `document.body` is unavailable, preventing crashes during server-side rendering
- **Container reuse** — a shared toast container is reused across instances to avoid DOM duplication
- **Tree-shakable** — ESM module with `sideEffects: false` for optimal bundle sizes
- **Modern browsers** — works in all evergreen browsers including Chrome, Firefox, Safari, and Edge

---


## Installation

```bash
npm install @codewithrajat/rm-toast-notification
```

```bash
pnpm add @codewithrajat/rm-toast-notification
```

```bash
yarn add @codewithrajat/rm-toast-notification
```

---
<div id="quick-start"></div>
## Quick Start

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';

const toast = new ToastNotification();

toast.showToast({
  type: 'success',
  header: 'Saved',
  body: 'Your changes were saved successfully.',
  position: 'top-right',
  duration: 3000,
});
```

---

## Usage Examples

### Basic toast

```ts
const toast = new ToastNotification();
toast.showToast({
  type: 'info',
  body: 'Hello from rm-toast-notification',
});
```

### Toast with header, footer, and custom logo

```ts
toast.showToast({
  type: 'warning',
  header: 'Heads up',
  body: 'Your session will expire soon.',
  footer: 'Please save your work',
  logo: 'https://example.com/icon.png',
  position: 'bottom-right',
});
```

### Toast with action button

```ts
toast.showToast({
  type: 'error',
  header: 'Upload failed',
  body: 'Please try again.',
  duration: 0,
  actionButton: {
    text: 'Retry',
    onClick: () => console.log('Retry clicked'),
  },
});
```

### Custom color

```ts
toast.showToast({
  type: 'info',
  body: 'Custom styled toast',
  color: '#6366f1',
});
```

### Persistent toast

```ts
toast.showToast({
  type: 'warning',
  body: 'This toast stays until you close it.',
  duration: 0,
});
```

### Programmatic control

```ts
const toastElement = toast.showToast({
  type: 'success',
  body: 'This toast can be closed manually.',
});

toast.closeToast(toastElement!);
toast.clearAll();
toast.destroy();
```

---

### Examples 1

Create a service and reuse it.

```javascript
import ToastNotification from 'rm-toast-notification';

const toastService = new ToastNotification();

toastService.showToast({
  type: 'info',          // Notification type (success, error, warning, info)
  position: 'top-right', // Position of the toast (top-left, top-right, bottom-left, bottom-right)
  duration: 3000,        // Duration in milliseconds (null for permanent)
  header: 'Information', // Header text (optional)
  body: 'This is a simple toast notification.', // Body content (can be plain text or HTML)
  footer: 'Footer content (optional)', // Footer text (optional)
  logo: 'https://example.com/logo.png', // Logo image (optional)
  color: '',             // Custom background color (optional)
  actionButton: {        // Action button (optional)
    text: 'Action',
    onClick: () => alert('Action clicked!'),
  },
  onClick: (e) => {      // Custom onClick event (optional)
    console.log('Toast clicked', e);
  },
  animation: true        // Animation for appearance (true or false)
});
```


###  Example with Action Button

```javascript
toastService.showToast({
  type: 'success',
  position: 'bottom-left',
  duration: 4000,
  header: 'Success!',
  body: 'You have successfully completed the task.',
  actionButton: {
    text: 'Undo',
    onClick: () => alert('Undo clicked!'),
  },
});
```

###  Example with HTML Content

```javascript
toastService.showToast({
  type: 'error',
  position: 'top-right',
  duration: 5000,
  body: '<strong>Error!</strong> <p>An unexpected error occurred.</p>',
});
```

---

## API

### ToastNotification

```ts
const toast = new ToastNotification();
```

### Methods

| Method | Description |
|---|---|
| `showToast(options)` | Displays a toast and returns the DOM element |
| `closeToast(toast)` | Closes a specific toast safely |
| `clearAll()` | Closes all active toasts |
| `destroy()` | Removes the toast container and clears resources |

### Toast options

| **Option**     | **Type**   | **Description**                                                                                                 | **Default** |
|----------------|------------|-----------------------------------------------------------------------------------------------------------------|-------------|
| `type`         | `string`   | Notification type. Available options: `success`, `error`, `warning`, `info`.                                    | `info`      |
| `position`     | `string`   | Position of the toast on the screen. Available options: `top-left`, `top-right`, `bottom-left`, `bottom-right`. | `top-right` |
| `duration`     | `number`   | Duration in milliseconds to show the toast. Set to `null` for a permanent toast.                                | `3000`      |
| `header`       | `string`   | The header text for the notification. (Optional)                                                                |             |
| `body`         | `string`   | The body content. Can be plain text or sanitized HTML.                                                          |             |
| `footer`       | `string`   | The footer text. (Optional)                                                                                     |             |
| `logo`         | `string`   | URL of the logo image. (Optional)                                                                               |             |
| `color`        | `string`   | Custom background color. (Optional)                                                                             |             |
| `onClick`      | `function` | Custom click event handler for the notification. (Optional)                                                     |             |
| `actionButton` | `object`   | Custom action button with `text` and `onClick` function. (Optional)                                             |             |
| `animation`    | `boolean`  | Enable or disable animation for showing the toast.                                                              | `true`      |

---

## Security

This package is built with security in mind.

- HTML content is sanitized through DOMPurify
- Inline style attributes and style blocks are stripped from body content
- Dangerous CSS expressions such as `expression()`, `url(javascript:...)`, and `@import` are blocked
- Logo URLs are validated to allow only safe schemes
- Custom colors are restricted to safe formats
- Text values are inserted using `textContent` where appropriate


---

## Changelog

See [CHANGELOG.md](CHANGELOG.md)  for release history and updates.

---

### Latest Release

Check the [releases page](https://github.com/malikrajat/rm-toast-notification/releases) for the most recent version and updates.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**TL;DR:** You can use this library freely in commercial and personal projects.

### MIT License Summary

**You can:**
- Use commercially
- Modify the code
- Distribute
- Use privately

**You must:**
- Include the license and copyright notice

**You cannot:**
- Hold the author liable


---

## FAQ

### What is rm-toast-notification?

It is a lightweight, framework-agnostic toast notification library for web apps, built with TypeScript and designed for zero-config usage. It supports plain JavaScript, React, Angular, Vue, and Svelte, and ships with full type definitions for TypeScript projects.

### Does the library have dependencies?

The library source imports a single runtime dependency, **DOMPurify**, which is used to sanitize HTML content before it is inserted into the DOM. There are no other runtime imports, keeping the bundle small and focused.

### Which frameworks does it support?

It works with plain JavaScript, TypeScript, React, Angular, Vue, and Svelte. Because the library is framework-agnostic and DOM-based, you can use it anywhere you have access to the DOM — including inside framework services, components, or utility modules.

### How do I create a persistent toast that never auto-dismisses?

Set `duration: 0` (or a negative value). The toast stays on screen until the user clicks the close button, clicks the toast body, or you call `clearAll()` / `destroy()` programmatically.

### Is it safe to render HTML in the body?

Yes, but it is sanitized before being inserted into the DOM. The `body` option is passed through DOMPurify with dangerous tags (`script`, `iframe`, `object`, `embed`, `link`, `meta`, `base`, `form`, `style`) stripped, inline `style`/`class`/`id` and event-handler attributes removed, and data attributes disabled. You can safely pass simple rich content such as `<strong>`, `<em>`, or `<p>`.

### Can I customize the look of a toast?

Yes. Use the `color` option for custom background colors, the `logo` option for a custom icon/logo image, and the `body` option for safe HTML content. Header and footer text are inserted as plain text to prevent XSS. Custom colors must be valid hex (`#fff`, `#ffffff`, `#ffffffff`) or `rgb()`/`rgba()` values.

### What happens when the user hovers over a toast?

The auto-dismiss timer pauses while the mouse is over the toast and resumes when the mouse leaves. The toast also shows a subtle scale/shadow hover effect to signal interactivity. Hover handlers use `relatedTarget` checks so they don't fire incorrectly when moving between child elements.

### Can I attach an action button to a toast?

Yes. Use the `actionButton` option with `text` and `onClick`. The button's click handler fires independently, and clicks on the action button do not trigger the toast-level `onClick` or close the toast — preventing accidental dismissal while interacting with the button.

### Can I trigger an action when the whole toast is clicked?

Yes. Use the `onClick` option to provide a click handler for the toast itself. Clicks originating from buttons (the close button or action button) are automatically excluded so they don't accidentally trigger the toast-level handler, and the toast auto-closes after the handler runs.

### Is it SSR-safe?

Yes. The library guards against missing document access during server rendering. If `document` or `document.body` is unavailable (for example during SSR in Next.js, Nuxt, or Angular Universal), `showToast()` safely returns `null` instead of crashing.

### How do I handle multiple toast instances or SPA route changes?

The library reuses a single shared container, so you can create multiple `ToastNotification` instances without duplicating the DOM container. For SPA route changes or app teardown, call `destroy()` to remove the container and clear all active toasts, or `clearAll()` to remove all toasts while keeping the container available.

### Can I disable animations?

Yes. Set `animation: false` in the toast options to disable the slide-in animation. Positioning and layout remain intact — only the keyframe animation is skipped.

### Can I access default colors or animations programmatically?

Yes. The library exposes public utility methods: `getColor(type)` returns the default color for a toast type, `getAnimation(position)` returns the slide-in CSS animation value for a position, and `getActionButtonColor(type)` returns the default action button color for a toast type — useful for aligning custom styling with the library's defaults.

### Is the close button accessible?

Yes. The close button is a real `<button>` element with `type="button"` and an `aria-label="Close notification"`, making it accessible to screen readers and keyboard users.

### What browsers are supported?

The library targets modern evergreen browsers: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+, Opera 67+, and Samsung Internet 12+. Internet Explorer and pre-2019 legacy browsers are not supported.

### How do I import the library?

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';
```

The package ships as an ESM module with TypeScript type definitions included, so autocomplete and type checking work out of the box.

---

## Browser Support

The library targets modern browsers and works well in:

- Chrome
- Edge
- Firefox
- Safari
- Mobile browsers with modern JavaScript support

---

## Browser Compatibility

### Supported Browsers

| Browser | Version | Support Level | Notes |
|---------|---------|---------------|-------|
| Chrome | 80+ | Full Support | Recommended browser |
| Firefox | 75+ | Full Support | Works perfectly |
| Safari | 13+ | Full Support | iOS and macOS |
| Edge | 80+ | Full Support | Chromium-based |
| Opera | 67+ | Full Support | Works well |
| Samsung Internet | 12+ | Full Support | Mobile support |

### Mobile Support

- iOS Safari 13+
- Chrome for Android 80+
- Samsung Internet
- All mobile browsers with modern JavaScript support

### Download Behavior by Platform

| Platform | Behavior |
|----------|----------|
| Desktop Chrome/Firefox/Edge | Direct download to Downloads folder |
| Desktop Safari | May prompt for download location |
| iOS Safari | Opens download manager |
| Android Chrome | Downloads to Downloads folder |
| Mobile Safari | Shows share sheet with save option |

### Not Supported

- Internet Explorer (all old versions)
- Very old mobile browsers (pre-2019)

---

## Statistics

[![npm downloads](https://img.shields.io/npm/dt/@codewithrajat/rm-toast-notification.svg)](https://www.npmjs.com/package/@codewithrajat/rm-toast-notification)
[![npm version](https://img.shields.io/npm/v/@codewithrajat/rm-toast-notification.svg)](https://www.npmjs.com/package/@codewithrajat/rm-toast-notification)
[![GitHub issues](https://img.shields.io/github/issues/malikrajat/rm-toast-notification.svg)](https://github.com/malikrajat/rm-toast-notification/issues)
[![GitHub stars](https://img.shields.io/github/stars/malikrajat/rm-toast-notification.svg?style=social)](https://github.com/malikrajat/rm-toast-notification/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/malikrajat/rm-toast-notification/blob/main/LICENSE)

---

## Support This Project

If **rm-toast-notification** has helped you build better applications, please consider:

If this library has saved you development time and helped create amazing projects, **please consider giving it a  star!** 

 **Why star this repo?**
- Help other developers discover this lightweight, optimized solution
- Support continued development and improvements
- Show appreciation for free, quality tools
- Boost visibility in the  community
- Increases visibility in the  community
- Supports ongoing development and maintenance
- Encourages more open-source contributions
- Helps other developers find quality tools

###  **Want More Quality Libraries?**

This is just one of several useful libraries I've created. **[Explore my other  web development libraries](https://github.com/malikrajat?tab=repositories)** that might solve your next challenge:

-  **Utility libraries** for common development tasks
-  **UI components** for better user experiences  
-  **Performance tools** for optimization
-  **Mobile-friendly solutions** for responsive apps

**Found them helpful?** A star on each repo you find useful helps tremendously! It takes just one click but means the world to open-source maintainers.

[![GitHub](https://img.shields.io/badge/View_All_Repositories-181717?logo=github)](https://github.com/malikrajat?tab=repositories)
[![GitHub followers](https://img.shields.io/github/followers/malikrajat?style=social)](https://github.com/malikrajat)
[![GitHub stars](https://img.shields.io/github/stars/malikrajat/rm-toast-notification?style=social)](https://github.com/malikrajat/rm-toast-notification/stargazers)

---

## Support and Community

### Getting Help

Need assistance? We're here to help!

| Support Channel | Link | Best For |
|----------------|------|----------|
| Bug Reports | [Report Bug](https://github.com/malikrajat/rm-toast-notification/issues/new?template=bug_report.md) | Technical issues |
| Feature Requests | [Request Feature](https://github.com/malikrajat/rm-toast-notification/issues/new?template=feature_request.md) | New features |
| Discussions | [Join Discussion](https://github.com/malikrajat/rm-toast-notification/discussions) | General questions |
| Email | [mr.rajatmalik@gmail.com](mailto:mr.rajatmalik@gmail.com?subject=rm-toast-notification%20Support) | Direct support |

### Documentation

- [GitHub Repository](https://github.com/malikrajat/rm-toast-notification)
- [npm Package](https://www.npmjs.com/package/@codewithrajat/rm-toast-notification)
- [Live Demo](https://stackblitz.com/edit/vitejs-vite-22yb4jvh)
- [Changelog](https://github.com/malikrajat/rm-toast-notification/blob/master/CHANGELOG.md)

### Community

- Star the repository to show support
- Watch for updates and new releases
- Share your use cases and feedback
- Contribute code or documentation

### Stay Updated

- Follow the project on [GitHub](https://github.com/malikrajat/rm-toast-notification)
- Star the repository for updates
- Watch for new releases

---

## Acknowledgments

This library was created to provide a simple, a lightweight, customizable, and secure toast notification library for web applications.
It helps you show short-lived messages with auto-dismiss, custom colors, logos, action buttons,
animated positions, and built-in protection against XSS and CSS injection.

Special thanks to:
- **Contributors** - Thank you for making this library better
- **Community** - For feedback and feature requests

---

## Other Libraries

### UI Components

| Library                           | Description                                                              | npm Link                                                                                                        |
|-----------------------------------| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| **rm-range-slider**               | Lightweight two-thumb range slider with tooltips and color customization | [![npm](https://img.shields.io/npm/v/rm-range-slider.svg)](https://www.npmjs.com/package/rm-range-slider)       |
| **rm-ng-range-slider**            | Angular-specific version of the dual range slider                        | [![npm](https://img.shields.io/npm/v/rm-ng-range-slider.svg)](https://www.npmjs.com/package/rm-ng-range-slider) |
| **rm-carousel**                   | Simple, responsive carousel component                                    | [![npm](https://img.shields.io/npm/v/rm-carousel.svg)](https://www.npmjs.com/package/rm-carousel)               |
| **rm-image-slider**               | Minimal image slider with smooth transitions                             | [![npm](https://img.shields.io/npm/v/rm-image-slider.svg)](https://www.npmjs.com/package/rm-image-slider)       |
| **rm-ng-star-rating**             | Configurable Angular star rating component with readonly mode            | [![npm](https://img.shields.io/npm/v/rm-ng-star-rating.svg)](https://www.npmjs.com/package/rm-ng-star-rating)   |
| **@codewithrajat/rm-ng-typeahead** | Angular autocomplete/typeahead component with search suggestions and keyboard navigation | [![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/malikrajat/rm-ng-typeahead) |
| **@codewithrajat/rm-ng-editor**                  | Rich text editor component for Angular applications with customizable toolbar support | [![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/malikrajat/rm-ng-editor) |

---

### PDF & Export Libraries

| Library                                | Description                                                  | npm Link                                                                                                                                        |
| -------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **rm-ng-export-to-csv**                | Export JSON data to CSV with zero dependencies               | [![npm](https://img.shields.io/npm/v/rm-ng-export-to-csv.svg)](https://www.npmjs.com/package/rm-ng-export-to-csv)                               |
| **@codewithrajat/rm-ng-pdf-export**    | Image-based PDF export tool for Angular applications         | [![npm](https://img.shields.io/npm/v/@codewithrajat/rm-ng-pdf-export.svg)](https://www.npmjs.com/package/@codewithrajat/rm-ng-pdf-export)       |
| **@codewithrajat/rm-ng-structure-pdf** | Generate structured PDFs for reports, invoices, or documents | [![npm](https://img.shields.io/npm/v/@codewithrajat/rm-ng-structure-pdf.svg)](https://www.npmjs.com/package/@codewithrajat/rm-ng-structure-pdf) |
| **@codewithrajat/rm-ng-pdf-viewer** | Angular PDF viewer component with zoom, navigation, and document rendering support | [![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/malikrajat/rm-ng-pdf-viewer) |

---

### Chrome Extension

| Library | Description | Link                                                                                                                                    |
|----------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| **quickocr** | Chrome extension that extracts text from images using OCR technology | [![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/malikrajat/quickocr/releases)                                     |
| **readLoude** | Chrome extension that read you web page loude e.g article etc. | [![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/malikrajat/readLoude/releases)                            |
| **ai-assistant-reply** | AI Chrome extension to auto generate reply on linked in posts. | [![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/malikrajat/ai-assistant-reply/releases) |

---

### VS Code Extension

| Library | Description | Link                                                                                                                                      |
|----------|-------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| **dead-css-cleaner** | VS Code extension for identifying and cleaning unused CSS styles | [![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/malikrajat/dead-css-cleaner/releases)      |
| **file-coverage-insight** | VS Code extension for auto generated component file coverage automatelly on open. | [![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/malikrajat/file-coverage-insight/releases) |

---

### Desktop Applications - All Plateform

| Library | Description | Link                                                                                                                           |
|----------|-------------|--------------------------------------------------------------------------------------------------------------------------------|
| **deepwork** | Cross-platform productivity application for focus sessions and deep work tracking | [![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/malikrajat/deepwork/releases)          |
| **JsSandbox** | Cross-platform JavaScript playground and code execution environment | [![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/malikrajat/JsSandbox/releases) |

---

### Device Detection

| Library                        | Description                                             | npm Link                                                                                                                        |
| ------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **rm-ng-device-detection**     | Detect device type, OS, and browser in Angular          | [![npm](https://img.shields.io/npm/v/rm-ng-device-detection.svg)](https://www.npmjs.com/package/rm-ng-device-detection)         |

---

### Notifications

| Library           | Description                                       | npm Link                                                                                              |
| ----------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **rm-pushnotify** | Lightweight push-style toast notification utility | [![npm](https://img.shields.io/npm/v/rm-pushnotify.svg)](https://www.npmjs.com/package/rm-pushnotify) |
| **@codewithrajat/rm-toast-notification** | Cross-platform toast and desktop notification library for web, Angular, and desktop applications | [![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/malikrajat/rm-toast-notification) |


---

### Layout & Dynamic Rendering

| Library | Description | Link |
|----------|-------------|------|
| **rm-ng-dynamic-layout** | Dynamic layout rendering engine for Angular applications using JSON-driven UI configuration | [![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/malikrajat/rm-ng-dynamic-layout) |

---

### Developer Tools & Extensions

| Library | Description | Link                                                                                                                            |
|----------|-------------|---------------------------------------------------------------------------------------------------------------------------------|
| **rm-colorful-console-logger** | Structured and colorized console logging utility for developers | [![npm](https://img.shields.io/npm/v/rm-colorful-console-logger.svg)](https://www.npmjs.com/package/rm-colorful-console-logger) |

---

### Meta & Personal Branding

| Library         | Description                                                      | npm Link                                                                                          |
| --------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **about-rajat** | Developer portfolio package for branding and quick personal info | [![npm](https://img.shields.io/npm/v/about-rajat.svg)](https://www.npmjs.com/package/about-rajat) |

---


### All Packages

Browse all my packages:
- [npm: @codewithrajat](https://www.npmjs.com/~codewithrajat)
- [npm: rajatmalik](https://www.npmjs.com/~rajatmalik)
- [GitHub: @malikrajat](https://github.com/malikrajat?tab=repositories)

---

## Author

**Rajat Malik**

Full‑Stack Developer and Frontend Architect at Siemens with 14+ years building scalable enterprise platforms, specializing in micro‑frontends, AI‑native development, React, and Angular.  
Author of 10+ open‑source libraries and 100+ technical articles, driving innovation through developer‑friendly tools, performance optimization, and AI‑assisted workflows.

### GET IN TOUCH

- Portfolio:  [rajatmalik.dev](https://rajatmalik.dev)
- Email:      [mr.rajatmalik@gmail.com](mailto:mr.rajatmalik@gmail.com)
- LinkedIn:   [errajatmalik](https://linkedin.com/in/errajatmalik)
- GitHub:     [@malikrajat](https://github.com/malikrajat)
- npm:        [rajatmalik](https://www.npmjs.com/~rajatmalik)

### SOCIAL PRESENCE
- Threads:    [rajatmalik](https://www.threads.net/@er.rajatmalik)
- Twitter/X:  [rajatmalik](https://x.com/er_rajatmalik)
- BlueSky:    [rajatmalik](http://devrajat.bsky.social)

### CONTENT & WRITING

- Medium:    [rajatmalik]( https://medium.com/@codewithrajat)
- Dev.to:    [rajatmalik]( https://dev.to/codewithrajat)
- Substack:   [rajatmalik](https://codewithrajat.substack.com)
- Hashnode:   [rajatmalik](https://hashnode.com/@codeswithrajat)

---

<p align="center">
  <p align="center">Made with care and love  by <a href="https://rajatmalik.dev">Rajat Malik</a> for the community</p>
</p>

<p align="center">
  <a href="https://github.com/malikrajat/rm-toast-notification/stargazers">Star on GitHub</a> •
  <a href="https://www.npmjs.com/package/@codewithrajat/rm-toast-notification">View on npm</a> •
  <a href="https://github.com/malikrajat/rm-toast-notification/issues">Report Issue</a>
</p>


<p align="center">
  Made with dedication by <a href="https://rajatmalik.dev">Rajat Malik</a>
</p>
