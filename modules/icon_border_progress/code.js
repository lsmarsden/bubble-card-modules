import { checkAllConditions } from "../helpers/entity/condition.js";
import { resolveColor, resolveColorFromStops } from "../helpers/ui/color.js";
import { applyEffects } from "../helpers/ui/effects.js";
import { toArray } from "../helpers/utils/arrays.js";
import { resolveConfig } from "../helpers/utils/config.js";
import { createProgressBorder, removeProgressBorder } from "../helpers/ui/progressBorder.js";
import { calculateProgressValue } from "../helpers/entity/progress.js";
import { manageTimerUpdater } from "../helpers/ui/timerUpdater.js";

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
      hasBackgroundColor: backColor !== undefined && backColor !== null,
    };
  }

  function applyProgressStyling(element, progressValue, progressColor, colors, buttonConfig) {
    // Only set background if one was configured
    // This allows us to pass-through colours that Bubble Card sets automatically
    // e.g. colours based on the light entity
    if (colors.hasBackgroundColor) {
      element.style.background = `${colors.backgroundColor}`;
    }
    element.style.position = "relative"; // Ensure element can contain absolutely positioned SVG

    createProgressBorder(element, progressValue, progressColor, colors.remainingProgressColor, {
      strokeWidth: 3,
      animationDuration: 800,
      borderRadiusOverride: buttonConfig?.border_radius,
      offsetPercent: buttonConfig?.offset_percent || 0,
    });
  }

  function updateProgressDisplay(progressSource, buttonConfig, buttonElement) {
    const progressValue = calculateProgressValue(progressSource, buttonConfig);
    const inverted = buttonConfig?.invert || false;
    const adjustedProgress = inverted ? 100 - progressValue : progressValue;
    const colorStops = buttonConfig.color_stops || [];
    const progressColor = resolveColorFromStops(adjustedProgress, colorStops, buttonConfig.interpolate_colors);
    const colors = resolveColorConfigs(buttonConfig);

    applyProgressStyling(buttonElement, adjustedProgress, progressColor, colors, buttonConfig);
  }

  // group button configs by button name
  function groupByButton(configArray) {
    return configArray.reduce((groups, buttonConfig) => {
      const button = buttonConfig.button;
      if (!button) return groups;

      if (!groups.has(button)) {
        groups.set(button, []);
      }
      groups.get(button).push(buttonConfig);
      return groups;
    }, new Map());
  }

  // Main processing loop
  groupByButton(toArray(config)).forEach((buttonConfigs, button) => {
    const selector = getElementSelector(button);
    const buttonElement = card.querySelector(selector);
    if (!buttonElement) return;

    storeOriginalBackground(buttonElement);

    // Find the first configuration with matching conditions
    const matchingConfig = buttonConfigs.find((config) => checkAllConditions(config.condition));

    if (!matchingConfig) {
      // No matching conditions found, cleanup styling
      cleanupProgressStyling(buttonElement);
      const updateIntervalId = buttonElement.dataset.progress_update_interval;
      if (updateIntervalId) {
        buttonElement.removeAttribute("data-progress_update_interval");
        clearInterval(Number(updateIntervalId));
      }
      return;
    }

    const progressSource = resolveConfig([
      {
        config: matchingConfig,
        path: "source",
      },
      {
        config: matchingConfig,
        path: "entity",
        metadata: { deprecated: true, replacedWith: "source" },
      },
    ]);

    manageTimerUpdater(buttonElement, progressSource, () => {
      updateProgressDisplay(progressSource, matchingConfig, buttonElement);
    });
    updateProgressDisplay(progressSource, matchingConfig, buttonElement);
    applyEffects(buttonElement, matchingConfig.effects || []);
  });
}
