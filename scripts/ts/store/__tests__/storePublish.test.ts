/**
 * @jest-environment node
 */
import { jest } from "@jest/globals";
import type { LivePost } from "../storeListing";
import type { StorePlan } from "../storePlan";
import {
  fetchComments,
  fetchReleasePost,
  fetchTarget,
  githubGraphql,
  postTitle,
  publishSteps,
  runSteps,
  selectModules,
} from "../storePublish";

const live: LivePost = {
  number: 7,
  nodeId: "D_7",
  url: "https://github.com/Clooos/Bubble-Card/discussions/7",
  version: "v1.2.1",
  body: "old post",
};
const base = { id: "demo_mod", name: "Demo Module", version: "v1.2.3", post: "new post" };
const marker = "<!-- bubble-card-modules release demo_mod@1.2.3 -->";
const update: StorePlan = { ...base, status: "update", live, comment: `${marker}\nwhat changed` };

describe("publishSteps", () => {
  it("comments the changes, then replaces the post", () => {
    expect(publishSteps(update, { comments: [] })).toEqual([
      { kind: "comment", discussionId: "D_7", url: live.url, body: `${marker}\nwhat changed` },
      { kind: "update", discussionId: "D_7", url: live.url, body: "new post" },
    ]);
  });

  it("doesn't comment a version twice, so a failed publish can be re-run", () => {
    expect(publishSteps(update, { comments: ["thanks!", `${marker}\nwhat changed`] })).toEqual([
      { kind: "update", discussionId: "D_7", url: live.url, body: "new post" },
    ]);
  });

  it("doesn't rewrite a post that is already right", () => {
    expect(publishSteps({ ...update, post: "old post" }, { comments: [marker] })).toEqual([]);
  });

  it("creates the post for a new module", () => {
    expect(publishSteps({ ...base, status: "new" }, { comments: [] })).toEqual([
      { kind: "create", title: "[JS+Editor Module] Demo Module", body: "new post" },
    ]);
  });

  it("leaves an up-to-date post alone, unless forced to republish it", () => {
    const current: StorePlan = { ...base, status: "up-to-date", live: { ...live, version: "v1.2.3" } };
    expect(publishSteps(current, { comments: [] })).toEqual([]);
    expect(publishSteps(current, { comments: [], force: true })).toEqual([
      { kind: "update", discussionId: "D_7", url: live.url, body: "new post" },
    ]);
    expect(publishSteps({ ...current, post: "old post" }, { comments: [], force: true })).toEqual([]);
  });
});

describe("postTitle", () => {
  it("follows the store's title convention", () => {
    expect(postTitle("Sub Button Wheel")).toBe("[JS+Editor Module] Sub Button Wheel");
  });
});

describe("githubGraphql", () => {
  type Init = { method: string; headers: Record<string, string>; body: string };
  const fakeFetch = (...responses: unknown[]) =>
    jest.fn(async (_url: string, _init: Init) => {
      const [status, body] = responses.shift() as [number, unknown];
      return new Response(JSON.stringify(body), { status });
    });

  it("posts the query with the token and returns its data", async () => {
    const fetch = fakeFetch([200, { data: { viewer: { login: "me" } } }]);
    const gql = githubGraphql(fetch, "t0ken");

    await expect(gql("query { viewer { login } }", { a: 1 })).resolves.toEqual({ viewer: { login: "me" } });
    expect(fetch).toHaveBeenCalledWith("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: "Bearer t0ken", "Content-Type": "application/json" },
      body: JSON.stringify({ query: "query { viewer { login } }", variables: { a: 1 } }),
    });
  });

  it("fails on GraphQL errors and HTTP errors", async () => {
    const gql = githubGraphql(
      fakeFetch(
        [200, { data: null, errors: [{ message: "Bad id" }, { message: "No access" }] }],
        [401, { message: "Bad credentials" }],
      ),
      "t0ken",
    );
    await expect(gql("q", {})).rejects.toThrow("GitHub GraphQL: Bad id; No access");
    await expect(gql("q", {})).rejects.toThrow("GitHub GraphQL: 401 Bad credentials");
  });
});

