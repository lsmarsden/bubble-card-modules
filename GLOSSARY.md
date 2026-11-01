# Glossary

Domain terms used in code, tests and docs. Use these names; don't invent synonyms.

## Modules and cards

- **Module**: a Bubble Card module in `modules/<module_id>/`, built into one YAML file. Its interface is the
  function `export function <module_id>(card, hass)`, run by Bubble Card on every style pass of every card it is on.
- **Helper**: shared code in `modules/helpers/`, inlined into each module that imports it at build time.
- **Style pass**: one run of a module's `code:` by Bubble Card. A card gets many (roughly seven per pop-up open), so
  modules must be idempotent: clean up, then apply.
- **Button**: the element a module targets on a button card: `main` / `main-button` (the main icon container) or
  `sub-button-N`.
- **Separator line**: the `.bubble-line` of a separator card, wrapped by modules in a `.bubble-line-wrapper`.
- **Gate**: the check that lets a module skip its DOM writes on a style pass where nothing they depend on changed
  (`modules/helpers/utils/gate.js`: `writeIfChanged`, `hasInputsChanged`). Uses `hasChanged` on 3.3.0+ and an identical
  fallback stored on the card instance before that. A module reads every input first (entities, colours, conditions,
  sizes, the clock), then gates only the writes. Each gate also compares the DOM it owns (nodes it created, styles and
  classes it sets), so it redraws whatever something else removed.

## Progress

- **Progress source**: what progress is read from: an entity, `entity[attribute]`, a `timer` entity, or a raw value.
  Config key `source` (deprecated: `entity` in `icon_border_progress`).
- **Progress**: the percent shown, 0–100, after mapping the source onto `start`–`end`, clamping, and `invert`.
  An `override` replaces the source with a percent. A timer's progress is its elapsed share of `duration`.
- **Progress reading**: the helper module `modules/helpers/entity/progress.js` (`showProgress`, `stopProgress`) that
  turns a progress source into progress and keeps it current.
- **Ticker**: the once-a-second update Progress reading runs while a progress source is an active timer. One per
  element; it always renders with the latest pass's config and `hass`, and stops when the timer stops, the config no
  longer matches, Bubble Card tears the card down, or the element leaves the page.
- **Color stops**: `{ percent, color }` entries mapping progress to a colour, optionally interpolated.

## Testing

- **Card harness**: the shared test fixture in `testing/cardHarness.js`. Runs a module the way Bubble Card does (see
  below), builds card DOM with upstream class names, stubs layout APIs and pins the clock. `useHass(states)` gives
  helper tests real `hass` states.

## Bubble Card runtime contract

Checked against Bubble Card v3.4.3 (`src/modules/module-documentation.md`, `src/tools/style-processor.js`).

- `code:` is compiled as a JavaScript template literal with `Function(...)` and applied with `this` = the card
  instance, so `this.config` holds the card config.
- Names in scope: `hass` (a tracking proxy: reading an entity through it registers a render dependency), `entity`,
  `state`, `icon`, `subButtonState`, `subButtonIcon`, `getWeatherIcon`, `card`, `name`, `checkConditionsMet`,
  `onTeardown` (3.3.0+), `hasChanged` (3.3.0+), `renderTemplate`.
- Referencing a name the installed version lacks throws and Bubble Card skips the whole module: guard newer names
  with `typeof name === "function"`, and make the fallback behave the same.
- `hasChanged(label, ...values)` (3.3.0+): true the first time and whenever a value changed since that label was last
  asked. One memory per label per module per card, emptied when the card is rebuilt. Values are joined into a
  signature: arrays by value, `null`/`undefined` as `""`, anything else with `String()` (so pass objects as JSON).
  Never throws. Bubble Card never memoises `code:` with side effects, so a gate is the only way to skip work.
- `onTeardown(fn)`: one registration per module per card (the last wins), run once when the card is torn down, which
  includes being moved in the DOM. Fallback for older versions: check `element.isConnected` inside timers.
- `checkConditionsMet(conditions, hass)`: upstream's condition evaluator, in scope in every stable release with modules
  (v3.0.0+; first in v2.5.0-beta.6). Takes a list only, and throws on a single object or a `null` entry. On 3.4.x it is
  bound to the card, so `template` conditions re-render it. Its semantics differ from our `checkAllConditions` and
  change between versions (`not` from 3.0.1, `template` and numeric `attribute` from 3.1.0). It has no `exists`
  condition and doesn't read `entity[attribute]` thresholds. Modules evaluate conditions with `checkAllConditions`.
- `code:` may contain Home Assistant (Jinja) templates: any `{{` or `{%` is sent to the server. Built modules must
  never contain them.
