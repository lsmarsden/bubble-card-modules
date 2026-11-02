/**
 * @jest-environment node
 */
import { dump } from "js-yaml";
import type { BuiltModule, ModuleInfo } from "../../build/buildModule";
import { DISCUSSION_BODY_LIMIT, GENERATED_MARKER, assetUrl, releaseTag, renderStorePost } from "../storePost";

const info = (overrides: Partial<ModuleInfo> = {}): ModuleInfo => ({
  id: "demo_mod",
  name: "Demo Module",
  version: "1.2.3",
  creator: "someone",
  supported: ["button", "pop-up"],
  description_file: "description.html",
  code_file: "code.js",
  styles: "styles.css",
  editor_file: "editor.yaml",
  ...overrides,
});

const built = (overrides: Partial<ModuleInfo> = {}, definition: Record<string, unknown> = {}): BuiltModule => {
  const moduleInfo = info(overrides);
  const yaml = dump({
    [moduleInfo.id]: {
      name: moduleInfo.name,
      version: `v${moduleInfo.version}`,
      description: "<div>\n    <p>\n        Does a thing.\n\n    </p>\n</div>",
      code: "${(() => {})()}",
      ...definition,
    },
  });
  return { id: moduleInfo.id, folder: "demo_folder", info: moduleInfo, yaml, warnings: [] };
};

describe("releaseTag", () => {
  it("is <id>/v<version>, the tag the release workflow creates", () => {
    expect(releaseTag("demo_mod", "1.2.3")).toBe("demo_mod/v1.2.3");
  });
});

describe("assetUrl", () => {
  it("links the file at the release tag, encoding each path segment", () => {
    expect(assetUrl("demo_folder", "demo_mod/v1.2.3", "assets/My Shot.gif")).toBe(
      "https://raw.githubusercontent.com/lsmarsden/bubble-card-modules/refs/tags/demo_mod/v1.2.3/modules/demo_folder/assets/My%20Shot.gif",
    );
  });
});

describe("renderStorePost", () => {
  it("starts with the name, version, creator and supported card names", () => {
    expect(renderStorePost(built())).toMatch(
      new RegExp(
        [
          "^# Demo Module\n\n",
          "\\*\\*Version:\\*\\* v1\\.2\\.3  \n",
          "\\*\\*Creator:\\*\\* \\[someone\\]\\(https://github\\.com/someone\\)\n\n",
          "> \\[!IMPORTANT\\]\n> \\*\\*Supported cards:\\*\\*\n>  - Button\n>  - Pop-up\n",
        ].join(""),
      ),
    );
  });

  it("contains the module YAML exactly, in one yaml block", () => {
    const module = built();
    const post = renderStorePost(module);
    expect(post).toContain("```yaml\n" + module.yaml.trimEnd() + "\n```");
    expect(post.match(/```yaml/g)).toHaveLength(1);
  });

  it("flattens the description so Markdown renders it as HTML, not code", () => {
    expect(renderStorePost(built())).toContain("\n\n<div>\n<p>\nDoes a thing.\n</p>\n</div>\n\n");
  });

  it("shows the first screenshot above the description and the rest at the end", () => {
    const post = renderStorePost(
      built({
        screenshots: [
          { file: "assets/a.png", alt: "First" },
          { file: "assets/b.png", alt: "Second" },
        ],
      }),
    );
    const url = (file: string) => assetUrl("demo_folder", "demo_mod/v1.2.3", file);
    expect(post.indexOf(`![First](${url("assets/a.png")})`)).toBeLessThan(post.indexOf("<div>"));
    expect(post).toMatch(new RegExp(`### More screenshots\n\n!\\[Second\\]\\(${url("assets/b.png")}\\)\n\n<!--`));
  });

  it("has no images or extra screenshot section without screenshots", () => {
    const post = renderStorePost(built());
    expect(post).not.toContain("![");
    expect(post).not.toContain("More screenshots");
  });

  it("ends with a marker naming the module folder and tag", () => {
    expect(renderStorePost(built())).toMatch(
      new RegExp(`${GENERATED_MARKER} Released from modules/demo_folder at demo_mod/v1\\.2\\.3; .* -->\n$`),
    );
  });

  it("rejects a card type Bubble Card doesn't have", () => {
    expect(() => renderStorePost(built({ supported: ["button", "toaster"] }))).toThrow(
      "Module demo_mod: Bubble Card has no card type toaster",
    );
  });

  it("rejects YAML that would end the code block early", () => {
    expect(() => renderStorePost(built({}, { code: "a ``` b" }))).toThrow(/contains ```/);
  });

  it("rejects a post longer than GitHub allows", () => {
    expect(() => renderStorePost(built({}, { code: "x".repeat(DISCUSSION_BODY_LIMIT) }))).toThrow(
      /the store post is \d+ characters, over GitHub's 65536 limit/,
    );
  });
});
