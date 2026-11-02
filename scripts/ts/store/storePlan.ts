import type { BuiltModule } from "../build/buildModule";
import { releaseNotes } from "../release/releasePlan";
import { _compareVersions } from "../upstream/bubble-card/store-shim.js";
import type { LivePost } from "./storeListing";
import { REPOSITORY, renderStorePost } from "./storePost";

/** What publishing would do for one module. `version` is the version the post would show, as the store reads it. */
export type StorePlan =
  | { id: string; status: "new"; version: string; post: string }
  | { id: string; status: "up-to-date"; version: string; live: LivePost }
  | { id: string; status: "update"; version: string; live: LivePost; post: string; comment: string };

/** Hidden in each release comment, so publishing again doesn't comment the same version twice. */
export function releaseCommentMarker(id: string, version: string): string {
  return `<!-- bubble-card-modules release ${id}@${version} -->`;
}

/**
 * Compares a built module with its live store post. A post is only replaced for a newer version; the release comment
 * lists every CHANGELOG entry since the version the post showed, since that is what its readers get by updating.
 *
 * @throws if the store shows a newer version than the module (something was published from elsewhere).
 */
export function planStoreUpdate(built: BuiltModule, live: LivePost | undefined, changelog: string): StorePlan {
  const { id, info } = built;
  const version = `v${info.version}`;
  if (!live) return { id, status: "new", version, post: renderStorePost(built) };

  const order = _compareVersions(version, live.version);
  if (order === 0) return { id, status: "up-to-date", version, live };
  if (order < 0) throw new Error(`${id}: the store shows ${live.version}, newer than ${version}`);

  const notes = releaseNotes(changelog, info.version, [live.version.replace(/^v/, "")]);
  const comment = [
    releaseCommentMarker(id, info.version),
    `**${info.name} ${version}** is out: update it from the Module Store. Changes since ${live.version}:`,
    "",
    linkIssueReferences(notes),
  ].join("\n");
  return { id, status: "update", version, live, post: renderStorePost(built), comment };
}

// On Clooos/Bubble-Card a bare #12 would link to its own issue 12.
function linkIssueReferences(markdown: string): string {
  return markdown.replace(/(^|[^\w/[])#(\d+)\b/g, `$1${REPOSITORY}#$2`);
}
