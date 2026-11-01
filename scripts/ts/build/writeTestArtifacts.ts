/**
 * Builds every module into `<outDir>/<module_id>.yaml` so tests can run what users install.
 * Run by the Jest global setup in a plain Node process (esbuild cannot run inside jsdom).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { buildModule, findModuleFolders } from "./buildModule";
import { modulesDir } from "../paths";

const outDir = process.argv[2];
if (!outDir) throw new Error("Usage: writeTestArtifacts <outDir>");

await fs.mkdir(outDir, { recursive: true });
for (const folder of await findModuleFolders(modulesDir)) {
  const built = await buildModule(path.join(modulesDir, folder));
  await fs.writeFile(path.join(outDir, `${built.id}.yaml`), built.yaml, "utf8");
}
