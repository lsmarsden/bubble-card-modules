import { isActiveTimer } from "../entity/timer.js";

export function manageTimerUpdater(element, progressSource, updateFn) {
  const hasUpdater = !!element.dataset.progress_update_interval;
  const shouldHaveUpdater = isActiveTimer(progressSource);

  if (shouldHaveUpdater && !hasUpdater) {
    element.dataset.progress_update_interval = setInterval(updateFn, 1000);
  }

  if (!shouldHaveUpdater && hasUpdater) {
    clearInterval(Number(element.dataset.progress_update_interval));
    element.removeAttribute("data-progress_update_interval");
  }
}
