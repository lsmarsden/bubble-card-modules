/**
 * @jest-environment node
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { dump, load } from "js-yaml";
import { buildModule, findModuleFolders } from "../buildModule";

let root: string;
let moduleDir: string;

const write = (file: string, content: string) => {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), content);
};
const moduleYaml = (info: Record<string, unknown> = {}) =>
  dump({
    module_info: {
      id: "demo_mod",
      name: "Demo",
      version: "1.2.3",
      creator: "me",
      supported: ["button"],
      description_file: "description.html",
      code_file: "code.js",
      styles: "styles.css",
      editor_file: "editor.yaml",
      ...info,
    },
  });
const listing = () => fs.readdirSync(root, { recursive: true, withFileTypes: false }).map(String).sort();
const definition = async () => (load((await buildModule(moduleDir)).yaml) as Record<string, any>).demo_mod;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "build-module-"));
  moduleDir = path.join(root, "modules", "demo_mod");
  write(
    "modules/helpers/math.js",
    "export function double(n) { return n * 2; }\nexport function unusedHelper() { return 'gone'; }\n",
  );
  write(
    "modules/demo_mod/code.js",
    [
      'import { double } from "../helpers/math.js";',
      "export function demo_mod(card, hass) {",
      "  card.dataset.result = `${this.config.demo_mod.label}:${double(hass.states.x)}:${typeof onTeardown}`;",
      "}",
    ].join("\n"),
  );
  write("modules/demo_mod/module.yaml", moduleYaml());
  write("modules/demo_mod/description.html", "  <p>Demo</p>\n");
  write("modules/demo_mod/styles.css", ".demo { color: red; }\n");
  write("modules/demo_mod/editor.yaml", "editor:\n  - name: label\n    selector:\n      text: {}\n");
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

describe("buildModule", () => {
  it("produces the Bubble Card module definition", async () => {
    const def = await definition();
    expect(def).toMatchObject({
      name: "Demo",
      version: "v1.2.3",
      creator: "me",
      link: "https://github.com/lsmarsden/bubble-card-modules/tree/main/demo_mod",
      supported: ["button"],
      description: "<p>Demo</p>",
      editor: [{ name: "label", selector: { text: {} } }],
    });
    expect(def.code).toMatch(/^\$\{\(\(\) => \{\n/);
    expect(def.code).toMatch(/\nreturn "";\n\}\)\(\)\}\n\n\.demo \{ color: red; \}$/);
  });

  it("keeps an explicit link and an editor without the editor: wrapper", async () => {
    write("modules/demo_mod/module.yaml", moduleYaml({ link: "https://example.com" }));
    write("modules/demo_mod/editor.yaml", "- name: label\n");
    const def = await definition();
    expect(def.link).toBe("https://example.com");
    expect(def.editor).toEqual([{ name: "label" }]);
  });

  it("bundles imported helpers, tree-shaking unused ones", async () => {
    const { code } = await definition();
    expect(code).toContain("function double(n)");
    expect(code).not.toContain("unusedHelper");
  });

  it("runs like Bubble Card runs it: this = card, scope names free", async () => {
    const { code } = await definition();
    const compiled = Function("hass", "card", "onTeardown", `return \`${code}\`;`);
    const card = { dataset: {} as Record<string, string> };
    const css = compiled.call({ config: { demo_mod: { label: "hi" } } }, { states: { x: 21 } }, card, () => {});

    expect(card.dataset.result).toBe("hi:42:function");
    expect(css).toBe("\n\n.demo { color: red; }");
  });

  it("writes nothing", async () => {
    const before = listing();
    await buildModule(moduleDir);
    expect(listing()).toEqual(before);
  });

  it.each([["{{"], ["{%"]])("rejects output containing %s, naming the line", async (marker) => {
    write("modules/demo_mod/code.js", `export function demo_mod(card) {\n  card.title = "a ${marker} b";\n}\n`);
    await expect(buildModule(moduleDir)).rejects.toThrow(
      new RegExp(
        `demo_mod: built code contains "\\${marker[0]}\\${marker[1]}" \\(line \\d+: card\\d*\\.title = "a \\${marker[0]}\\${marker[1]} b";\\)`,
      ),
    );
  });

  it.each([
    ["no module_info", "other: 1\n", /Missing module_info/],
    ["an invalid id", moduleYaml({ id: "Bad-Id" }), /Invalid or missing module ID/],
    ["an invalid version", moduleYaml({ version: "1.2" }), /Invalid or missing version for module demo_mod/],
    ["supported not a list", moduleYaml({ supported: "button" }), /Supported must be an array/],
    ["a missing file reference", moduleYaml({ code_file: "" }), /Missing code_file/],
  ])("rejects module.yaml with %s", async (_, content, error) => {
    write("modules/demo_mod/module.yaml", content);
    await expect(buildModule(moduleDir)).rejects.toThrow(error);
  });

  it("rejects code whose imports don't resolve", async () => {
    write(
      "modules/demo_mod/code.js",
      'import { nope } from "../helpers/missing.js";\nexport function demo_mod() { nope(); }\n',
    );
    await expect(buildModule(moduleDir)).rejects.toThrow(/Could not resolve "\.\.\/helpers\/missing\.js"/);
  });
});

describe("findModuleFolders", () => {
  it("lists folders that contain a module.yaml", async () => {
    write("modules/README.md", "");
    expect(await findModuleFolders(path.join(root, "modules"))).toEqual(["demo_mod"]);
  });
});
