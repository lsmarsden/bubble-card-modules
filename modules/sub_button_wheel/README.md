# Sub Button Wheel

[Features](#features) | [Dynamic Entity Resolution](#dynamic-entity-resolution-der) | [Examples](#example-yaml) | [Installation](#install-this-module) | [Contributing](#contributing)

[![Buy me a coffee](https://img.shields.io/badge/Buy_me_a_coffee-yellow?logo=buymeacoffee&logoColor=darkred)](https://buymeacoffee.com/lsmarsden)

---

![quickAction.gif](assets/Quick%20Action%20Wheel.gif)

Transform your bubble card sub-buttons into quick-action wheels with customisable layouts and animations.

> See the [examples](#example-yaml) for different styling options.
>
> ### Supported cards
>
> - button
> - climate
> - cover
> - separator
> - calendar
> - media-player
> - select

## Features

[Config Options](#configuration-options)

---

- **Multiple layout styles**: Various layout styles to display button configurations in circles or arcs
- **Smooth animations**: Animation options to customise wheel opening aesthetic
- **Flexible positioning**: Manual button positioning or automatic distribution
- **Respects existing styling**: Works with other modules and sub-button styling
- **Up to 8 buttons**: Supports organizing up to 8 sub-buttons in various arrangements
- **Customizable timing**: Configurable animation delays and durations
- **Outside click to close**: Click anywhere outside the wheel to dismiss

### Layout Options

- **Even Circle**: Buttons evenly distributed around a circle
- **Progressive Arc**: Dramatic arc with alternating left/right placement (up to 7 buttons)
- **Compact Arc**: Tighter arc with alternating left/right placement (up to 7 buttons)
- **Fixed Position**: Uses standard 8-button template positions
- **Double Ring**: Two concentric rings of buttons (configurable inner button count)
- **Smart Adaptive**: Automatically chooses the best layout based on button count

### Configuration Options

See [CONFIG_OPTIONS.md](CONFIG_OPTIONS.md) for a full list of options.

## Dynamic Entity Resolution (DER)

Dynamic Entity Resolution is available in certain fields.

To use DER, look for any input field that contains ✨ in the editor label. This means you can now use:

- Simple values e.g. `red`
- Entities e.g. `input_text.my_favourite_color` or `sensor.sun_next_dawn`
- Attributes using format `entity[attribute]`, such as `sensor.my_phone[battery_level]`

**Example editor with DER fields:**

![DER_inputs](../templates/assets/DER%20inputs.png)

## Example YAML

  <details>
    <summary><strong>Basic wheel with even circle layout</strong></summary>

```yaml
type: custom:bubble-card
card_type: button
button_type: state
entity: light.living_room_main
icon: mdi:lightbulb
name: Living Room Lights
sub_button:
  - icon: mdi:brightness-1
    entity: light.living_room_lamp1
  - icon: mdi:brightness-2
    entity: light.living_room_lamp2
  - icon: mdi:brightness-3
    entity: light.living_room_lamp3
  - icon: mdi:brightness-4
    entity: light.living_room_lamp4
  - icon: mdi:sofa
    entity: light.living_room_main
    tap_action:
      action: none
modules:
  - sub_button_wheel
sub_button_wheel:
  wheel_opener: "5"
  layout_options:
    wheel_layout: even-circle
  wheel_buttons:
    - sub_button: "1"
    - sub_button: "2"
    - sub_button: "3"
    - sub_button: "4"
```

  </details>

  <details>
    <summary><strong>Entertainment center with progressive arc layout</strong></summary>

```yaml
type: custom:bubble-card
card_type: button
button_type: state
entity: media_player.living_room_tv
icon: mdi:television
name: Entertainment
sub_button:
  - icon: mdi:netflix
    entity: script.netflix
  - icon: mdi:youtube
    entity: script.youtube
  - icon: mdi:spotify
    entity: script.spotify
  - icon: mdi:gamepad-variant
    entity: script.gaming_mode
  - icon: mdi:movie-open
    entity: script.movie_mode
  - icon: mdi:volume-high
    entity: script.party_mode
modules:
  - sub_button_wheel
sub_button_wheel:
  wheel_opener: "main"
  layout_options:
    wheel_layout: "progressive-arc"
  animation_options:
    wheel_animation: "staggered-scale"
    animation_delay: 0.2
    animation_duration: 0.8
  wheel_buttons:
    - sub_button: "1"
    - sub_button: "2"
    - sub_button: "3"
    - sub_button: "4"
    - sub_button: "5"
    - sub_button: "6"
```

  </details>

  <details>
    <summary><strong>Smart home control with double ring layout</strong></summary>

```yaml
type: custom:bubble-card
card_type: button
button_type: state
entity: switch.home_automation
icon: mdi:home-automation
name: Smart Home
sub_button:
  - icon: mdi:lightbulb
    entity: light.kitchen_lights
  - icon: mdi:fan
    entity: fan.living_room_fan
  - icon: mdi:power-plug
    entity: switch.coffee_maker
  - icon: mdi:speaker
    entity: media_player.kitchen_speaker
  - icon: mdi:thermometer
    entity: sensor.living_room_temperature
    tap_action:
      action: more-info
  - icon: mdi:water-pump
    entity: switch.irrigation_system
  - icon: mdi:security
    entity: alarm_control_panel.home_security
  - icon: mdi:dots-circle
    entity: alarm_control_panel.home_security
    tap_action:
      action: none
modules:
  - sub_button_wheel
sub_button_wheel:
  wheel_opener: 8
  layout_options:
    wheel_layout: double-ring
    double_ring_inner_count: 3
  animation_options:
    wheel_animation: staggered-scale
    animation_delay: 0.1
    animation_duration: 0.3
  wheel_buttons:
    - sub_button: "1"
    - sub_button: "2"
    - sub_button: "3"
    - sub_button: "4"
    - sub_button: "5"
    - sub_button: "6"
    - sub_button: "7"
```

  </details>

  <details>
    <summary><strong>Custom button positioning with fixed positions</strong></summary>

```yaml
type: custom:bubble-card
card_type: button
button_type: state
entity: switch.security_system
icon: mdi:shield-home
name: Security
sub_button:
  - icon: mdi:door-open
    entity: binary_sensor.front_door
  - icon: mdi:window-open
    entity: binary_sensor.living_room_window
  - icon: mdi:cctv
    entity: camera.front_yard
  - icon: mdi:alarm-light
    entity: switch.alarm_lights
modules:
  - sub_button_wheel
sub_button_wheel:
  wheel_opener: "main"
  layout_options:
    wheel_layout: "fixed-position"
  wheel_buttons:
    - sub_button: "1"
      position: 1
    - sub_button: "2"
      position: 3
    - sub_button: "3"
      position: 4
    - sub_button: "4"
      position: 2
```

  </details>

## Install this module

1. Install [Bubble Card](https://github.com/Clooos/Bubble-Card) in Home Assistant if you haven't already.
2. Install this module via the Bubble Card module store by searching for `sub button wheel`. This way you get access to
   the latest features.

That's all!

<details><summary><strong>Manual Installation</strong></summary>

Built modules are available in the `modules/sub_button_wheel/dist/` folder for manual installation.

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
