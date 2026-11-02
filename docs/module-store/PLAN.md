# Plan: publish modules to Bubble Card's module store from the pipeline

Living plan for automating the module store discussion posts. Update the status boxes and the log at the bottom as
work lands, so the next session can pick up from here. Decisions and their reasons are also in
`docs/architecture-review/DECISIONS.md` ("Module store publishing").

## Goal

Releasing a module (bump `module.yaml` version + CHANGELOG entry, merge) also updates its post in Clooos/Bubble-Card's
"Share your Modules" discussion category and comments the changelog there, after one approval click. Today this is a
manual copy-paste that has fallen behind (icon_border_progress post shows v1.7.0 with 1.7.3 released; sub_button_wheel
v1.3.0 with 1.3.2 released).

## How the store works (Bubble Card v3.4.3)

- Lists posts with unauthenticated `GET /repos/Clooos/Bubble-Card/discussions?per_page=100&page=N`, keeps category
  name exactly `Share your Modules`, caches 24h per browser.
- Parser (`src/modules/parser.js`, `parseDiscussionsREST`): module id = first key of the first ```yaml block whose
  module has `name`/`code`/`description`/`version`; that YAML is installed as written. Update badge when the YAML
  `version` is newer than the installed one. Preview image = first `https://` image.
- Body limit 65,536 characters; our posts are 32–37 KB.
- Only the author can edit a post. Writing to Clooos's repo needs a **classic** PAT (`public_repo`) of lsmarsden;
  fine-grained tokens can't write to public repos you aren't a member of.

Known posts: icon_border_progress <https://github.com/Clooos/Bubble-Card/discussions/1525>, sub_button_wheel
<https://github.com/Clooos/Bubble-Card/discussions/1728>. separator_as_progress_bar and separator_as_timeline: find
them through the store listing (step 2 does this).

## Working agreements

- **TDD**: red, green, refactor. Write the failing test first, from the behaviour the store or GitHub shows; one
  behaviour per test.
- **Simple design (XP)**: the simplest thing that passes; no speculative options. Thin CLI and workflow glue over pure,
  tested functions (fetch injected, never mocked globally).
- **Small releases**: one step per PR, each green in CI and mergeable on its own. Nothing writes to Clooos's repo until
  step 4, and then only behind the approval button.
- **Test at the artifact**: assert on what users get (the rendered post as the store parses it), not on internals.

## Steps

### 1. Store post renderer + contract tests — done (PR #34, merged)

- [x] `scripts/ts/store/storePost.ts`: `renderStorePost(built)` → `dist/STORE_POST.md` on every build. Replaces
      SHARE_MODULE.md.
- [x] `module.yaml` `screenshots: [{ file, alt }]`, linked at the release tag via raw.githubusercontent.com.
- [x] Rejects unknown card types, ``` in the YAML, bodies over 65,536.
- [x] Upstream parser vendored at v3.4.3 (`scripts/ts/upstream/vendorStoreParser.ts`), read with the js-yaml version
      Bubble Card ships (`store-js-yaml` alias).
- [x] Contract test: every module's post parses to the right id/name/version/creator/cards/description/image, counts
      as an update, and installs the built YAML byte for byte.
- [x] Fixed module `link` (404) and a README image filename case.

### 1b. Keep the vendored parser current — proposed, needs a decision

Bubble Card isn't on npm, so the parser has to come from its git repo. Options:

- **(recommended) Weekly sync workflow**: compare the latest Bubble Card release tag with
  `testing/upstream/bubble-card/VERSION`; if newer, run the vendor script, push a branch, start CI on it with
  `workflow_dispatch` (PRs opened with `GITHUB_TOKEN` don't trigger `pull_request` workflows) and open a PR. Tracks
  releases (what users run), keeps tests offline and deterministic, and shows upstream parser changes as a reviewable
  diff; a contract break shows up as a red PR.
- Git submodule + Dependabot `gitsubmodule`: no copy in the repo, but Dependabot follows upstream `main` (not
  releases), CI needs submodule checkout, and the parser's imports still need stubbing at test time.
- Fetch at test time: always latest, but tests depend on the network and break without any change of ours.

### 2. Read-only store preview in CI — PR #35 open

No secret, publishes nothing.

- [x] Vendored parser moved to `scripts/ts/upstream/bubble-card/` (used by scripts, not just tests).
- [x] `fetchStoreDiscussions(fetch, { repository, token })` (`scripts/ts/store/storeListing.ts`): every page of the
      REST listing; fails rather than return part of it.
- [x] `findLivePost(discussions, id, author)`: store category + author, store parser decides the module (each post
      parsed alone: the parser drops unreadable posts, so batch output doesn't line up). Two posts → error.
- [x] `planStoreUpdate(built, live, changelog)` (`storePlan.ts`): `new` / `up-to-date` / `update` + release comment
      (entries since the live version; marker `<!-- bubble-card-modules release <id>@<version> -->`; bare `#123` →
      `lsmarsden/bubble-card-modules#123`). Store newer than repo → error.
- [x] `renderPreview(plans, diff)` (`storePreview.ts`) + `preview_store.ts` CLI; non-required "Module store preview"
      CI job (output teed to the log too).
- [ ] Check the first real run shows the known posts and their versions (PR #35's job).

### 3. Publisher, dry run by default, sandbox first

- [ ] Release job attaches `STORE_POST.md` to each GitHub release; publishing uses the release asset, so a re-run
      republishes exactly what was released.
- [ ] `publishStorePost` (GraphQL `updateDiscussion` / `addDiscussionComment`, `createDiscussion` for new modules):
      only rewrites a differing body; comments only if the marker for that version is missing. Unit-tested with a fake
      GraphQL client.
- [ ] `--repo` target. Sandbox = this repo with Discussions on and a `Share your Modules` category, written with
      `GITHUB_TOKEN` (`discussions: write`). **Needs:** enable Discussions + create the category.
- [ ] Manual `workflow_dispatch` "Publish to module store" with `target: sandbox` and `dry-run: true` defaults.

### 4. Real store, behind approval

- [ ] `module-store` environment: deployment branch `main`, required reviewer lsmarsden, secret `MODULE_STORE_TOKEN`
      (classic PAT, `public_repo`). **Needs:** token created by lsmarsden; `gh` commands to be provided.
- [ ] After publishing, re-read through the store's endpoint + vendored parser; fail if the store wouldn't show the
      new version.
- [ ] First run: patch-release all four modules (ships the link fix, catches up the stale posts).
- [ ] Hook into `release.yaml` after the release job, waiting on the environment approval (the "button").
- [ ] New modules: create the post on first release (title `[JS+Editor Module] <name>`).

## Log

- 2026-11-02: PR #34 merged. Step 2 (PR #35) built test-first; the sandbox here can't call the GitHub API directly,
  so live reads are only verified in CI.
- 2026-11-02: plan agreed (option A, approval button, update on new versions only, re-run overwrites, release
  comment). Step 1 opened as PR #34.
