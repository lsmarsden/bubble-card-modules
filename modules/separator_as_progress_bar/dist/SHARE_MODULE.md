# Separator As Progress Bar

**Version:** 1.0.0  
**Creator:** lsmarsden

> [!IMPORTANT]
>
> ### Supported cards:
>
> - separator

![preview.png](assets/preview.png)

<div><h2>Separator As Progress Bar</h2>
    <p>

        This module transforms the standard separator line into a sleek, customisable progress
        bar with multiple styling and animation options.
    </p>
    <ul>
        <li>Bind to any numeric entity or attribute as the source for progress</li>
        <li>Define progress colors at specific percentage stops, with optional smooth interpolation between them</li>
        <li>Fully customizable progress bar appearance: height, outline, background, and color transitions</li>
        <li>Support for conditional and templated text above and below the progress bar using entity values</li>
        <li>Optional animated orb and/or shine effects, each fully customizable and independently toggleable by
            conditions
        </li>
        <li>Invert progress direction (e.g. countdown behavior)</li>
    </ul>

    <p>
        For full documentation including configuration, examples, and more, visit the <a
            href="https://github.com/lsmarsden/bubble-card-modules/tree/main/modules/separator_as_progress_bar"
            target="_blank">GitHub repo</a>.
    </p>

</div>

---

<details>

<summary><b>🧩 Get this Module</b></summary>

<br>

> To use this module, search for Separator As Progress Bar in the module store.
> Alternatively, copy and paste the following configuration into your `/www/bubble/bubble-modules.yaml` file.

