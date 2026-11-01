# Architecture review decision record

Ephemeral reference branch (`claude/architecture-review-notes`). Not meant to be merged.
It records the 2026-11-01 architecture review and every design decision taken while grilling it,
so future sessions can pick up without re-deriving or re-litigating.

- Review report: [`2026-11-01-architecture-review.html`](2026-11-01-architecture-review.html)
  (open it in a browser; Tailwind + Mermaid come from CDNs)
- Repo state reviewed: `main` @ `0461b36`
- Work branch: `claude/affectionate-maxwell-rouon6`

## Candidates from the review

| #   | Candidate                                              | Strength        | Status                                    |
| --- | ------------------------------------------------------ | --------------- | ----------------------------------------- |
| 1   | Deepen Progress reading into one module                | Strong          | Chosen (2nd, after test uplift)           |
| 2   | Make Module build a deep module tested at the artifact | Strong          | Chosen (3rd)                              |
| 3   | Name the hass seam, give tests one Card harness        | Worth exploring | Card harness part pulled into test uplift |
| 4   | Test each Module at its own interface, not past it     | Worth exploring | Pulled into test uplift                   |
| 5   | Normalise editor-shaped config once, on entry          | Speculative     | Not started                               |
| 6   | One module for Bubble Card DOM targeting               | Speculative     | Not started                               |

## Verified findings (evidence)

- **Stale ticker bug** (`icon_border_progress` 1.7.0): two configs on one button with the same active
  timer; switching the condition from config A (red) to B (green) repaints green, then the 1s interval
  repaints red. Cause: `manageTimerUpdater` keeps the first `updateFn` closure forever.
- **Ticker leak**: intervals are never released when Bubble Card rebuilds a card (pop-ups rebuild on every open).
- **Stray hoisted closure**: built `icon_border_progress` YAML contains a top-level copy of `getDashArray`
  (inner closure of `createProgressBorder`), from the regex call-graph walk in `scripts/ts/helpers/extractors.ts`.
- **Import cycle**: `extractors.ts` imports `modulesDir` from `build_modules.ts`, whose import runs the full build.
  This is why `extractors.ts` has no tests.
- **Progress modules disagree**: separator maps out-of-range (150) to 0, icon clamps to 100; separator
  colour ignores `invert`, icon colour follows it; separator ignores `override: 0`; only icon supports
  `start`/`end`/timers.

## Upstream Bubble Card runtime contract (checked against v3.4.3, 2026-10-31)

Source: `Clooos/Bubble-Card` `src/modules/module-documentation.md`, `src/tools/style-processor.js`.

- Module YAML keys: `name, version, creator, link, supported (preferred over legacy unsupported), description, code, editor` (+ optional `suggestions`, `is_global`).
- `code:` is compiled as a JS template literal via `Function(...)` and applied with `this` = the card instance (`this.config` works).
- Names in scope: `hass` (tracking proxy: reads register render dependencies), `entity`, `state`, `icon`,
  `subButtonState`, `subButtonIcon`, `getWeatherIcon`, `card`, `name`, `checkConditionsMet`,
  `onTeardown` (3.3.0+), `hasChanged` (3.3.0+), `renderTemplate`.
- Referencing a name the installed version lacks throws and skips the whole module: guard with `typeof`.
- `onTeardown(fn)`: one registration per module per card, last wins, runs once after disconnect; also fires when a card is moved.
  Documented fallback: check `isConnected` inside the interval.
- Side-effecting `code:` (anything touching DOM/timers) is re-run on every style pass (~7 per pop-up open), never memoised.
- `code:` may contain HA Jinja; any `{{` or `{%` is split out and rendered server-side. Our output must never contain them
  (none do as of `0461b36`).
- Store discovers modules from the GitHub Discussions "Share your Modules" category (our `SHARE_MODULE.md` flow still valid).
- DOM selectors we rely on still exist: `.bubble-icon-container`, `.bubble-sub-button-N`, `.bubble-line`, `--bubble-icon-border-radius`.

## Decisions

### Round 1: candidate 1 (Progress reading)

- **Q1 Scope behind the seam**: value (source → state, timer active/paused, `start`/`end`, `override`, clamp, `invert`) + ticker.
  Colour resolution stays in each module.
- **Q2 Ticker**: the Progress module owns the 1s ticker; state lives on the DOM side (helpers are re-inlined each pass, so no
  module-level state); every render replaces the callback; stops when source isn't an active timer, no config matches, or the
  element is disconnected. Nothing outside knows `progress_update_interval`.
- **Q3 Out-of-range**: clamp everywhere (150 → 100, -10 → 0). Separator behaviour change, noted in CHANGELOG.
- **Q4 Invert and colour**: colour stops follow the displayed (inverted) percent in both modules. Separator CHANGELOG note.
- **Q5 Separator features**: expose `start`, `end`, timer sources in separator schema/editor/README; `override: 0` honoured;
  `override` remains separator-only in config.
- **Q6 Location and names**: `modules/helpers/entity/progress.js`; fold in and delete `entity/timer.js`, `ui/timerUpdater.js`.
  Create `GLOSSARY.md` with Progress source, Progress, Ticker.
- **Q7 Tests**: TDD. Stale-ticker regression test first; new `progress.test.js` through the module interface (fake timers, real
  hass fixture) replaces `timer`/`timerUpdater`/old progress tests; separator tests updated + timer/start/end tests;
  `icon_border_progress` mock test updated minimally (superseded by test uplift, see Q11).
