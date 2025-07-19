# Changelog

### v1.5.0

<details><summary>See Changes</summary>

- Added support for timer entities as `source`. Timers will ignore custom `start` and `end` values.

</details>

### v1.4.1

<details><summary>See Changes</summary>

- Fixed issue where `start` and `end` values were not working with float values.

</details>

### v1.4.0

<details><summary>See Changes</summary>

- Added support for colours to be resolved using `var(--my-custom-variable)` in all ✨DER colour fields.

</details>

### v1.3.1

<details><summary>See Changes</summary>

- Use Bubble Card's automatic background colours when `background_color` is not set, instead of defaulting to
  `var(--bubble-icon-background-color)`.
  This fixes background colours based on entity states.

</details>

### v1.3.0

<details><summary>See Changes</summary>

- Removed `start_angle` configuration option, as it no longer makes sense with varying sizes.
  This will be superseded by a new option to offset the starting point in the future.
- Fixed border shape for buttons that are not always square/circular.

</details>

### v1.2.0

<details><summary>See Changes</summary>

- Added automatic border radius matching based on CSS variables (`--bubble-icon-border-radius`,
  `--bubble-border-radius`)
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
