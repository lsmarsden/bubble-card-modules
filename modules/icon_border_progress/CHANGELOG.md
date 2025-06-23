# Changelog

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
