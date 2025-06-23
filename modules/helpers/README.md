# Reusing Module Code

Many modules will involve some fundamental logic that is common, such as
processing colour values, evaluating conditions, or getting entity state.

For these occasions, we can make use of the helpers in this folder to reuse code
across modules.

To use these, import them in the `code.js` file within a module, and use them as you normally would:

```javascript
import { resolveColor } from "../helpers/color";

function module_id(card, hass) {
  // use the helper function as normal
  const iconColor = resolveColor(config.module_id.icon_color);

  // module-specific code here...
}
```

When building the final module using `npm run build`, all helper imports will be injected into the final `code` section of the YAML
above the main module code.

For example, the above JavaScript snippet would be built into the following YAML:

```yaml
module_id:
  name: My Module
  version: v1.2.2
  # Other YAML config...
  code: |-
    ${(() => {
    /**
     * ======== IMPORTED HELPER FUNCTIONS =========
     */

    function resolveColor(color) {
      // logic from helper function
    }

    /**
     * ======== MAIN MODULE CODE =========
     */


    // all module code from inside module_id(card, hass) function

    })()}
```
