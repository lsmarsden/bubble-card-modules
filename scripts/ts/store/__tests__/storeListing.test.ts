/**
 * @jest-environment node
 */
import { jest } from "@jest/globals";
import { type Discussion, fetchStoreDiscussions, findLivePost } from "../storeListing";

const post = (moduleId: string, version: string) =>
  ["# Title", "", "```yaml", `${moduleId}:`, "  name: Demo", `  version: ${version}`, "  code: ''", "```", ""].join(
    "\n",
  );

let nextNumber = 1;
const discussion = (overrides: Partial<Discussion> = {}): Discussion => {
  const number = nextNumber++;
  return {
    number,
    node_id: `D_${number}`,
    title: "[JS Module] Demo",
    html_url: `https://github.com/Clooos/Bubble-Card/discussions/${number}`,
    body: post("demo_mod", "v1.0.0"),
    user: { login: "lsmarsden" },
    category: { name: "Share your Modules" },
    ...overrides,
  };
};

describe("findLivePost", () => {
  it("finds the author's post the store reads as the module", () => {
    const other = discussion({ body: post("other_mod", "v2.0.0") });
    const mine = discussion({ body: post("demo_mod", "v1.2.0") });

    expect(findLivePost([other, mine], "demo_mod", "lsmarsden")).toEqual({
      number: mine.number,
      nodeId: mine.node_id,
      url: mine.html_url,
      version: "v1.2.0",
      body: mine.body,
    });
  });

  it("skips posts the store can't read", () => {
    const untitled = discussion({ title: "" });
    const mine = discussion({ body: post("demo_mod", "v1.2.0") });
    expect(findLivePost([untitled, mine], "demo_mod", "lsmarsden")?.number).toBe(mine.number);
  });

  it("ignores posts by someone else, and posts outside the store's category", () => {
    const discussions = [discussion({ user: { login: "someone" } }), discussion({ category: { name: "Questions" } })];
    expect(findLivePost(discussions, "demo_mod", "lsmarsden")).toBeUndefined();
  });

  it("refuses to choose between two posts for the module", () => {
    const [a, b] = [discussion(), discussion()];
    expect(() => findLivePost([a, b], "demo_mod", "lsmarsden")).toThrow(
      `lsmarsden has 2 store posts for demo_mod: ${a.html_url}, ${b.html_url}`,
    );
  });
});

describe("fetchStoreDiscussions", () => {
  const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
  type Init = { headers: Record<string, string> };

  it("reads every page of the store's discussion listing", async () => {
    const pages = [[discussion()], [discussion(), discussion()], []];
    const fetch = jest.fn(async (_url: string, _init: Init) => response(pages.shift()));

    const discussions = await fetchStoreDiscussions(fetch, { token: "t0ken" });

    expect(discussions).toHaveLength(3);
    expect(fetch.mock.calls.map(([url]) => url)).toEqual(
      [1, 2, 3].map((page) => `https://api.github.com/repos/Clooos/Bubble-Card/discussions?per_page=100&page=${page}`),
    );
    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer t0ken",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
  });

  it("reads from another repository when asked", async () => {
    const fetch = jest.fn(async (_url: string, _init: Init) => response([]));
    await fetchStoreDiscussions(fetch, { repository: "me/sandbox" });
    expect(fetch).toHaveBeenCalledWith("https://api.github.com/repos/me/sandbox/discussions?per_page=100&page=1", {
      headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    });
  });

  it("fails rather than return part of the listing", async () => {
    const pages = [response([discussion()]), response({ message: "Server Error" }, 502)];
    const fetch = jest.fn(async (_url: string, _init: Init) => pages.shift()!);
    await expect(fetchStoreDiscussions(fetch, {})).rejects.toThrow(
      "GET https://api.github.com/repos/Clooos/Bubble-Card/discussions?per_page=100&page=2 failed: 502 Server Error",
    );
  });
});
