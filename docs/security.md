# Security

Toast messages frequently contain data that originated outside your application — server error
strings, validation messages, user-supplied names, URLs from an API. The library treats every
option as untrusted input.

---

## Threat model

| Threat | Vector | Mitigation |
|---|---|---|
| Stored / reflected XSS | `body` HTML containing `<script>`, event handlers, `javascript:` URLs | DOMPurify with an HTML-only profile and an attribute/tag deny list |
| CSS injection | Inline `style` attributes carrying `expression()`, `url(javascript:)`, `@import` | DOMPurify strips `style`; a second pass scrubs anything that survives |
| Attribute injection | `class` / `id` / `data-*` used to trigger framework or CSS behavior | `class` and `id` are forbidden; `ALLOW_DATA_ATTR: false` |
| Markup injection via text fields | HTML in `header`, `footer`, or button labels | Inserted with `textContent`, never parsed |
| Script URL execution | `logo: 'javascript:alert(1)'` | `isSafeUrl` allows only `http:`, `https:`, `data:`, and relative URLs |
| Style breaking / UI redressing | `color: 'red; position:fixed; inset:0'` | `isSafeColor` accepts only strict hex and `rgb()` / `rgba()` |

---

## The sanitization pipeline

`body` is the only option that accepts HTML. It passes two independent stages.

### Stage 1 — DOMPurify

```ts
DOMPurify.sanitize(body, {
  USE_PROFILES: { html: true },
  FORBID_ATTR: ['style', 'class', 'id', 'onload', 'onerror', 'onclick'],
  FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form'],
  ALLOW_DATA_ATTR: false,
});
```

- `USE_PROFILES: { html: true }` removes SVG and MathML, which have their own script surfaces.
- Forbidding `style` prevents CSS payloads; forbidding `class` and `id` prevents selector-based
  injection and interference with your application styles.
- Forbidding `onload`, `onerror`, and `onclick` removes the classic inline-handler vector even if
  DOMPurify's default attribute rules change in a future release.
- Forbidding `style`, `script`, `iframe`, `object`, `embed`, `link`, `meta`, `base`, and `form`
  removes code execution, external resource loading, and navigation/clickjacking primitives.
- `ALLOW_DATA_ATTR: false` prevents `data-*` attributes from smuggling behavior into frameworks
  that read them.

### Stage 2 — CSS scrub (defense in depth)

Any element that still carries a `style` attribute is passed through `sanitizeCss`, which removes:

- `expression( … )` — legacy script execution
- `url( javascript: … )`, `url( vbscript: … )`, `url( data:text/html … )`, `url( livescript: … )`,
  `url( mocha: … )`
- `@import` — external resource loading and exfiltration
- `behavior: …` and `-moz-binding` — legacy script bindings
- Any remaining `url()` that is not `http(s)` or relative

If nothing safe remains, the attribute is removed entirely.

---

## Text-only fields

```ts
const headerElem = document.createElement('strong');
headerElem.textContent = header; // never innerHTML
```

The same applies to `footer` and to both button labels. Passing `<b>bold</b>` into `header` renders
the literal characters — that is intentional.

---

## URL and color validation

```ts
isSafeUrl('/assets/logo.svg'); // true
isSafeUrl('https://cdn.example.com/logo.png'); // true
isSafeUrl('data:image/svg+xml;base64,...'); // true
isSafeUrl('javascript:alert(1)'); // false
isSafeUrl('vbscript:msgbox(1)'); // false

isSafeColor('#fff'); // true
isSafeColor('#0096ffff'); // true
isSafeColor('rgb(0 150 255 / 50%)'); // true
isSafeColor('red'); // false
isSafeColor('url(javascript:alert(1))'); // false
```

Relative URLs are allowed because they cannot change the scheme. Strings that begin with a
scheme-like prefix (`javascript:`) are parsed and rejected.

> `data:` URLs are allowed for convenience (inline icons). Because `data:` can encode SVG, only rely
> on it when the value comes from a trusted source. Validate in your wrapper if you need stricter
> behavior.

---

## Reusing the sanitizers

The helpers are exported so the rules are identical everywhere:

```ts
import {
  isSafeColor,
  isSafeUrl,
  sanitizeCss,
  sanitizeText,
} from '@codewithrajat/rm-toast-notification';

const label = sanitizeText(userValue); // assign with textContent
const background = isSafeColor(themeColor) ? themeColor : '#0096FF';
const safeCss = sanitizeCss(userCssFragment);
const avatar = isSafeUrl(userAvatarUrl) ? userAvatarUrl : '/assets/placeholder.svg';
```

---

## What the library does not protect you from

- **Your own `innerHTML` usage.** Sanitization only applies to the `body` option.
- **Server-rendered content.** If your backend echoes a message into HTML, sanitize it there too.
- **Trusted-looking data.** `data:` logos and third-party image URLs can still be abused for
  tracking, or for script execution when SVG is loaded as a document.
- **CSP bypass.** A strict `Content-Security-Policy` remains the strongest layer. The library
  injects one `<style>` element using `textContent`, which requires `style-src 'unsafe-inline'` or a
  nonce/hash policy that permits it. If your CSP uses nonces, add the hash of the injected keyframes
  or allow inline styles for styles only.
- **Dependency drift.** DOMPurify is a runtime dependency. Keep it updated through your lockfile;
  new bypasses are found and fixed upstream regularly.

---

## Reporting a vulnerability

Please do not open a public issue for security problems. Email
[mr.rajatmalik@gmail.com](mailto:mr.rajatmalik@gmail.com?subject=rm-toast-notification%20security)
or use GitHub private vulnerability reporting on the repository. Include a minimal reproduction and
the affected version.

---

**Previous:** [Architecture](./architecture.md) · **Next:** [Accessibility](./accessibility.md) · **See also:** [API Reference](./api-reference.md) · [Back to documentation index](./README.md)
