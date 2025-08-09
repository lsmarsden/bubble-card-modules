# Changelog

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
