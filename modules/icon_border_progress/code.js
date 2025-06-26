import { checkAllConditions } from "../helpers/condition.js";
import { resolveColor, resolveColorFromStops } from "../helpers/color.js";
import { applyEffects } from "../helpers/effects.js";
import { getState } from "../helpers/hass.js";
import { toArray } from "../helpers/arrays.js";
import { resolveConfig } from "../helpers/config.js";

export function icon_border_progress(card, hass) {
  // this allows IDEs to parse the file normally - will be removed automatically during build.
  const { icon_border_progress: config } = this.config;

  // Helper function to get element selector based on button type
  function getElementSelector(button) {
    if (button === "main-button" || button === "main") {
      return ".bubble-icon-container";
    } else {
      return `.bubble-${button}`;
    }
  }

  // Helper function to store original background if not already stored
  function storeOriginalBackground(element) {
    if (element.dataset.originalBackground === undefined) {
      element.dataset.originalBackground = element.style.background || "";
    }
  }

  // Helper function to clean up progress styling and restore original background
  function cleanupProgressStyling(element) {
    element.classList.remove("progress-border", "has-bubble-border-radius");
    element.style.background = element.dataset.originalBackground;
    element.style.removeProperty("--custom-background-color");
    element.style.removeProperty("--progress");
    element.style.removeProperty("--orb-angle");
    element.style.removeProperty("--progress-color");
    element.style.removeProperty("--remaining-progress-color");
  }

  // Helper function to calculate progress value with bounds checking
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

  // Helper function to resolve color configurations with deprecated fallbacks
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

  // Helper function to handle border radius styling
  function handleBorderRadius(element) {
    const bubbleBorderRadius = getComputedStyle(element).getPropertyValue("--bubble-icon-border-radius");
    if (bubbleBorderRadius && bubbleBorderRadius.trim() !== "") {
      element.classList.add("has-bubble-border-radius");
    } else {
      element.classList.remove("has-bubble-border-radius");
    }
  }

  // Helper function to apply progress styling to element
  function applyProgressStyling(element, progressValue, progressColor, colors) {
    handleBorderRadius(element);

    element.style.background = `${colors.backgroundColor}`;
    element.classList.add("progress-border");
    element.style.setProperty("--custom-background-color", `${colors.backgroundColor}`);
    element.style.setProperty("--progress", `${progressValue}%`);
    element.style.setProperty("--orb-angle", `${(progressValue / 100) * 360}deg`);
    element.style.setProperty("--progress-color", `${progressColor}`);
    element.style.setProperty("--remaining-progress-color", `${colors.remainingProgressColor}`);
  }

  // Main processing loop
  toArray(config).forEach((buttonConfig) => {
    const button = buttonConfig.button;
    if (!button) return;

    const selector = getElementSelector(button);
    const element = card.querySelector(selector);
    if (!element) return;

    // Store original background if not already stored
    storeOriginalBackground(element);

    // Only apply styling if conditions are met
    if (!checkAllConditions(buttonConfig.condition)) {
      // Clean up only when condition is false
      cleanupProgressStyling(element);
      return;
    }

    // Resolve progress source with deprecated fallback
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

    // Calculate progress value and colors
    const progressValue = calculateProgressValue(progressSource, buttonConfig);
    const colorStops = buttonConfig.color_stops || [];
    const progressColor = resolveColorFromStops(progressValue, colorStops, buttonConfig.interpolate_colors);
    const colors = resolveColorConfigs(buttonConfig);

    // Apply progress styling
    applyProgressStyling(element, progressValue, progressColor, colors);
    applyEffects(element, buttonConfig.effects || []);
  });
}
