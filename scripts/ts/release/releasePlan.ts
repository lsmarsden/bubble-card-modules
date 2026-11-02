import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { findModuleFolders, type ModuleInfo } from "../build/buildModule";

export interface PlannedRelease {
  folder: string;
  id: string;
  version: string;
  /** Git tag of the release, `<id>/v<version>`. */
  tag: string;
  title: string;
  /** Built module YAML attached to the release. */
  asset: string;
  notes: string;
}

interface ChangelogEntry {
  version: string;
  body: string;
}

/** CHANGELOG.md entries, newest first: each `### v<version>` heading with its body, minus the `<details>` wrapper. */
export function changelogEntries(changelog: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  let current: { version: string; lines: string[] } | undefined;
  const flush = () => {
    if (!current) return;
    const body = current.lines
      .filter((line) => !/^\s*(<details>(<summary>.*<\/summary>)?|<summary>.*<\/summary>|<\/details>)\s*$/.test(line))
      .join("\n")
      .trim();
    entries.push({ version: current.version, body });
  };
  for (const line of changelog.split("\n")) {
    const heading = line.match(/^### v(\d+\.\d+\.\d+)\s*$/);
    if (heading) {
      flush();
      current = { version: heading[1], lines: [] };
    } else if (/^#{1,3} /.test(line)) {
      flush();
      current = undefined;
    } else {
      current?.lines.push(line);
    }
  }
  flush();
  return entries;
}

/**
 * Release notes for `version`: its CHANGELOG entry, plus every older entry back to (not including) the newest
 * already-published version, so users updating from the last release see everything they get. Throws if `version`
 * has no entry or an entry is empty, so a release never goes out without notes.
 */
export function releaseNotes(changelog: string, version: string, published: Iterable<string> = []): string {
  const entries = changelogEntries(changelog);
  const start = entries.findIndex((e) => e.version === version);
  if (start === -1) throw new Error(`CHANGELOG.md has no "### v${version}" entry`);

  const publishedSet = new Set(published);
  const stop = entries.findIndex((e, i) => i > start && publishedSet.has(e.version));
  const included = stop === -1 ? [entries[start]] : entries.slice(start, stop);

  for (const entry of included) {
    if (!entry.body) throw new Error(`CHANGELOG.md entry "### v${entry.version}" is empty`);
  }
  if (included.length === 1) return included[0].body;
  return included.map((e) => `### v${e.version}\n\n${e.body}`).join("\n\n");
}

/**
 * Releases to publish: every module whose `<id>/v<version>` tag is not in `publishedTags`, with notes covering all
 * versions since its last published one.
 */
export async function planReleases(modulesDir: string, publishedTags: string[]): Promise<PlannedRelease[]> {
  const published = new Set(publishedTags);
  const folders = await findModuleFolders(modulesDir);
  const plans = await Promise.all(
    folders.map(async (folder): Promise<PlannedRelease | undefined> => {
      const dir = path.join(modulesDir, folder);
      const { module_info: info } = yaml.load(await fs.readFile(path.join(dir, "module.yaml"), "utf8")) as {
        module_info: ModuleInfo;
      };
      const tag = `${info.id}/v${info.version}`;
      if (published.has(tag)) return undefined;

      const prefix = `${info.id}/v`;
      const publishedVersions = publishedTags.filter((t) => t.startsWith(prefix)).map((t) => t.slice(prefix.length));
      const changelog = await fs.readFile(path.join(dir, "CHANGELOG.md"), "utf8");
      return {
        folder,
        id: info.id,
        version: info.version,
        tag,
        title: `${info.name} v${info.version}`,
        asset: path.join(dir, "dist", `${info.id}.yaml`),
        notes: releaseNotes(changelog, info.version, publishedVersions),
      };
    }),
  );
  return plans.filter((p): p is PlannedRelease => p !== undefined);
}
