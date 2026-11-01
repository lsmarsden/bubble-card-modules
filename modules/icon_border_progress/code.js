import { checkAllConditions } from "../helpers/entity/condition.js";
import { resolveColor, resolveColorFromStops } from "../helpers/ui/color.js";
import { applyEffects } from "../helpers/ui/effects.js";
import { toArray } from "../helpers/utils/arrays.js";
import { resolveConfig } from "../helpers/utils/config.js";
import { createProgressBorder, getEffectiveDimensions, removeProgressBorder } from "../helpers/ui/progressBorder.js";
import { detectElementShape } from "../helpers/ui/borderRadiusDetection.js";
import { showProgress, stopProgress } from "../helpers/entity/progress.js";
import { writeIfChanged } from "../helpers/utils/gate.js";

export function icon_border_progress(card, hass) {
  // this allows IDEs to parse the file normally - will be removed automatically during build.
  const { icon_border_progress: config } = this.config;
  // Shared by Progress reading and the gates: everything is read on every pass, only unchanged writes are skipped.
  const ctx = {
    host: this,
    module: "icon_border_progress",
    onTeardown: typeof onTeardown === "function" ? onTeardown : undefined,
    hasChanged: typeof hasChanged === "function" ? hasChanged : undefined,
  };

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

  // What a button's progress styling leaves in the DOM, so the gate notices when something else removed it.
  function ownedProgressStyling(element, ownsBackground) {
    return [
      element.querySelector(".stroke-dash-aligned-svg") !== null,
      ownsBackground ? element.style.background : "",
      element.style.position,
    ];
  }

  function renderProgress(percent, buttonConfig, buttonElement, button) {
    const colorStops = buttonConfig.color_stops || [];
    const progressColor = resolveColorFromStops(percent, colorStops, buttonConfig.interpolate_colors);
    const colors = resolveColorConfigs(buttonConfig);
    const dimensions = getEffectiveDimensions(buttonElement);
    const shape = detectElementShape(buttonElement, dimensions, buttonConfig.border_radius);

    writeIfChanged(
      ctx,
      button,
      [
        "progress",
        percent,
        progressColor,
        colors.remainingProgressColor,
        colors.backgroundColor,
        colors.hasBackgroundColor,
        buttonConfig.offset_percent,
        dimensions.width,
        dimensions.height,
        shape.isCircular,
        shape.borderRadius,
      ],
      () => ownedProgressStyling(buttonElement, colors.hasBackgroundColor),
      () => applyProgressStyling(buttonElement, percent, progressColor, colors, buttonConfig),
    );
  }

  function renderEffects(buttonElement, button, effects) {
    const active = Object.values(effects).map((eff) => (eff.effect ? checkAllConditions(eff.condition) : null));
    writeIfChanged(
      ctx,
      `${button}/effects`,
      [JSON.stringify(effects), active],
      () => [buttonElement.className],
      () => applyEffects(buttonElement, effects),
    );
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
      stopProgress(ctx, buttonElement);
      writeIfChanged(
        ctx,
        button,
        ["none"],
        () => ownedProgressStyling(buttonElement, true),
        () => cleanupProgressStyling(buttonElement),
      );
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

    const progressOptions = {
      source: progressSource,
      start: matchingConfig.start,
      end: matchingConfig.end,
      invert: matchingConfig.invert,
    };
    // Called on every pass, gated or not: it hands an active timer's ticker this pass's config and hass.
    showProgress(ctx, buttonElement, progressOptions, (percent) =>
      renderProgress(percent, matchingConfig, buttonElement, button),
    );
    renderEffects(buttonElement, button, matchingConfig.effects || []);
  });
}
