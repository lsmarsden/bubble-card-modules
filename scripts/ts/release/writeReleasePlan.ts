/**
 * Writes the release plan for CI. Input: a JSON array of published release tags (`gh release list --json tagName
 * --jq '[.[].tagName]'`). Output: `<outDir>/plan.json`, one entry per module version not yet released, and
 * `<outDir>/<id>.md` with its notes. Fails if a version to release has no CHANGELOG entry.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { modulesDir } from "../paths";
import { planReleases } from "./releasePlan";

const [publishedTagsFile, outDir] = process.argv.slice(2);
if (!publishedTagsFile || !outDir) throw new Error("Usage: writeReleasePlan <published-tags.json> <outDir>");

const publishedTags = JSON.parse(await fs.readFile(publishedTagsFile, "utf8")) as string[];
await fs.mkdir(outDir, { recursive: true });
const plan = await planReleases(modulesDir, publishedTags);
for (const release of plan) {
  await fs.writeFile(path.join(outDir, `${release.id}.md`), `${release.notes}\n`, "utf8");
}
const entries = plan.map(({ notes, ...rest }) => ({ ...rest, notesFile: path.join(outDir, `${rest.id}.md`) }));
await fs.writeFile(path.join(outDir, "plan.json"), JSON.stringify(entries, null, 2), "utf8");
console.log(entries.length ? entries.map((e) => `to release: ${e.tag}`).join("\n") : "Nothing to release");
