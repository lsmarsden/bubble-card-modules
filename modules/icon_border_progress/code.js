import { checkAllConditions } from "../helpers/condition.js";
import { resolveColor, resolveColorFromStops } from "../helpers/color.js";
import { applyEffects } from "../helpers/effects.js";
import { getState } from "../helpers/hass.js";
import { toArray } from "../helpers/arrays.js";
import { resolveConfig } from "../helpers/config.js";

export function icon_border_progress(card, hass) {
  // this allows IDEs to parse the file normally - will be removed automatically during build.
  const { icon_border_progress: config } = this.config;
  toArray(config).forEach((buttonConfig) => {
    const button = buttonConfig.button;
    if (!button) return;

    let selector;
    if (button === "main-button" || button === "main") {
      selector = ".bubble-icon-container";
    } else {
      selector = `.bubble-${button}`;
    }

    const element = card.querySelector(selector);
    if (!element) return;

    // Always clean up previous state first
    element.classList.remove("progress-border", "has-bubble-border-radius");
    element.style.background = "";
    element.style.removeProperty("--custom-background-color");
    element.style.removeProperty("--progress");
    element.style.removeProperty("--orb-angle");
    element.style.removeProperty("--progress-color");
    element.style.removeProperty("--remaining-progress-color");

    // Only apply styling if conditions are met
    if (!checkAllConditions(buttonConfig.condition)) {
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

    progressValue = ((progressValue - startValue) / (endValue - startValue)) * 100;
    const colorStops = buttonConfig.color_stops || [];
    const progressColor = resolveColorFromStops(progressValue, colorStops, buttonConfig.interpolate_colors);

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
    const remainingProgressColor = resolveColor(remainingColor, "var(--dark-grey-color)");
    const backgroundColor = resolveColor(backColor, "var(--bubble-icon-background-color)");

    const bubbleBorderRadius = getComputedStyle(element).getPropertyValue("--bubble-icon-border-radius");
    if (bubbleBorderRadius && bubbleBorderRadius.trim() !== "") {
      element.classList.add("has-bubble-border-radius");
    } else {
      element.classList.remove("has-bubble-border-radius");
    }

    element.style.background = `${backgroundColor}`;
    element.classList.add("progress-border");
    element.style.setProperty("--custom-background-color", `${backgroundColor}`);
    element.style.setProperty("--progress", `${progressValue}%`);
    element.style.setProperty("--orb-angle", `${(progressValue / 100) * 360}deg`);
    element.style.setProperty("--progress-color", `${progressColor}`);
    element.style.setProperty("--remaining-progress-color", `${remainingProgressColor}`);
    applyEffects(element, buttonConfig.effects || []);
  });
}
