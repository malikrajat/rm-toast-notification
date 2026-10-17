# Contributing

Thanks for taking the time to contribute. This page covers everything you need to go from a fresh
clone to a merged pull request.

---

## Ways to help

- 🐛 Report bugs with a minimal reproduction
- 💡 Propose features (open an issue before writing large amounts of code)
- 📝 Improve docs in [`docs/`](./README.md) and [`examples/`](../examples/README.md)
- 🧪 Add tests that cover a reported bug
- 🌍 Add or correct a framework recipe in [Framework Integration](./frameworks.md)
- ⭐ Star the repository if it is useful to you

---

## Setting up the repository

```bash
git clone https://github.com/malikrajat/rm-toast-notification.git
cd rm-toast-notification

corepack enable pnpm   # or: npm i -g pnpm
pnpm install
```

### Quality gates

Run these before opening a pull request — CI runs the same commands:

```bash
pnpm run check          # Biome: formatting + linting
pnpm run typecheck      # tsc --noEmit
pnpm run test:coverage  # Jest with the 90% coverage gate
pnpm run build          # emits dist/ and copies metadata files
```

Useful extras:

```bash
pnpm run format         # write formatting fixes
pnpm run lint:fix       # apply safe lint fixes
pnpm run test:watch     # watch mode
```

---

## Project layout

| Path | What lives there |
|---|---|
| `src/index.ts` | The entire library |
| `tests/` | Jest unit tests (jsdom) |
| `docs/` | Long-form documentation |
| `examples/` | Copy-paste usage scenarios |
| `.github/workflows/ci.yml` | CI/CD pipeline |
| `GITHUB_ACTIONS.md` | Branch/tag policy for the CI workflow and how to change it |
| `biome.json` | Formatter and linter configuration |
| `copy-extra-files.js` | Post-build copy step |

More detail in [Project Structure](./project-structure.md).

---

## Coding standards

- **TypeScript strict.** `tsconfig.json` enables `strict`. Avoid `any`; prefer `unknown` plus a
  narrowing check — that is the pattern the library uses for `validateType`, `sanitizeText`, and
  friends.
- **Formatting and linting are automated.** [Biome](https://biomejs.dev) formats and lints `src/`,
  `tests/`, and config files. Run `pnpm run check` (or `pnpm run format` / `pnpm run lint:fix`) and
  commit the result. Do not hand-format around the tool.
- **Style.** Single quotes, semicolons, 2-space indentation, trailing commas where multi-line. The
  rules live in `biome.json`; `.editorconfig` mirrors the basics for editors.
- **Comments explain *why*.** The code should read clearly enough that comments are reserved for
  security reasoning, browser quirks, and non-obvious trade-offs — like the existing SSR guard.
- **Public API changes are additive by default.** Removing or renaming anything is a breaking change
  and needs a major version.

---

## Tests

New behavior needs tests. Bug fixes need a test that fails before the fix.

```bash
pnpm run test -- tests/toast-notification.test.ts
pnpm run test:coverage
```

Guidelines:

- Prefer asserting on classes, text, structure, and `data-*` over inline styles.
- Control time with `jest.useFakeTimers()`; both auto-dismiss and the exit animation are timers.
- Keep the coverage gate at 90% or above; CI fails below it.
- See the [Testing Guide](./testing.md) for patterns.

---

## Commit messages

Conventional Commits, matching the existing history:

```
feat: add maxWidth option for the toast container
fix: restart hover timer with the full duration
docs: document the filtering example
test: cover persistent toasts with non-numeric durations
chore: bump DOMPurify
build: copy docs into the dist folder
```

Common scopes in this repository: `config`, `release`, `deps`, `docs`, `ci`.

---

## Branch and pull request flow

1. Fork the repository (or create a branch if you have write access).
2. Branch from `main` using a descriptive name: `feat/stack-limit`, `fix/hover-timer`,
   `docs/examples-section`, or the `codex/` prefix used by automation.
3. Make focused changes — one topic per pull request.
4. Run the quality gates above.
5. Open the pull request using the checklist below.

> **CI runs only on `main` and on release tags created from `main`.** Pull requests do not trigger
> the pipeline, so run the quality gates locally before asking for a review. The policy, and the
> exact edits needed to allow more branches, are documented in
> [GITHUB_ACTIONS.md](../GITHUB_ACTIONS.md).

### Pull request checklist

- [ ] The change is scoped to one topic and described in the PR body
- [ ] `pnpm run check` passes (Biome format + lint)
- [ ] `pnpm run typecheck` passes
- [ ] `pnpm run test:coverage` passes with ≥ 90% coverage
- [ ] `pnpm run build` succeeds
- [ ] New behavior is covered by tests; bug fixes include a regression test
- [ ] Public API changes are documented in `README.md` and the relevant `docs/` page
- [ ] `CHANGELOG.md` has an entry under **Added**, **Changed**, **Fixed**, or **Security**
- [ ] No new runtime dependency unless the PR explains why it is necessary

---

## Documentation contributions

Documentation is treated as part of the product:

- Keep the voice direct: lead with what the reader gets, then the details.
- Every code sample must be accurate against `src/index.ts`. If behavior and docs disagree, fix the
  docs in the same PR (or open an issue if the mismatch is a bug).
- Link rather than duplicate. `README.md` is the landing page; deep explanations belong in `docs/`.
- Add cross-links in both directions when you add a page, and register it in
  [`docs/README.md`](./README.md).
- Update `README.md`'s index when you add a new docs or examples page.

---

## Reporting bugs

Include:

1. Library version (`npm ls @codewithrajat/rm-toast-notification`)
2. Browser and version, or Node version for build/test issues
3. A minimal reproduction — a StackBlitz fork, a code snippet, or a failing test
4. Expected behavior vs. actual behavior
5. Console output or a screenshot for visual issues

---

## Reporting security issues

Do not open a public issue. Email
[mr.rajatmalik@gmail.com](mailto:mr.rajatmalik@gmail.com?subject=rm-toast-notification%20security)
or use GitHub private vulnerability reporting, and give the maintainer time to ship a fix before
disclosing.

---

## Code of conduct

Be respectful and constructive. Assume good intent, critique ideas rather than people, and keep
discussions on the topic of the project.

---

**Previous:** [Changelog and Versioning](./changelog.md) · **Back to documentation index](./README.md)
