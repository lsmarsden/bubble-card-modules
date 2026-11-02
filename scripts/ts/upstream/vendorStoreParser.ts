// Copies Bubble Card's module store parser into scripts/ts/upstream/bubble-card, so the store post tests and preview run
// against the code the store itself runs. Usage:
//
//   git clone --depth 1 --branch v3.4.3 https://github.com/Clooos/Bubble-Card /tmp/bubble-card
//   npx tsx scripts/ts/upstream/vendorStoreParser.ts /tmp/bubble-card
//
// parser.js is copied unchanged apart from its imports. The few functions it imports from files that pull in the
// rest of the editor (lit, translations, the module registry) are copied verbatim into store-shim.js. It reads YAML
// with `store-js-yaml`, an alias of the js-yaml version Bubble Card ships: keep that alias on the version in the
// checkout's package-lock.json (the script checks).
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { projectRoot } from "../paths";

const outDir = path.join(projectRoot, "scripts", "ts", "upstream", "bubble-card");

const SHIMMED = {
  "src/modules/utils.js": ["_cleanMarkdown", "_slugify", "_normalizeVersionInput", "_compareVersions"],
  "src/modules/module-editor.js": ["getAvailableCardTypes"],
};

/** Source of a top-level `function name(...) { ... }`, found by matching braces from its first `{`. */
export function extractFunction(source: string, name: string): string {
  const start = source.search(new RegExp(`^(export )?function ${name}\\(`, "m"));
  if (start === -1) throw new Error(`function ${name} not found`);
  let depth = 0;
  for (let i = source.indexOf("{", start); i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}" && --depth === 0) return source.slice(start, i + 1).replace(/^function /, "export function ");
  }
  throw new Error(`function ${name} is not closed`);
}

async function vendor(checkout: string) {
  const git = (...args: string[]) => execFileSync("git", ["-C", checkout, ...args], { encoding: "utf8" }).trim();
  const commit = git("rev-parse", "HEAD");
  const tag = git("describe", "--tags", "--always");
  const header = `// Vendored from Clooos/Bubble-Card ${tag} (${commit}) by scripts/ts/upstream/vendorStoreParser.ts.\n// Do not edit: re-run the script against a newer checkout instead.\n`;
  const read = (file: string) => fs.readFile(path.join(checkout, file), "utf8");

  const lock = JSON.parse(await read("package-lock.json"));
  const upstreamYaml = lock.packages["node_modules/js-yaml"].version;
  const ours = JSON.parse(await fs.readFile(path.join(projectRoot, "package.json"), "utf8")).devDependencies[
    "store-js-yaml"
  ];
  if (ours !== `npm:js-yaml@${upstreamYaml}`) {
    throw new Error(
      `Bubble Card ${tag} ships js-yaml ${upstreamYaml}: run npm install -D --save-exact store-js-yaml@npm:js-yaml@${upstreamYaml}`,
    );
  }

  const parser = (await read("src/modules/parser.js"))
    .replace("import jsyaml from 'js-yaml';", "import jsyaml from 'store-js-yaml';")
    .replace("from './utils.js';", "from './store-shim.js';")
    .replace("from './module-editor.js';", "from './store-shim.js';");
  if (/from '\.\/(?!store-shim)/.test(parser)) throw new Error("parser.js has an import this script does not handle");

  const shimmed: string[] = [];
  for (const [file, names] of Object.entries(SHIMMED)) {
    const source = await read(file);
    for (const name of names) shimmed.push(`// ${file}\n${extractFunction(source, name)}`);
  }

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "parser.js"), header + parser);
  await fs.writeFile(path.join(outDir, "store-shim.js"), `${header}\n${shimmed.join("\n\n")}\n`);
  await fs.writeFile(path.join(outDir, "VERSION"), `${tag} ${commit}\njs-yaml ${upstreamYaml}\n`);
  console.log(`Vendored Bubble Card ${tag} store parser into ${path.relative(projectRoot, outDir)}`);
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const checkout = process.argv[2];
  if (!checkout) {
    console.error("Usage: tsx scripts/ts/upstream/vendorStoreParser.ts <path to a Bubble Card checkout>");
    process.exit(1);
  }
  await vendor(path.resolve(checkout));
}
