import { parseDiscussionsREST, type RestDiscussion } from "../upstream/bubble-card/parser.js";

/** Where Bubble Card's module store reads its posts from. */
export const STORE_REPOSITORY = "Clooos/Bubble-Card";
export const STORE_CATEGORY = "Share your Modules";

/** A discussion as the REST listing returns it, as far as we use it. */
export interface Discussion extends RestDiscussion {
  node_id: string;
}

/** A module's post in the store, as the store reads it. */
export interface LivePost {
  number: number;
  nodeId: string;
  url: string;
  version: string;
  body: string;
}

type Fetch = (url: string, init: { headers: Record<string, string> }) => Promise<Response>;

/** Every discussion in `repository`, read the way the store reads them (all pages of the REST listing). */
export async function fetchStoreDiscussions(
  fetch: Fetch,
  { repository = STORE_REPOSITORY, token }: { repository?: string; token?: string },
): Promise<Discussion[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const discussions: Discussion[] = [];
  for (let page = 1; ; page++) {
    const url = `https://api.github.com/repos/${repository}/discussions?per_page=100&page=${page}`;
    const response = await fetch(url, { headers });
    const body = await response.json();
    if (!response.ok) throw new Error(`GET ${url} failed: ${response.status} ${body?.message ?? ""}`.trim());
    if (body.length === 0) return discussions;
    discussions.push(...body);
  }
}

/**
 * The post the store shows for `moduleId` by `author`: in the store's category, with the store's parser deciding which
 * module a post is. Undefined if there is none.
 *
 * @throws if the author has more than one post for the module, since the store would list both.
 */
export function findLivePost(discussions: Discussion[], moduleId: string, author: string): LivePost | undefined {
  const candidates = discussions.filter((d) => d.category?.name === STORE_CATEGORY && d.user?.login === author);
  // One at a time: the parser drops posts it can't read, so its output doesn't line up with its input.
  const matches = candidates.flatMap((discussion) => {
    const [module] = parseDiscussionsREST([discussion]);
    return module?.id === moduleId ? [{ discussion, version: module.version }] : [];
  });
  if (matches.length > 1) {
    const urls = matches.map((m) => m.discussion.html_url).join(", ");
    throw new Error(`${author} has ${matches.length} store posts for ${moduleId}: ${urls}`);
  }
  if (!matches.length) return undefined;
  const [{ discussion, version }] = matches;
  return {
    number: discussion.number,
    nodeId: discussion.node_id,
    url: discussion.html_url,
    version,
    body: discussion.body,
  };
}
