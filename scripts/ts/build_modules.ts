import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { buildModule, findModuleFolders } from "./build/buildModule";
import { generateDocs } from "./generate_docs";
import { logProgress, visibleLog } from "./helpers/logging";
import { modulesDir } from "./paths";

// CI and releases only need the module YAML; --skip-docs skips the Python schema docs and SHARE_MODULE.md.
const skipDocs = process.argv.includes("--skip-docs");

async function buildAndWrite(folder: string): Promise<void> {
  const startTime = Date.now();
  const moduleDir = path.join(modulesDir, folder);
  try {
    logProgress(`BUILDING MODULE: ${folder}`);
    const built = await buildModule(moduleDir);
    built.warnings.forEach((warning) => console.warn(warning));

    const distPath = path.join(moduleDir, "dist");
    await fs.mkdir(distPath, { recursive: true });
    await fs.writeFile(path.join(distPath, `${built.id}.yaml`), built.yaml, "utf8");
    visibleLog(`BUILT MODULE: ${built.id} (${Date.now() - startTime}ms)`, chalk.green);

    if (!skipDocs) await generateDocs(built.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Module '${folder}' build failed after ${Date.now() - startTime}ms: ${message}`);
  }
}

async function buildModules() {
  const folders = await findModuleFolders(modulesDir);
  if (folders.length === 0) {
    console.log("No modules to build");
    return;
  }

  logProgress(`Building ${folders.length} modules in parallel...`);
  const results = await Promise.allSettled(folders.map(buildAndWrite));
  const failures = results.flatMap((result, i) => (result.status === "rejected" ? [[folders[i], result.reason]] : []));

  if (failures.length === 0) {
    console.log(`\n✅ All ${folders.length} modules built successfully`);
    return;
  }
  if (failures.length < folders.length) {
    console.log(`\n✅ ${folders.length - failures.length} module(s) built successfully`);
  }
  console.error(`\n❌ ${failures.length} module(s) failed to build:`);
  for (const [folder, error] of failures) {
    console.error(`\n  📦 ${folder}:\n     ${error instanceof Error ? error.message : String(error)}`);
  }
  process.exit(1);
}

buildModules();
