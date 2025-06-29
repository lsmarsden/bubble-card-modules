# Changelog

### v1.2.0

<details><summary>See Changes</summary>

- Added automatic border radius matching based on CSS variables (`--bubble-icon-border-radius`, `--bubble-border-radius`)
- Added support for custom border radius per button using `border_radius` configuration option
- Added support for custom start angle per button using `start_angle` configuration option

</details>

### v1.1.0

<details><summary>See Changes</summary>

- Added support for `background_color` and `remaining_color` YAML fields in place of `backcolor` and `remainingcolor`.
  Old values will still work, but new fields will take priority.
- Fixed editor missing `remaining_color` options.

</details>

### v1.0.2

<details><summary>See Changes</summary>

- Fixed issue with code referring to `source` field as `entity`. Kept
  backwards compatibility with `entity`, but `source` is the correct value and will be provided by the editor.
- Updated README examples to match `source` usage.

</details>