describe("talking to GitHub", () => {
  const recorder = (answers: Record<string, unknown> = {}) => {
    const calls: { query: string; variables: Record<string, unknown> }[] = [];
    const gql = async (query: string, variables: Record<string, unknown>) => {
      calls.push({ query, variables });
      const name = Object.keys(answers).find((key) => query.includes(key));
      return (name ? answers[name] : {}) as never;
    };
    return { calls, gql };
  };

  it("reads a discussion's comment bodies", async () => {
    const { calls, gql } = recorder({ comments: { node: { comments: { nodes: [{ body: "a" }, { body: "b" }] } } } });
    await expect(fetchComments(gql, "D_7")).resolves.toEqual(["a", "b"]);
    expect(calls[0].variables).toEqual({ id: "D_7" });
  });

  it("finds the repository and its store category", async () => {
    const repository = {
      id: "R_1",
      discussionCategories: {
        nodes: [
          { id: "C_q", name: "Q&A" },
          { id: "C_s", name: "Share your Modules" },
        ],
      },
    };
    const { calls, gql } = recorder({ discussionCategories: { repository } });
    await expect(fetchTarget(gql, "me/sandbox")).resolves.toEqual({ repositoryId: "R_1", categoryId: "C_s" });
    expect(calls[0].variables).toEqual({ owner: "me", name: "sandbox" });
  });

  it("fails when the repository has no store category", async () => {
    const repository = { id: "R_1", discussionCategories: { nodes: [{ id: "C_q", name: "Q&A" }] } };
    const { gql } = recorder({ discussionCategories: { repository } });
    await expect(fetchTarget(gql, "me/sandbox")).rejects.toThrow(
      'me/sandbox has no "Share your Modules" discussion category',
    );
  });

  it("makes each write in order and reports what it wrote", async () => {
    const { calls, gql } = recorder({
      createDiscussion: { createDiscussion: { discussion: { url: "https://x/discussions/9" } } },
      addDiscussionComment: { addDiscussionComment: { comment: { url: "https://x/discussions/7#c1" } } },
      updateDiscussion: { updateDiscussion: { discussion: { url: "https://x/discussions/7" } } },
    });
    const written = await runSteps(
      [
        { kind: "comment", discussionId: "D_7", url: "https://x/discussions/7", body: "changes" },
        { kind: "update", discussionId: "D_7", url: "https://x/discussions/7", body: "post" },
        { kind: "create", title: "[JS+Editor Module] New", body: "first post" },
      ],
      gql,
      { repositoryId: "R_1", categoryId: "C_s" },
    );

    expect(calls.map((c) => c.variables)).toEqual([
      { discussionId: "D_7", body: "changes" },
      { discussionId: "D_7", body: "post" },
      { repositoryId: "R_1", categoryId: "C_s", title: "[JS+Editor Module] New", body: "first post" },
    ]);
    expect(written).toEqual([
      "Commented https://x/discussions/7#c1",
      "Updated https://x/discussions/7",
      "Created https://x/discussions/9",
    ]);
  });
});

describe("fetchReleasePost", () => {
  it("downloads the store post attached to the module's release", async () => {
    const fetch = jest.fn(async (_url: string) => new Response("released post", { status: 200 }));
    await expect(fetchReleasePost(fetch, "demo_mod/v1.2.3")).resolves.toBe("released post");
    expect(fetch).toHaveBeenCalledWith(
      "https://github.com/lsmarsden/bubble-card-modules/releases/download/demo_mod/v1.2.3/STORE_POST.md",
    );
  });

  it("fails clearly for a release made before posts were attached", async () => {
    const fetch = jest.fn(async (_url: string) => new Response("Not Found", { status: 404 }));
    await expect(fetchReleasePost(fetch, "demo_mod/v1.2.3")).rejects.toThrow(
      "Release demo_mod/v1.2.3 has no STORE_POST.md (404): release a new version to publish this module",
    );
  });
});

describe("selectModules", () => {
  const ids = ["alpha", "beta", "gamma"];

  it.each([[undefined], [""], ["  "], [" , "]])("selects every module when MODULES is %j", (modules) => {
    expect(selectModules(ids, modules)).toEqual(ids);
  });

  it("selects the listed modules, ignoring spaces", () => {
    expect(selectModules(ids, " gamma, alpha ")).toEqual(["alpha", "gamma"]);
  });

  it("fails on a module that doesn't exist", () => {
    expect(() => selectModules(ids, "alpha,delta")).toThrow("Unknown module in MODULES: delta");
  });
});
