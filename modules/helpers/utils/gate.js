/**
 * Gate: lets a module skip its DOM writes on style passes where nothing they depend on changed.
 *
 * Bubble Card re-runs a module's `code:` on every style pass (roughly seven per pop-up open), and never memoises code
 * with side effects. On 3.3.0+ it offers `hasChanged(label, ...values)`; on older versions an identical fallback
 * remembers values on the card instance instead.
 *
 * Read every input before gating, every pass: reading an entity through Bubble Card's `hass` proxy is what registers
 * the card's dependency on it. Gate only the writes.
 *
 * @typedef {Object} GateCtx
 * @property {Object} host - The card instance (`this` in module code). The fallback remembers values on it.
 * @property {string} module - The module id, so labels from different modules on one card never collide.
 * @property {function|undefined} hasChanged - Bubble Card's `hasChanged` when in scope (3.3.0+), otherwise undefined:
 *   pass `typeof hasChanged === "function" ? hasChanged : undefined`.
 */

// As upstream (Bubble Card src/tools/module-gate.js): values are joined with a control character, arrays by value.
const SEP = "\u0001";

function signatureOf(values) {
  let out = "";
  for (const value of values) {
    if (Array.isArray(value)) out += value.join(",");
    else if (value !== null && value !== undefined) out += String(value);
    out += SEP;
  }
  return out;
}

/**
 * Whether any of `values` changed since this label was last asked, on this card: true the first time.
 * Uses Bubble Card's `hasChanged` when available, otherwise a fallback with the same answers. Never throws: when it
 * cannot tell, it answers true so the work is done rather than skipped.
 *
 * Values are compared as upstream does: strings, numbers and booleans by value, arrays by their joined elements.
 * `null`, `undefined` and `""` are equal. Pass objects as `JSON.stringify(object)`.
 *
 * @param {GateCtx} ctx
 * @param {string} label - What the values gate, unique within the module on one card (e.g. per element).
 * @param {Array} values - Everything the gated work depends on.
 * @returns {boolean}
 */
export function hasInputsChanged(ctx, label, values) {
  try {
    if (typeof ctx.hasChanged === "function") return ctx.hasChanged(label, ...values) !== false;

    if (!ctx.host._moduleGateFallback) ctx.host._moduleGateFallback = new Map();
    const key = `${ctx.module}::${label}`;
    const signature = signatureOf(values);
    if (ctx.host._moduleGateFallback.get(key) === signature) return false;
    ctx.host._moduleGateFallback.set(key, signature);
    return true;
  } catch {
    return true;
  }
}

/**
 * Runs `write` only when `inputs`, or the DOM it owns, changed since it last ran.
 *
 * `owned()` reads the DOM state `write` produces (whether the nodes it created are still present, inline styles and
 * classes it sets on Bubble Card's elements). It is read before gating, so anything that removed or overwrote the
 * module's work makes it run again, and after writing, so the gate remembers the DOM as `write` left it.
 *
 * @param {GateCtx} ctx
 * @param {string} label - Unique per element (or piece of work) within the module.
 * @param {Array} inputs - Every input `write` depends on, already read (entity states, resolved colours, sizes...).
 * @param {function(): Array} owned - Reads the DOM state `write` owns.
 * @param {function(): void} write - The DOM writes.
 * @returns {boolean} Whether `write` ran.
 */
export function writeIfChanged(ctx, label, inputs, owned, write) {
  if (!hasInputsChanged(ctx, label, [...inputs, ...owned()])) return false;
  write();
  hasInputsChanged(ctx, label, [...inputs, ...owned()]);
  return true;
}
