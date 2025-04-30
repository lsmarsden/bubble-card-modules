# Contributing to Bubble Card Modules

Thank you for your interest in contributing!

This project enables users to create and share custom modules for [Bubble Card](https://github.com/Clooos/Bubble-Card) in Home Assistant. The repository includes a small build pipeline to assist with authoring and managing modules, featuring code splitting, auto-generation of documentation, and GitHub Releases.

## Requirements

- Node.js 16+
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

Each module will be built into its final `.yaml` file and saved in the `modules/module_id/dist` folder. This build step will also generate documentation files, including `modules/module_id/dist/SHARE_MODULE.md`, which can be used to share the module on the [Bubble Card community discussions](https://github.com/Clooos/Bubble-Card/discussions/categories/share-your-modules).

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

Each module has a `dist/` folder created during the build, containing the final `.yaml` file used in Home Assistant.