```yaml
separator_as_progress_bar:
  name: Separator As Progress Bar
  version: v1.0.0
  creator: lsmarsden
  link: https://github.com/lsmarsden/bubble-card-modules/tree/main/separator_as_progress_bar
  supported:
    - separator
  description: |-
    <div><h2>Separator As Progress Bar</h2>
        <p>

            This module transforms the standard separator line into a sleek, customisable progress
            bar with multiple styling and animation options.
        </p>
        <ul>
            <li>Bind to any numeric entity or attribute as the source for progress</li>
            <li>Define progress colors at specific percentage stops, with optional smooth interpolation between them</li>
            <li>Fully customizable progress bar appearance: height, outline, background, and color transitions</li>
            <li>Support for conditional and templated text above and below the progress bar using entity values</li>
            <li>Optional animated orb and/or shine effects, each fully customizable and independently toggleable by
                conditions
            </li>
            <li>Invert progress direction (e.g. countdown behavior)</li>
        </ul>

        <p>
            For full documentation including configuration, examples, and more, visit the <a
                href="https://github.com/lsmarsden/bubble-card-modules/tree/main/modules/separator_as_progress_bar"
                target="_blank">GitHub repo</a>.
        </p>
    </div>
  code: |-
    ${(() => {
    /**
     * ======== IMPORTED HELPER FUNCTIONS =========
     */

    function checkAllConditions(cProp) {
        if (!cProp) return true;
        if (Array.isArray(cProp)) {
            return cProp.every(condition => evaluateSingleCondition(condition));
        }
        return evaluateSingleCondition(cProp);
    }

    function evaluateSingleCondition(condObj) {
        if (!condObj || typeof condObj !== 'object') return false;
        if (!condObj.condition) return false;
        const t = condObj.condition;
        switch (t) {
            case 'state': {
                const state = getState(condObj, false);
                if (state === undefined) return false;
                if (Array.isArray(condObj.state)) {
                    return condObj.state.includes(state);
                }
                return state === condObj.state;
            }
            case 'numeric_state': {
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
            case 'exists':
                return getState(condObj) !== undefined;
            case 'and':
                if (!Array.isArray(condObj.conditions)) return false;
                return condObj.conditions.every(sc => evaluateSingleCondition(sc));
            case 'or':
                if (!Array.isArray(condObj.conditions)) return false;
                return condObj.conditions.some(sc => evaluateSingleCondition(sc));
            case 'not':
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

    function suffix(str, suffix) {
        str = clean(str);
        if (str === '') return '';
        return str.endsWith(suffix) ? str : str + suffix;
    }

    function clean(str) {
        if (!str) return '';
        str = String(str);
        if (str.trim() === '') return '';
        return str;
    }

    function renderTextTemplate(textTemplate) {
        if (!textTemplate || !textTemplate.text) return "";

        const placeholders = textTemplate.placeholders ?? {};
        const data = {};

        for (const key in placeholders) {
            data[key] = getState(placeholders[key]) ?? '';
        }

        return textTemplate.text.replace(/\{(\w+)}/g, (_, key) => data[key] ?? '');
    }

    function resolveColor(color, defaultColor) {
        let resolvedColor = getState(color);
        if (!resolvedColor) return defaultColor ?? 'var(--primary-color)';
        if (typeof resolvedColor !== 'string') return defaultColor ?? 'var(--primary-color)';

        resolvedColor = resolvedColor.trim();
        const validPrefixes = ['#', 'rgb', 'hsl'];

        if (validPrefixes.some((prefix) => resolvedColor.startsWith(prefix))) {
            return resolvedColor;
        }

        return `var(--${resolvedColor}-color)`;
    }

    function resolveColorFromStops(progress, stops, interpolate) {
        // handles the situation when HA reformats arrays into objects keyed by numbers.
        if (!Array.isArray(stops) && typeof stops === 'object' && stops !== null) {
            stops = Object.values(stops).sort((a, b) => a.percent - b.percent);
        }
        if (!Array.isArray(stops) || !stops || stops.length === 0) {
            return 'var(--primary-color)';
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
        const lower = [...sortedStops].reverse().find(s => s.percent <= progress);
        const upper = sortedStops.find(s => s.percent >= progress);

        if (!interpolate || resolveColor(lower.color) === resolveColor(upper.color)) {
            return resolveColor(lower.color);
        }

        const range = upper.percent - lower.percent;
        const frac = (progress - lower.percent) / range;
        const format = v => parseFloat(v.toFixed(2));

        return `color-mix(in srgb, ${resolveColor(lower.color)} ${format((1 - frac) * 100)}%, ${resolveColor(upper.color)} ${format(frac * 100)}%)`;
    }

    const getState = (input, fallbackToRaw = true) => {
        if (input == null) return undefined;
        if (typeof input !== 'string' && typeof input !== 'object') return input;


        let entityId, attribute;

        if (typeof input === 'object') {
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

    /**
     * ======== MAIN MODULE CODE =========
     */

     // this allows IDEs to parse the file normally - will be removed automatically during build.
        const config = this.config.separator_as_progress_bar;
        const element = card.querySelector('.bubble-line');
        if (!config || !element) return;
        let wrapper = card.querySelector('.bubble-line-wrapper');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'bubble-line-wrapper';
            element.parentNode.insertBefore(wrapper, element);
            wrapper.appendChild(element);
        }

        if (!checkAllConditions(config.condition)) {
            return;
        }

        let progressValue = config.override ? config.override : parseFloat(getState(config.source));

        if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
            progressValue = 0;
        }

        if (!config.progress_style) {
            return;
        }
        const progressStyle = config.progress_style;
        const interpolate = progressStyle.interpolate ?? true;
        const colorStops = progressStyle.color_stops || [];
        const progressColor = resolveColorFromStops(progressValue, colorStops, interpolate);

        const backgroundColorStops = progressStyle.background_color_stops || [];
        const backgroundProgressColor = resolveColorFromStops(progressValue, backgroundColorStops, interpolate);

        const bubbleBorderRadius = getComputedStyle(element).getPropertyValue('--bubble-icon-border-radius');
        if (bubbleBorderRadius && bubbleBorderRadius.trim() !== '') {
            element.classList.add('has-bubble-border-radius');
        } else {
            element.classList.remove('has-bubble-border-radius');
        }

        let tipGlowElement = element.querySelector('.bubble-line-progress-tip');
        if (!tipGlowElement) {
            tipGlowElement = document.createElement('div');
            tipGlowElement.className = 'bubble-line-progress-tip';
            element.appendChild(tipGlowElement);
        }

        let progressBarElement = element.querySelector('.bubble-line-progress-bar');
        if (!progressBarElement) {
            progressBarElement = document.createElement('div')
            progressBarElement.className = 'bubble-line-progress-bar';
            element.appendChild(progressBarElement);
        }

        element.classList.add('bubble-line-progress');
        wrapper.style.setProperty('--bubble-line-height', suffix(progressStyle.height ?? '6', "px"));

        // Delay setting the progress width until the element is visible and painted.
        // This allows the initial width to transition from zero when loading the page, otherwise it transitions from full width for some reason.
        // Still happens when switching views via tabs though.
        element.style.setProperty('--progress-width', '0cqw');
        requestAnimationFrame(() => {
            element.style.setProperty('--progress-width', `${config.invert ? 100 - progressValue : progressValue}cqw`);
        });
        element.style.setProperty('--bubble-line-progress-color', progressColor);
        element.style.setProperty('--bubble-line-progress-background-color', backgroundProgressColor);

        const shineSettings = progressStyle.shine_settings;
        if (shineSettings && (shineSettings.show_shine ?? false) && checkAllConditions(shineSettings.condition)) {
            const shineColor = resolveColor(shineSettings.shine_color, 'rgba(255,255,255,0.4)');
            const shineWidth = shineSettings.shine_width;
            const shineDelay = shineSettings.shine_delay;
            const shineAngle = shineSettings.shine_angle;

            if (!element.querySelector('.bubble-line-progress-shine')) {
                const shineElement = document.createElement('div');
                shineElement.className = 'bubble-line-progress-shine';
                progressBarElement.appendChild(shineElement);
                shineElement.style.setProperty('--bubble-line-progress-shine-color', shineColor);
                shineElement.style.setProperty('--bubble-line-progress-shine-width', shineWidth ? suffix(shineWidth, 'px') : 'calc(var(--progress-width) / 2)');
                shineElement.style.setProperty('--bubble-line-progress-shine-angle', shineAngle ? suffix(shineAngle, 'deg') : '0deg');
                shineElement.style.setProperty('animation-delay', `${shineDelay ?? '0'}s`);
            }
        }

        const orbSettings = progressStyle.orb_settings;
        if (orbSettings && (orbSettings.show_orb ?? false) && checkAllConditions(orbSettings.condition)) {
            const slowOrb = orbSettings.slow_orb ?? false;
            const orbColor = resolveColor(orbSettings.orb_color);
            const orbTrailColor = resolveColor(orbSettings.trail_color);

            if (!element.querySelector('.bubble-line-progress-orb')) {
                const orbElement = document.createElement('div');
                orbElement.className = 'bubble-line-progress-orb';
                progressBarElement.appendChild(orbElement);
                orbElement.style.setProperty('animation', `orb-${slowOrb ? 'slow 2s ease-in-out infinite' : 'fast 2s linear infinite'}`);
                orbElement.style.setProperty('--bubble-line-progress-orb-color', orbColor);
                orbElement.style.setProperty('--bubble-line-progress-orb-trail-color', orbTrailColor);
            }
        }

        const outlineSettings = progressStyle.outline;
        if (outlineSettings) {
            element.style.setProperty('--bubble-line-progress-outline', `${outlineSettings.style ?? ''} ${suffix(outlineSettings.width, 'px')} ${resolveColor(outlineSettings.color)}`);
        } else {
            element.style.setProperty('--bubble-line-progress-outline', 'none');
        }

        function addTextElement(textConfig, textClass) {
            if (textConfig) {

                let textEl = wrapper.querySelector(`.bubble-line-text.${textClass}`);
                if (!checkAllConditions(textConfig.condition)) {
                    if (textEl) {
                        textEl.remove();
                    }
                    return;
                }

                if (!textEl) {
                    textEl = document.createElement('div');
                    textEl.className = 'bubble-line-text';
                    textEl.classList.add(textClass);
                    if (textClass === 'above-text') {
                        wrapper.insertBefore(textEl, element);
                    } else {
                        wrapper.appendChild(textEl);
                    }
                }
                textEl.innerText = renderTextTemplate(textConfig);
            }
        }

        addTextElement(config.below_text, 'below-text');
        addTextElement(config.above_text, 'above-text');
    })()}

    .bubble-line-text {
        text-align: center;
        width: 100%;
        font-weight: bold;
        position: absolute;
    }

    .bubble-line-text.above-text {
        bottom: 100%;
        margin-bottom: 4px;
    }

    .bubble-line-text.below-text {
        top: 100%;
        margin-top: 2px;
    }

    .bubble-line-wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex-grow: 1;
    }

    .bubble-line-progress {
        position: relative;
        border-radius: calc(var(--bubble-line-height) / 2); /* Same as the orb radius - this lets is fit in the progress bar edges nicely */
        margin-right: 14px;
        opacity: 1 !important;
        flex-grow: 1;
        height: var(--bubble-line-height);
        background-color: var(--bubble-line-progress-background-color);
        container-type: size;
        outline: var(--bubble-line-progress-outline, none);
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
        overflow: hidden;
    }

    .bubble-line-progress-bar {
        content: '';
        position: absolute;
        height: inherit;
        border-radius: inherit;
        width: var(--progress-width);
        background: var(--bubble-line-progress-color);
        transition: width 0.3s ease-in-out;
        box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3),
        inset 0 -1px 2px rgba(0, 0, 0, 0.2);
        overflow: hidden;
    }

    .bubble-line-progress-bar::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 50%;
        background: linear-gradient(
                to bottom,
                rgba(255, 255, 255, 0.2),
                rgba(255, 255, 255, 0)
        );
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
        pointer-events: none;
    }

    .bubble-line-progress-tip {
        content: '';
        position: absolute;
        width: var(--bubble-line-height);
        height: var(--bubble-line-height);
        border-radius: 50%;
        top: 50%;
        left: calc(var(--progress-width) - 1.5 * var(--bubble-line-height));
        transition: left 0.3s ease-in-out;
        background-color: var(--bubble-line-progress-color);
        box-shadow: 0 0 6px var(--bubble-line-progress-color),
        0 0 12px var(--bubble-line-progress-color),
        0 0 20px var(--bubble-line-progress-color);
        animation: pulse-glow 1.8s ease-in-out infinite;
        pointer-events: none;
    }

    .bubble-line-progress-shine {
        content: '';
        position: absolute;
        top: 0;
        left: -50%;
        height: 100%;
        width: var(--bubble-line-progress-shine-width);
        background: linear-gradient( to right, transparent 0%, var(--bubble-line-progress-shine-color, rgba(255,255,255,0.4)) 50%, transparent 100%);
        animation: shine 2s linear infinite;
        pointer-events: none;
    }

    .bubble-line-progress-orb {
        position: absolute;
        height: inherit;
        width: 100cqh;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, var(--bubble-line-progress-orb-color));
    }

    .bubble-line-progress-orb::after {
        content: '';
        position: absolute;
        top: 20%;
        left: 20%;
        width: 40%;
        height: 30%;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        filter: blur(1px);
    }

    @keyframes shine {
        0% {
            transform: translateX(0) skew(var(--bubble-line-progress-shine-angle, 0deg));
        }
        20% {
            transform: translateX(0) skew(var(--bubble-line-progress-shine-angle, 0deg));
        }

        100% {
            transform: translateX(calc(1.5 * var(--progress-width) + 2.5 * var(--bubble-line-height))) skew(var(--bubble-line-progress-shine-angle, 0deg));
        }
    }

    @keyframes pulse-glow {
        0%, 100% {
            opacity: 0.3;
            transform: translate(50%, -50%) scale(1);
        }
        50% {
            transform: translate(50%, -50%) scale(1.3);
        }
    }

    @keyframes orb-slow {
        0% {
            transform-origin: left;
            transform: translateX(0);
            scale: 0;
        }

        20% {
            transform: translateX(0);
            scale: 1;
            box-shadow: none;
            clip-path: none;
        }
        50% {
            box-shadow: calc(-1 * var(--bubble-line-height)) 0 var(--bubble-line-height) calc(var(--bubble-line-height) / 4) var(--bubble-line-progress-orb-trail-color);
            clip-path: polygon(0 5%, 100% 0, 100% 100%, 0 95%, calc(-2.5 * var(--bubble-line-height)) 50%);
        }

        80% {
            transform: translateX(calc(var(--progress-width) - var(--bubble-line-height)));
            scale: 1;
        }
        100% {
            transform-origin: var(--progress-width);
            transform: translateX(calc(var(--progress-width) - var(--bubble-line-height)));
            scale: 0;
            box-shadow: none;
            clip-path: none;
        }
    }

    @keyframes orb-fast {
        0% {
            transform-origin: left;
            scale: 0;
            transform: translateX(0);
            box-shadow: none;
            clip-path: none;
        }

        20% {
            scale: 1;
            transform: translateX(0);
            box-shadow: calc(-1 * var(--bubble-line-height)) 0 var(--bubble-line-height) calc(var(--bubble-line-height) / 4) var(--bubble-line-progress-orb-trail-color);
            clip-path: polygon(0 5%, 100% 0, 100% 100%, 0 95%, calc(-2.5 * var(--bubble-line-height)) 50%);
        }

        100% {
            transform: translateX(calc(1.5 * var(--progress-width) + 2.5 * var(--bubble-line-height)));
            box-shadow: calc(-1 * var(--bubble-line-height)) 0 var(--bubble-line-height) calc(var(--bubble-line-height) / 4) var(--bubble-line-progress-orb-trail-color);
            clip-path: polygon(0 5%, 100% 0, 100% 100%, 0 95%, calc(-2.5 * var(--bubble-line-height)) 50%);
        }
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
    - name: source
      label: ✨Source entity
      selector:
        entity: {}
    - name: invert
      label: Invert progress (bar decreases as progress completes)
      default: false
      selector:
        boolean: null
    - type: expandable
      title: Below text
      name: below_text
      schema:
        - name: text
          label: Text template
          selector:
            text: null
        - name: placeholders
          label: "Placeholders - format lines like pct: sensor.clean_progress"
          selector:
            object: {}
        - name: condition
          label: Condition to show text (see docs for additional condition configuration)
          selector:
            condition: {}
    - type: expandable
      title: Above text
      name: above_text
      schema:
        - name: text
          label: Text template
          selector:
            text: null
        - name: placeholders
          label: "Placeholders - format lines like pct: sensor.clean_progress"
          selector:
            object: {}
        - name: condition
          label: Condition to show text (see docs for additional condition configuration)
          selector:
            condition: {}
    - type: expandable
      title: Progress Style
      name: progress_style
      schema:
        - name: interpolate
          label: Interpolate the colours
          default: true
          selector:
            boolean: null
        - name: height
          label: Height of the progress bar, in pixels
          selector:
            number:
              min: 1
              max: 50
              step: 1
              unit_of_measurement: px
        - type: expandable
          name: orb_settings
          label: Orb Settings
          schema:
            - name: show_orb
              default: true
              label: Show progress orb animation
              selector:
                boolean: null
            - name: slow_orb
              default: false
              label: Use slow orb animation
              selector:
                boolean: null
            - name: orb_color
              label: ✨Color of progress orb
              selector:
                ui_color: null
            - name: trail_color
              label: ✨Color of progress orb trail
              selector:
                ui_color: null
            - name: condition
              label: Show the orb under these conditions
              selector:
                condition: {}
        - type: expandable
          name: shine_settings
          label: Shine Settings
          schema:
            - name: show_shine
              label: Show shine animation
              default: false
              selector:
                boolean: null
            - name: shine_color
              label: ✨Shine color
              selector:
                ui_color: null
            - name: shine_width
              label: Shine width, in pixels. Defaults to half current progress width
              selector:
                number:
                  min: 1
                  step: 1
                  unit_of_measurement: px
            - name: shine_angle
              label: Shine angle, in degrees
              default: 0
              selector:
                number:
                  unit_of_measurement: deg
            - name: shine_delay
              label: Shine delay, in seconds
              default: 0
              selector:
                number:
                  min: 0
                  unit_of_measurement: s
        - type: expandable
          name: outline
          label: Outline Settings
          schema:
            - name: style
              label: Outline CSS style
              selector:
                select:
                  options:
                    - none
                    - dotted
                    - dashed
                    - solid
                    - double
                    - groove
                    - ridge
                    - inset
                    - outset
            - name: color
              label: ✨Outline color
              selector:
                ui_color: null
            - name: width
              label: Outline width, in pixels
              selector:
                number:
                  min: 1
                  step: 1
                  unit_of_measurement: px
        - type: expandable
          name: color_stops
          label: Progress colors - add more in YAML
          schema:
            - type: expandable
              label: Color 1
              name: "0"
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
                      unit_of_measurement: "%"
            - type: expandable
              label: Color 2
              name: "1"
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
                      unit_of_measurement: "%"
        - type: expandable
          name: color_stops
          label: Background Progress colors - add more in YAML
          schema:
            - type: expandable
              label: Color 1
              name: "0"
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
                      unit_of_measurement: "%"
            - type: expandable
              label: Color 2
              name: "1"
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
                      unit_of_measurement: "%"
```

</details>

---

### Screenshot:

**ADD SCREENSHOTS HERE**
