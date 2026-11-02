import type { StorePlan } from "./storePlan";

const ACTIONS: Record<StorePlan["status"], string> = {
  update: "Update the post and comment the changes",
  new: "Create the post",
  "up-to-date": "None, up to date",
};

/**
 * Job summary markdown describing what publishing would do: a table of modules, then for each module that would change
 * the post diff (or whole new post) and the release comment. `diff(before, after)` returns a unified diff.
 */
export function renderPreview(plans: StorePlan[], diff: (before: string, after: string) => string): string {
  const rows = plans.map((plan) => {
    const shows = plan.status === "new" ? "(no post)" : `[${plan.live.version}](${plan.live.url})`;
    return `| ${plan.id} | ${shows} | ${plan.version} | ${ACTIONS[plan.status]} |`;
  });
  const details = plans.flatMap((plan) => {
    if (plan.status === "new") return [section(`${plan.id}: new post`, "markdown", plan.post)];
    if (plan.status === "update") {
      return [
        section(`${plan.id}: post changes`, "diff", diff(plan.live.body, plan.post)),
        section(`${plan.id}: release comment`, "markdown", plan.comment),
      ];
    }
    return [];
  });
  return [
    "## Module store preview",
    "What publishing would do. Nothing is published from here.",
    ["| Module | Store shows | Would publish | Action |", "| --- | --- | --- | --- |", ...rows].join("\n"),
    ...details,
  ].join("\n\n");
}

// Four backticks, so the ``` blocks inside posts don't close the fence.
function section(summary: string, language: string, content: string): string {
  return `<details><summary>${summary}</summary>\n\n\`\`\`\`${language}\n${content.trimEnd()}\n\`\`\`\`\n\n</details>`;
}
