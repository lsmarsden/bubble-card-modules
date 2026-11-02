# Contributing to Bubble Card Modules

Thank you for your interest in contributing!

This project enables users to create and share custom modules for [Bubble Card](https://github.com/Clooos/Bubble-Card) in Home Assistant. The repository includes a small build pipeline to assist with authoring and managing modules, featuring code splitting, auto-generation of documentation, and GitHub Releases.

## Requirements

- Node.js 22+ (CI and releases use the version in `.nvmrc`, currently 26)
- Python 3.7+ (for schema documentation generation)
- Run `pip install -r requirements.txt` to install the required Python packages
- Run `npm install` to install the required Node packages

## Building and Generating Docs

### Creating a New Module

To create a new module, run `npm run create-module` and follow the prompts. This will set up a new template module in the `modules/module_id` folder.

To build locally, run:

```
npm install
npm run build
```

This process will:

- Compile all module components (code, styles, etc.) into a single `.yaml` output file.
- Run the Python-based schema documentation generator ([json-schema-for-humans](https://github.com/coveooss/json-schema-for-humans)) to create `CONFIG_OPTIONS.md` for each module.

Each module will be built into its final `.yaml` file and saved in the `modules/module_id/dist` folder, next to
`STORE_POST.md`: the module's post for the [module store](#-module-store).

Each module must include a `schema.yaml` file describing the configuration schema. This schema is used for validation and to generate the `CONFIG_OPTIONS.md` documentation during the build process.

## 🧱 Project Structure

Each module resides in its own folder under `modules/<module_id>`. A module consists of several files:

- `code.js`: main JavaScript logic
- `styles.css`: optional styles
- `editor.yaml`: configuration for the visual editor
- `description.html`: short module description (used in the store)
- `schema.yaml`: configuration schema used for validation and documentation
- `README.md`: detailed technical usage documentation
- `config_options.md`: auto-generated configuration documentation
- `module.yaml`: id, name, version, supported cards, and `screenshots` (images under the module folder for its store
  post; the first is the store's preview image)

Each module has a `dist/` folder created during the build, containing the final `.yaml` file used in Home Assistant.

## 🚀 Releasing

CI (`.github/workflows/ci.yml`) runs on every pull request: formatting, script type checks, all tests (each module
suite runs against both the source and the built module YAML), and the build.

Releases are automatic. On every push to `main`, `.github/workflows/release.yaml` runs CI again, then publishes a
GitHub release for each module whose `module.yaml` version has no release yet (tag `<module_id>/v<version>`), with
the built YAML attached. To release a module:

1. Bump `version` in `modules/<module_id>/module.yaml` (semver).
2. Add a `### v<version>` entry at the top of `modules/<module_id>/CHANGELOG.md`. The release fails without one.
3. Merge to `main`.

Release notes are the CHANGELOG entries since the module's last release, so versions bumped in between (and never
released on their own) are included.

## 🧩 Module store

Bubble Card's module store lists the posts in the
[Share your Modules](https://github.com/Clooos/Bubble-Card/discussions/categories/share-your-modules) discussion
category and installs the first module YAML block of each post exactly as written. `scripts/ts/store/storePost.ts`
renders each module's post from the built module (`dist/STORE_POST.md`); its images link to the module's release tag,
so a post is only valid once that version is released.

`scripts/ts/store/__tests__/storePost.contract.test.ts` runs every post through Bubble Card's own store parser, vendored
in `testing/upstream/bubble-card` (see `VERSION` there). To move to a newer Bubble Card release, clone it and run
`npx tsx scripts/ts/upstream/vendorStoreParser.ts <checkout>`.

Publishing the posts is still manual: copy `dist/STORE_POST.md` over the module's discussion post after its release.

## 🤖 Automation

- **Dependabot** opens update pull requests for npm (weekly) and GitHub Actions (monthly). Once CI passes, `ci.yml`
  merges minor and patch updates automatically; major updates wait for review.
- **Labels**: pull requests are labelled by the files they change (`module:*`, `type:testing`, `type:documentation`).
- **Stale issues and pull requests**: see [.github/ISSUE_MANAGEMENT.md](.github/ISSUE_MANAGEMENT.md#stale-issues-and-pull-requests).
