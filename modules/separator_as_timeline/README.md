# Separator as Timeline

[Features](#features) | [Examples](#example-yaml) | [Installation](#install-this-module) | [Contributing](#contributing)

[![Buy me a coffee](https://img.shields.io/badge/Buy_me_a_coffee-yellow?logo=buymeacoffee&logoColor=darkred)](https://buymeacoffee.com/lsmarsden)

---

![TimelineUse.gif](assets/TimelineUse.gif)

Transform any separator into a visual time-aware timeline.  
This module displays time blocks along the bar using flexible ranges, icons, labels, active indicators, and more.  
Use it for schedules, quiet hours, cleaning periods, charging windows - or anything time-related.

> See the [examples](#example-yaml) for different styling options.
>
> ### Supported cards:
>
> - Separator

## Features

[Config Options](#configuration-options)

---

- Multiple time ranges with `start`/`end` time or entity
- Wraparound time support (e.g. `22:00 → 06:00`)
- Per-range labels and icons (with highlight when active)
- Grouped ranges share highlighting and tooltips by label
- Dynamic entity or attribute-based times (including `sensor`/`time`)
- Tooltip on hover with range label and time
- Optional tick marks at standard intervals (0:00, 6:00, etc.)
- Current time marker with color customization
- Rounded or flat segment edges (with logic for midnight cutoffs)
- Global or per-range styling for icon color, background, outline, glow
- Supports ISO 8601 timestamps and optional local timezone conversion

### Configuration Options

- `show_time_ticks` – Show tick marks under the timeline
- `show_current_time` – Show current time marker
- `marker_color` – Color of current time marker
- `highlight_active` – Highlight icon when time is active
- `rounded_edges` – Enable rounded ends (except at midnight)
- `convert_to_local` – Convert ISO timestamps to local time
- `icon_color`, `icon_background_color`, `icon_outline_color`, `icon_active_color` – Style per range or globally

## Example YAML

---

  <details>
    <summary><strong>Using entities or static times</strong></summary>
    <p>Mix entity-based and static times with individual labels/icons.</p>

    type: custom:bubble-card
    card_type: separator
    modules:
      - default
      - separator_as_timeline
    separator_as_timeline:
      show_time_ticks: true
      show_current_time: true
      highlight_active: true
      marker_color: blue
      ranges:
        "0":
          start_entity: time.bedtime_start
          end_entity: time.bedtime_end
          label: Bedtime
          color: indigo
          icon: mdi:bed
        "1":
          start: "08:00"
          end: "09:00"
          label: Breakfast
          color: orange
          icon: mdi:coffee
    name: Day Schedule
    icon: mdi:calendar-clock
    grid_options:
      columns: full

  </details>

  <details>
    <summary><strong>Full Timestamp with Timezone Conversion</strong></summary>

    type: custom:bubble-card
    card_type: separator
    modules:
      - default
      - separator_as_timeline
    separator_as_timeline:
      convert_to_local: true
      show_current_time: true
      marker_color: red
      ranges:
        "0":
          start: "2025-04-26T02:00:00+00:00"
          end: "2025-04-26T04:30:00+00:00"
          label: Remote Job
          color: blue
          icon: mdi:laptop
    name: Remote Work
    icon: mdi:cloud

  </details>

  <details>
    <summary><strong>Global Icon Styling with Overrides</strong></summary>

    type: custom:bubble-card
    card_type: separator
    modules:
      - default
      - separator_as_timeline
    separator_as_timeline:
      icon_color: grey
      icon_background_color: transparent
      icon_outline_color: teal
      icon_active_color: yellow
      show_time_ticks: true
      highlight_active: true
      ranges:
        "0":
          start: "12:00"
          end: "13:00"
          label: Lunch
          color: green
          icon: mdi:silverware
        "1":
          start: "17:00"
          end: "17:30"
          label: Gym
          color: red
          icon: mdi:weight-lifter
          icon_color: red
          icon_background_color: black
    name: Daily Activities
    icon: mdi:timeline-check-outline

  </details>

  <details>
    <summary><strong>Grouped Segments with Shared Label</strong></summary>
    <p>Hovering over a segment highlights all segments with the same <code>label</code>, regardless of icon or color.</p>

    type: custom:bubble-card
    card_type: separator
    modules:
      - default
      - separator_as_timeline
    separator_as_timeline:
      highlight_active: true
      marker_color: "#333333"
      show_current_time: true
      show_time_ticks: true
      rounded_edges: true
      ranges:
        "0":
          start: "09:00"
          end: "09:30"
          label: Travel
          color: teal
          icon: mdi:bike
        "1":
          start: "17:00"
          end: "17:45"
          label: Travel
          color: orange
          icon: mdi:train
          icon_color: red
    name: Travel Blocks
    icon: mdi:map-clock-outline

  </details>

  <details>
    <summary><strong>Minimal Styling with Flat Edges</strong></summary>

    type: custom:bubble-card
    card_type: separator
    modules:
      - default
      - separator_as_timeline
    separator_as_timeline:
      show_time_ticks: false
      show_current_time: false
      rounded_edges: false
      ranges:
        "0":
          start: "01:00"
          end: "03:00"
          label: Task
          color: red
        "1":
          start: "10:30"
          end: "12:00"
          label: Task
          color: green
    name: Flat Layout
    icon: mdi:timeline

  </details>

## Install this module

---

1. Install [Bubble Card](https://github.com/Clooos/Bubble-Card) in Home Assistant if you haven't already.
2. Install this module via the Bubble Card module store by searching for `Separator as Timeline`. This way you get access to the latest updates and features.

That's all!

<details><summary><strong>Manual Installation</strong></summary>

Built modules are available in the `modules/separator_as_timeline/dist/` folder for manual installation.

To install the built YAML directly, go to the module store and use the 'Import from YAML' option, then paste the built
module inside.

</details>

## Contributing

---

Contributions are welcome!

- Open an issue to suggest features, improvements, or report bugs (or comment on the module store discussion).
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

If you've edited this module in HA using the module editor to add great features, **please consider
opening a PR** to add it into this module so that others can benefit too!

### Support

If you like this module and want to help support further development, any donations
would really help allow me to dedicate more time to this project! All donations are greatly appreciated!

[![Buy me a coffee](https://img.shields.io/badge/Buy_me_a_coffee-yellow?logo=buymeacoffee&logoColor=darkred)](https://buymeacoffee.com/lsmarsden)
