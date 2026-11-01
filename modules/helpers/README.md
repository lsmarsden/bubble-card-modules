# Reusing Module Code

Many modules will involve some fundamental logic that is common, such as
processing colour values, evaluating conditions, or getting entity state.

For these occasions, we can make use of the helpers in this folder to reuse code
across modules.

To use these, import them in the `code.js` file within a module, and use them as you normally would:

```javascript
import { resolveColor } from "../helpers/ui/color.js";

function module_id(card, hass) {
  // use the helper function as normal
  const iconColor = resolveColor(config.module_id.icon_color);

  // module-specific code here...
}
```

When building the final module using `npm run build`, the module's `code.js` and every helper it imports are bundled
with [esbuild](https://esbuild.github.io/): only the helpers actually used are included, unminified so the result stays
readable in Bubble Card's editor. Helpers can be functions, constants or classes, and may import other helpers.

The bundle is wrapped so Bubble Card runs it as a JavaScript template in the module's `code`, with `this` bound to the
card:

```yaml
module_id:
  name: My Module
  version: v1.2.2
  # Other YAML config...
  code: |-
    ${(() => {
    const __bubble_card_this = this;
    // modules/helpers/ui/color.js
    function resolveColor(color, defaultColor) {
      // logic from helper function
    }

    // modules/module_id/code.js
    function module_id(card, hass) {
      // module code
    }

    module_id.call(__bubble_card_this, card, hass);
    return "";
    })()}

    /* module styles */
```

Helpers read `hass` as a free variable. Names only newer Bubble Card versions have (`onTeardown`, `hasChanged`, both
3.3.0+) are passed in by the module through a `ctx` object, guarded with `typeof name === "function"`; see the runtime
contract in [`GLOSSARY.md`](../../GLOSSARY.md). The build fails if the output contains `{{` or `{%`, which
Bubble Card would send to Home Assistant as a Jinja template.
