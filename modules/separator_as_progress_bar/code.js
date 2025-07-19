import { checkAllConditions } from "../helpers/entity/condition.js";
import { renderTextTemplate, suffix } from "../helpers/utils/strings.js";
import { resolveColor, resolveColorFromStops } from "../helpers/ui/color.js";
import { getState } from "../helpers/entity/hass.js";

export function separator_as_progress_bar(card, hass) {
  // this allows IDEs to parse the file normally - will be removed automatically during build.
  const config = this.config.separator_as_progress_bar;
  const element = card.querySelector(".bubble-line");
  if (!config || !element) return;
  let wrapper = card.querySelector(".bubble-line-wrapper");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.className = "bubble-line-wrapper";
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
  }

  if (!checkAllConditions(config.condition)) {
    // Clean up progress bar elements when overall condition is false
    element.classList.remove("bubble-line-progress");
    element.style.removeProperty("--progress-width");
    element.style.removeProperty("--bubble-line-progress-color");
    element.style.removeProperty("--bubble-line-progress-background-color");
    element.style.removeProperty("--bubble-line-progress-outline");
    wrapper.style.removeProperty("--bubble-line-height");
    return;
  }

  function cleanupElement(parent, selector) {
    const existingElement = parent.querySelector(selector);
    if (existingElement) {
      existingElement.remove();
    }
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
  const colorStops = progressStyle.color_stops;
  const progressColor = resolveColorFromStops(progressValue, colorStops, interpolate);

  const backgroundColorStops = progressStyle.background_color_stops;
  const backgroundProgressColor = resolveColorFromStops(progressValue, backgroundColorStops, interpolate);

  const bubbleBorderRadius = getComputedStyle(element).getPropertyValue("--bubble-icon-border-radius");
  if (bubbleBorderRadius && bubbleBorderRadius.trim() !== "") {
    element.classList.add("has-bubble-border-radius");
  } else {
    element.classList.remove("has-bubble-border-radius");
  }

  let tipGlowElement = element.querySelector(".bubble-line-progress-tip");
  if (!tipGlowElement) {
    tipGlowElement = document.createElement("div");
    tipGlowElement.className = "bubble-line-progress-tip";
    element.appendChild(tipGlowElement);
  }

  let progressBarElement = element.querySelector(".bubble-line-progress-bar");
  if (!progressBarElement) {
    progressBarElement = document.createElement("div");
    progressBarElement.className = "bubble-line-progress-bar";
    element.appendChild(progressBarElement);
  }

  element.classList.add("bubble-line-progress");
  wrapper.style.setProperty("--bubble-line-height", suffix(progressStyle.height ?? "6", "px"));

  // Delay setting the progress width until the element is visible and painted.
  // This allows the initial width to transition from zero when loading the page, otherwise it transitions from full width for some reason.
  // Still happens when switching views via tabs though.
  element.style.setProperty("--progress-width", "0cqw");
  requestAnimationFrame(() => {
    element.style.setProperty("--progress-width", `${config.invert ? 100 - progressValue : progressValue}cqw`);
  });
  element.style.setProperty("--bubble-line-progress-color", progressColor);
  element.style.setProperty("--bubble-line-progress-background-color", backgroundProgressColor);

  const shineSettings = progressStyle.shine_settings;
  if (shineSettings && (shineSettings.show_shine ?? false) && checkAllConditions(shineSettings.condition)) {
    const shineColor = resolveColor(shineSettings.shine_color, "rgba(255,255,255,0.4)");
    const shineWidth = shineSettings.shine_width;
    const shineDelay = shineSettings.shine_delay;
    const shineAngle = shineSettings.shine_angle;

    if (!element.querySelector(".bubble-line-progress-shine")) {
      const shineElement = document.createElement("div");
      shineElement.className = "bubble-line-progress-shine";
      progressBarElement.appendChild(shineElement);
      shineElement.style.setProperty("--bubble-line-progress-shine-color", shineColor);
      shineElement.style.setProperty(
        "--bubble-line-progress-shine-width",
        shineWidth ? suffix(shineWidth, "px") : "calc(var(--progress-width) / 2)",
      );
      shineElement.style.setProperty(
        "--bubble-line-progress-shine-angle",
        shineAngle ? suffix(shineAngle, "deg") : "0deg",
      );
      shineElement.style.setProperty("animation-delay", `${shineDelay ?? "0"}s`);
    }
  } else {
    cleanupElement(element, ".bubble-line-progress-shine");
  }

  const orbSettings = progressStyle.orb_settings;
  if (orbSettings && (orbSettings.show_orb ?? false) && checkAllConditions(orbSettings.condition)) {
    const slowOrb = orbSettings.slow_orb ?? false;
    const orbColor = resolveColor(orbSettings.orb_color);
    const orbTrailColor = resolveColor(orbSettings.trail_color);

    if (!element.querySelector(".bubble-line-progress-orb")) {
      const orbElement = document.createElement("div");
      orbElement.className = "bubble-line-progress-orb";
      progressBarElement.appendChild(orbElement);
      orbElement.style.setProperty(
        "animation",
        `orb-${slowOrb ? "slow 2s ease-in-out infinite" : "fast 2s linear infinite"}`,
      );
      orbElement.style.setProperty("--bubble-line-progress-orb-color", orbColor);
      orbElement.style.setProperty("--bubble-line-progress-orb-trail-color", orbTrailColor);
    }
  } else {
    cleanupElement(element, ".bubble-line-progress-orb");
  }

  const outlineSettings = progressStyle.outline;
  if (outlineSettings) {
    element.style.setProperty(
      "--bubble-line-progress-outline",
      `${outlineSettings.style ?? ""} ${suffix(outlineSettings.width, "px")} ${resolveColor(outlineSettings.color)}`,
    );
  } else {
    element.style.setProperty("--bubble-line-progress-outline", "none");
  }

  function addTextElement(textConfig, textClass) {
    if (textConfig) {
      let textEl = wrapper.querySelector(`.bubble-line-text.${textClass}`);
      if (!checkAllConditions(textConfig.condition)) {
        cleanupElement(wrapper, `.bubble-line-text.${textClass}`);
        return;
      }

      if (!textEl) {
        textEl = document.createElement("div");
        textEl.className = "bubble-line-text";
        textEl.classList.add(textClass);
        if (textClass === "above-text") {
          wrapper.insertBefore(textEl, element);
        } else {
          wrapper.appendChild(textEl);
        }
      }
      textEl.innerText = renderTextTemplate(textConfig);
    }
  }

  addTextElement(config.below_text, "below-text");
  addTextElement(config.above_text, "above-text");
}
