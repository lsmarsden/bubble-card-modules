/**
 * Run a module's built artifact (the YAML users install) the way Bubble Card v3.4.3 does: `code:` compiled as a
 * template literal with Bubble Card's scope names, applied with `this` = the card. Artifacts are built once per test
 * run by testing/globalSetup.js.
 */
import fs from "node:fs";
import path from "node:path";
import { load } from "js-yaml";

// Names in `code:` scope, in Bubble Card's order (src/tools/style-processor.js).
const SCOPE = [
  "hass",
  "entity",
  "state",
  "icon",
  "subButtonState",
  "subButtonIcon",
  "getWeatherIcon",
  "card",
  "name",
  "checkConditionsMet",
  "onTeardown",
  "hasChanged",
  "__jinja",
  "renderTemplate",
];

/** The built module definition (name, version, code, editor, ...) for `moduleId`. */
export function loadArtifact(moduleId) {
  const dir = process.env.BUBBLE_CARD_ARTIFACTS;
  if (!dir) throw new Error("No built artifacts: run tests through Jest so testing/globalSetup.js builds them");
  return load(fs.readFileSync(path.join(dir, `${moduleId}.yaml`), "utf8"))[moduleId];
}

/**
 * A function shaped like the module's own (`name` = module id, called as `fn.call(card, cardEl, hass)`) that runs
 * the built artifact instead, so the Card harness can run either. `onTeardown`/`hasChanged` come from the harness
 * mode: absent in legacy mode, as on Bubble Card versions before 3.3.0.
 */
export function artifactModule(moduleId) {
  const compiled = Function(...SCOPE, `return \`${loadArtifact(moduleId).code}\`;`);
  return {
    [moduleId](card, hass) {
      const scope = {
        hass,
        entity: this.config?.entity,
        card,
        subButtonState: [],
        subButtonIcon: [],
        onTeardown: global.onTeardown,
        hasChanged: global.hasChanged,
        __jinja: [],
      };
      return compiled.apply(
        this,
        SCOPE.map((name) => scope[name]),
      );
    },
  }[moduleId];
}

/** Bubble Card versions the Card harness can mimic: with `onTeardown`/`hasChanged` (3.3.0+) and without. */
export const HARNESS_MODES = ["3.3+", "legacy"];

/**
 * `describe.each` rows `[label, fn, mode]` running a suite against the module source and its built artifact, each on
 * Bubble Card 3.3+ and on older versions (pass `mode` to the Card harness).
 */
export function sourceAndArtifact(moduleId, sourceFn) {
  const builds = [
    ["source", sourceFn],
    ["built artifact", artifactModule(moduleId)],
  ];
  return builds.flatMap(([build, fn]) => HARNESS_MODES.map((mode) => [`${build}, Bubble Card ${mode}`, fn, mode]));
}
