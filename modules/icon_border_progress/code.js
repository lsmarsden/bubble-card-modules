import {checkAllConditions} from "../helpers/condition.js";
import {resolveColor, resolveColorFromStops} from "../helpers/color.js";
import {applyEffects} from "../helpers/effects.js";
import {getState} from "../helpers/hass.js";
import {toArray} from "../helpers/arrays.js";

function icon_border_progress(card, hass) { // this allows IDEs to parse the file normally - will be removed automatically during build.
    const {icon_border_progress: config} = this.config;
    toArray(config).forEach(({button, condition, entity, start, end, interpolate_colors, color_stops, backcolor, remainingcolor, effects}) => {
        if (!button) return;

        let selector;
        if (button === 'main-button' || button === 'main') {
            selector = '.bubble-icon-container';
        } else {
            selector = `.bubble-${button}`;
        }

        const element = card.querySelector(selector);
        if (!element) return;

        if (!checkAllConditions(condition)) {
            return;
        }

        let progressValue = parseFloat(getState(entity));
        let startValue = parseInt(getState(start));
        let endValue = parseInt(getState(end));

        startValue = isNaN(startValue) ? 0 : startValue;
        endValue = isNaN(endValue) ? 100 : endValue;

        if (isNaN(progressValue) || progressValue < startValue || progressValue > endValue) {
            progressValue = startValue;
        }

        progressValue = (progressValue - startValue) / (endValue - startValue) * 100;
        const colorStops = color_stops || [];
        const progressColor = resolveColorFromStops(progressValue, colorStops, interpolate_colors)

        const remainingProgressColor = resolveColor(remainingcolor, 'var(--dark-grey-color)');
        const backgroundColor = resolveColor(backcolor, 'var(--bubble-icon-background-color)');

        const bubbleBorderRadius = getComputedStyle(element).getPropertyValue('--bubble-icon-border-radius');
        if (bubbleBorderRadius && bubbleBorderRadius.trim() !== '') {
            element.classList.add('has-bubble-border-radius');
        } else {
            element.classList.remove('has-bubble-border-radius');
        }

        element.style.background = `${backgroundColor}`;
        element.classList.add('progress-border');
        element.style.setProperty('--custom-background-color', `${backgroundColor}`);
        element.style.setProperty('--progress', `${progressValue}%`);
        element.style.setProperty('--orb-angle', `${progressValue / 100 * 360}deg`);
        element.style.setProperty('--progress-color', `${progressColor}`);
        element.style.setProperty('--remaining-progress-color', `${remainingProgressColor}`);
        applyEffects(element, effects || []);
    });
}