// Jest transformer for the build scripts' TypeScript tests: strips types with esbuild (already used by the build),
// keeping ES modules. Type checking is `tsc --noEmit`, run separately in CI.
const { transformSync } = require("esbuild");

module.exports = {
  process(source, filename) {
    const { code, map } = transformSync(source, {
      loader: "ts",
      format: "esm",
      target: "node22",
      sourcefile: filename,
      sourcemap: "external",
    });
    return { code, map };
  },
};
