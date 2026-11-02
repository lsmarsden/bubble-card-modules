import { STORE_CATEGORY } from "./storeListing";
import { REPOSITORY, STORE_POST_FILE } from "./storePost";
import { releaseCommentMarker } from "./storePlan";
import type { StorePlan } from "./storePlan";

/** One write to GitHub. */
export type PublishStep =
  | { kind: "create"; title: string; body: string }
  | { kind: "comment"; discussionId: string; url: string; body: string }
  | { kind: "update"; discussionId: string; url: string; body: string };

/**
 * The module ids to publish: those listed in `modules` (comma-separated, as the MODULES variable), or every module when
 * it lists none. Workflows pass an empty string for a blank input, which means all, not none.
 *
 * @throws if a listed module doesn't exist.
 */
export function selectModules(ids: string[], modules: string | undefined): string[] {
  const listed = (modules ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!listed.length) return ids;
  const unknown = listed.filter((id) => !ids.includes(id));
  if (unknown.length) throw new Error(`Unknown module in MODULES: ${unknown.join(", ")}`);
  return ids.filter((id) => listed.includes(id));
}

/** The title of a new store post, following the store's "[Module type] Name" convention. */
export function postTitle(name: string): string {
  return `[JS+Editor Module] ${name}`;
}

/**
 * The writes that bring a module's store post in line with its plan. Safe to repeat: the release comment goes first and
 * is skipped once posted (found by its marker in `comments`, the post's existing comment bodies), and a post that
 * already reads right isn't rewritten. An up-to-date post is only rewritten when `force` is set.
 */
export function publishSteps(
  plan: StorePlan,
  { comments, force = false }: { comments: string[]; force?: boolean },
): PublishStep[] {
  if (plan.status === "new") return [{ kind: "create", title: postTitle(plan.name), body: plan.post }];
  if (plan.status === "up-to-date" && !force) return [];

  const steps: PublishStep[] = [];
  const target = { discussionId: plan.live.nodeId, url: plan.live.url };
  if (plan.status === "update") {
    const marker = releaseCommentMarker(plan.id, plan.version.replace(/^v/, ""));
    if (!comments.some((comment) => comment.includes(marker))) {
      steps.push({ kind: "comment", ...target, body: plan.comment });
    }
  }
  if (plan.live.body !== plan.post) steps.push({ kind: "update", ...target, body: plan.post });
  return steps;
}

/**
 * The store post attached to a module's release (`<id>/v<version>`), so publishing, or re-running it, posts exactly what
 * was released.
 */
export async function fetchReleasePost(fetch: (url: string) => Promise<Response>, tag: string): Promise<string> {
  const response = await fetch(`https://github.com/${REPOSITORY}/releases/download/${tag}/${STORE_POST_FILE}`);
  if (!response.ok) {
    throw new Error(
      `Release ${tag} has no ${STORE_POST_FILE} (${response.status}): release a new version to publish this module`,
    );
  }
  return response.text();
}

/** Runs a GitHub GraphQL query and returns its data. */
export type Graphql = <T>(query: string, variables: Record<string, unknown>) => Promise<T>;

type Fetch = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<Response>;

export function githubGraphql(fetch: Fetch, token: string): Graphql {
  return async <T>(query: string, variables: Record<string, unknown>) => {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(`GitHub GraphQL: ${response.status} ${result?.message ?? ""}`.trim());
    if (result.errors?.length) {
      throw new Error(`GitHub GraphQL: ${result.errors.map((e: { message: string }) => e.message).join("; ")}`);
    }
    return result.data as T;
  };
}

/** The bodies of a discussion's latest 100 comments: enough to find a release comment from a recent run. */
export async function fetchComments(gql: Graphql, discussionId: string): Promise<string[]> {
  const data = await gql<{ node: { comments: { nodes: { body: string }[] } } }>(
    `query($id: ID!) { node(id: $id) { ... on Discussion { comments(last: 100) { nodes { body } } } } }`,
    { id: discussionId },
  );
  return data.node.comments.nodes.map((comment) => comment.body);
}

/** Where new posts go: the repository and its store category. */
export interface PublishTarget {
  repositoryId: string;
  categoryId: string;
}

export async function fetchTarget(gql: Graphql, repository: string): Promise<PublishTarget> {
  const [owner, name] = repository.split("/");
  const data = await gql<{
    repository: { id: string; discussionCategories: { nodes: { id: string; name: string }[] } };
  }>(
    `query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) { id discussionCategories(first: 100) { nodes { id name } } }
    }`,
    { owner, name },
  );
  const category = data.repository.discussionCategories.nodes.find((c) => c.name === STORE_CATEGORY);
  if (!category) throw new Error(`${repository} has no "${STORE_CATEGORY}" discussion category`);
  return { repositoryId: data.repository.id, categoryId: category.id };
}

/** Makes the writes in order, stopping at the first failure. Returns a line per write. */
export async function runSteps(steps: PublishStep[], gql: Graphql, target: PublishTarget): Promise<string[]> {
  const written: string[] = [];
  for (const step of steps) {
    if (step.kind === "comment") {
      const data = await gql<{ addDiscussionComment: { comment: { url: string } } }>(
        `mutation($discussionId: ID!, $body: String!) {
          addDiscussionComment(input: { discussionId: $discussionId, body: $body }) { comment { url } }
        }`,
        { discussionId: step.discussionId, body: step.body },
      );
      written.push(`Commented ${data.addDiscussionComment.comment.url}`);
    } else if (step.kind === "update") {
      const data = await gql<{ updateDiscussion: { discussion: { url: string } } }>(
        `mutation($discussionId: ID!, $body: String!) {
          updateDiscussion(input: { discussionId: $discussionId, body: $body }) { discussion { url } }
        }`,
        { discussionId: step.discussionId, body: step.body },
      );
      written.push(`Updated ${data.updateDiscussion.discussion.url}`);
    } else {
      const data = await gql<{ createDiscussion: { discussion: { url: string } } }>(
        `mutation($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
          createDiscussion(input: { repositoryId: $repositoryId, categoryId: $categoryId, title: $title, body: $body }) {
            discussion { url }
          }
        }`,
        { ...target, title: step.title, body: step.body },
      );
      written.push(`Created ${data.createDiscussion.discussion.url}`);
    }
  }
  return written;
}
