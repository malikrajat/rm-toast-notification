# Installation

## Package managers

```bash
npm install @codewithrajat/rm-toast-notification
```

```bash
pnpm add @codewithrajat/rm-toast-notification
```

```bash
yarn add @codewithrajat/rm-toast-notification
```

The published package contains:

- `dist/index.js` — the compiled entry point referenced by `main` and `module`
- `dist/index.d.ts` — TypeScript declarations
- `README.md`, `CHANGELOG.md`, `LICENSE`

---

## Import styles

### ESM / TypeScript (recommended)

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';
import type { ToastOptions, ToastType } from '@codewithrajat/rm-toast-notification';
```

### Named utility imports

The sanitization helpers used internally are exported so you can reuse the exact same rules for
your own markup:

```ts
import {
  sanitizeCss,
  sanitizeText,
  isSafeColor,
  isSafeUrl,
} from '@codewithrajat/rm-toast-notification';
```

### CDN (esm.sh / unpkg / jsDelivr)

```html
<script type="module">
  import ToastNotification from 'https://esm.sh/@codewithrajat/rm-toast-notification';

  const toast = new ToastNotification();
  toast.showToast({ type: 'success', body: 'Loaded from the CDN' });
</script>
```

> The CDN build pulls in DOMPurify as a dependency, which esm.sh resolves automatically.

---

## TypeScript configuration

No extra types to install. The package ships its own declarations, so this is enough:

```jsonc
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler", // or "NodeNext"
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "strict": true
  }
}
```

`DOM` in `lib` is required — `ToastOptions` references `MouseEvent` and `showToast()` returns
`HTMLDivElement | null`.

---

## Verifying the install

```ts
import ToastNotification from '@codewithrajat/rm-toast-notification';

const toast = new ToastNotification();
console.log(toast.getColor('success')); // '#28a745'
```

If that logs a color, the package, the ESM entry, and the type declarations are all wired up.

---

## Upgrading

```bash
npm outdated @codewithrajat/rm-toast-notification
npm install @codewithrajat/rm-toast-notification@latest
```

Check [Changelog and Versioning](./changelog.md) before major bumps, and keep the pinned version in
sync across workspaces — the toast container is shared per document, so two versions of the library
on one page will produce two containers with the same `id`.

---

**Next:** [Quick Start](./quick-start.md) · [Configuration](./configuration.md) · [Back to documentation index](./README.md)
