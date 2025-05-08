# Changelog

### v1.4.0

<details><summary>See Changes</summary>

#### Added ~~AI~~ **Dynamic Entity Resolution** (DER)

To use DER, look for any input field that contains ✨ in the editor label. This means you can now use:
- Simple values e.g. `red`
- Entities e.g. `input_text.my_favourite_color` or `sensor.sun_next_dawn`
- Attributes using format `entity[attribute]`, such as `sensor.my_phone[battery_level]`

</details>

### v1.3.0

<details><summary>See Changes</summary>

- Added `icon_size` and `icon_image_size` options to configure icon total size and icon image size. These can be configured in any `icon_settings` block. Icon-level settings will override the global icon settings.

The default total icon size is 18px, and the default icon image size is 16px.


<details><summary>Deprecated Fields</summary>

Old schema settings are still valid to allow backwards compatibility but will be removed in a future release. Making changes to values via the editor
will add the new schema fields instead. These new schema fields will take priority over any existing deprecated fields.

**Deprecated icon settings:** 

- `icon_color`
- `icon_background_color`
- `icon_outline_color`
- `icon_active_color`
- `ranges[*].icon_color`
- `ranges[*].icon_background_color`
- `ranges[*].icon_outline_color`
- `ranges[*].icon_active_color`

These settings have been replaced by:

- `icon_settings.icon_color`
- `icon_settings.icon_background_color`
- `icon_settings.icon_outline_color`
- `icon_settings.icon_active_color`
- `ranges[*].icon_settings.icon_color`
- `ranges[*].icon_settings.icon_background_color`
- `ranges[*].icon_settings.icon_outline_color`
- `ranges[*].icon_settings.icon_active_color`

**Deprecated time format settings:**

- `time_format.use_24_hour`
- `time_format.append_suffix`
- `time_format.pad_hours`
- `time_format.show_minutes`

These settings have been replaced by:

- `time_format.global_settings.use_24_hour`
- `time_format.global_settings.append_suffix`
- `time_format.global_settings.pad_hours`
- `time_format.global_settings.show_minutes`

</details>
</details>

### v1.2.0

<details><summary>See Changes</summary>

- Add support for customising time display format globally, in the timeline, and in the tooltip.
  Customisation is now available for:
  - 12-hour or 24-hour time format
  - Padding hours (e.g. 5:00/05:00)
  - Showing AM/PM
  - Showing/hiding minutes (e.g. 5PM/5:00PM)

_Thanks to [@gandhiarpit](https://github.com/gandhiarpit) for suggesting these improvements!_

</details>

### v1.1.0

<details><summary>See Changes</summary>

- Now supports numeric (minutes-since-midnight), HH:MM, and full ISO datetime formats
- Added new field `source_entities` for optional tooltip info
- Improved clarity of form field names and descriptions in UI editor
- Minor formatting cleanup and consistent code style

_Thanks to [@Jaw818](https://github.com/Jaw818) for contributing these improvements!_

</details>
