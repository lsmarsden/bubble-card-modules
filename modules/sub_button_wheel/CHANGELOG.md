# Changelog

### v1.3.2

<details><summary>See Changes</summary>

- Fixed `fixed-position` ignoring each button's `position`: buttons were laid out in order, so gaps in the positions
  were closed up. A button now sits in the slot its `position` names (1 = top, then clockwise, up to 8). Thanks to
  @avano for reporting this and proposing a fix in
  [#14](https://github.com/lsmarsden/bubble-card-modules/pull/14).
- Fixed buttons without a `position` losing their automatic position (and order) in Home Assistant, which passes the
  configuration read-only.
- Fixed layouts and `close_on_click` applying to the wrong buttons, or the wheel failing to build, when a configured
  sub-button doesn't exist.

</details>

### v1.3.1

<details><summary>See Changes</summary>

- Fixed the hidden wheel overlay causing a horizontal page scroll when the card sits inside a transformed element
  ([#17](https://github.com/lsmarsden/bubble-card-modules/pull/17), thanks @finder39). The overlay still fades out when
  the wheel closes.

</details>

### v1.3.0

<details><summary>See Changes</summary>

- Added support for having multiple wheels in the same card. Each wheel can have its own configuration.

</details>

### v1.2.0

<details><summary>See Changes</summary>

- Added support for using main button as the wheel opener. Use `wheel_opener: "main"` to enable this feature.
- Existing tap actions will automatically be removed from the wheel opener button without manual configuration.

</details>

### v1.1.0

<details><summary>See Changes</summary>

- Added support for closing wheel when clicking sub buttons. This can be configured globally using `close_on_sub_button_click` or per button using `close_on_click`.
  Button configuration overrides the global setting.
- Fixed issue with `animation_delay` and `animation_duration` not being applied correctly when using values of 0 for instant display.

</details>
