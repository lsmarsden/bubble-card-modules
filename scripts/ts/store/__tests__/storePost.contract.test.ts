/**
 * @jest-environment node
 */
// Runs every module's store post through Bubble Card's own store parser (vendored in scripts/ts/upstream/bubble-card,
// see VERSION there), so a post that builds is a post the store reads as intended.
import path from "node:path";
import { load } from "js-yaml";
import storeYaml from "store-js-yaml";
import { parseDiscussionsREST } from "../../upstream/bubble-card/parser.js";
import { _compareVersions, getAvailableCardTypes } from "../../upstream/bubble-card/store-shim.js";
import { type BuiltModule, buildModule, findModuleFolders } from "../../build/buildModule";
import { modulesDir } from "../../paths";
import { findLivePost } from "../storeListing";
import { CARD_NAMES, assetUrl, releaseTag, renderStorePost } from "../storePost";

const folders = await findModuleFolders(modulesDir);
const modules: Record<string, BuiltModule> = Object.fromEntries(
  await Promise.all(folders.map(async (folder) => [folder, await buildModule(path.join(modulesDir, folder))])),
);

// What GET /repos/Clooos/Bubble-Card/discussions returns for the post, as far as the store reads it.
const asDiscussion = (body: string) => ({
  number: 1,
  node_id: "D_1",
  title: "[JS+Editor Module] Title the store ignores",
  html_url: "https://github.com/Clooos/Bubble-Card/discussions/1",
  body,
  user: { login: "lsmarsden" },
  category: { name: "Share your Modules" },
});

it("knows the card types Bubble Card has", () => {
  expect(CARD_NAMES).toEqual(Object.fromEntries(getAvailableCardTypes().map((card) => [card.id, card.name])));
});

describe.each(folders)("the store post for %s", (folder) => {
  const module = modules[folder];
  const definition = () => (load(module.yaml) as Record<string, Record<string, unknown>>)[module.id];
  const parse = () => {
    const parsed = parseDiscussionsREST([asDiscussion(renderStorePost(module))]);
    expect(parsed).toHaveLength(1);
    return parsed[0];
  };

  it("is read as this module, with its name, version, creator and supported cards", () => {
    expect(parse()).toMatchObject({
      id: module.id,
      name: module.info.name,
      version: `v${module.info.version}`,
      creator: module.info.creator,
      supportedCards: module.info.supported,
      unsupportedCards: [],
    });
  });

  it("gives the store the description from the module", () => {
    expect(parse().description).toBe(definition().description);
  });

  it("installs exactly the built module", () => {
    const { yamlContent } = parse();
    expect(yamlContent).toBe(module.yaml.trim());
    // The store reads it with its own js-yaml, which must see what our build wrote.
    expect(storeYaml.load(yamlContent!)).toEqual(load(module.yaml));
  });

  it("previews the first screenshot at the release tag", () => {
    const [first] = module.info.screenshots ?? [];
    expect(first).toBeDefined();
    expect(parse().imageUrl).toBe(assetUrl(module.folder, releaseTag(module.id, module.info.version), first.file));
  });

  it("is found again as this module's live post once published", () => {
    const body = renderStorePost(module);
    expect(findLivePost([asDiscussion(body)], module.id, module.info.creator)).toMatchObject({
      version: `v${module.info.version}`,
      body,
    });
  });

  it("shows as an update to the previous version", () => {
    const [major, minor, patch] = module.info.version.split(".").map(Number);
    const previous = patch > 0 ? `${major}.${minor}.${patch - 1}` : minor > 0 ? `${major}.${minor - 1}.0` : "0.0.0";
    expect(_compareVersions(parse().version, `v${previous}`)).toBe(1);
    expect(_compareVersions(parse().version, `v${module.info.version}`)).toBe(0);
  });
});
