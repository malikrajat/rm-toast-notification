# Changelog and Versioning

The authoritative release history lives in [CHANGELOG.md](../CHANGELOG.md) at the root of the
repository. This page explains the conventions behind it so you can read it — and extend it —
without guessing.

---

## Versioning policy

The project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html):

| Change | Version bump | Examples |
|---|---|---|
| Backwards-incompatible change | **Major** (`1.0.0` → `2.0.0`) | Removing an option, renaming a method, changing a default, dropping a browser |
| Backwards-compatible feature | **Minor** (`1.0.0` → `1.1.0`) | New option, new toast type, new exported helper, new framework recipe |
| Backwards-compatible fix | **Patch** (`1.0.0` → `1.0.1`) | Sanitization hardening, timer fix, typo in a type, performance fix |

Documentation-only changes and internal tooling changes do not require a version bump on their own,
but they are listed under the next release when it happens.

---

## Changelog format

Entries follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Each release is a section
with an ISO date and one or more subsections:

```markdown
## [1.1.0] - 2026-10-15

### Added
- `maxWidth` option for the toast container.

### Changed
- Hover resume now restarts the full duration instead of the remaining time.

### Fixed
- `clearAll()` no longer leaves `data-closed` elements in `toasts`.

### Security
- Updated DOMPurify to the latest patch release.
```

The allowed headings are **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, and
**Security**. Every release also gets a link reference at the bottom of the file:

```markdown
[1.1.0]: https://github.com/malikrajat/rm-toast-notification/releases/tag/v1.1.0
```

---

## How a release is cut

1. Merge the last pull request for the release into `main`.
2. In `package.json`, bump `version` and move any "Unreleased" notes in `CHANGELOG.md` under the new
   version with today's date.
3. Run the full quality gate locally:

```bash
pnpm install --frozen-lockfile
pnpm run check
pnpm run typecheck
pnpm run test:coverage
pnpm run build
npm pack --dry-run
```

4. Commit with `chore(release): vX.Y.Z`.
5. Tag and push:

```bash
git tag v1.1.0
git push origin main --tags
```

6. The [GitHub Actions workflow](../.github/workflows/ci.yml) validates the tag, rebuilds, and
   publishes to npm with provenance using the `NPM_TOKEN` secret.
7. Verify the published tarball and create the GitHub Release with the changelog section as its body.

---

## What changed in each released version

### 1.0.0 — initial release

Everything the library offers today: four toast types, four positions, auto-dismiss with hover
pause, header/body/footer/logo, custom colors, action buttons, click handling, sanitized HTML,
validated URLs and colors, an accessible close button, SSR guards, and full TypeScript types.

See [CHANGELOG.md](../CHANGELOG.md) for the full entry.

> 1.0.1 and later releases are documented in `CHANGELOG.md` as they ship. This page intentionally
> does not duplicate the list — the changelog is the single source of truth for what changed, and
> this page is the source of truth for how it is written.

---

## Deprecation policy

There is no deprecation window in `1.x` for the documented API. Before anything is removed:

1. Mark it deprecated in the JSDoc comment in `src/index.ts`.
2. Add a **Deprecated** entry to the changelog.
3. Note it in the docs with the replacement.
4. Remove it only in the next major version.

---

## Reading the changelog when upgrading

- **Patch:** safe to upgrade without reading — fixes only.
- **Minor:** skim the **Added** section for new options; existing behavior is unchanged.
- **Major:** read the whole entry, then check [Configuration](./configuration.md) and
  [API Reference](./api-reference.md), because both pages are updated in the same pull request as
  the code.

---

**Previous:** [Troubleshooting](./troubleshooting.md) · **Next:** [Contributing](./contributing.md) · **See also:** [Project Structure](./project-structure.md) · [Back to documentation index](./README.md)
