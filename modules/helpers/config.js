/**
 * Resolve config values from the given sources. Sources are checked in the order they are provided,
 * so this can be used to override values from other sources or define a hierarchy/priority for config values.
 *
 * Useful for switching around and deprecating config values.
 *
 * Each source is an object with the following properties:
 *
 * @param {Source[]} sources - An array of sources to check for config values.
 * @param {*} defaultValue - The default value to return if no config value is found.
 * @typedef {Object} Source
 * @property {object} config - The loaded config object.
 * @property {string} path - The directory to search for modules.
 * @property {object} metadata - Additional metadata.
 * @property {boolean} [metadata.deprecated] - Whether the config is deprecated.
 * @property {string} [metadata.replacedWith] - ID of the module replacing this one.
 * @property {string} [metadata.message] - Custom deprecation message.
 */
export const resolveConfig = (sources, defaultValue = undefined) => {
  for (const source of sources) {
    const keys = Array.isArray(source.path)
      ? source.path
      : source.path.split(".");
    const value = getConfigValue(source.config, keys);

    if (
      value !== undefined &&
      (!source.condition || source.condition(value, source.config))
    ) {
      const metadata = source.metadata || {};
      if (metadata.deprecated) {
        console.warn(
          `[DEPRECATED] Config path "${source.path}" used.` +
            (metadata.replacedWith
              ? ` Use "${metadata.replacedWith}" instead.`
              : "") +
            (metadata.message ? ` ${metadata.message}` : ""),
        );
      }
      return value;
    }
  }
  return defaultValue;
};

function getConfigValue(config, keys) {
  let current = config;
  for (const key of keys) {
    if (current && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  return current;
}
