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
- `onTeardown(fn)`: one registration per module per card (the last wins), run once when the card is torn down, which
  includes being moved in the DOM. Fallback for older versions: check `element.isConnected` inside timers.
- `code:` may contain Home Assistant (Jinja) templates: any `{{` or `{%` is sent to the server. Built modules must
  never contain them.
