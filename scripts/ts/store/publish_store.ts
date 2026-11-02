// Publishes each module's released store post: comments the changes and updates the post, or creates it. A dry run
// unless PUBLISH=true. Prints a markdown report (CI appends it to the job summary).
//
//   GH_TOKEN=... [PUBLISH=true] npx tsx scripts/ts/store/publish_store.ts
//
// STORE_REPOSITORY  where the posts live (default Clooos/Bubble-Card)
// STORE_AUTHOR      whose posts are the modules' posts there (default each module's creator)
// MODULES           comma-separated module ids (default all)
// FORCE=true        also rewrite posts that already show the current version
// SEED_FROM         copy each module's live post from this repository first, if STORE_REPOSITORY has none (sandbox)
import fs from "node:fs";
import path from "node:path";
import { buildModule, findModuleFolders } from "../build/buildModule";
import { modulesDir } from "../paths";
import { type Discussion, fetchStoreDiscussions, findLivePost } from "./storeListing";
import { planStoreUpdate } from "./storePlan";
import { releaseTag } from "./storePost";
import {
  type PublishStep,
  fetchComments,
  fetchReleasePost,
  fetchTarget,
  githubGraphql,
  postTitle,
  publishSteps,
  runSteps,
} from "./storePublish";

const env = process.env;
const token = env.GH_TOKEN;
if (!token) throw new Error("GH_TOKEN is required");
const repository = env.STORE_REPOSITORY || "Clooos/Bubble-Card";
const publish = env.PUBLISH === "true";
const force = env.FORCE === "true";
const only = env.MODULES?.split(",")
  .map((id) => id.trim())
  .filter(Boolean);

const gql = githubGraphql(fetch, token);
const listing = () => fetchStoreDiscussions(fetch, { repository, token });
const report: string[] = [`## Module store ${publish ? "publish" : "dry run"}: ${repository}`];
const describe = (step: PublishStep) =>
  step.kind === "create"
    ? `create "${step.title}"`
    : `${step.kind === "comment" ? "comment on" : "update"} ${step.url}`;

const modules = await Promise.all(
  (await findModuleFolders(modulesDir)).map(async (folder) => ({
    folder,
    built: await buildModule(path.join(modulesDir, folder)),
  })),
);
const selected = modules.filter(({ built }) => !only || only.includes(built.id));
if (only && selected.length !== only.length) throw new Error(`Unknown module in MODULES=${env.MODULES}`);
const target = publish ? await fetchTarget(gql, repository) : undefined;
const authorOf = (creator: string) => env.STORE_AUTHOR || creator;

let discussions: Discussion[] = await listing();

if (env.SEED_FROM) {
  const source = await fetchStoreDiscussions(fetch, { repository: env.SEED_FROM, token });
  for (const { built } of selected) {
    const seed = findLivePost(source, built.id, built.info.creator);
    if (!seed || findLivePost(discussions, built.id, authorOf(built.info.creator))) continue;
    const step: PublishStep = { kind: "create", title: postTitle(built.info.name), body: seed.body };
    report.push(`- ${built.id}: seed from ${seed.url} (${seed.version})`);
    if (target) report.push(...(await runSteps([step], gql, target)).map((line) => `  - ${line}`));
  }
  if (target) discussions = await listing();
}

// Plan every module before writing anything, so a missing release post can't leave a publish half done.
const work = [];
for (const { folder, built } of selected) {
  const { id, info } = built;
  const live = findLivePost(discussions, id, authorOf(info.creator));
  const changelog = fs.readFileSync(path.join(modulesDir, folder, "CHANGELOG.md"), "utf8");
  const post = await fetchReleasePost(fetch, releaseTag(id, info.version));
  const plan = planStoreUpdate(built, live, changelog, post);
  const comments = live ? await fetchComments(gql, live.nodeId) : [];
  work.push({ plan, live, creator: info.creator, steps: publishSteps(plan, { comments, force }) });
}

const published: { id: string; version: string; creator: string }[] = [];
for (const { plan, live, creator, steps } of work) {
  report.push(`- ${plan.id}: store shows ${live?.version ?? "no post"}, release is ${plan.version}`);
  if (!steps.length) report.push("  - nothing to do");
  if (!target) report.push(...steps.map((step) => `  - would ${describe(step)}`));
  else if (steps.length) {
    report.push(...(await runSteps(steps, gql, target)).map((line) => `  - ${line}`));
    published.push({ id: plan.id, version: plan.version, creator });
  }
}

// Read the posts back the way the store does: publishing only counts if the store now shows the new versions. The
// listing can lag a write by a few seconds, so look a few times.
let missing = published;
for (let attempt = 1; missing.length && attempt <= 5; attempt++) {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  discussions = await listing();
  missing = missing.filter(
    ({ id, version, creator }) => findLivePost(discussions, id, authorOf(creator))?.version !== version,
  );
}
if (published.length) {
  report.push(
    missing.length
      ? `**The store doesn't show: ${missing.map((m) => `${m.id} ${m.version}`).join(", ")}**`
      : "Verified: the store shows every published version.",
  );
}
console.log(report.join("\n"));
if (missing.length) process.exit(1);
