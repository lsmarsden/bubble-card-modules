import { checkAllConditions } from "../helpers/condition.js";
import { resolveColor, resolveColorFromStops } from "../helpers/color.js";
import { applyEffects } from "../helpers/effects.js";
import { getState } from "../helpers/hass.js";
import { toArray } from "../helpers/arrays.js";
import { resolveConfig } from "../helpers/config.js";
import { createProgressBorder, removeProgressBorder } from "../helpers/progressBorder.js";

export function icon_border_progress(card, hass) {
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
}
