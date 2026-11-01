# Changelog

### v1.7.3

<details><summary>See Changes</summary>

- Faster pop-ups and dashboards: on style passes where nothing the border depends on changed (progress, colours,
  conditions, button size and shape), the module no longer redraws it. Uses Bubble Card's `hasChanged` on v3.3.0+, and
  the same check stored on the card on older versions. Entities are still read on every pass, so the card keeps
  updating when they change, and timer progress keeps ticking.
- The border, background and effect classes are redrawn if something else removes or overwrites them.

</details>

### v1.7.2

<details><summary>See Changes</summary>

- Fixed `exists` conditions always passing. They now fail when the entity (or attribute) doesn't exist.

</details>

### v1.7.1

<details><summary>See Changes</summary>

- Fixed timer progress briefly reverting to a previous configuration's colours after a condition switched configurations
  (or to a previous timer after the source changed).
- Timer updates now stop when Bubble Card rebuilds or removes the card (e.g. each time a pop-up opens), instead of
  running in the background. Uses Bubble Card's `onTeardown` on v3.3.0+, and stops automatically on older versions.

</details>

### v1.7.0

<details><summary>See Changes</summary>

- Added ability to define multiple configurations for the same button.
Define separate configuration blocks with conditions, and the configuration matching the condition will be used.
If multiple configurations match, the first one in the list will be used.
</details>

### v1.6.0

<details><summary>See Changes</summary>

- Added ability to invert progress using `invert: true`.

</details>

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
