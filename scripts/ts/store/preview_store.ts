// Prints the module store preview (markdown) for every module: what publishing would change in the store, read live.
// Publishes nothing. CI appends the output to the job summary.
//
//   GH_TOKEN=... npx tsx scripts/ts/store/preview_store.ts
//
// STORE_REPOSITORY reads posts from another repository (default Clooos/Bubble-Card).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildModule, findModuleFolders } from "../build/buildModule";
import { modulesDir } from "../paths";
import { fetchStoreDiscussions, findLivePost } from "./storeListing";
import { planStoreUpdate } from "./storePlan";
import { renderPreview } from "./storePreview";

function unifiedDiff(before: string, after: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "store-preview-"));
  try {
    fs.writeFileSync(path.join(dir, "live.md"), before);
    fs.writeFileSync(path.join(dir, "new.md"), after);
    const result = spawnSync("git", ["diff", "--no-index", "--no-color", "live.md", "new.md"], {
      cwd: dir,
      encoding: "utf8",
    });
    if (result.status !== 0 && result.status !== 1) throw new Error(`git diff failed: ${result.stderr}`);
    return result.stdout.split("\n").slice(4).join("\n"); // drop the diff/index/---/+++ header
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const discussions = await fetchStoreDiscussions(fetch, {
  repository: process.env.STORE_REPOSITORY || undefined,
  token: process.env.GH_TOKEN || undefined,
});
const folders = await findModuleFolders(modulesDir);
const plans = await Promise.all(
  folders.map(async (folder) => {
    const built = await buildModule(path.join(modulesDir, folder));
    const changelog = fs.readFileSync(path.join(modulesDir, folder, "CHANGELOG.md"), "utf8");
    return planStoreUpdate(built, findLivePost(discussions, built.id, built.info.creator), changelog);
  }),
);
console.log(renderPreview(plans, unifiedDiff));
