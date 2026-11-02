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

### 1b. Keep the vendored parser current — done (PR #36, merged; option 1 chosen)

Bubble Card isn't on npm, so the parser has to come from its git repo. Options:

- **(recommended) Weekly sync workflow**: compare the latest Bubble Card release tag with
  `testing/upstream/bubble-card/VERSION`; if newer, run the vendor script, push a branch, start CI on it with
  `workflow_dispatch` (PRs opened with `GITHUB_TOKEN` don't trigger `pull_request` workflows) and open a PR. Tracks
  releases (what users run), keeps tests offline and deterministic, and shows upstream parser changes as a reviewable
  diff; a contract break shows up as a red PR.
- Git submodule + Dependabot `gitsubmodule`: no copy in the repo, but Dependabot follows upstream `main` (not
  releases), CI needs submodule checkout, and the parser's imports still need stubbing at test time.
- Fetch at test time: always latest, but tests depend on the network and break without any change of ours.

### 2. Read-only store preview in CI — done (PR #35, merged)

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
- [x] First real run (PR #35) found all four posts: icon_border_progress v1.7.0, separator_as_progress_bar v1.1.1,
      separator_as_timeline v1.5.0, sub_button_wheel v1.3.0. All four would update; comments list the missed versions.

### 3. Publisher, dry run by default, sandbox first — done (PRs #37, #38, #39; rehearsal passed)

- [x] Release job attaches `STORE_POST.md` to each GitHub release (`PlannedRelease.assets`); publishing downloads it
      (`fetchReleasePost`), so a re-run republishes exactly what was released.
- [x] `publishSteps(plan, { comments, force })` (`scripts/ts/store/storePublish.ts`): comment first (skipped when its
      marker is on the post), then update (skipped when the body already matches); create for new modules
      (title `[JS+Editor Module] <name>`); up-to-date only rewritten with `force`.
- [x] `githubGraphql`, `fetchComments`, `fetchTarget` (store category), `runSteps` (GraphQL mutations), all against
      fakes.
- [x] `publish_store.ts`: env-driven (`STORE_REPOSITORY`, `STORE_AUTHOR`, `PUBLISH`, `FORCE`, `MODULES`,
      `SEED_FROM`); plans all modules before any write; reads back through the store listing (5 tries, 5s apart) and
      fails if a new version isn't shown.
- [x] `publish-store.yml`: manual, target `sandbox` only, GITHUB_TOKEN with `discussions: write`. Sandbox = this repo's
      "Share your Modules" category (enabled by lsmarsden 2026-11-02).
- [x] Patch released all four modules (PR #38): icon_border_progress 1.7.4, separator_as_progress_bar 1.2.3,
      separator_as_timeline 1.6.2, sub_button_wheel 1.3.3. Every release has STORE_POST.md; tag image links resolve.
- [x] Rehearsed in the sandbox (runs 5–8, 2026-11-02): dry run listed seeds + creates; seed + publish created
      discussions #40–#43 from the live posts (#1525 v1.7.0, #1518 v1.1.1, #1426 v1.5.0, #1728 v1.3.0), commented and
      updated each, verification passed; re-run and forced re-run: "nothing to do" for all four.

### 4. Real store, behind approval

- [ ] `module-store` environment: deployment branch `main`, required reviewer lsmarsden, secret `MODULE_STORE_TOKEN`
      (classic PAT, `public_repo`). **Needs:** token created by lsmarsden; `gh` commands to be provided.
- [ ] After publishing, re-read through the store's endpoint + vendored parser; fail if the store wouldn't show the
      new version.
- [ ] First run: patch-release all four modules (ships the link fix, catches up the stale posts).
- [ ] Hook into `release.yaml` after the release job, waiting on the environment approval (the "button").
- [ ] New modules: create the post on first release (title `[JS+Editor Module] <name>`).

## Log

- 2026-11-02: first sandbox rehearsal (runs 1–4) succeeded but did nothing: the workflow passes MODULES="" for a blank
  input and the CLI read that as "no modules". Fixed test-first (`selectModules`) in PR #39. Lesson: a run that
  reports nothing per module is a failure; read the report, not the green tick.
- 2026-11-02: #37 (publisher) and #38 (patch releases) merged; releases carry STORE_POST.md. Sandbox rehearsal
  commands given to lsmarsden (dry run with seed → seed + publish → re-run → forced re-run).
- 2026-11-02: #35 merged (preview found all four posts: 1.7.0, 1.1.1, 1.5.0, 1.3.0). #36 merged (weekly parser sync;
  needs "Allow GitHub Actions to create and approve pull requests" for its PR step). Step 3 opened as #37.
- 2026-11-02: PR #34 merged. Step 2 (PR #35) built test-first; the sandbox here can't call the GitHub API directly,
  so live reads are only verified in CI.
- 2026-11-02: plan agreed (option A, approval button, update on new versions only, re-run overwrites, release
  comment). Step 1 opened as PR #34.