- **Q8 Versions**: `icon_border_progress` 1.7.0 → 1.7.1; `separator_as_progress_bar` 1.1.1 → 1.2.0; CHANGELOG entries.
- **Q9 Delivery**: separate commits on `claude/affectionate-maxwell-rouon6`, candidate 1 first; candidate 1 stays within
  today's regex-build limits (function/arrow declarations only in helpers, no shared top-level constants).

### Round 2: test uplift + upstream findings

- **Q10 Order**: test uplift → candidate 1 → candidate 2; separate commits, pushed after each step.
- **Q11 Test uplift scope**: (a) shared Card harness for all integration tests; (b) de-verbose (`it.each` tables, shared
  assertion helpers, drop comments that restate code); (c) fold mock-heavy `code.test.js` (icon_border_progress,
  separator_as_timeline) into module-interface tests and rewrite the testing section of `.github/copilot-instructions.md`.
- **Q12 Safety net**: baseline per-file line + branch coverage first; no module or helper file may drop. Every deleted `it`
  must be covered by a surviving case.
- **Q13 Harness mirrors upstream scope**: `this` = card-like `{ config }`, real card DOM, `hass` as global; two modes:
  "3.3+" (provides `onTeardown` + `hasChanged`, records teardowns so tests can fire them) and "legacy" (absent, to test fallbacks).
- **Q14 Helper tests**: keep and tidy pure-logic helper tests (colour, time, strings, config, arrays, condition); leave
  progress/timer/timerUpdater tests to candidate 1.
- **Q15 Ticker cleanup**: register via `onTeardown` behind `typeof` guard, keep `isConnected` fallback. One teardown per module
  per card, so a per-card ticker list lives on `this`; the module function passes `this` and `onTeardown` into the Progress module.
- **Q16 Out of scope**: adopting `hasChanged` gating and upstream `checkConditionsMet`. Queued as separate suggested tasks.
- **Q17 Jinja guard (candidate 2)**: build fails if output contains `{{` or `{%`.
- **Q18 Glossary**: add Card harness and a short "Bubble Card runtime contract" section to `GLOSSARY.md`.

### Round 3: interfaces for candidates 1 and 2

- **Q19 Progress interface**: `showProgress(ctx, element, options, render)` resolves the percent, calls `render(percent)` now,
  keeps the ticker only while the source is an active timer (each tick calls the latest `render`); `ctx = { host: this, onTeardown }`.
  `stopProgress(ctx, element)` stops that element's ticker (no config matches). `readProgress` stays internal; tests go through
  `showProgress` with a spy render + fake timers. No design-it-twice.
- **Q20 Option keys**: `options` uses config keys (`source`, `start`, `end`, `override`, `invert`); icon's deprecated `entity`
  alias resolved before the call.
- **Q21 Render argument**: displayed percent only (0-100, after invert); 1s tick.
- **Q22 Separator first paint**: the `0cqw` then next-frame width trick happens only on first paint, so ticks don't collapse the bar.
- **Q23 Bundler**: esbuild (direct devDependency), tree-shaken, unminified; free names (`hass`, `card`, `onTeardown`...) left free;
  delete `extractors.ts`, `importParser.ts` and its test.
- **Q24 Module source format unchanged**: `export function module_id(card, hass)`; generated entry calls
  `module_id.call(this, card, hass)` inside `${(() => { ... })()}`.
- **Q25 Artifact tests**: build in memory, evaluate `code:` like upstream (`Function(<upstream scope names>, "return `...`")`
  applied with `this` = card); every module's integration suite runs against both source and artifact via the Card harness.
- **Q26 Build interface**: `buildModule(moduleDir) -> { yaml, warnings }` (reads, never writes; validation + Jinja guard).
  CLI writes `dist/` and runs Python doc gen. Paths move to a small paths file to break the import cycle.
- **Q27 CI**: artifact tests run inside the existing per-module `npm test` job; release job keeps `npm run build`.

## Progress log

- Push from the session is blocked (403, GitHub access not linked); commits are local until access is restored.
- **Test uplift done** (`1ef2c62` on `claude/affectionate-maxwell-rouon6`, local): Card harness in `testing/cardHarness.js`
  (+ `useHass`), TZ pinned to UTC, one `code.test.js` per module through the module function, mock-free helper tests,
  Jest 30 (jsdom 26 keeps `var()` CSS values; `--testPathPatterns` renamed in scripts/CI). 546 tests; no per-file coverage drop.
- **Found during uplift** (pinned in tests with comments, queued as a task): `exists` condition never fails
  (`getState` falls back to the raw condition object); `separator_as_timeline` editor writes
  `icon_settings.highlight_active` but code reads top-level `highlight_active` (schema default false, editor default true).
- Timezone-dependent timeline failure was a test issue, not a bug: a range crossing midnight intentionally renders two icons.
- **Candidate 1 done** (`da076a5`, pushed): `showProgress`/`stopProgress` in `modules/helpers/entity/progress.js`;
  `timer.js` and `timerUpdater.js` deleted; `icon_border_progress` 1.7.1, `separator_as_progress_bar` 1.2.0;
  `GLOSSARY.md` added. Ticker registry lives on `this._progressTickers` (a Map keyed by element); each pass replaces the
  ticker's `update` closure so ticks use that pass's `hass` and config.
- **Found during candidate 1**: the regex extractor only followed same-file calls one level deep, so the built
  modules would have lacked `readSourcePercent`/`readTimerPercent` (ReferenceError, whole module skipped). Minimal fix
  in `extractors.ts` (recurse instead of eager extraction); other modules' built output byte-identical. Strengthens the
  case for candidate 2's artifact tests.
