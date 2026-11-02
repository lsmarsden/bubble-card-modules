/**
 * @jest-environment node
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { changelogEntries, planReleases, releaseNotes } from "../releasePlan";

const changelog = `# Changelog

### v1.2.0

<details><summary>See Changes</summary>

- Added a thing.
- Changed another
  over two lines.

</details>

### v1.1.1

<details><summary>See Changes</summary>

- Fixed a bug.

</details>

### v1.1.0

<details>
<summary>See Changes</summary>

- Older change.

</details>
`;

describe("changelogEntries", () => {
  it("reads every version newest first, without the details wrapper", () => {
    expect(changelogEntries(changelog)).toEqual([
      { version: "1.2.0", body: "- Added a thing.\n- Changed another\n  over two lines." },
      { version: "1.1.1", body: "- Fixed a bug." },
      { version: "1.1.0", body: "- Older change." },
    ]);
  });
});

describe("releaseNotes", () => {
  it("returns just the version's entry when the previous version was published", () => {
    expect(releaseNotes(changelog, "1.2.0", ["1.1.1", "1.1.0"])).toBe(
      "- Added a thing.\n- Changed another\n  over two lines.",
    );
  });

  it("includes every unpublished version back to the last published one, with headings", () => {
    expect(releaseNotes(changelog, "1.2.0", ["1.1.0"])).toBe(
      "### v1.2.0\n\n- Added a thing.\n- Changed another\n  over two lines.\n\n### v1.1.1\n\n- Fixed a bug.",
    );
  });

  it("returns only the version's entry for a module never published", () => {
    expect(releaseNotes(changelog, "1.1.1")).toBe("- Fixed a bug.");
  });

  it.each([
    ["a missing version", changelog, "9.9.9", /no "### v9\.9\.9" entry/],
    ["a version that is a prefix of another", changelog, "1.2", /no "### v1\.2" entry/],
    [
      "an empty entry",
      changelog.replace("# Changelog\n", "# Changelog\n\n### v2.0.0\n\n<details><summary>x</summary>\n</details>\n"),
      "2.0.0",
      /"### v2\.0\.0" is empty/,
    ],
  ])("rejects %s", (_, text, version, error) => {
    expect(() => releaseNotes(text, version, ["1.1.0"])).toThrow(error);
  });
});

describe("planReleases", () => {
  let modulesDir: string;
  const addModule = (id: string, version: string, log: string) => {
    const dir = path.join(modulesDir, id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "module.yaml"),
      `module_info:\n  id: ${id}\n  name: ${id.toUpperCase()}\n  version: ${version}\n`,
    );
    fs.writeFileSync(path.join(dir, "CHANGELOG.md"), log);
  };

  beforeEach(() => {
    modulesDir = fs.mkdtempSync(path.join(os.tmpdir(), "release-plan-"));
    addModule("alpha", "1.2.0", changelog);
    addModule("beta", "1.1.0", changelog);
    fs.mkdirSync(path.join(modulesDir, "helpers"));
  });
  afterEach(() => fs.rmSync(modulesDir, { recursive: true, force: true }));

  it("plans only versions without a published tag, with notes since the last release", async () => {
    const plan = await planReleases(modulesDir, ["alpha/v1.1.0", "beta/v1.1.0", "other/v1.2.0"]);
    expect(plan).toEqual([
      {
        folder: "alpha",
        id: "alpha",
        version: "1.2.0",
        tag: "alpha/v1.2.0",
        title: "ALPHA v1.2.0",
        asset: path.join(modulesDir, "alpha", "dist", "alpha.yaml"),
        notes: releaseNotes(changelog, "1.2.0", ["1.1.0"]),
      },
    ]);
  });

  it("plans nothing when every version is published", async () => {
    expect(await planReleases(modulesDir, ["alpha/v1.2.0", "beta/v1.1.0"])).toEqual([]);
  });
});
