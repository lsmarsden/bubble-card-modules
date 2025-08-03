import { toArray } from "../helpers/utils/arrays.js";

export function sub_button_wheel(card, hass) {
  // this allows IDEs to parse the file normally - will be removed automatically during build.
  const { sub_button_wheel: config } = this.config;

  function moveButtonsToWheel(wheelOpenerButton, layout = "even-circle") {
    const wheelButtonsConfig = toArray(config.wheel_buttons);
    if (!wheelButtonsConfig || wheelButtonsConfig.length === 0) {
      console.warn("No wheel buttons configured, skipping wheel setup");
      return;
    }

    const wheelMenu = document.createElement("div");
    wheelMenu.className = "wheel-menu";

    const overlay = document.createElement("div");
    overlay.className = "wheel-overlay";

    // 1. Add glass ring first (behind everything)
    const glassRing = document.createElement("div");
    glassRing.className = "glass-ring";
    wheelMenu.appendChild(glassRing);

    const orderedButtonConfigs = processButtonPositions([...wheelButtonsConfig]);
    // assume 36px as there are no variables in buttons until reported otherwise
    const buttonSize = 36;
    const wheelButtons = [];

    orderedButtonConfigs.forEach((buttonConfig) => {
      const button = card.querySelector(getElementSelector(buttonConfig.sub_button));
      if (!button) {
        console.warn(`Sub-button ${buttonConfig.sub_button} not found, skipping`);
        return;
      }

      button.classList.add("wheel-button");
      wheelMenu.appendChild(button);
      wheelButtons.push(button);
    });

    wheelMenu.style.width = `${buttonSize}px`;
    wheelOpenerButton.replaceWith(wheelMenu);
    wheelMenu.before(overlay);
    wheelMenu.appendChild(wheelOpenerButton);

    // Apply layout positioning directly to buttons
    const layoutManager = new WheelLayoutManager(buttonSize, config);
    const glassRingRadius = layoutManager.applyLayout(layout, orderedButtonConfigs, wheelButtons);

    // Set glass ring size based on calculated radius
    const glassRingDiameter = glassRingRadius * 2;
    glassRing.style.width = `${glassRingDiameter}px`;
    glassRing.style.height = `${glassRingDiameter}px`;

    const animationManager = new WheelAnimationManager(config);
    animationManager.applyAnimation(orderedButtonConfigs, wheelButtons);
    const animationOptions = animationManager.getAnimationOptions();
    glassRing.style.transitionDelay = `${animationOptions.delay}s`;
    glassRing.style.transitionDuration = `${animationOptions.duration}s`;

    function toggle() {
      wheelMenu.classList.toggle("active");
      glassRing.classList.toggle("active");
      overlay.classList.toggle("active");
    }
    wheelOpenerButton.onclick = (event) => {
      event.stopPropagation();
      toggle();
    };
    overlay.onclick = (event) => {
      event.stopPropagation();
      if (wheelMenu.classList.contains("active")) {
        toggle();
      }
    };
  }

  class WheelLayoutManager {
    constructor(buttonSize = 36, config = {}) {
      this.buttonSize = buttonSize;
      this.config = config;
    }

    calculateCirclePosition(index, total, radius, startAngle = -90) {
      const angle = (index * 360) / total + startAngle;
      const x = Math.cos((angle * Math.PI) / 180) * radius;
      const y = Math.sin((angle * Math.PI) / 180) * radius;
      return { x: Math.round(x), y: Math.round(y) };
    }

    getLayoutRadius(layout) {
      switch (layout) {
        case "even-circle":
        case "smart-adaptive":
        case "fixed-position":
          return this.buttonSize * 0.8 + 25;

        case "double-ring":
          return this.buttonSize * 0.8 + 65; // outer ring radius

        case "progressive-arc":
        case "compact-arc":
          return 1.6 * this.buttonSize;
        default:
          return this.buttonSize * 0.8 + 25;
      }
    }

    calculateGlassRingRadius(layoutRadius) {
      // Glass ring is always layout radius + 25px (for visual separation)
      return layoutRadius + 25;
    }

    applyLayout(layout, buttonConfigs, buttonElements) {
      // Get the layout radius first
      const layoutRadius = this.getLayoutRadius(layout);

      // Apply layout using the calculated radius
      switch (layout) {
        case "even-circle":
          this.applyEvenCircleLayout(buttonConfigs, buttonElements, layoutRadius);
          break;
        case "progressive-arc":
          this.applyCircularArcLayout(buttonConfigs, buttonElements, 2.0, layoutRadius);
          break;
        case "compact-arc":
          this.applyCircularArcLayout(buttonConfigs, buttonElements, 1.0, layoutRadius);
          break;
        case "fixed-position":
          this.applyFixedPositionLayout(buttonConfigs, buttonElements, layoutRadius);
          break;
        case "double-ring":
          this.applyDoubleRingLayout(buttonConfigs, buttonElements, layoutRadius);
          break;
        case "smart-adaptive":
          this.applySmartAdaptiveLayout(buttonConfigs, buttonElements, layoutRadius);
          break;
        default:
          this.applyEvenCircleLayout(buttonConfigs, buttonElements, layoutRadius);
          break;
      }

      // Return the calculated glass ring radius
      return this.calculateGlassRingRadius(layoutRadius);
    }

    applyEvenCircleLayout(buttonConfigs, buttonElements, radius) {
      const buttonCount = buttonElements.length;

      buttonElements.forEach((button, index) => {
        const { x, y } = this.calculateCirclePosition(index, buttonCount, radius);
        // For overlay buttons, we need to add the offset to the base center positioning
        button.style.transform = `translate(${x}px, ${y}px)`;
      });
    }

    applyCircularArcLayout(buttonConfigs, buttonElements, arcSpacingRatio, radius) {
      // Maximum 7 buttons supported (1 at top + 3 on each side)
      const maxButtons = 7;

      buttonElements.slice(0, maxButtons).forEach((button, index) => {
        let angle, x, y;

        if (index === 0) {
          // First button always goes at the top (-90°)
          angle = -90;
        } else {
          // Calculate arc span based on button count and spacing ratio
          // More buttons = wider arc, spacing ratio affects overall spread
          const buttonCount = Math.min(buttonElements.length, maxButtons);
          const maxArcSpan = 120 * arcSpacingRatio; // Maximum arc span in degrees
          const arcSpan = Math.min(maxArcSpan, (buttonCount - 1) * 20 * arcSpacingRatio);

          // Calculate angular increment between buttons (excluding the first top button)
          const angularIncrement = arcSpan / (buttonCount - 1);

          // Alternate buttons left and right of center
          const sideIndex = Math.floor((index - 1) / 2) + 1; // 1, 2, 3...
          const isRight = (index - 1) % 2 === 0; // Even indices go right, odd go left

          angle = -90 + (isRight ? 1 : -1) * sideIndex * angularIncrement;
        }

        // Convert angle to x, y coordinates on the circle
        x = Math.cos((angle * Math.PI) / 180) * radius;
        y = Math.sin((angle * Math.PI) / 180) * radius;

        // Apply position directly to button
        button.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      });

      // Warn if more buttons than supported
      if (buttonElements.length > maxButtons) {
        console.warn(
          `Circular arc layout supports maximum ${maxButtons} buttons, ${buttonElements.length - maxButtons} buttons will be hidden`,
        );
      }
    }

    applyFixedPositionLayout(buttonConfigs, buttonElements, radius) {
      // Uses standard 8-button positions regardless of actual button count
      const totalPositions = 8; // Fixed 8-position template

      buttonElements.forEach((button, index) => {
        // Use index directly as position in 8-button layout
        const { x, y } = this.calculateCirclePosition(index, totalPositions, radius);
        button.style.transform = `translate(${x}px, ${y}px)`;
      });
    }

    applyFixedPositionToRing(buttonElements, radius) {
      // Helper method for applying fixed-position layout to a specific ring
      const totalPositions = 8;
      buttonElements.forEach((button, index) => {
        const { x, y } = this.calculateCirclePosition(index, totalPositions, radius);
        button.style.transform = `translate(${x}px, ${y}px)`;
      });
    }

    applyDoubleRingLayout(buttonConfigs, buttonElements, outerRadius) {
      // Get inner button count from config, default to 4
      const innerButtonCount = this.config?.layout_options?.double_ring_inner_count || 4;

      // Calculate inner radius as outer radius minus button size (for spacing between rings)
      const innerRadius = outerRadius - this.buttonSize;

      // Split buttons into inner and outer rings
      const innerButtons = buttonElements.slice(0, innerButtonCount);
      const outerButtons = buttonElements.slice(innerButtonCount);

      // Apply fixed-position layout to each ring
      this.applyFixedPositionToRing(innerButtons, innerRadius);
      this.applyFixedPositionToRing(outerButtons, outerRadius);
    }

    applySmartAdaptiveLayout(buttonConfigs, buttonElements, radius) {
      const buttonCount = buttonElements.length;

      if (buttonCount <= 3) {
        this.applyFixedPositionLayout(buttonConfigs, buttonElements, radius);
      } else {
        // 4+ buttons: circle distribution - use even-circle logic
        this.applyEvenCircleLayout(buttonConfigs, buttonElements, radius);
      }
    }
  }

  class WheelAnimationManager {
    constructor(config) {
      this.config = config;
    }

    // Get animation options from config with defaults
    getAnimationOptions() {
      return {
        animation: this.config.animation_options?.wheel_animation || "staggered-scale",
        duration: this.config.animation_options?.animation_duration || 0.2,
        delay: this.config.animation_options?.animation_delay || 0.1,
      };
    }

    applyAnimation(buttonConfigs, buttonElements) {
      const animationOptions = this.getAnimationOptions();

      switch (animationOptions.animation) {
        case "staggered-scale":
          this.applyStaggeredScaleAnimation(buttonConfigs, buttonElements, animationOptions);
          break;
        case "instant":
        default:
          this.applyInstantAnimation(buttonConfigs, buttonElements);
      }
    }

    applyStaggeredScaleAnimation(buttonConfigs, buttonElements, animationOptions) {
      const delayIncrement = animationOptions.duration / buttonElements.length;

      buttonElements.forEach((button, index) => {
        button.style.transition = `all ${animationOptions.duration}s cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
        button.style.transitionDelay = `${animationOptions.delay + index * delayIncrement}s`;
      });
    }

    applyInstantAnimation(buttonConfigs, buttonElements) {
      buttonElements.forEach((button, index) => {
        // Clear any existing transitions
        button.style.transition = "";
        button.style.transitionDelay = "";
      });
    }
  }

  function processButtonPositions(wheelButtonsConfig) {
    // First, collect explicitly positioned buttons
    const explicitPositions = new Set();
    const explicitButtons = [];
    const unpositionedButtons = [];

    wheelButtonsConfig.forEach((buttonConfig) => {
      if (buttonConfig.position !== undefined) {
        explicitPositions.add(buttonConfig.position);
        explicitButtons.push(buttonConfig);
      } else {
        unpositionedButtons.push(buttonConfig);
      }
    });

    // Find available positions for unpositioned buttons
    const totalButtons = wheelButtonsConfig.length;
    const availablePositions = [];
    for (let i = 1; i <= totalButtons; i++) {
      if (!explicitPositions.has(i)) {
        availablePositions.push(i);
      }
    }

    // Assign positions to unpositioned buttons in config order
    unpositionedButtons.forEach((buttonConfig, index) => {
      if (index < availablePositions.length) {
        buttonConfig.position = availablePositions[index];
      }
    });

    // Combine and sort by position
    const allButtons = [...explicitButtons, ...unpositionedButtons];
    return allButtons.sort((a, b) => a.position - b.position);
  }

  function getElementSelector(button) {
    if (button === "main-button" || button === "main") {
      return ".bubble-icon-container";
    } else {
      return typeof button === "string" && button.startsWith("sub-button-")
        ? `.bubble-${button}`
        : `.bubble-sub-button-${button}`;
    }
  }

  const wheelOpener = config.wheel_opener;
  if (!wheelOpener) {
    return;
  }
  const wheelOpenerButton = card.querySelector(getElementSelector(wheelOpener));

  if (!wheelOpenerButton || wheelOpenerButton.classList.contains("wheel-open-button")) {
    return;
  }

  wheelOpenerButton.classList.add("wheel-open-button");
  const layout = config.layout_options?.wheel_layout || "even-circle";

  moveButtonsToWheel(wheelOpenerButton, layout);
}
