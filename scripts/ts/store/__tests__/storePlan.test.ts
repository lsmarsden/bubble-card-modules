/**
 * @jest-environment node
 */
import type { LivePost } from "../storeListing";
import { planStoreUpdate, releaseCommentMarker } from "../storePlan";
import { renderStorePost } from "../storePost";
import { builtModule } from "./fixtures";

const live = (version: string): LivePost => ({
  number: 7,
  nodeId: "D_7",
  url: "https://github.com/Clooos/Bubble-Card/discussions/7",
  version,
  body: "old post",
});

const changelog = [
  "# Changelog",
  "",
  "### v1.2.3",
  "",
  "<details><summary>See Changes</summary>",
  "",
  "- Fixed a thing ([#14](https://github.com/lsmarsden/bubble-card-modules/pull/14)).",
  "",
  "</details>",
  "",
  "### v1.2.2",
  "",
  "- Fixed another thing, see #12.",
  "",
  "### v1.2.1",
  "",
  "- First patch.",
].join("\n");

describe("planStoreUpdate", () => {
  const module = builtModule();

  it("posts a module the store doesn't have yet", () => {
    expect(planStoreUpdate(module, undefined, changelog)).toEqual({
      id: "demo_mod",
      name: "Demo Module",
      status: "new",
      version: "v1.2.3",
      post: renderStorePost(module),
    });
  });

  it("leaves a post that already shows this version alone, keeping the post for a forced republish", () => {
    expect(planStoreUpdate(module, live("v1.2.3"), changelog)).toEqual({
      id: "demo_mod",
      name: "Demo Module",
      status: "up-to-date",
      version: "v1.2.3",
      live: live("v1.2.3"),
      post: renderStorePost(module),
    });
  });

  it("uses the post it is given, such as the one attached to the release", () => {
    expect(planStoreUpdate(module, live("v1.2.1"), changelog, "released post")).toMatchObject({
      post: "released post",
    });
  });

  it("updates an older post, commenting every change since the version it showed", () => {
    const plan = planStoreUpdate(module, live("v1.2.1"), changelog);
    expect(plan).toMatchObject({ status: "update", version: "v1.2.3", live: live("v1.2.1") });
    if (plan.status !== "update") throw new Error("expected an update");

    expect(plan.post).toBe(renderStorePost(module));
    expect(plan.comment).toBe(
      [
        releaseCommentMarker("demo_mod", "1.2.3"),
        "**Demo Module v1.2.3** is out: update it from the Module Store. Changes since v1.2.1:",
        "",
        "### v1.2.3",
        "",
        "- Fixed a thing ([#14](https://github.com/lsmarsden/bubble-card-modules/pull/14)).",
        "",
        "### v1.2.2",
        "",
        "- Fixed another thing, see lsmarsden/bubble-card-modules#12.",
      ].join("\n"),
    );
  });

  it("refuses to go back to an older version than the store shows", () => {
    expect(() => planStoreUpdate(module, live("v1.3.0"), changelog)).toThrow(
      "demo_mod: the store shows v1.3.0, newer than v1.2.3",
    );
  });
});

describe("releaseCommentMarker", () => {
  it("is a hidden comment naming the module version", () => {
    expect(releaseCommentMarker("demo_mod", "1.2.3")).toBe("<!-- bubble-card-modules release demo_mod@1.2.3 -->");
  });
});
