# {{MODULE_NAME}}

[Features](#features) | [Examples](#example-yaml) | [Installation](#install-this-module) | [Contributing](#contributing)

[![Buy me a coffee](https://img.shields.io/badge/Buy_me_a_coffee-yellow?logo=buymeacoffee&logoColor=darkred)](https://buymeacoffee.com/lsmarsden)

---

![{{MAIN_IMAGE}}](assets/{{MAIN_IMAGE}})

**ADD SUMMARY HERE**

> See the [examples](#example-yaml) for different styling options.
>
> ### Supported cards:
>
> {{SUPPORTED_CARDS}}

## Features

[Config Options](#configuration-options)

---

- **Add features here**

### Configuration Options

- `config_option` - **Add options here**

## Example YAML

  <details>
    <summary><strong>Please add at least one example!</strong></summary>
    <p>Some example:</p>

```yaml
type: custom:bubble-card
card_type:
modules:
  - ${{MODULE_ID}}
${{MODULE_ID}}:
```

  </details>

## Install this module

1. Install [Bubble Card](https://github.com/Clooos/Bubble-Card) in Home Assistant if you haven't already.
2. Install this module via the Bubble Card module store by searching for `{{MODULE_NAME}}`. This way you get access to
   the latest features.

That's all!

<details><summary><strong>Manual Installation</strong></summary>

Built modules are available in the `modules/{{MODULE_ID}}/dist/` folder for manual installation.

To install the built YAML directly, go to the module store and use the 'Import from YAML' option, then paste the built
module inside.

</details>

## Contributing

Contributions are welcome!

- Open an issue to suggest features, improvements, or report bugs (or comment on the module store discussion).
- Pull requests are welcome for fixes or enhancements.

If contributing to a module, please keep code clean and consistent with existing styles.

### Building Locally

This repository uses a simple build process to combine module parts (code.js, description.md, editor.yaml) into final
module YAMLs.

To create a new module, run `npm run create-module` and follow the instructions. This will setup
a new template module in the `modules/module_id` folder.

To build locally just run:

```
npm install
npm run build
```

Each module will be built into its final `.yaml` file and stored in the `modules/module_id/dist` folder.

If you've edited this module in HA using the module editor to add great features, **please consider
opening a PR** to add it into this module so that others can benefit too!

### Support

If you like this module and want to help support further development, any donations
would really help allow me to dedicate more time to this project! All donations are greatly appreciated!

[![Buy me a coffee](https://img.shields.io/badge/Buy_me_a_coffee-yellow?logo=buymeacoffee&logoColor=darkred)](https://buymeacoffee.com/lsmarsden)
