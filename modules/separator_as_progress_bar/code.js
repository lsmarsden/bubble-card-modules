import { checkAllConditions } from "../helpers/entity/condition.js";
import { renderTextTemplate, suffix } from "../helpers/utils/strings.js";
import { resolveColor, resolveColorFromStops } from "../helpers/ui/color.js";
import { showProgress, stopProgress } from "../helpers/entity/progress.js";
import { writeIfChanged } from "../helpers/utils/gate.js";

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

  // Shared by Progress reading and the gates: everything is read on every pass, only unchanged writes are skipped.
  const ctx = {
    host: this,
    module: "separator_as_progress_bar",
    onTeardown: typeof onTeardown === "function" ? onTeardown : undefined,
    hasChanged: typeof hasChanged === "function" ? hasChanged : undefined,
  };

  const progressVars = ["--progress-width", "--bubble-line-progress-color", "--bubble-line-progress-background-color"];
  const ownedProgress = () => progressVars.map((name) => element.style.getPropertyValue(name));
  const has = (parent, selector) => parent.querySelector(selector) !== null;
  // What the bar's layout leaves in the DOM, so the gate notices when something else removed it.
  const ownedLayout = () => [
    element.className,
    element.style.getPropertyValue("--bubble-line-progress-outline"),
    wrapper.style.getPropertyValue("--bubble-line-height"),
    has(element, ".bubble-line-progress-tip"),
    has(element, ".bubble-line-progress-bar"),
    has(element, ".bubble-line-progress-shine"),
    has(element, ".bubble-line-progress-orb"),
    has(wrapper, ".bubble-line-text.above-text"),
    has(wrapper, ".bubble-line-text.below-text"),
  ];

  if (!checkAllConditions(config.condition)) {
    // Clean up progress bar elements when overall condition is false
    stopProgress(ctx, element);
    writeIfChanged(
      ctx,
      "layout",
      ["hidden"],
      () => [...ownedLayout(), ...ownedProgress()],
      () => {
        element.classList.remove("bubble-line-progress");
        element.style.removeProperty("--progress-width");
        element.style.removeProperty("--bubble-line-progress-color");
        element.style.removeProperty("--bubble-line-progress-background-color");
        element.style.removeProperty("--bubble-line-progress-outline");
        wrapper.style.removeProperty("--bubble-line-height");
      },
    );
    return;
  }

  function cleanupElement(parent, selector) {
    const existingElement = parent.querySelector(selector);
    if (existingElement) {
      existingElement.remove();
    }
  }

  if (!config.progress_style) {
    stopProgress(ctx, element);
    return;
  }
  const progressStyle = config.progress_style;
  const interpolate = progressStyle.interpolate ?? true;

  // Read every input before gating: entities through hass (which registers the card's dependency on them), the
  // theme's border radius, conditions and text.
  const bubbleBorderRadius = getComputedStyle(element).getPropertyValue("--bubble-icon-border-radius");
  const hasBorderRadius = Boolean(bubbleBorderRadius && bubbleBorderRadius.trim() !== "");

  const shineSettings = progressStyle.shine_settings;
  const showShine = Boolean(
    shineSettings && (shineSettings.show_shine ?? false) && checkAllConditions(shineSettings.condition),
  );
  const shineColor = showShine ? resolveColor(shineSettings.shine_color, "rgba(255,255,255,0.4)") : undefined;

  const orbSettings = progressStyle.orb_settings;
  const showOrb = Boolean(orbSettings && (orbSettings.show_orb ?? false) && checkAllConditions(orbSettings.condition));
  const orbColor = showOrb ? resolveColor(orbSettings.orb_color) : undefined;
  const orbTrailColor = showOrb ? resolveColor(orbSettings.trail_color) : undefined;

  const outlineSettings = progressStyle.outline;
  const outline = outlineSettings
    ? `${outlineSettings.style ?? ""} ${suffix(outlineSettings.width, "px")} ${resolveColor(outlineSettings.color)}`
    : "none";

  // undefined: no text configured; null: its condition doesn't hold; otherwise the text to show.
  const readText = (textConfig) => {
    if (!textConfig) return undefined;
    return checkAllConditions(textConfig.condition) ? renderTextTemplate(textConfig) : null;
  };
  const textInput = (text) => (text === undefined ? "none" : text === null ? "hidden" : `text:${text}`);
  const belowText = readText(config.below_text);
  const aboveText = readText(config.above_text);

  function drawLayout() {
    if (hasBorderRadius) {
      element.classList.add("has-bubble-border-radius");
    } else {
      element.classList.remove("has-bubble-border-radius");
    }

    if (!element.querySelector(".bubble-line-progress-tip")) {
      const tipGlowElement = document.createElement("div");
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

    if (showShine) {
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

    if (showOrb) {
      const slowOrb = orbSettings.slow_orb ?? false;

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

    element.style.setProperty("--bubble-line-progress-outline", outline);

    drawText(belowText, "below-text");
    drawText(aboveText, "above-text");
  }

  function drawText(text, textClass) {
    if (text === undefined) return;
    if (text === null) {
      cleanupElement(wrapper, `.bubble-line-text.${textClass}`);
      return;
    }

    let textEl = wrapper.querySelector(`.bubble-line-text.${textClass}`);
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
    textEl.innerText = text;
  }

  writeIfChanged(
    ctx,
    "layout",
    [
      "shown",
      JSON.stringify(progressStyle),
      hasBorderRadius,
      showShine,
      shineColor,
      showOrb,
      orbColor,
      orbTrailColor,
      outline,
      textInput(belowText),
      textInput(aboveText),
    ],
    ownedLayout,
    drawLayout,
  );

  function renderProgress(percent) {
    const progressColor = resolveColorFromStops(percent, progressStyle.color_stops, interpolate);
    const backgroundColor = resolveColorFromStops(percent, progressStyle.background_color_stops, interpolate);

    writeIfChanged(ctx, "progress", [percent, progressColor, backgroundColor], ownedProgress, () => {
      const width = `${percent}cqw`;
      if (element.style.getPropertyValue("--progress-width") === "") {
        // First paint: start from zero and set the width once the element is painted, so it grows in rather than
        // transitioning from full width. Later updates (including timer ticks) set the width directly.
        element.style.setProperty("--progress-width", "0cqw");
        requestAnimationFrame(() => element.style.setProperty("--progress-width", width));
      } else {
        element.style.setProperty("--progress-width", width);
      }
      element.style.setProperty("--bubble-line-progress-color", progressColor);
      element.style.setProperty("--bubble-line-progress-background-color", backgroundColor);
    });
  }

  const progressOptions = {
    source: config.source,
    start: config.start,
    end: config.end,
    override: config.override,
    invert: config.invert,
  };
  // Called on every pass, gated or not: it hands an active timer's ticker this pass's config and hass.
  showProgress(ctx, element, progressOptions, renderProgress);
}
