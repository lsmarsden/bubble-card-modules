export function sub_button_wheel(card, hass) {
  // this allows IDEs to parse the file normally - will be removed automatically during build.
  const { sub_button_wheel: config } = this.config;

  const exampleConfig = {
    wheel_opener: "sub-button-1", // main or sub buttons
    layout_options: {
      wheel_layout: "even-circle", // 'even-circle', 'progressive-arc'
    },
    animation_options: {
      wheel_animation: "staggered-scale", // 'staggered-scale', 'instant'
      animation_delay: 0.5, // seconds
      animation_duration: 1.0, // seconds
    },
    wheel_buttons: [
      // supports up to 8 buttons
      { sub_button: "1", position: 2 },
      { sub_button: "2", position: 3 },
      { sub_button: "3" },
      { sub_button: "4", position: 5 },
      { sub_button: "5" },
    ],
  };

  // Global interaction manager - one per card to coordinate all wheels
  class InteractionManager {
    constructor(card) {
      this.card = card;
      this.wheels = new Map(); // wheelContainer -> wheel state
      this.activeWheel = null;

      // Setup global click handler for outside-click-to-close
      this.setupOutsideClickHandler();
    }

    registerWheel(wheelContainer, showCallback, hideCallback, overlayManager) {
      const wheelState = {
        container: wheelContainer,
        show: showCallback,
        hide: hideCallback,
        isOpen: false,
        overlayManager: overlayManager,
      };

      this.wheels.set(wheelContainer, wheelState);
      this.setupWheelInteractions(wheelState);

      console.log(`Registered wheel for ${wheelContainer.className}, total wheels: ${this.wheels.size}`);
    }

    setupWheelInteractions(wheelState) {
      const { container, overlayManager } = wheelState;

      // Click to toggle - works for both desktop and mobile
      container.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent triggering outside click handler
        this.toggleWheel(container);
      });

      // Also handle clicks on the overlay if it exists
      if (overlayManager) {
        // We'll set up overlay click handling when the overlay is created
      }
    }

    setupOutsideClickHandler() {
      // Close any open wheel when clicking outside
      document.addEventListener(
        "click",
        (e) => {
          if (this.activeWheel) {
            const wheelState = this.wheels.get(this.activeWheel);
            const overlay = wheelState?.overlayManager?.getOverlay();

            // Check if click is outside the overlay or on the central button (to toggle)
            if (overlay && !overlay.contains(e.target) && !this.activeWheel.contains(e.target)) {
              this.closeAllWheels();
            } else if (!overlay && !this.activeWheel.contains(e.target)) {
              this.closeAllWheels();
            }
          }
        },
        { capture: true },
      );
    }

    openWheel(wheelContainer) {
      const wheelState = this.wheels.get(wheelContainer);
      if (!wheelState || wheelState.isOpen) return;

      // Close any currently open wheel
      this.closeAllWheels();

      // Create overlay if overlay manager exists
      if (wheelState.overlayManager) {
        const overlay = wheelState.overlayManager.createOverlay(wheelContainer);
        // Add visual state classes to overlay
        overlay.classList.add("wheel-open");
        // Also keep the wheel-open class on the original button for any existing styling
        wheelContainer.classList.add("wheel-open");
      } else {
        // Fallback for wheels without overlay
        wheelContainer.classList.add("wheel-open");
      }

      // Open the requested wheel
      wheelState.isOpen = true;
      this.activeWheel = wheelContainer;
      wheelState.show();

      console.log(`Opened wheel: ${wheelContainer.className}`);
    }

    closeWheel(wheelContainer) {
      const wheelState = this.wheels.get(wheelContainer);
      if (!wheelState || !wheelState.isOpen) return;

      wheelState.isOpen = false;
      if (this.activeWheel === wheelContainer) {
        this.activeWheel = null;
      }
      wheelState.hide();

      // Remove visual state classes and destroy overlay if it exists
      if (wheelState.overlayManager) {
        const overlay = wheelState.overlayManager.getOverlay();
        if (overlay) {
          overlay.classList.remove("wheel-open");
        }
        wheelContainer.classList.remove("wheel-open");
        wheelState.overlayManager.destroyOverlay();
      } else {
        // Fallback for wheels without overlay
        wheelContainer.classList.remove("wheel-open");
      }

      console.log(`Closed wheel: ${wheelContainer.className}`);
    }

    closeAllWheels() {
      this.wheels.forEach((wheelState, wheelContainer) => {
        if (wheelState.isOpen) {
          this.closeWheel(wheelContainer);
        }
      });
    }

    toggleWheel(wheelContainer) {
      const wheelState = this.wheels.get(wheelContainer);
      if (!wheelState) return;

      if (wheelState.isOpen) {
        this.closeWheel(wheelContainer);
      } else {
        this.openWheel(wheelContainer);
      }
    }

    cleanup() {
      // Clean up global event listeners when card is destroyed
      this.closeAllWheels();
      this.wheels.clear();
    }
  }

  // Get or create interaction manager for this card
  function getInteractionManager(card) {
    if (!card._wheelInteractionManager) {
      card._wheelInteractionManager = new InteractionManager(card);
    }
    return card._wheelInteractionManager;
  }

  let wheelButtonsState = "hidden"; // 'hidden', 'shown'
  let currentWheelButtons = [];
  let currentOverlayManager = null;

  function showButtons() {
    if (wheelButtonsState !== "hidden" || currentWheelButtons.length === 0) return;

    console.log("Showing wheel buttons");
    wheelButtonsState = "shown";

    currentWheelButtons.forEach((button, index) => {
      // Just change scale/opacity - existing transitions handle the animation
      button.style.scale = "1";
      button.style.opacity = "1";
    });
  }

  function hideButtons() {
    if (wheelButtonsState !== "shown" || currentWheelButtons.length === 0) return;

    console.log("Hiding wheel buttons");
    wheelButtonsState = "hidden";

    currentWheelButtons.forEach((button, index) => {
      // Just change scale/opacity - existing transitions handle the animation
      button.style.scale = "0";
      button.style.opacity = "0";
    });
  }

  function moveButtonsToWheel(wheelContainer, layout = "even-circle", animation = "staggered-scale") {
    const wheelButtonsConfig = config.wheel_buttons;
    if (!wheelButtonsConfig || wheelButtonsConfig.length === 0) {
      console.warn("No wheel buttons configured, skipping wheel setup");
      return;
    }

    console.log(`Moving ${wheelButtonsConfig.length} buttons to wheel with layout: ${layout}, animation: ${animation}`);

    // Create overlay manager for this wheel
    const overlayManager = new WheelOverlayManager(card);
    currentOverlayManager = overlayManager;

    const orderedButtonConfigs = processButtonPositions([...wheelButtonsConfig]); // Copy to avoid mutating original
    const buttonSize = 36; // Default wheel button size

    const wheelButtons = [];
    orderedButtonConfigs.forEach((buttonConfig) => {
      const button = card.querySelector(`.bubble-sub-button-${buttonConfig.sub_button}`);
      if (!button) {
        console.warn(`Sub-button ${buttonConfig.sub_button} not found, skipping`);
        return;
      }
      // Don't append to wheelContainer yet - will be handled by overlay
      button.classList.add("in-wheel");
      wheelButtons.push(button);
    });

    // Apply layout positioning directly to buttons
    const layoutManager = new WheelLayoutManager(buttonSize);
    layoutManager.applyLayout(layout, orderedButtonConfigs, wheelButtons);

    // Set default hidden state for all wheel buttons
    wheelButtons.forEach((button) => {
      button.style.scale = "0";
      button.style.opacity = "0";
    });

    const animationManager = new WheelAnimationManager(config);
    animationManager.applyAnimation(orderedButtonConfigs, wheelButtons);

    // Store references for show/hide functionality
    currentWheelButtons = wheelButtons;
    wheelButtonsState = "hidden";

    // Register this wheel with the interaction manager
    const interactionManager = getInteractionManager(card);
    interactionManager.registerWheel(
      wheelContainer,
      () => showButtonsInOverlay(overlayManager, wheelButtons),
      () => hideButtons(),
      overlayManager,
    );

    wheelContainer.classList.add("has-buttons");
  }

  function showButtonsInOverlay(overlayManager, wheelButtons) {
    // Move wheel buttons to overlay and position them relative to center
    const overlay = overlayManager.getOverlay();
    if (overlay) {
      wheelButtons.forEach((button) => {
        overlay.appendChild(button);
        // Buttons will be positioned using CSS custom properties set on overlay
      });
    }

    // Show buttons using existing logic
    showButtons();
  }

  class WheelLayoutManager {
    constructor(buttonSize = 36) {
      this.buttonSize = buttonSize;
    }

    // Shared utility methods
    calculateCirclePosition(index, total, radius, startAngle = -90) {
      const angle = (index * 360) / total + startAngle;
      const x = Math.cos((angle * Math.PI) / 180) * radius;
      const y = Math.sin((angle * Math.PI) / 180) * radius;
      return { x: Math.round(x), y: Math.round(y) };
    }

    getCardinalPositions(radius) {
      return [
        { x: 0, y: -radius }, // Top (0°)
        { x: radius, y: 0 }, // Right (90°)
        { x: 0, y: radius }, // Bottom (180°)
        { x: -radius, y: 0 }, // Left (270°)
      ];
    }

    applyLayout(layout, buttonConfigs, buttonElements) {
      switch (layout) {
        case "even-circle":
          this.applyEvenCircleLayout(buttonConfigs, buttonElements);
          break;
        case "progressive-arc":
          this.applyProgressiveArcLayout(buttonConfigs, buttonElements);
          break;
        case "quadrant-plus":
          this.applyQuadrantPlusLayout(buttonConfigs, buttonElements);
          break;
        case "compact-arc":
          this.applyCompactArcLayout(buttonConfigs, buttonElements);
          break;
        case "double-ring":
          this.applyDoubleRingLayout(buttonConfigs, buttonElements);
          break;
        case "smart-adaptive":
          this.applySmartAdaptiveLayout(buttonConfigs, buttonElements);
          break;
        case "wide-circle":
          this.applyWideCircleLayout(buttonConfigs, buttonElements);
          break;
        default:
          console.warn(`Unknown layout: ${layout}`);
      }
    }

    applyEvenCircleLayout(buttonConfigs, buttonElements) {
      // Simple radius scaling: 80% of button size + 30px padding
      const radius = this.buttonSize * 0.8 + 30;
      const buttonCount = buttonElements.length;

      buttonElements.forEach((button, index) => {
        const { x, y } = this.calculateCirclePosition(index, buttonCount, radius);
        // For overlay buttons, we need to add the offset to the base center positioning
        button.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      });
    }

    applyProgressiveArcLayout(buttonConfigs, buttonElements) {
      // Arc spacing ratio - adjust this to make the arc tighter (0.8) or wider (1.2)
      const arcSpacingRatio = 1.0;

      buttonElements.forEach((button, index) => {
        let x, y;

        if (index === 0) {
          // First button always goes center top
          x = 0;
          y = Math.round(-1.75 * this.buttonSize * arcSpacingRatio);
        } else {
          // Define the arc position ratios for additional buttons
          const arcPositionRatios = [
            { x: 0.875, y: -1.5 }, // Right side
            { x: -0.875, y: -1.5 }, // Left side
            { x: 1.5, y: -0.875 }, // Further right
            { x: -1.5, y: -0.875 }, // Further left
            { x: 1.875, y: -0.25 }, // Far right
            { x: -1.875, y: -0.25 }, // Far left
          ];

          if (index - 1 < arcPositionRatios.length) {
            const ratio = arcPositionRatios[index - 1];
            x = Math.round(ratio.x * this.buttonSize * arcSpacingRatio);
            y = Math.round(ratio.y * this.buttonSize * arcSpacingRatio);
          } else {
            // Fallback for more buttons - extend the arc
            const isRight = index % 2 === 1;
            const level = Math.floor((index - 1) / 2);
            const baseX = 0.875 * this.buttonSize * arcSpacingRatio;
            const baseY = -1.5 * this.buttonSize * arcSpacingRatio;
            const levelSpacingX = 0.625 * this.buttonSize * arcSpacingRatio;
            const levelSpacingY = 0.375 * this.buttonSize * arcSpacingRatio;

            x = Math.round(isRight ? baseX + level * levelSpacingX : -(baseX + level * levelSpacingX));
            y = Math.round(baseY + level * levelSpacingY);
          }
        }

        // Apply position directly to button
        button.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      });
    }

    applyQuadrantPlusLayout(buttonConfigs, buttonElements) {
      // Cardinal directions with consistent radius - relative to button size
      const radius = this.buttonSize * 0.8 + 45;
      const cardinalPositions = this.getCardinalPositions(radius);
      const buttonCount = buttonElements.length;

      // Handle different button counts gracefully
      let positions = [];
      if (buttonCount === 2) {
        // Horizontal line: left and right
        positions = [cardinalPositions[3], cardinalPositions[1]]; // Left, Right
      } else if (buttonCount === 3) {
        // Triangle: top, bottom-left, bottom-right
        positions = [
          cardinalPositions[0], // Top
          { x: -radius * 0.7, y: radius * 0.7 }, // Bottom-left
          { x: radius * 0.7, y: radius * 0.7 }, // Bottom-right
        ];
      } else {
        // 4+ buttons: use cardinal directions, then add intermediate positions
        positions = [...cardinalPositions];

        // Add intermediate positions for 5+ buttons
        if (buttonCount > 4) {
          const intermediateRadius = radius * 0.85;
          for (let i = 4; i < buttonCount; i++) {
            const angle = (i - 4) * 45 - 45; // Start at -45° (top-right diagonal)
            const x = Math.cos((angle * Math.PI) / 180) * intermediateRadius;
            const y = Math.sin((angle * Math.PI) / 180) * intermediateRadius;
            positions.push({ x: Math.round(x), y: Math.round(y) });
          }
        }
      }

      buttonElements.forEach((button, index) => {
        if (index < positions.length) {
          const { x, y } = positions[index];
          button.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        }
      });
    }

    applyCompactArcLayout(buttonConfigs, buttonElements) {
      // Similar to progressive-arc but with tighter spacing - relative to button size
      const arcSpacingRatio = 0.7; // Tighter than progressive-arc (1.0)

      buttonElements.forEach((button, index) => {
        let x, y;

        if (index === 0) {
          // First button always goes center top, closer to center
          x = 0;
          y = Math.round(-1.4 * this.buttonSize * arcSpacingRatio);
        } else {
          // Tighter arc position ratios
          const arcPositionRatios = [
            { x: 0.7, y: -1.2 }, // Right side (closer)
            { x: -0.7, y: -1.2 }, // Left side (closer)
            { x: 1.2, y: -0.7 }, // Further right
            { x: -1.2, y: -0.7 }, // Further left
            { x: 1.5, y: -0.2 }, // Far right
            { x: -1.5, y: -0.2 }, // Far left
          ];

          if (index - 1 < arcPositionRatios.length) {
            const ratio = arcPositionRatios[index - 1];
            x = Math.round(ratio.x * this.buttonSize * arcSpacingRatio);
            y = Math.round(ratio.y * this.buttonSize * arcSpacingRatio);
          } else {
            // Fallback for more buttons - extend the compact arc
            const isRight = index % 2 === 1;
            const level = Math.floor((index - 1) / 2);
            const baseX = 0.7 * this.buttonSize * arcSpacingRatio;
            const baseY = -1.2 * this.buttonSize * arcSpacingRatio;
            const levelSpacingX = 0.5 * this.buttonSize * arcSpacingRatio;
            const levelSpacingY = 0.3 * this.buttonSize * arcSpacingRatio;

            x = Math.round(isRight ? baseX + level * levelSpacingX : -(baseX + level * levelSpacingX));
            y = Math.round(baseY + level * levelSpacingY);
          }
        }

        button.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      });
    }

    applyDoubleRingLayout(buttonConfigs, buttonElements) {
      const buttonCount = buttonElements.length;
      // Inner ring radius - relative to button size
      const innerRadius = this.buttonSize * 0.8 + 35;
      // Outer ring radius - relative to button size
      const outerRadius = this.buttonSize * 0.8 + 65;

      buttonElements.forEach((button, index) => {
        let x, y;

        if (index < 4) {
          // First 4 buttons go in inner ring
          const { x: ix, y: iy } = this.calculateCirclePosition(index, 4, innerRadius);
          x = ix;
          y = iy;
        } else {
          // Remaining buttons go in outer ring
          const outerIndex = index - 4;
          const outerCount = buttonCount - 4;
          const { x: ox, y: oy } = this.calculateCirclePosition(outerIndex, outerCount, outerRadius);
          x = ox;
          y = oy;
        }

        button.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      });
    }

    applySmartAdaptiveLayout(buttonConfigs, buttonElements) {
      const buttonCount = buttonElements.length;

      if (buttonCount === 2) {
        // Horizontal line - relative to button size
        const spacing = this.buttonSize * 0.8 + 40;
        const positions = [
          { x: -spacing, y: 0 }, // Left
          { x: spacing, y: 0 }, // Right
        ];

        buttonElements.forEach((button, index) => {
          const { x, y } = positions[index];
          button.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        });
      } else if (buttonCount === 3) {
        // Triangle formation - relative to button size
        const radius = this.buttonSize * 0.8 + 40;
        const positions = [
          { x: 0, y: -radius }, // Top
          { x: -radius * 0.866, y: radius * 0.5 }, // Bottom-left (60° apart)
          { x: radius * 0.866, y: radius * 0.5 }, // Bottom-right
        ];

        buttonElements.forEach((button, index) => {
          const { x, y } = positions[index];
          button.style.transform = `translate(calc(-50% + ${Math.round(x)}px), calc(-50% + ${Math.round(y)}px))`;
        });
      } else if (buttonCount === 4) {
        // Plus/cross pattern - reuse quadrant-plus logic
        this.applyQuadrantPlusLayout(buttonConfigs, buttonElements);
      } else {
        // 5+ buttons: circle distribution - reuse even-circle logic
        this.applyEvenCircleLayout(buttonConfigs, buttonElements);
      }
    }

    applyWideCircleLayout(buttonConfigs, buttonElements) {
      // Same as even-circle but with larger radius - relative to button size
      const radius = this.buttonSize * 0.8 + 70; // Increased from +30 to +70
      const buttonCount = buttonElements.length;

      buttonElements.forEach((button, index) => {
        const { x, y } = this.calculateCirclePosition(index, buttonCount, radius);
        button.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      });
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
        duration: this.config.animation_options?.animation_duration || 1.0,
        delay: this.config.animation_options?.animation_delay || 0.5,
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

        console.log(
          `Button ${index + 1}: ${button.textContent} with staggered transition delay ${animationOptions.delay + index * delayIncrement}s`,
        );
      });
    }

    applyInstantAnimation(buttonConfigs, buttonElements) {
      buttonElements.forEach((button, index) => {
        // Clear any existing transitions
        button.style.transition = "";
        button.style.transitionDelay = "";

        console.log(`Button ${index + 1}: ${button.textContent} with instant animation (no delays)`);
      });
    }
  }

  // Overlay manager for card-level overlay (simpler approach)
  class WheelOverlayManager {
    constructor(card) {
      this.card = card;
      this.overlay = null;
      this.centralButton = null;
    }

    createOverlay(centralButton) {
      if (this.overlay) return this.overlay;

      this.centralButton = centralButton;

      // Get central button position relative to the card
      const cardRect = this.card.getBoundingClientRect();
      const buttonRect = centralButton.getBoundingClientRect();

      const centerX = buttonRect.left - cardRect.left + buttonRect.width / 2;
      const centerY = buttonRect.top - cardRect.top + buttonRect.height / 2;

      // Create overlay that covers the card area
      this.overlay = document.createElement("div");
      this.overlay.className = "wheel-overlay";

      // Set center position as CSS custom properties
      this.overlay.style.setProperty("--wheel-center-x", `${centerX}px`);
      this.overlay.style.setProperty("--wheel-center-y", `${centerY}px`);

      // Append to card for simple relative positioning
      this.card.appendChild(this.overlay);

      console.log(`Created overlay at card level. Center: ${centerX}px, ${centerY}px`);

      return this.overlay;
    }

    destroyOverlay() {
      if (!this.overlay) return;

      console.log("Destroying overlay");

      // Remove overlay from card
      this.overlay.remove();

      // Reset state
      this.overlay = null;
      this.centralButton = null;
    }

    getOverlay() {
      return this.overlay;
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

  const wheelOpener = config.wheel_opener;
  if (!wheelOpener) {
    return;
  }
  const wheelOpenerButton = card.querySelector(`.bubble-${wheelOpener}`);

  if (!wheelOpenerButton || wheelOpenerButton.classList.contains("wheel-container")) {
    return;
  }

  wheelOpenerButton.classList.add("wheel-container");
  const layout = config.layout_options?.wheel_layout || "even-circle";

  moveButtonsToWheel(wheelOpenerButton, layout);
}
