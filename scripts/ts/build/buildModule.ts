import fs from "node:fs/promises";
import path from "node:path";
import { dump, load } from "js-yaml";
import * as esbuild from "esbuild";

export interface ModuleInfo {
  id: string;
  name: string;
  version: string;
  creator: string;
  link?: string;
  supported: string[];
  description_file: string;
  code_file: string;
  styles: string;
  editor_file: string;
  /** Images under the module folder, shown in the module store post. The first is the store's preview image. */
  screenshots?: Screenshot[];
}

export interface Screenshot {
  file: string;
  alt: string;
}

export interface BuiltModule {
  id: string;
  /** The module's folder name under modules/. */
  folder: string;
  info: ModuleInfo;
  /** The module YAML users import into Bubble Card. */
  yaml: string;
  /** Non-fatal bundler warnings, formatted for display. */
  warnings: string[];
}

/** Folders under `modulesDir` that contain a module.yaml, i.e. buildable modules. */
export async function findModuleFolders(modulesDir: string): Promise<string[]> {
  const entries = await fs.readdir(modulesDir, { withFileTypes: true });
  const isModule = (name: string) =>
    fs.access(path.join(modulesDir, name, "module.yaml")).then(
      () => true,
      () => false,
    );
  const checks = await Promise.all(entries.map(async (e) => e.isDirectory() && (await isModule(e.name))));
  return entries.filter((_, i) => checks[i]).map((e) => e.name);
}

// Bubble Card runs `code:` with `this` bound to the card. The bundle is top-level ES module code, where esbuild
// rewrites `this` to `undefined`, so the entry receives the card through this free name instead.
const CARD_THIS = "__bubble_card_this";

/**
 * Builds a module folder into the YAML Bubble Card imports. Reads the folder; writes nothing.
 *
 * The module's `code.js` must export `function <module_id>(card, hass)`. Its imports (helpers) are bundled and
 * tree-shaken by esbuild, unminified so users can read the result in Bubble Card's editor. Names Bubble Card puts in
 * `code:` scope (`hass`, `card`, `onTeardown`, ...) stay free variables.
 *
 * @throws if module.yaml is invalid, the code does not bundle, or the output contains Home Assistant template
 *   markers (`{{`, `{%`), which Bubble Card would send to the server as Jinja.
 */
export async function buildModule(moduleDir: string): Promise<BuiltModule> {
  const folder = path.basename(moduleDir);
  const parsed = load(await fs.readFile(path.join(moduleDir, "module.yaml"), "utf8")) as {
    module_info: ModuleInfo;
  };
  const info = parsed?.module_info;
  validateModuleInfo(info, folder);
  await assertScreenshotsExist(moduleDir, info);

  const read = (file: string) => fs.readFile(path.join(moduleDir, file), "utf8").catch(() => "");
  const [description, styles, editorYaml] = await Promise.all([
    read(info.description_file),
    read(info.styles),
    read(info.editor_file),
  ]);
  const { code, warnings } = await bundleCode(moduleDir, info);

  // The wrapper returns "" so nothing (e.g. "undefined") is interpolated ahead of the styles.
  const moduleCode = `\${(() => {\nconst ${CARD_THIS} = this;\n${code.trim()}\nreturn "";\n})()}\n\n${styles.trim()}`;
  assertNoJinja(moduleCode, info.id);

  const editorParsed = load(editorYaml) as { editor?: unknown } | undefined;
  const output = {
    [info.id]: {
      name: info.name,
      version: `v${info.version}`,
      creator: info.creator,
      link: info.link || `https://github.com/lsmarsden/bubble-card-modules/tree/main/modules/${folder}`,
      supported: info.supported || [],
      description: description.trim(),
      code: moduleCode,
      editor: editorParsed?.editor ?? editorParsed,
    },
  };

  return { id: info.id, folder, info, yaml: dump(output, { lineWidth: 120 }), warnings };
}

async function bundleCode(moduleDir: string, info: ModuleInfo) {
  const codeFile = `./${info.code_file}`;
  const result = await esbuild.build({
    stdin: {
      contents: `import { ${info.id} } from ${JSON.stringify(codeFile)};\n${info.id}.call(${CARD_THIS}, card, hass);\n`,
      resolveDir: moduleDir,
      sourcefile: `${info.id}.entry.js`,
      loader: "js",
    },
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    treeShaking: true,
    minify: false,
    legalComments: "none",
    logLevel: "silent",
  });
  const warnings = await esbuild.formatMessages(result.warnings, { kind: "warning" });
  return { code: result.outputFiles[0].text, warnings };
}

function assertNoJinja(code: string, id: string) {
  const match = code.match(/\{\{|\{%/);
  if (!match || match.index === undefined) return;
  const line = code.slice(0, match.index).split("\n").length;
  const excerpt = code.split("\n")[line - 1].trim();
  throw new Error(
    `Module ${id}: built code contains "${match[0]}" (line ${line}: ${excerpt}). ` +
      "Bubble Card renders {{ and {% as Home Assistant templates; rewrite the code to avoid them.",
  );
}

async function assertScreenshotsExist(moduleDir: string, info: ModuleInfo) {
  for (const shot of info.screenshots ?? []) {
    if (!shot?.file || !shot.alt) throw new Error(`Each screenshot of module ${info.id} needs a file and alt text`);
    await fs.access(path.join(moduleDir, shot.file)).catch(() => {
      throw new Error(`Screenshot ${shot.file} of module ${info.id} does not exist`);
    });
  }
}

function validateModuleInfo(info: ModuleInfo | undefined, folder: string): asserts info is ModuleInfo {
  if (!info) throw new Error(`Missing module_info in ${folder}/module.yaml`);
  if (!info.id || !/^[a-z0-9_]+$/.test(info.id)) {
    throw new Error(`Invalid or missing module ID for module in ${folder}`);
  }
  if (!info.version || !/^\d+\.\d+\.\d+$/.test(info.version)) {
    throw new Error(`Invalid or missing version for module ${info.id}`);
  }
  if (!Array.isArray(info.supported)) {
    throw new Error(`Supported must be an array for module ${info.id}`);
  }
  if (info.screenshots !== undefined && !Array.isArray(info.screenshots)) {
    throw new Error(`Screenshots must be a list for module ${info.id}`);
  }
  for (const key of ["description_file", "code_file", "styles", "editor_file"] as const) {
    if (!info[key]) throw new Error(`Missing ${key} in module info for ${info.id}`);
  }
}
