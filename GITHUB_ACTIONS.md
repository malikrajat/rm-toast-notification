# GitHub Actions — Branch and Tag Policy

This repository's CI/CD pipeline lives in
[`.github/workflows/ci.yml`](./.github/workflows/ci.yml). This document explains **when it runs**,
**why a run can be rejected**, and **exactly what to edit** if you ever want to allow another branch.

---

## 1. Current policy

The workflow runs **only** for these two cases:

| Trigger | Condition | Runs? |
|---|---|---|
| Push to `main` | `refs/heads/main` | ✅ Yes |
| Push of a version tag | `refs/tags/v*` **and** the tagged commit is contained in `main` | ✅ Yes |
| Push to any other branch (`develop`, `feature/*`, `release/*`, a fork branch…) | — | ❌ Never starts a run |
| Pull request from any branch | — | ❌ Never starts a run |
| Tag created from a branch other than `main` | `refs/tags/v*` but the commit is not on `main` | ⚠️ Starts, then fails in the `gate` job |
| Manual run (`Run workflow` button) | — | ❌ Not available — the `workflow_dispatch` trigger is not enabled |

Two mechanisms enforce this:

1. **The `on:` filter** in `ci.yml` decides which refs may start a run at all.
2. **The `gate` job** re-checks the ref inside the run. It is the first job, every other job declares
   `needs: gate` (directly or transitively), so nothing else executes if the check fails.

The gate exists because a `v*` tag can technically be pushed from any branch or commit — GitHub's
`on:` filter cannot tell where a tag came from. The gate resolves the tag to its commit and verifies
it is an ancestor of `origin/main`:

```bash
git rev-parse "${GITHUB_REF}^{commit}"                          # tag -> commit
git merge-base --is-ancestor "$TAGGED_COMMIT" refs/remotes/origin/main
```

### What you see when a run is rejected

- **Push to another branch:** no run at all — nothing appears in the Actions tab.
- **Tag not from `main`:** a run appears and fails within a few seconds with an error such as
  `Tag v1.2.0 was not created from the 'main' branch.`

---

## 2. Where the policy is defined

