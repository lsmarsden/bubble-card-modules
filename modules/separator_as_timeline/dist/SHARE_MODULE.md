# Separator as Timeline

**Version:** 1.3.0  
**Creator:** lsmarsden

> [!IMPORTANT]
>
> ### Supported cards:
>
> - separator

![preview.png](assets/preview.png)

<div><h2>Separator as Timeline</h2>
  <p>
    Transform any separator into a visual time-aware timeline.
    This module displays time blocks along the bar using flexible ranges, icons, labels, active indicators, and more.
    Use it for schedules, quiet hours, cleaning periods, charging windows - anything time-related.
  </p>

  <p>
    For full documentation including configuration, examples, and more, visit the <a
          href="https://github.com/lsmarsden/bubble-card-modules/tree/main/modules/separator_as_timeline"
          target="_blank">GitHub repo</a>.
  </p>
</div>

---

<details>

<summary><b>🧩 Get this Module</b></summary>

<br>

> To use this module, simply copy and paste the following configuration into your `/www/bubble/bubble-modules.yaml` file.

```yaml
separator_as_timeline:
  name: Separator as Timeline
  version: v1.3.0
  creator: lsmarsden
  link: https://github.com/lsmarsden/bubble-card-modules/tree/main/separator_as_timeline
  supported:
    - separator
  description: |-
    <div><h2>Separator as Timeline</h2>
      <p>
        Transform any separator into a visual time-aware timeline.
        This module displays time blocks along the bar using flexible ranges, icons, labels, active indicators, and more.
        Use it for schedules, quiet hours, cleaning periods, charging windows - anything time-related.
      </p>

      <p>
        For full documentation including configuration, examples, and more, visit the <a
              href="https://github.com/lsmarsden/bubble-card-modules/tree/main/modules/separator_as_timeline"
              target="_blank">GitHub repo</a>.
      </p>
    </div>
  code: |-
    ${(() => {
    /**
     * ======== IMPORTED HELPER FUNCTIONS =========
     */

    function processColor(color) {
      if (!color) return null;
      if (["#", "rgb", "hsl"].some((prefix) => color.startsWith(prefix))) {
        return color;
      }
      return `var(--${color}-color)`;
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
                        (metadata.message ? ` ${metadata.message}` : "")
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

    function suffix(str, suffix) {
        str = String(str);
        return str.endsWith(suffix) ? str : str + suffix;
    }

    /**
     * ======== MAIN MODULE CODE =========
     */


        const config = this.config.separator_as_timeline;
        if (!config) return;

        const element = card.querySelector(".bubble-line");
        if (!element) return;

        // 1. ===== Config Defaults =====
        const defaults = {
            show_time_ticks: true,
            show_current_time: true,
            icon_settings: {
                icon_background_color: "var(--bubble-icon-background-color)",
                icon_color: "var(--primary-text-color)",
                icon_outline_color: "var(--card-background-color)",
                icon_size: "18px",
                icon_image_size: "16px",
                highlight_active: true,
                icon_active_color: "var(--primary-color)"
            },
            time_format: {
                global_settings: {
                    use_24_hour: true,
                    append_suffix: false,
                    pad_hours: true,
                    show_minutes: true
                }
            },
            marker_color: "var(--accent-color)",
            rounded_edges: false
        };

        const getConfig = (key) => config[key] ?? defaults[key];

        // 2. ===== Helpers =====
        const timeToPercent = (h, m) => ((h * 60 + m) / 1440) * 100;

        const parseTimeString = (str) => {
            if (!str) return [0, 0];
            try {
                // Handle ISO format: 2025-04-23T10:12:23+00:00
                if (str.includes("T")) {
                    const date = new Date(str);
                    if (!isNaN(date)) {
                        return [date.getHours(), date.getMinutes()];
                    }
                }

                // Handle HH:MM format
                if (str.includes(":")) {
                    const [h, m] = str.split(":").map(Number);
                    return [h || 0, m || 0];
                }

                // Handle numeric time formats (minutes since midnight)
                if (!isNaN(str)) {
                    const totalMinutes = parseInt(str);
                    return [Math.floor(totalMinutes / 60), totalMinutes % 60];
                }

                return [0, 0];
            } catch {
                return [0, 0];
            }
        };

        const getTimeFormatProperty = (overrideSection, property) => resolveConfig([
            {
                config: config?.time_format,
                path: `${overrideSection}.${property}`,
                condition: (value, cfg) => cfg[overrideSection]?.override === true,
            }, {
                config: config?.time_format?.global_settings,
                path: property
            }, {
                config: config?.time_format,
                path: property,
                metadata: {deprecated: true, replacedWith: `time_format.global_settings.${property}`}
            }
        ], defaults.time_format.global_settings[property]);

        const formatTime = (h, m, section) => {

            const use_24_hour = getTimeFormatProperty(section, "use_24_hour");
            const append_suffix = getTimeFormatProperty(section, "append_suffix");
            const pad_hours = getTimeFormatProperty(section, "pad_hours");
            const show_minutes = getTimeFormatProperty(section, "show_minutes");

            let hour = h;
            const suffix = hour >= 12 ? "PM" : "AM";

            if (!use_24_hour) {
                hour = hour % 12;
                if (hour === 0) hour = 12;
            }

            let hourStr = pad_hours ? pad(hour) : hour;

            return `${hourStr}${show_minutes ? ":" + pad(m) : ""}${append_suffix ? suffix : ""}`;
        };

        const getState = (entityId, attribute) => {
            if (!entityId || !hass.states[entityId]) {
                return undefined;
            }
            const statesObj = hass.states[entityId];
            return attribute ? statesObj.attributes[attribute] : statesObj.state;
        };

        // 3. ===== Init wrapper =====
        let wrapper = element.closest(".bubble-line-wrapper");
        if (!wrapper) {
            wrapper = document.createElement("div");
            wrapper.className = "bubble-line-wrapper";
            wrapper.style.height = getComputedStyle(element).height;
            element.classList.add("wrapped");
            element.parentNode.insertBefore(wrapper, element);
            wrapper.appendChild(element);
        }

        // Tooltip init (only one)
        let tooltip = wrapper.querySelector(".timeline-tooltip");
        if (!tooltip) {
            tooltip = document.createElement("div");
            tooltip.className = "timeline-tooltip";
            wrapper.appendChild(tooltip);
        }

        const showTooltip = (el) => {
            tooltip.innerText = el.dataset.tooltip;
            tooltip.style.opacity = "1";
        };

        const hideTooltip = () => {
            tooltip.style.opacity = "0";
        };

        // Clear old segments
        wrapper
            .querySelectorAll(".timeline-segment, .timeline-icon")
            .forEach((e) => e.remove());

        // 4. ===== Render Segments =====
        const ranges = Array.isArray(config.ranges)
            ? config.ranges
            : Object.values(config.ranges || {});
        const now = new Date();
        const currentPct = timeToPercent(now.getHours(), now.getMinutes());
        const pad = (n) => String(n).padStart(2, "0");
        for (const r of ranges) {
            const group = `group-${r.label?.replace(/\s+/g, "-")}`;

            // Get start time (from entity if provided, otherwise from direct value)
            let startTimeValue;
            if (r.start_entity) {
                startTimeValue = getState(r.start_entity, r.start_attribute);
            } else {
                startTimeValue = r.start;
            }

            // Get end time (from entity if provided, otherwise from direct value)
            let endTimeValue;
            if (r.end_entity) {
                endTimeValue = getState(r.end_entity, r.end_attribute);
            } else {
                endTimeValue = r.end;
            }

            const [startH, startM] = parseTimeString(startTimeValue);
            const [endH, endM] = parseTimeString(endTimeValue);

            const startPct = timeToPercent(startH, startM);
            const endPct = timeToPercent(endH, endM);

            // Handle wrap-around time ranges (e.g. 22:00–06:00)
            const segments =
                startPct < endPct
                    ? [{left: startPct, width: endPct - startPct}]
                    : [
                        {left: startPct, width: 100 - startPct},
                        {left: 0, width: endPct},
                    ];

            let isActive = false;

            segments.forEach(({left, width}) => {
                const seg = document.createElement("div");
                seg.className = `timeline-segment ${group}`;
                seg.style.left = `${left}%`;
                seg.style.width = `${width}%`;
                seg.style.background = processColor(r.color) || "var(--primary-color)";
                seg.dataset.tooltip = `${r.label ? r.label + ": " : ""}${formatTime(startH, startM, "tooltip")} → ${formatTime(endH, endM, "tooltip")}`;
                if (r.source_entities) {
                    seg.dataset.tooltip += `\nSources: ${r.source_entities}`;
                }

                const isRounded = getConfig("rounded_edges");
                if (isRounded) {
                    const leftEdge = Math.round(left) === 0;
                    const rightEdge = Math.round(left + width) === 100;

                    seg.style.borderTopLeftRadius = leftEdge ? "0" : "4px";
                    seg.style.borderBottomLeftRadius = leftEdge ? "0" : "4px";
                    seg.style.borderTopRightRadius = rightEdge ? "0" : "4px";
                    seg.style.borderBottomRightRadius = rightEdge ? "0" : "4px";
                } else {
                    seg.style.borderRadius = "0";
                }
                wrapper.appendChild(seg);

                seg.addEventListener("mouseenter", () => {
                    wrapper
                        .querySelectorAll(`.${group}`)
                        .forEach((e) => e.classList.add("highlighted"));
                    showTooltip(seg);
                });
                seg.addEventListener("mouseleave", () => {
                    wrapper
                        .querySelectorAll(`.${group}`)
                        .forEach((e) => e.classList.remove("highlighted"));
                    hideTooltip();
                });

                if (currentPct >= left && currentPct <= left + width) {
                    isActive = true;
                }

                const getIconConfig = (key) => resolveConfig([
                        // check override first, then deprecated override, then default, then deprecated default
                        {config: r.icon_settings, path: key},
                        {config: r, path: key, metadata: {deprecated: true, replacedWith: `icon_settings.${key}`}},
                        {config: config.icon_settings, path: key},
                        {config: config, path: key, metadata: {deprecated: true, replacedWith: `icon_settings.${key}`}},
                    ],
                    defaults.icon_settings[key]
                );


                if (r.icon) {
                    const iconEl = document.createElement("ha-icon");

                    iconEl.setAttribute("icon", r.icon);
                    iconEl.className = `timeline-icon ${group}`;
                    iconEl.style.left = `${left + width / 2}%`;
                    iconEl.style.color = processColor(getIconConfig("icon_color"));
                    iconEl.style.border = `1px solid ${processColor(getIconConfig("icon_outline_color"))}`;
                    iconEl.style.background = processColor(getIconConfig("icon_background_color"));
                    // TODO invalid values cause this to blow up, so we need it to default if icon size is not a px
                    // value
                    iconEl.style.setProperty("--icon-size", suffix(getIconConfig("icon_size"), "px"));
                    iconEl.style.setProperty("--mdc-icon-size", suffix(getIconConfig("icon_image_size"), "px"));

                    wrapper.style.setProperty(
                        `--icon-${group}-active-color`,
                        `${processColor(getIconConfig("icon_active_color"))}`,
                    );


                    wrapper.appendChild(iconEl);

                    iconEl.addEventListener("mouseenter", () => {
                        wrapper
                            .querySelectorAll(`.${group}`)
                            .forEach((e) => e.classList.add("highlighted"));
                        showTooltip(seg);
                    });
                    iconEl.addEventListener("mouseleave", () => {
                        wrapper
                            .querySelectorAll(`.${group}`)
                            .forEach((e) => e.classList.remove("highlighted"));
                        hideTooltip();
                    });
                }
            });

            // Apply glow to icons if active
            if (getConfig("highlight_active") && isActive) {
                wrapper.querySelectorAll(`.timeline-icon.${group}`).forEach((e) => {
                    e.style.filter = `drop-shadow(0 0 5px var(--icon-${group}-active-color))`;
                });
            } else {
                wrapper.querySelectorAll(`.timeline-icon.${group}`).forEach((e) => {
                    e.style.filter = "";
                });
            }
        }

        // 5. ===== Time Ticks =====
        if (
            getConfig("show_time_ticks") &&
            !wrapper.querySelector(".timeline-tick")
        ) {
            [0, 6, 12, 18, 24].forEach((h) => {
                const tick = document.createElement("div");
                tick.className = "timeline-tick";
                tick.style.left = `${(h / 24) * 100}%`;
                tick.innerText = `${formatTime(h % 24, 0, "timeline")}`;
                wrapper.appendChild(tick);
            });
        }

        // 6. ===== Current Time Marker =====
        if (getConfig("show_current_time")) {
            let marker = wrapper.querySelector(".timeline-marker");
            if (!marker) {
                marker = document.createElement("div");
                marker.className = "timeline-marker";
                wrapper.appendChild(marker);
            }
            wrapper.style.setProperty("--timeline-marker-left", `${currentPct}%`);
            wrapper.style.setProperty(
                "--marker-color",
                processColor(getConfig("marker_color")),
            );
        }
    })()}

    .bubble-line {
        width: 100%;
        container-type: size;
    }

    .bubble-name {
        overflow: visible !important;
    }

    .bubble-line-wrapper {
        position: relative;
        background-color: var(--bubble-line-background-color, #444);
        margin: 0 12px;
        width: 100cqw;
    }

    .timeline-container {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
    }

    .timeline-segment {
        position: absolute;
        height: 100%;
        background: linear-gradient(to right, var(--accent-color), var(--primary-color));
        opacity: 0.6;
        transition: opacity 0.2s ease;
        cursor: pointer;
        top: 0;
    }

    .timeline-icon {
        pointer-events: auto;
        width: var(--icon-size, 18px);
        height: var(--icon-size, 18px);
        border-radius: 50%;
        background: var(--card-background-color);
        box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        position: absolute;
        transform: translateX(-50%);
        top: -26px;
        transition: filter 0.3s ease;
        border: 1px solid var(--icon-border-color, var(--primary-color))
    }

    .timeline-icon.active {
        filter: drop-shadow(0 0 5px var(--icon-active-color));
    }

    .highlighted {
        filter: brightness(1.15);
        box-shadow: 0 0 8px white;
        opacity: 1;
        z-index: 1;
    }

    .timeline-tooltip {
        position: absolute;
        top: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary-background-color);
        color: var(--primary-text-color);
        padding: 2px 6px;
        font-size: 11px;
        border-radius: 4px;
        white-space: nowrap;
        box-shadow: 0 0 4px white;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        z-index: 3 !important;
    }

    .timeline-tick {
        position: absolute;
        bottom: -18px;
        transform: translateX(-50%);
        font-size: 10px;
        font-weight: bold;
        color: var(--secondary-text-color);
        pointer-events: none;
    }

    .timeline-tick::before {
        content: "";
        position: absolute;
        bottom: 90%;
        left: 50%;
        transform: translateX(-50%);
        height: 6px;
        width: 1px;
        background-color: var(--secondary-text-color);
        opacity: 0.6;
    }

    .timeline-marker {
        position: absolute;
        top: -8px;
        left: calc(var(--timeline-marker-left) - 6px);
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid var(--marker-color, var(--primary-color));
    }
  editor:
    - type: expandable
      title: Timeline settings
      icon: mdi:timeline-text
      schema:
        - name: show_time_ticks
          label: Show time ticks on the timeline.
          default: true
          selector:
            boolean: null
        - name: rounded_edges
          label: Round edges of segments. Midnight edges will stay flat for display.
          default: false
          selector:
            boolean: null
        - name: show_current_time
          label: Show current time marker on the timeline.
          default: true
          selector:
            boolean: null
        - name: marker_color
          label: Color of the current time marker.
          selector:
            ui_color: null
    - type: expandable
      title: Time Format
      icon: mdi:clock
      name: time_format
      schema:
        - type: grid
          name: global_settings
          schema:
            - name: use_24_hour
              label: Use 24-hour time
              default: true
              selector:
                boolean: null
            - name: append_suffix
              label: Show AM/PM
              default: false
              selector:
                boolean: null
            - name: pad_hours
              label: Pad hours (5:00/05:00)
              default: true
              selector:
                boolean: null
            - name: show_minutes
              label: Show minutes (5PM/5:00PM)
              default: true
              selector:
                boolean: null
        - type: expandable
          title: Timeline Override (Optional)
          icon: mdi:clock
          name: timeline
          schema:
            - name: override
              label: Apply below options to timeline.
              default: false
              selector:
                boolean: null
            - type: grid
              schema:
                - name: use_24_hour
                  label: Use 24-hour time
                  default: true
                  selector:
                    boolean: null
                - name: append_suffix
                  label: Show AM/PM
                  default: false
                  selector:
                    boolean: null
                - name: pad_hours
                  label: Pad hours (5:00/05:00)
                  default: true
                  selector:
                    boolean: null
                - name: show_minutes
                  label: Show minutes (5PM/5:00PM)
                  default: true
                  selector:
                    boolean: null
        - type: expandable
          title: Tooltip Override (Optional)
          icon: mdi:clock
          name: tooltip
          schema:
            - name: override
              label: Apply below options to tooltip.
              default: false
              selector:
                boolean: null
            - type: grid
              schema:
                - name: use_24_hour
                  label: Use 24-hour time
                  default: true
                  selector:
                    boolean: null
                - name: append_suffix
                  label: Show AM/PM
                  default: false
                  selector:
                    boolean: null
                - name: pad_hours
                  label: Pad hours (5:00/05:00)
                  default: true
                  selector:
                    boolean: null
                - name: show_minutes
                  label: Show minutes (5PM/5:00PM)
                  default: true
                  selector:
                    boolean: null
    - type: expandable
      title: Global icon settings
      icon: mdi:palette
      name: icon_settings
      schema:
        - name: icon_size
          label: Icon total size in pixels. Overridable per icon.
          selector:
            number:
              min: 1
              step: 1
              unit_of_measurement: px
        - name: icon_image_size
          label: Icon image size in pixels. Max value is current icon_size. Overridable per icon.
          selector:
            number:
              min: 1
              step: 1
              unit_of_measurement: px
        - name: icon_color
          label: Icon color. Overridable per icon.
          selector:
            ui_color: null
        - name: icon_background_color
          label: Icon background color. Overridable per icon.
          selector:
            ui_color: null
        - name: icon_outline_color
          label: Icon outline color. Overridable per icon.
          selector:
            ui_color: null
        - name: highlight_active
          title: Highlight active period
          label: Highlight the current active period.
          default: true
          selector:
            boolean: null
        - name: icon_active_color
          label: Icon active period color. Overridable per icon.
          selector:
            ui_color: null
    - type: expandable
      title: Time Ranges - define additional in YAML
      icon: mdi:chart-gantt
      name: ranges
      schema:
        - type: expandable
          title: Time Range 1
          name: '0'
          schema:
            - name: start_entity
              label: Start Time Entity
              description: Entity whose state will be used as the start time (e.g. sensor.sun_next_dawn)
              selector:
                entity: null
            - name: start_attribute
              label: Start Time Attribute (optional)
              description: Attribute to use instead of state
              selector:
                attribute: {}
            - name: start
              label: Fixed start time (ignored if entity is set)
              selector:
                time:
                  no_second: true
            - name: end_entity
              label: End Time Entity
              description: Entity whose state will be used as the end time
              selector:
                entity: null
            - name: end_attribute
              label: End Time Attribute (optional)
              description: Attribute to use instead of state
              selector:
                attribute: {}
            - name: end
              label: Fixed end time (ignored if entity is set)
              selector:
                time:
                  no_second: true
            - name: label
              label: Label
              selector:
                text: null
            - name: color
              label: Timeline color
              selector:
                ui_color: null
            - name: icon
              label: Icon
              selector:
                icon: null
            - type: expandable
              title: Icon settings
              icon: mdi:palette
              name: icon_settings
              schema:
                - name: icon_size
                  label: Icon total size in pixels.
                  selector:
                    number:
                      min: 1
                      step: 1
                      unit_of_measurement: px
                - name: icon_image_size
                  label: Icon image size in pixels. Max value is current icon_size.
                  selector:
                    number:
                      min: 1
                      step: 1
                      unit_of_measurement: px
                - name: icon_color
                  label: Icon color.
                  selector:
                    ui_color: null
                - name: icon_background_color
                  label: Icon background color.
                  selector:
                    ui_color: null
                - name: icon_outline_color
                  label: Icon outline color.
                  selector:
                    ui_color: null
                - name: icon_active_color
                  label: Icon active period color.
                  selector:
                    ui_color: null
            - name: source_entities
              label: Source entities (for tooltip)
              description: Optional information to show in tooltip
              selector:
                text: null
        - type: expandable
          title: Time Range 2
          name: '1'
          schema:
            - name: start_entity
              label: Start Time Entity
              description: Entity whose state will be used as the start time (e.g. sensor.sun_next_dawn)
              selector:
                entity: null
            - name: start_attribute
              label: Start Time Attribute (optional)
              description: Attribute to use instead of state
              selector:
                attribute: {}
            - name: start
              label: Fixed start time (ignored if entity is set)
              selector:
                time:
                  no_second: true
            - name: end_entity
              label: End Time Entity
              description: Entity whose state will be used as the end time
              selector:
                entity: null
            - name: end_attribute
              label: End Time Attribute (optional)
              description: Attribute to use instead of state
              selector:
                attribute: {}
            - name: end
              label: Fixed end time (ignored if entity is set)
              selector:
                time:
                  no_second: true
            - name: label
              label: Label
              selector:
                text: null
            - name: color
              label: Timeline color
              selector:
                ui_color: null
            - name: icon
              label: Icon
              selector:
                icon: null
            - type: expandable
              title: Icon settings
              icon: mdi:palette
              name: icon_settings
              schema:
                - name: icon_size
                  label: Icon total size in pixels.
                  selector:
                    number:
                      min: 1
                      step: 1
                      unit_of_measurement: px
                - name: icon_image_size
                  label: Icon image size in pixels. Max value is current icon_size.
                  selector:
                    number:
                      min: 1
                      step: 1
                      unit_of_measurement: px
                - name: icon_color
                  label: Icon color.
                  selector:
                    ui_color: null
                - name: icon_background_color
                  label: Icon background color.
                  selector:
                    ui_color: null
                - name: icon_outline_color
                  label: Icon outline color.
                  selector:
                    ui_color: null
                - name: icon_active_color
                  label: Icon active period color.
                  selector:
                    ui_color: null
            - name: source_entities
              label: Source entities (for tooltip)
              description: Optional information to show in tooltip
              selector:
                text: null
        - type: expandable
          title: Time Range 3
          name: '2'
          schema:
            - name: start_entity
              label: Start Time Entity
              description: Entity whose state will be used as the start time (e.g. sensor.sun_next_dawn)
              selector:
                entity: null
            - name: start_attribute
              label: Start Time Attribute (optional)
              description: Attribute to use instead of state
              selector:
                attribute: {}
            - name: start
              label: Fixed start time (ignored if entity is set)
              selector:
                time:
                  no_second: true
            - name: end_entity
              label: End Time Entity
              description: Entity whose state will be used as the end time
              selector:
                entity: null
            - name: end_attribute
              label: End Time Attribute (optional)
              description: Attribute to use instead of state
              selector:
                attribute: {}
            - name: end
              label: Fixed end time (ignored if entity is set)
              selector:
                time:
                  no_second: true
            - name: label
              label: Label
              selector:
                text: null
            - name: color
              label: Timeline color
              selector:
                ui_color: null
            - name: icon
              label: Icon
              selector:
                icon: null
            - type: expandable
              title: Icon settings
              icon: mdi:palette
              name: icon_settings
              schema:
                - name: icon_size
                  label: Icon total size in pixels. Default 18px.
                  selector:
                    number:
                      min: 1
                      step: 1
                      unit_of_measurement: px
                - name: icon_image_size
                  label: Icon image size in pixels. Max is icon_size. Default 16px.
                  selector:
                    number:
                      min: 1
                      step: 1
                      unit_of_measurement: px
                - name: icon_color
                  label: Icon color.
                  selector:
                    ui_color: null
                - name: icon_background_color
                  label: Icon background color.
                  selector:
                    ui_color: null
                - name: icon_outline_color
                  label: Icon outline color.
                  selector:
                    ui_color: null
                - name: icon_active_color
                  label: Icon active period color.
                  selector:
                    ui_color: null
            - name: source_entities
              label: Source entities (for tooltip)
              description: Optional information to show in tooltip
              selector:
                text: null
```

</details>

---

### Screenshot:

**ADD SCREENSHOTS HERE**
