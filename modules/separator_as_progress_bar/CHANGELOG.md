# Changelog

### v1.2.1

<details><summary>See Changes</summary>

- Fixed `exists` conditions always passing. They now fail when the entity (or attribute) doesn't exist.

</details>

### v1.2.0

<details><summary>See Changes</summary>

- Added custom progress ranges with `start` and `end` (numbers or entities), matching `icon_border_progress`.
- Added support for `timer` entities as `source`; progress updates every second while the timer is active.
- Changed: values outside the range are now clamped (e.g. 150% shows a full bar). Previously they showed an empty bar.
- Changed: with `invert: true`, colour stops now follow the displayed (inverted) progress, matching `icon_border_progress`.
- Fixed `override: 0` being ignored.

</details>

### v1.1.1

<details><summary>See Changes</summary>

- [Issue #9](https://github.com/lsmarsden/bubble-card-modules/issues/9): Fixed default formatting of numeric states in text templates to default to 2 decimal places.

</details>

### v1.1.0

<details><summary>See Changes</summary>

- Added support for colours to be resolved using `var(--my-custom-variable)` in all ✨DER colour fields.

</details>

### v1.0.2

<details><summary>See Changes</summary>

- Fixed issue with orbs/shine not being removed when conditions become false.

</details>
