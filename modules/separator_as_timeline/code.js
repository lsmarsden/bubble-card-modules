import { resolveColor } from "../helpers/color";
import { resolveConfig } from "../helpers/config";
import { suffix } from "../helpers/strings";
import { getState } from "../helpers/hass";
import { timeToPercent, parseTimeString, formatTime } from "../helpers/timeUtils";

export function separator_as_timeline(card, hass) {
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
      icon_active_color: "var(--primary-color)",
    },
    time_format: {
      global_settings: {
        use_24_hour: true,
        append_suffix: false,
        pad_hours: true,
        show_minutes: true,
      },
    },
    marker_color: "var(--accent-color)",
    rounded_edges: false,
  };

  const getConfig = (key) => config[key] ?? defaults[key];

  // 2. ===== Helpers (using timeUtils helper) =====
  const getTimeFormatProperty = (overrideSection, property) =>
    resolveConfig(
      [
        {
          config: config?.time_format,
          path: `${overrideSection}.${property}`,
          condition: (value, cfg) => cfg[overrideSection]?.override === true,
        },
        {
          config: config?.time_format?.global_settings,
          path: property,
        },
        {
          config: config?.time_format,
          path: property,
          metadata: {
            deprecated: true,
            replacedWith: `time_format.global_settings.${property}`,
          },
        },
      ],
      defaults.time_format.global_settings[property],
    );

  const formattedTime = (h, m, section) => {
    const options = {
      use_24_hour: getTimeFormatProperty(section, "use_24_hour"),
      append_suffix: getTimeFormatProperty(section, "append_suffix"),
      pad_hours: getTimeFormatProperty(section, "pad_hours"),
      show_minutes: getTimeFormatProperty(section, "show_minutes"),
    };

    return formatTime(h, m, options);
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
  wrapper.querySelectorAll(".timeline-segment, .timeline-icon").forEach((e) => e.remove());

  // 4. ===== Render Segments =====
  const ranges = Array.isArray(config.ranges) ? config.ranges : Object.values(config.ranges || {});
  const now = new Date();
  const currentPct = timeToPercent(now.getHours(), now.getMinutes());
  const pad = (n) => String(n).padStart(2, "0");
  for (const r of ranges) {
    const group = `group-${r.label?.replace(/\s+/g, "-")}`;

    // Get start time (from entity if provided, otherwise from direct value)
    let startTimeValue;
    if (r.start_entity) {
      //TODO - replace with a single start field.
      // this will be a breaking change, so we need to
      // implement auto-migration first
      startTimeValue = getState(
        {
          entity: r.start_entity,
          attribute: r.start_attribute,
        },
        false,
      );
    } else {
      startTimeValue = r.start;
    }

    // Get end time (from entity if provided, otherwise from direct value)
    let endTimeValue;
    if (r.end_entity) {
      endTimeValue = getState(
        {
          entity: r.end_entity,
          attribute: r.end_attribute,
        },
        false,
      );
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
        ? [{ left: startPct, width: endPct - startPct }]
        : [
            { left: startPct, width: 100 - startPct },
            { left: 0, width: endPct },
          ];

    let isActive = false;

    segments.forEach(({ left, width }) => {
      const seg = document.createElement("div");
      seg.className = `timeline-segment ${group}`;
      seg.style.left = `${left}%`;
      seg.style.width = `${width}%`;
      seg.style.background = resolveColor(r.color);
      seg.dataset.tooltip = `${r.label ? r.label + ": " : ""}${formattedTime(startH, startM, "tooltip")} → ${formattedTime(endH, endM, "tooltip")}`;
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
        wrapper.querySelectorAll(`.${group}`).forEach((e) => e.classList.add("highlighted"));
        showTooltip(seg);
      });
      seg.addEventListener("mouseleave", () => {
        wrapper.querySelectorAll(`.${group}`).forEach((e) => e.classList.remove("highlighted"));
        hideTooltip();
      });

      if (currentPct >= left && currentPct <= left + width) {
        isActive = true;
      }

      const getIconConfig = (key) =>
        resolveConfig(
          [
            // check override first, then deprecated override, then default, then deprecated default
            { config: r.icon_settings, path: key },
            {
              config: r,
              path: key,
              metadata: {
                deprecated: true,
                replacedWith: `icon_settings.${key}`,
              },
            },
            { config: config.icon_settings, path: key },
            {
              config: config,
              path: key,
              metadata: {
                deprecated: true,
                replacedWith: `icon_settings.${key}`,
              },
            },
          ],
          defaults.icon_settings[key],
        );

      if (r.icon) {
        const iconEl = document.createElement("ha-icon");

        iconEl.setAttribute("icon", r.icon);
        iconEl.className = `timeline-icon ${group}`;
        iconEl.style.left = `${left + width / 2}%`;
        iconEl.style.color = resolveColor(getIconConfig("icon_color"));
        iconEl.style.border = `1px solid ${resolveColor(getIconConfig("icon_outline_color"))}`;
        iconEl.style.background = resolveColor(getIconConfig("icon_background_color"));
        // TODO invalid values cause this to blow up, so we need it to default if icon size is not a px
        // value
        iconEl.style.setProperty("--icon-size", suffix(getIconConfig("icon_size"), "px"));
        iconEl.style.setProperty("--mdc-icon-size", suffix(getIconConfig("icon_image_size"), "px"));

        wrapper.style.setProperty(
          `--icon-${group}-active-color`,
          `${resolveColor(getIconConfig("icon_active_color"))}`,
        );

        wrapper.appendChild(iconEl);

        iconEl.addEventListener("mouseenter", () => {
          wrapper.querySelectorAll(`.${group}`).forEach((e) => e.classList.add("highlighted"));
          showTooltip(seg);
        });
        iconEl.addEventListener("mouseleave", () => {
          wrapper.querySelectorAll(`.${group}`).forEach((e) => e.classList.remove("highlighted"));
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
  if (getConfig("show_time_ticks") && !wrapper.querySelector(".timeline-tick")) {
    [0, 6, 12, 18, 24].forEach((h) => {
      const tick = document.createElement("div");
      tick.className = "timeline-tick";
      tick.style.left = `${(h / 24) * 100}%`;
      tick.innerText = `${formattedTime(h % 24, 0, "timeline")}`;
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
    wrapper.style.setProperty("--marker-color", resolveColor(getConfig("marker_color")));
  }
}
