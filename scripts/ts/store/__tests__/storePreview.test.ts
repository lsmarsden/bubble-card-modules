/**
 * @jest-environment node
 */
import type { LivePost } from "../storeListing";
import type { StorePlan } from "../storePlan";
import { renderPreview } from "../storePreview";

const live = (version: string): LivePost => ({
  number: 7,
  nodeId: "D_7",
  url: "https://github.com/Clooos/Bubble-Card/discussions/7",
  version,
  body: "old post",
});
const diff = (before: string, after: string) => `-${before}\n+${after}`;

const update: StorePlan = {
  id: "demo_mod",
  name: "Demo",
  status: "update",
  version: "v1.2.3",
  live: live("v1.2.1"),
  post: "new post\n```yaml\n```",
  comment: "the comment",
};
const fresh: StorePlan = { id: "new_mod", name: "New", status: "new", version: "v1.0.0", post: "first post" };
const current: StorePlan = {
  id: "done_mod",
  name: "Done",
  status: "up-to-date",
  version: "v2.0.0",
  live: live("v2.0.0"),
  post: "same post",
};

describe("renderPreview", () => {
  it("lists what publishing would do for each module", () => {
    expect(renderPreview([update, fresh, current], diff)).toContain(
      [
        "| Module | Store shows | Would publish | Action |",
        "| --- | --- | --- | --- |",
        "| demo_mod | [v1.2.1](https://github.com/Clooos/Bubble-Card/discussions/7) | v1.2.3 | Update the post and comment the changes |",
        "| new_mod | (no post) | v1.0.0 | Create the post |",
        "| done_mod | [v2.0.0](https://github.com/Clooos/Bubble-Card/discussions/7) | v2.0.0 | None, up to date |",
      ].join("\n"),
    );
  });

  it("shows how an updated post changes, and the comment, fenced so the post's own code blocks can't end them", () => {
    const preview = renderPreview([update], diff);
    expect(preview).toContain(
      "<details><summary>demo_mod: post changes</summary>\n\n````diff\n-old post\n+new post\n```yaml\n```\n````\n\n</details>",
    );
    expect(preview).toContain(
      "<details><summary>demo_mod: release comment</summary>\n\n````markdown\nthe comment\n````\n\n</details>",
    );
  });

  it("shows a new module's whole post", () => {
    expect(renderPreview([fresh], diff)).toContain(
      "<details><summary>new_mod: new post</summary>\n\n````markdown\nfirst post\n````\n\n</details>",
    );
  });

  it("says nothing more about modules that are up to date", () => {
    expect(renderPreview([current], diff)).not.toContain("<details>");
  });

  it("says it publishes nothing", () => {
    expect(renderPreview([], diff)).toMatch(
      /^## Module store preview\n\nWhat publishing would do\. Nothing is published/,
    );
  });
});