Everything lives in one file: [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

| What you want to change | Where | What to edit |
|---|---|---|
| Which branches start a run | top of the file, the `on.push.branches` list | the `- main` entry |
| Which tags start a run | `on.push.tags` | the `- 'v*'` entry |
| Which branch tags may come from | `jobs.gate` → step *Verify the ref is allowed* | `refs/remotes/origin/main`, and the `main` string in the branch check |
| Who must pass the gate first | each job's `needs:` | add `gate` to the `needs` list |
| Re-enable pull request runs | `on:` | add a `pull_request:` block |
| Re-enable manual runs | `on:` | add `workflow_dispatch:` (the gate still protects it) |
| Publishing conditions | `jobs.publish.if` | the `startsWith(github.ref, 'refs/tags/v')` expression |

---

## 3. Recipes

Every recipe below is a copy-paste edit of `ci.yml`. After editing, commit to `main` — the workflow
file on `main` is the version GitHub uses for `push` events.

### 3.1 Allow one more branch (for example `develop`)

**Step 1** — add the branch to the trigger:

```yaml
on:
  push:
    branches:
      - main
      - develop # <-- added
    tags:
      - 'v*'
```

**Step 2** — allow that branch in the gate (otherwise the run starts and fails):

```yaml
      - name: Verify the ref is allowed
        run: |
          set -euo pipefail

          if [ "$GITHUB_REF_TYPE" = "branch" ]; then
            case "$GITHUB_REF_NAME" in
              main|develop) ;; # <-- allowed branches
              *)
                echo "::error::This workflow only runs on main and develop. Requested: '$GITHUB_REF_NAME'. See GITHUB_ACTIONS.md."
                exit 1
                ;;
            esac
            echo "Allowed: push to $GITHUB_REF_NAME ($GITHUB_SHA)."
            exit 0
          fi

          # ... the tag check below stays unchanged ...
```

> Tip: the single-branch check can stay a simple `if [ "$GITHUB_REF_NAME" != "main" ]` when you only
> ever allow one branch. Use the `case` form when you allow several.

### 3.2 Allow a branch pattern (for example `release/*`)

```yaml
on:
  push:
    branches:
      - main
      - 'release/*' # quoted: * is a YAML/GitHub filter wildcard
    tags:
      - 'v*'
```

In the gate, match the pattern with a shell case statement:

```bash
case "$GITHUB_REF_NAME" in
  main|release/*) ;;
  *)
    echo "::error::Allowed refs are main and release/*. Requested: '$GITHUB_REF_NAME'."
    exit 1
    ;;
esac
```

### 3.3 Allow release tags created from a branch other than `main`

Use this when you cut releases from `release/x.y`. Add the extra source refs to the tag check:

```yaml
          # Tag push: the tagged commit must be reachable from an allowed branch.
          git fetch --no-tags origin \
            "+refs/heads/main:refs/remotes/origin/main" \
            "+refs/heads/release/*:refs/remotes/origin/release/*"

          TAGGED_COMMIT="$(git rev-parse "${GITHUB_REF}^{commit}")"
          echo "Tag ${GITHUB_REF_NAME} points at commit ${TAGGED_COMMIT}."

          ALLOWED=0
          for source in refs/remotes/origin/main $(git for-each-ref --format='%(refname)' refs/remotes/origin/release); do
            if git merge-base --is-ancestor "$TAGGED_COMMIT" "$source"; then
              echo "Tag ${GITHUB_REF_NAME} is contained in $source."
              ALLOWED=1
              break
            fi
          done

          if [ "$ALLOWED" != "1" ]; then
            echo "::error::Tag ${GITHUB_REF_NAME} was not created from an allowed branch. See GITHUB_ACTIONS.md."
            exit 1
          fi
```

> Keep the `refs/remotes/origin/main` entry unless you deliberately want to stop releasing from
> `main`.

### 3.4 Run the pipeline on pull requests as well

Pull request runs execute the **head branch** code, which is why they are disabled by default in this
repository. To turn them back on:

```yaml
on:
  push:
    branches:
      - main
    tags:
      - 'v*'
  pull_request:
    branches:
      - main
```

Then relax the gate so pull request refs are accepted:

```bash
if [ "$GITHUB_EVENT_NAME" = "pull_request" ]; then
  echo "Allowed: pull request #${GITHUB_REF#refs/pull/} targeting $GITHUB_BASE_REF."
  exit 0
fi
```

Place that block immediately after `set -euo pipefail`. Note that `pull_request` runs never publish:
the publish job requires `startsWith(github.ref, 'refs/tags/v')`, and pull request refs are
`refs/pull/<n>/merge`.

### 3.5 Re-enable manual runs — `Run workflow` button

```yaml
on:
  push:
    branches:
      - main
    tags:
      - 'v*'
  workflow_dispatch:
```

`workflow_dispatch` lets the person dispatching choose **any** branch or tag in the UI. The gate
still runs first, so dispatching on a feature branch fails immediately with the branch error and no
other job starts. If you want manual runs to be convenient, keep the trigger and tell your team to
select `main` in the dropdown.

### 3.6 Stop publishing entirely

Delete the whole `publish:` job from `ci.yml`, or keep it and change its condition so it never
matches:

```yaml
    if: false
```

---

## 4. Testing a policy change

1. Edit `ci.yml` on a scratch branch — the file edit itself triggers nothing, because pushes to
   non-`main` branches never start a run.
2. Merge the change into `main`, then verify:

```bash
# Allowed: push to main starts a run
git switch main && git commit --allow-empty -m "ci: verify branch policy" && git push

# Rejected, no run at all: push to another branch
git switch -c ci/policy-check && git commit --allow-empty -m "ci: should not run" && git push -u origin ci/policy-check

# Rejected inside the gate: a tag pointing at a non-main commit
git switch ci/policy-check
git tag v0.0.0-policy-check
git push origin v0.0.0-policy-check
```

3. Check the Actions tab: the first produces a run, the second produces nothing, the third produces a
   run that fails in **Verify ref is main (or a tag from main)**.
4. Clean up the test tag and branch:

```bash
git push origin --delete v0.0.0-policy-check
git push origin --delete ci/policy-check
git tag -d v0.0.0-policy-check
```

You can reproduce the ancestry check locally before pushing a release tag:

```bash
git fetch origin main
git merge-base --is-ancestor "$(git rev-parse v1.2.0^{commit})" origin/main \
  && echo "tag is on main" \
  || echo "tag is NOT on main"
```

---

## 5. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| No run at all after pushing | The branch is not in `on.push.branches` | Add the branch to `on.push.branches` **and** to the gate's allowed list |
| Run starts but fails in seconds with "only runs on the `main` branch" | You pushed to another branch after adding it to `on.push.branches` but not to the gate | Update the gate's branch check (recipe 3.1) |
| Tag run fails with "was not created from the `main` branch" | The tag points at a commit that is not on `main` | Re-create the tag on a `main` commit, or allow the source branch (recipe 3.3) |
| `git merge-base` errors with "Not a valid object name origin/main" | `main` was not fetched in the gate | Keep the `git fetch --no-tags origin "+refs/heads/main:refs/remotes/origin/main"` line and `fetch-depth: 0` on the checkout step |
| Publish job is skipped even though a tag was pushed | The tag run failed earlier in the chain, or the tag does not match `v*` / `package.json` version | Fix the failing job; the publish job also requires the tag to equal the `package.json` version |
| A PR shows "expected" checks that never appear | Pull request triggers are disabled on purpose | Either rely on the branch policy, or re-enable PR runs (recipe 3.4) and update the branch protection rules to the new check names |

### Note on required status checks

Branch protection rules on GitHub can require specific check names. If you changed which jobs run,
update **Settings → Branches → Branch protection rules → Require status checks to pass** so the
required list matches the job names that still exist (`Verify ref is main (or a tag from main)`,
`Install dependencies`, `Format check (Biome)`, `Lint (Biome)`, `Type check`,
`Unit tests (Node 20)`, `Unit tests (Node 22)`, `Build and package`).

---

## 6. Quick reference

```yaml
# current, restrictive policy
on:
  push:
    branches: [main] # only main
    tags: ['v*'] # tags are additionally verified against main in the gate job
```

```yaml
# permissive alternative: any branch, any tag, plus PRs
on:
  push:
    branches: ['**']
    tags: ['v*']
  pull_request:
```

If you take the permissive route, remove the `gate` job and the `needs: gate` references, or the run
will start and then fail by design.

---

**Related:** [README](./README.md) · [Contributing guide](./docs/contributing.md) ·
[Project structure](./docs/project-structure.md) · [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)
