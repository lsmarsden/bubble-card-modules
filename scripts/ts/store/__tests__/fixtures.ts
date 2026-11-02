import { dump } from "js-yaml";
import type { BuiltModule, ModuleInfo } from "../../build/buildModule";

/** A built module for store tests: demo_mod v1.2.3 in modules/demo_folder, with a small YAML definition. */
export const builtModule = (
  overrides: Partial<ModuleInfo> = {},
  definition: Record<string, unknown> = {},
): BuiltModule => {
  const info: ModuleInfo = {
    id: "demo_mod",
    name: "Demo Module",
    version: "1.2.3",
    creator: "someone",
    supported: ["button", "pop-up"],
    description_file: "description.html",
    code_file: "code.js",
    styles: "styles.css",
    editor_file: "editor.yaml",
    ...overrides,
  };
  const yaml = dump({
    [info.id]: {
      name: info.name,
      version: `v${info.version}`,
      description: "<div>\n    <p>\n        Does a thing.\n\n    </p>\n</div>",
      code: "${(() => {})()}",
      ...definition,
    },
  });
  return { id: info.id, folder: "demo_folder", info, yaml, warnings: [] };
};
