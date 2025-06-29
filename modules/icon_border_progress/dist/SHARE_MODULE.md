# Icon Border Progress

**Version:** 1.2.0  
**Creator:** lsmarsden

> [!IMPORTANT]
>
> ### Supported cards:
>
> - button
> - climate
> - cover
> - media-player
> - pop-up
> - select
> - separator

![preview.png](assets/preview.png)

<div><h2>Icon Border Progress</h2>
    <p>
        Forked from <a href="https://github.com/Clooos/Bubble-Card/discussions/1296" target="_blank">Nick's module</a>.

        This module adds the ability to show progress of an entity via icon borders. If using a custom border-radius please make sure you define --bubble-icon-border-radius for this to work correctly.
    </p>

    <p>
        For full documentation including configuration, examples, and more, visit the <a
            href="https://github.com/lsmarsden/bubble-card-modules/tree/main/modules/icon_border_progress"
            target="_blank">GitHub repo</a>.
    </p>
</div>

---

<details>

<summary><b>🧩 Get this Module</b></summary>

<br>

> To use this module, search for Icon Border Progress in the module store.
> Alternatively, copy and paste the following configuration into your `/www/bubble/bubble-modules.yaml` file.

```yaml
icon_border_progress:
  name: Icon Border Progress
  version: v1.2.0
  creator: lsmarsden
  link: https://github.com/lsmarsden/bubble-card-modules/tree/main/icon_border_progress
  supported:
    - button
    - climate
    - cover
    - media-player
    - pop-up
    - select
    - separator
  description: |-
    <div><h2>Icon Border Progress</h2>
        <p>
            Forked from <a href="https://github.com/Clooos/Bubble-Card/discussions/1296" target="_blank">Nick's module</a>.

            This module adds the ability to show progress of an entity via icon borders. If using a custom border-radius please make sure you define --bubble-icon-border-radius for this to work correctly.
        </p>

        <p>
            For full documentation including configuration, examples, and more, visit the <a
                href="https://github.com/lsmarsden/bubble-card-modules/tree/main/modules/icon_border_progress"
                target="_blank">GitHub repo</a>.
        </p>
    </div>
  code: |-
    ${(() => {
    /**
     * ======== IMPORTED HELPER FUNCTIONS =========
     */

    const getState = (input, fallbackToRaw = true) => {
      if (input == null) return undefined;
      if (typeof input !== "string" && typeof input !== "object") return input;

      let entityId, attribute;

      if (typeof input === "object") {
        entityId = input.entity_id || input.entity;
        attribute = input.attribute || input.att;
      } else {
        // Pattern: entity_id[attribute]
        const match = input.match(/^([A-z0-9_.]+)\[([A-z0-9_]+)]$/);
        if (match) {
          [, entityId, attribute] = match;
        } else if (hass.states[input]) {
          entityId = input;
        } else {
          return fallbackToRaw ? input : undefined;
        }
      }

      const stateObj = hass.states[entityId];
      if (!stateObj) return fallbackToRaw ? input : undefined;

      return attribute ? stateObj.attributes[attribute] : stateObj.state;
    }

    function checkAllConditions(cProp) {
      if (!cProp) return true;
      if (Array.isArray(cProp)) {
        return cProp.every((condition) => evaluateSingleCondition(condition));
      }
      return evaluateSingleCondition(cProp);
    }

    function evaluateSingleCondition(condObj) {
      if (!condObj || typeof condObj !== "object") return false;
      if (!condObj.condition) return false;
      const t = condObj.condition;
      switch (t) {
        case "state": {
          const state = getState(condObj, false);
          if (state === undefined) return false;
          if (Array.isArray(condObj.state)) {
            return condObj.state.includes(state);
          }
          return state === condObj.state;
        }
        case "numeric_state": {
          const numVal = parseFloat(getState(condObj));
          if (isNaN(numVal)) return false;

          const aboveVal = parseFloat(getState(condObj.above));
          if (!isNaN(aboveVal) && numVal <= aboveVal) {
            return false;
          }

          const belowVal = parseFloat(getState(condObj.below));
          if (!isNaN(belowVal) && numVal >= belowVal) {
            return false;
          }

          return true;
        }
        case "exists":
          return getState(condObj) !== undefined;
        case "and":
          if (!Array.isArray(condObj.conditions)) return false;
          return condObj.conditions.every((sc) => evaluateSingleCondition(sc));
        case "or":
          if (!Array.isArray(condObj.conditions)) return false;
          return condObj.conditions.some((sc) => evaluateSingleCondition(sc));
        case "not":
          if (Array.isArray(condObj.conditions) && condObj.conditions.length > 0) {
            return !evaluateSingleCondition(condObj.conditions[0]);
          }
          if (condObj.conditions) {
            return !evaluateSingleCondition(condObj.conditions);
          }
          return false;
        default:
          return false;
      }
    }

    function resolveColor(color, defaultColor) {
      let resolvedColor = getState(color);
      if (!resolvedColor) return defaultColor ?? "var(--primary-color)";
      if (typeof resolvedColor !== "string") return defaultColor ?? "var(--primary-color)";

      resolvedColor = resolvedColor.trim();
      const validPrefixes = ["#", "rgb", "hsl"];

      if (validPrefixes.some((prefix) => resolvedColor.startsWith(prefix))) {
        return resolvedColor;
      }

      return `var(--${resolvedColor}-color)`;
    }

    function resolveColorFromStops(progress, stops, interpolate) {
      // handles the situation when HA reformats arrays into objects keyed by numbers.
      if (!Array.isArray(stops) && typeof stops === "object" && stops !== null) {
        stops = Object.values(stops).sort((a, b) => a.percent - b.percent);
      }
      if (!Array.isArray(stops) || !stops || stops.length === 0) {
        return "var(--primary-color)";
      }
      // Sort stops in ascending order by percent
      const sortedStops = stops.slice().sort((a, b) => a.percent - b.percent);

      // Handle out-of-range progress values
      if (progress <= sortedStops[0].percent) {
        return resolveColor(sortedStops[0].color);
      }
      if (progress >= sortedStops[sortedStops.length - 1].percent) {
        return resolveColor(sortedStops[sortedStops.length - 1].color);
      }

      // Find the lower and upper bounds
      const lower = [...sortedStops].reverse().find((s) => s.percent <= progress);
      const upper = sortedStops.find((s) => s.percent >= progress);

      if (!interpolate || resolveColor(lower.color) === resolveColor(upper.color)) {
        return resolveColor(lower.color);
      }

      const range = upper.percent - lower.percent;
      const frac = (progress - lower.percent) / range;
      const format = (v) => parseFloat(v.toFixed(2));

      return `color-mix(in srgb, ${resolveColor(lower.color)} ${format((1 - frac) * 100)}%, ${resolveColor(upper.color)} ${format(frac * 100)}%)`;
    }

    function applyEffects(element, effects) {
      Object.values(effects).forEach((eff) => {
        if (eff.effect) {
          if (checkAllConditions(eff.condition)) {
            element.classList.add(`progress-effect-${eff.effect}`, "has-effect");
          } else {
            element.classList.remove(`progress-effect-${eff.effect}`);
          }
        }
      });
    }

    function toArray(object) {
      if (Array.isArray(object)) return object;
      if (!object || typeof object !== "object") return [];

      return Object.values(object);
    }

    const resolveConfig = (sources, defaultValue = undefined) => {
      for (const source of sources) {
        const keys = Array.isArray(source.path) ? source.path : source.path.split(".");
        const value = getConfigValue(source.config, keys);

        if (value !== undefined && (!source.condition || source.condition(value, source.config))) {
          const metadata = source.metadata || {};
          if (metadata.deprecated) {
            console.warn(
              `[DEPRECATED] Config path "${source.path}" used.` +
                (metadata.replacedWith ? ` Use "${metadata.replacedWith}" instead.` : "") +
                (metadata.message ? ` ${metadata.message}` : ""),
            );
          }
          return value;
        }
      }
      return defaultValue;
    }

    function getConfigValue(config, keys) {
      let current = config;
      for (const key of keys) {
        if (current && key in current) {
          current = current[key];
        } else {
          return undefined;
        }
      }
      return current;
    }

    function angleToOffset(angle, pathLength, visualOffset = 0) {
      const normalizedAngle = normalizeAngle(angle);
      const angleOffset = (normalizedAngle / 360) * pathLength;
      return angleOffset + visualOffset;
    }

    function normalizeAngle(angle) {
      return ((angle % 360) + 360) % 360;
    }

    function detectElementShape(element, elementSize, borderRadiusOverride) {
      // Priority: config override > computed CSS > default
      let borderRadiusStyle;

      if (borderRadiusOverride !== undefined && borderRadiusOverride !== null) {
        // Convert number to px string, or use string as-is
        borderRadiusStyle =
          typeof borderRadiusOverride === "number" ? `${borderRadiusOverride}px` : String(borderRadiusOverride);
      } else {
        // Fall back to computed CSS
        borderRadiusStyle = getBorderRadiusStyle(element);
      }

      return detectShapeFromBorderRadius(borderRadiusStyle, elementSize);
    }

    function detectShapeFromBorderRadius(borderRadiusStyle, elementSize) {
      const elementRadius = elementSize / 2;
      let borderRadius = 0;
      let isCircular = false;

      if (!borderRadiusStyle) {
        return { isCircular: false, borderRadius: 0 };
      }

      if (borderRadiusStyle.includes("%")) {
        const percent = parseInt(borderRadiusStyle) || 0;
        isCircular = percent >= 50;
      } else if (borderRadiusStyle.includes("50")) {
        // Special case: any border-radius containing "50" is treated as circular
        isCircular = true;
      } else {
        borderRadius = parseInt(borderRadiusStyle) || 0;
        // If border-radius >= element radius, CSS would make it circular
        isCircular = borderRadius >= elementRadius;
      }

      // For circular shapes, we don't need the borderRadius value for path calculation
      if (isCircular) {
        borderRadius = 0;
      }

      return { isCircular, borderRadius };
    }

    function getBorderRadiusStyle(element) {
      if (typeof getComputedStyle === "undefined") {
        return "";
      }

      const computedStyle = getComputedStyle(element);
      return computedStyle.borderRadius || "";
    }

    function createProgressBorder(element, progressValue, progressColor, remainingColor, startAngle, options) {
      const { strokeWidth = 3, animationDuration = 800, borderRadiusOverride } = options;
      progressValue = Math.max(0, Math.min(100, progressValue || 0));

      let svg = element.querySelector(".stroke-dash-aligned-svg");

      if (!svg) {
        const computedStyle = typeof getComputedStyle !== "undefined" ? getComputedStyle(element) : {};
        if (computedStyle.position === "static") {
          element.style.position = "relative";
        }

        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "stroke-dash-aligned-svg");
        svg.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none";
        element.appendChild(svg);
      }

      const size = getEffectiveSize(element);
      svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

      // Detect shape from border-radius CSS property using helper
      const { isCircular, borderRadius } = detectElementShape(element, size, borderRadiusOverride);

      // Check if SVG needs rebuilding
      const existingPath = svg.querySelector(".progress-path");
      const currentData = `${isCircular}-${borderRadius}-${size}`;
      const storedData = svg.getAttribute("data-config");

      if (!existingPath || currentData !== storedData) {
        // Rebuild SVG
        svg.innerHTML = "";
        svg.setAttribute("data-config", currentData);

        // Create path data
        const radius = (size - strokeWidth) / 2;
        const center = size / 2;
        let pathData;

        if (isCircular) {
          pathData = `M ${center} ${strokeWidth / 2} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${strokeWidth / 2}`;
        } else {
          const r = Math.min(borderRadius, radius);
          const x = strokeWidth / 2;
          const y = strokeWidth / 2;
          const w = size - strokeWidth;

          if (r > 0) {
            pathData = `M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + w - r} Q ${x + w} ${y + w} ${x + w - r} ${y + w} L ${x + r} ${y + w} Q ${x} ${y + w} ${x} ${y + w - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
          } else {
            pathData = `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + w} L ${x} ${y + w} Z`;
          }
        }

        // Create background and progress paths
        ["bg-path", "progress-path"].forEach((className, index) => {
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("class", className);
          path.setAttribute("d", pathData);
          path.setAttribute("stroke", index ? "transparent" : remainingColor); // Start progress path as transparent
          path.setAttribute("stroke-width", strokeWidth);
          path.setAttribute("fill", "none");

          if (index) {
            // progress path
            path.setAttribute("stroke-linecap", "round");
            path.style.transition = `all ${animationDuration}ms ease-out`;
          }

          svg.appendChild(path);
        });

        // Calculate path metrics
        const progressPath = svg.querySelector(".progress-path");
        const pathLength = progressPath.getTotalLength ? progressPath.getTotalLength() : 300; // Fallback for environments without getTotalLength
        const visualOffset = calculateVisualOffset(isCircular, borderRadius, pathLength);

        progressPath.setAttribute("data-length", pathLength);
        progressPath.setAttribute("data-offset", visualOffset);
      }

      // Update progress
      const bgPath = svg.querySelector(".bg-path");
      const progressPath = svg.querySelector(".progress-path");

      bgPath.setAttribute("stroke", remainingColor);

      // Apply progress
      const pathLength = parseFloat(progressPath.getAttribute("data-length"));
      const visualOffset = parseFloat(progressPath.getAttribute("data-offset"));

      const dashLength = (progressValue / 100) * pathLength;
      const totalOffset = angleToOffset(startAngle, pathLength, visualOffset);

      // Check if this is the first time setting a non-zero progress value
      const wasTransparent = progressPath.getAttribute("stroke") === "transparent";
      const isFirstPositiveProgress = wasTransparent && progressValue > 0;

      if (progressValue <= 0) {
        // Make progress invisible when 0 or less - keeps transitions working
        progressPath.setAttribute("stroke", "transparent");
        progressPath.setAttribute("stroke-dasharray", `0 ${pathLength}`);
        progressPath.setAttribute("stroke-dashoffset", "0");
      } else {
        // Show progress path with proper color
        progressPath.setAttribute("stroke", progressColor);
        progressPath.setAttribute("stroke-dashoffset", totalOffset);

        const getDashArray = () => {
          return progressValue >= 100 ? `${pathLength} 0` : `${dashLength} ${pathLength - dashLength}`;
        };

        if (isFirstPositiveProgress) {
          // Start from 0 and animate to target on first appearance
          progressPath.setAttribute("stroke-dasharray", `0 ${pathLength}`);
          progressPath.getBoundingClientRect();
          requestAnimationFrame(() => {
            progressPath.setAttribute("stroke-dasharray", getDashArray());
          });
        } else {
          progressPath.setAttribute("stroke-dasharray", getDashArray());
        }
      }
    }

    function getEffectiveSize(element) {
      const rect = element.getBoundingClientRect();
      return Math.min(rect.width, rect.height) || 38;
    }

    function calculateVisualOffset(isCircular, borderRadius, pathLength) {
      if (isCircular || borderRadius === 0) {
        return isCircular ? 0 : pathLength * -0.125; // Circle: no offset, Square: jump to top-center
      }

      // Rounded rectangle: interpolate between square (-12.5%) and circle (0%)
      const maxRadius = pathLength / 8;
      const ratio = Math.min(borderRadius / maxRadius, 1);
      return pathLength * -0.125 * (1 - ratio);
    }

    const getDashArray = () => {
          return progressValue >= 100 ? `${pathLength} 0` : `${dashLength} ${pathLength - dashLength}`;
        }

    function removeProgressBorder(element) {
      const svg = element.querySelector(".stroke-dash-aligned-svg");
      if (svg) {
        svg.remove();
      }
    }

    /**
     * ======== MAIN MODULE CODE =========
     */


      // this allows IDEs to parse the file normally - will be removed automatically during build.
      const { icon_border_progress: config } = this.config;

      function getElementSelector(button) {
        if (button === "main-button" || button === "main") {
          return ".bubble-icon-container";
        } else {
          return `.bubble-${button}`;
        }
      }

      function storeOriginalBackground(element) {
        if (element.dataset.originalBackground === undefined) {
          element.dataset.originalBackground = element.style.background || "";
        }
      }

      function cleanupProgressStyling(element) {
        element.style.background = element.dataset.originalBackground;

        removeProgressBorder(element);
      }

      function calculateProgressValue(progressSource, buttonConfig) {
        let progressValue = parseFloat(getState(progressSource));
        let startValue = parseInt(getState(buttonConfig.start));
        let endValue = parseInt(getState(buttonConfig.end));

        startValue = isNaN(startValue) ? 0 : startValue;
        endValue = isNaN(endValue) ? 100 : endValue;

        if (isNaN(progressValue) || progressValue < startValue) {
          progressValue = startValue;
        }
        if (progressValue > endValue) {
          progressValue = endValue;
        }

        return ((progressValue - startValue) / (endValue - startValue)) * 100;
      }

      function resolveColorConfigs(buttonConfig) {
        const remainingColor = resolveConfig([
          { config: buttonConfig, path: "remaining_color" },
          {
            config: buttonConfig,
            path: "remainingcolor",
            metadata: { deprecated: true, replacedWith: "remaining_color" },
          },
        ]);

        const backColor = resolveConfig([
          { config: buttonConfig, path: "background_color" },
          {
            config: buttonConfig,
            path: "backcolor",
            metadata: { deprecated: true, replacedWith: "background_color" },
          },
        ]);

        return {
          remainingProgressColor: resolveColor(remainingColor, "var(--dark-grey-color)"),
          backgroundColor: resolveColor(backColor, "var(--bubble-icon-background-color)"),
        };
      }

      function applyProgressStyling(element, progressValue, progressColor, colors, buttonConfig) {
        element.style.background = `${colors.backgroundColor}`;
        element.style.position = "relative"; // Ensure element can contain absolutely positioned SVG

        const startAngle = -1 * (buttonConfig?.start_angle ?? -0); // Default to 0 (top)

        createProgressBorder(element, progressValue, progressColor, colors.remainingProgressColor, startAngle, {
          strokeWidth: 3,
          animationDuration: 800,
          borderRadiusOverride: buttonConfig?.border_radius,
        });
      }

      // Main processing loop
      toArray(config).forEach((buttonConfig) => {
        const button = buttonConfig.button;
        if (!button) return;

        const selector = getElementSelector(button);
        const element = card.querySelector(selector);
        if (!element) return;

        storeOriginalBackground(element);

        if (!checkAllConditions(buttonConfig.condition)) {
          cleanupProgressStyling(element);
          return;
        }

        const progressSource = resolveConfig([
          {
            config: buttonConfig,
            path: "source",
          },
          {
            config: buttonConfig,
            path: "entity",
            metadata: { deprecated: true, replacedWith: "source" },
          },
        ]);

        const progressValue = calculateProgressValue(progressSource, buttonConfig);
        const colorStops = buttonConfig.color_stops || [];
        const progressColor = resolveColorFromStops(progressValue, colorStops, buttonConfig.interpolate_colors);
        const colors = resolveColorConfigs(buttonConfig);

        applyProgressStyling(element, progressValue, progressColor, colors, buttonConfig);
        applyEffects(element, buttonConfig.effects || []);
      });
    })()}

    :root {
        --animated-progress-stroke-width: 3;
        --animated-progress-transition-duration: 0.3s;
        --bubble-border-inset: 2px;
    }

    .bubble-icon-container {
        container-type: size;
    }

    .progress-border {
        position: relative;
    }

    .animated-mask-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100cqw;
        height: 100cqw;
        pointer-events: none;
        
        /* Performance optimizations */
        contain: layout style paint;
        transform: translateZ(0); /* Force hardware acceleration */
    }

    .mask-sector {
        fill: black;
        transition: d var(--animated-progress-transition-duration) cubic-bezier(0.4, 0, 0.2, 1);
        will-change: d;
        contain: layout style paint;
    }

    .bg-path,
    .progress-path {
        fill: none;
        stroke-width: var(--animated-progress-stroke-width, 3);
        stroke-linecap: round;
        transition: all var(--animated-progress-transition-duration, 0.3s) cubic-bezier(0.4, 0, 0.2, 1);
        will-change: stroke;
    }
  editor:
    - type: expandable
      title: Dynamic Entity Resolution
      icon: mdi:information-variant-circle-outline
      schema:
        - type: constant
          label: Dynamic Entity Resolution (DER)
          value: >-
            If you see ✨ in an input field, then it supports DER. This allows entry of an entity, attribute, or regular
            value. Just enter the entity name. For attributes, use the format ENTITY[ATTRIBUTE], e.g.,
            sensor.my_phone[battery_level].
    - type: expandable
      name: '0'
      title: Icon 1 settings (define more in YAML)
      schema:
        - name: button
          label: Button to apply to. Use 'main' or 'sub-button-1' etc.
          selector:
            text: null
        - name: source
          label: ✨Source entity
          selector:
            entity: {}
        - name: condition
          label: Condition to show progress (see docs for additional condition configuration)
          selector:
            condition: {}
        - type: expandable
          label: Custom start/end values (optional)
          schema:
            - type: constant
              value: Use these to override the default 0-100 progress range.
            - name: start
              label: ✨Start value of entity
              selector:
                number:
                  default: 0
            - name: end
              label: ✨End value of entity
              selector:
                number:
                  default: 100
        - name: start_angle
          label: Starting angle for progress (0=top, 90=right, 180=bottom, -90=left)
          selector:
            number:
              min: -180
              max: 180
              step: 1
              unit_of_measurement: °
              default: 0
        - name: border_radius
          label: Border radius override (e.g., 10 for 10px, or '50%' for circular)
          selector:
            text: null
        - type: expandable
          label: Color settings
          schema:
            - name: interpolate_colors
              label: Gradually transition between colours
              selector:
                boolean: null
            - type: expandable
              name: color_stops
              label: Progress colors - add more in YAML
              schema:
                - type: expandable
                  label: Color 1
                  name: '0'
                  schema:
                    - name: color
                      label: ✨Color
                      selector:
                        ui_color: null
                    - name: percent
                      label: From %
                      selector:
                        number:
                          min: 0
                          max: 100
                          step: 1
                          unit_of_measurement: '%'
                - type: expandable
                  label: Color 2
                  name: '1'
                  schema:
                    - name: color
                      label: ✨Color
                      selector:
                        ui_color: null
                    - name: percent
                      label: From %
                      selector:
                        number:
                          min: 0
                          max: 100
                          step: 1
                          unit_of_measurement: '%'
        - name: background_color
          label: ✨Background colour of icon
          selector:
            ui_color: null
        - name: remaining_color
          label: ✨Color of remaining progress section
          selector:
            ui_color: null
    - type: expandable
      name: '1'
      title: Icon 2 settings (define more in YAML)
      schema:
        - name: button
          label: Button to apply to. Use 'main' or 'sub-button-1' etc.
          selector:
            text: null
        - name: source
          label: ✨Source entity
          selector:
            entity: {}
        - name: condition
          label: Condition to show progress (see docs for additional condition configuration)
          selector:
            condition: {}
        - type: expandable
          label: Custom start/end values (optional)
          schema:
            - type: constant
              value: Use these to override the default 0-100 progress range.
            - name: start
              label: ✨Start value of entity
              selector:
                number:
                  default: 0
            - name: end
              label: ✨End value of entity
              selector:
                number:
                  default: 100
        - name: start_angle
          label: Starting angle for progress (0=top, 90=right, 180=bottom, -90=left)
          selector:
            number:
              min: -180
              max: 180
              step: 1
              unit_of_measurement: °
              default: 0
        - name: border_radius
          label: Border radius override (e.g., 10 for 10px, or '50%' for circular)
          selector:
            text: null
        - type: expandable
          label: Color settings
          schema:
            - name: interpolate_colors
              label: Gradually transition between colours
              selector:
                boolean: null
            - type: expandable
              name: color_stops
              label: Progress colors - add more in YAML
              schema:
                - type: expandable
                  label: Color 1
                  name: '0'
                  schema:
                    - name: color
                      label: ✨Color
                      selector:
                        ui_color: null
                    - name: percent
                      label: From %
                      selector:
                        number:
                          min: 0
                          max: 100
                          step: 1
                          unit_of_measurement: '%'
                - type: expandable
                  label: Color 2
                  name: '1'
                  schema:
                    - name: color
                      label: ✨Color
                      selector:
                        ui_color: null
                    - name: percent
                      label: From %
                      selector:
                        number:
                          min: 0
                          max: 100
                          step: 1
                          unit_of_measurement: '%'
        - name: background_color
          label: ✨Background colour of icon
          selector:
            ui_color: null
        - name: remaining_color
          label: ✨Color of remaining progress section
          selector:
            ui_color: null
```

</details>

---

### Screenshot:

**ADD SCREENSHOTS HERE**
