# Bubble Card Custom Modules

A collection of custom modules built for [Bubble Card](https://github.com/Clooos/Bubble-Card), enhancing Home Assistant dashboards with additional functionality and new visualisations.

[![Buy me a coffee](https://img.shields.io/badge/Buy_me_a_coffee-yellow?logo=buymeacoffee&logoColor=darkred)](https://buymeacoffee.com/lsmarsden)

---

## Module Structure

Each module is organized inside its own folder in the `modules` directory.

- Each folder contains its own YAML, description, code, and editor files.
- Built modules are available in the `modules/module_id/dist` folder for manual installation.

## Installation

1. Install [Bubble Card](https://github.com/Clooos/Bubble-Card) in Home Assistant if you haven't already.
2. Have a look through the `modules` in this repo or the Module Store in the Bubble Card editor in Home Assistant to find a module you like.
3. Install modules via the Bubble Card module store. This way you get access to the latest features.

### Manual Installation

<details><summary>Instructions</summary>
Built modules are available in the <code>modules/module_id/dist</code> folder for manual installation.

Import the module yaml in the module store by using the 'Import from YAML' option, and paste the built
module inside.

</details>

## Contributing

Contributions are welcome!

- Open an issue to suggest features, improvements, or report bugs.
- Pull requests are welcome for fixes or enhancements.

If contributing to a module, please keep code clean and consistent with existing styles.

### Building Locally

This repository uses a simple build process to combine module parts (code.js, description.md, editor.yaml) into final module YAMLs.

To create a new module, run `npm run create-module` and follow the instructions. This will setup
a new template module in the `modules/module_id` folder.

To build locally just run:

```
npm install
npm run build
```

Each module will be built into its final `.yaml` file and stored in the `modules/module_id/dist` folder.

If you've created/edited a module in HA using the module editor to add great features, please consider
opening a PR to add it into this repo so that others can benefit too!

If you like these modules and want to help support further development, any donations
would really help allow me to dedicate more time to this project! All donations are greatly appreciated!

[![Buy me a coffee](https://img.shields.io/badge/Buy_me_a_coffee-yellow?logo=buymeacoffee&logoColor=darkred)](https://buymeacoffee.com/lsmarsden)
