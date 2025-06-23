# `separator_as_timeline`

- [1. Property `icon_color`](#1-property-icon_color)
- [2. Property `icon_background_color`](#2-property-icon_background_color)
- [3. Property `icon_size`](#3-property-icon_size)
- [4. Property `icon_image_size`](#4-property-icon_image_size)
- [5. Property `icon_outline_color`](#5-property-icon_outline_color)
- [6. Property `icon_active_color`](#6-property-icon_active_color)
- [7. Property `rounded_edges`](#7-property-rounded_edges)
- [8. Property `show_time_ticks`](#8-property-show_time_ticks)
- [9. Property `show_current_time`](#9-property-show_current_time)
- [10. Property `marker_color`](#10-property-marker_color)
- [11. Property `highlight_active`](#11-property-highlight_active)
- [12. Property `icon_settings`](#12-property-icon_settings)
  - [12.1. Property `icon_color`](#121-property-icon_color)
  - [12.2. Property `icon_background_color`](#122-property-icon_background_color)
  - [12.3. Property `icon_size`](#123-property-icon_size)
  - [12.4. Property `icon_image_size`](#124-property-icon_image_size)
  - [12.5. Property `icon_outline_color`](#125-property-icon_outline_color)
  - [12.6. Property `icon_active_color`](#126-property-icon_active_color)
- [13. Property `time_format`](#13-property-time_format)
  - [13.1. Property `global_settings`](#131-property-global_settings)
    - [13.1.1. Property `use_24_hour`](#1311-property-use_24_hour)
    - [13.1.2. Property `append_suffix`](#1312-property-append_suffix)
    - [13.1.3. Property `pad_hours`](#1313-property-pad_hours)
    - [13.1.4. Property `show_minutes`](#1314-property-show_minutes)
  - [13.2. Property `timeline`](#132-property-timeline)
    - [13.2.1. Property `use_24_hour`](#1321-property-use_24_hour)
    - [13.2.2. Property `append_suffix`](#1322-property-append_suffix)
    - [13.2.3. Property `pad_hours`](#1323-property-pad_hours)
    - [13.2.4. Property `show_minutes`](#1324-property-show_minutes)
    - [13.2.5. Property `override`](#1325-property-override)
  - [13.3. Property `tooltip`](#133-property-tooltip)
    - [13.3.1. Property `use_24_hour`](#1331-property-use_24_hour)
    - [13.3.2. Property `append_suffix`](#1332-property-append_suffix)
    - [13.3.3. Property `pad_hours`](#1333-property-pad_hours)
    - [13.3.4. Property `show_minutes`](#1334-property-show_minutes)
    - [13.3.5. Property `override`](#1335-property-override)
- [14. Property `ranges`](#14-property-ranges)
  - [14.1. Property `Array of range`](#141-property-array-of-range)
    - [14.1.1. range](#1411-range)
      - [14.1.1.1. Property `icon_settings`](#14111-property-icon_settings)
        - [14.1.1.1.1. Property `icon_color`](#141111-property-icon_color)
        - [14.1.1.1.2. Property `icon_background_color`](#141112-property-icon_background_color)
        - [14.1.1.1.3. Property `icon_size`](#141113-property-icon_size)
        - [14.1.1.1.4. Property `icon_image_size`](#141114-property-icon_image_size)
        - [14.1.1.1.5. Property `icon_outline_color`](#141115-property-icon_outline_color)
        - [14.1.1.1.6. Property `icon_active_color`](#141116-property-icon_active_color)
      - [14.1.1.2. Property `start_entity`](#14112-property-start_entity)
      - [14.1.1.3. Property `start_attribute`](#14113-property-start_attribute)
      - [14.1.1.4. Property `start`](#14114-property-start)
      - [14.1.1.5. Property `end_entity`](#14115-property-end_entity)
      - [14.1.1.6. Property `end_attribute`](#14116-property-end_attribute)
      - [14.1.1.7. Property `end`](#14117-property-end)
      - [14.1.1.8. Property `label`](#14118-property-label)
      - [14.1.1.9. Property `color`](#14119-property-color)
      - [14.1.1.10. Property `source_entities`](#141110-property-source_entities)
  - [14.2. Property `Dictionary of range with numbered keys`](#142-property-dictionary-of-range-with-numbered-keys)

**Title:** `separator_as_timeline`

| **Type** | **Default** | **Description**    |
| -------- | ----------- | ------------------ |
| object   | -           | Main config object |

**Description:** Main config object

| Property                                                        | Type    | Default | Description                                                                                                   |
| --------------------------------------------------------------- | ------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| - [icon_color](#icon_settings_icon_color)                       | string  | -       | Icon colour                                                                                                   |
| - [icon_background_color](#icon_settings_icon_background_color) | string  | -       | Icon background colour                                                                                        |
| - [icon_size](#icon_settings_icon_size)                         | integer | 18      | Icon total size in pixels                                                                                     |
| - [icon_image_size](#icon_settings_icon_image_size)             | integer | 16      | Icon image size in pixels (max value is icon_size)                                                            |
| - [icon_outline_color](#icon_settings_icon_outline_color)       | string  | -       | Icon outline colour                                                                                           |
| - [icon_active_color](#icon_settings_icon_active_color)         | string  | -       | Icon active glow colour                                                                                       |
| - [rounded_edges](#rounded_edges)                               | boolean | false   | Use rounded ends on each segment. Segments that pass through midnight will still be flat for optimal visuals. |
| - [show_time_ticks](#show_time_ticks)                           | boolean | false   | Show time ticks on the timeline                                                                               |
| - [show_current_time](#show_current_time)                       | boolean | true    | Show the current time marker on the timeline.                                                                 |
| - [marker_color](#marker_color)                                 | string  | -       | Color of the current time marker.                                                                             |
| - [highlight_active](#highlight_active)                         | boolean | false   | Highlight segment icon when current time is within the segment period                                         |
| - [icon_settings](#icon_settings)                               | object  | -       | Global icon settings.                                                                                         |
| - [time_format](#time_format)                                   | object  | -       | -                                                                                                             |
| - [ranges](#ranges)                                             | object  | -       | List of time ranges to display on the timeline                                                                |

## 1. Property `icon_color`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | Icon colour     |

**Description:** Icon colour

## 2. Property `icon_background_color`

| **Type** | **Default** | **Description**        |
| -------- | ----------- | ---------------------- |
| string   | -           | Icon background colour |

**Description:** Icon background colour

## 3. Property `icon_size`

| **Type** | **Default** | **Description**           |
| -------- | ----------- | ------------------------- |
| integer  | 18          | Icon total size in pixels |

**Description:** Icon total size in pixels

## 4. Property `icon_image_size`

| **Type** | **Default** | **Description**                                    |
| -------- | ----------- | -------------------------------------------------- |
| integer  | 16          | Icon image size in pixels (max value is icon_size) |

**Description:** Icon image size in pixels (max value is icon_size)

## 5. Property `icon_outline_color`

| **Type** | **Default** | **Description**     |
| -------- | ----------- | ------------------- |
| string   | -           | Icon outline colour |

**Description:** Icon outline colour

## 6. Property `icon_active_color`

| **Type** | **Default** | **Description**         |
| -------- | ----------- | ----------------------- |
| string   | -           | Icon active glow colour |

**Description:** Icon active glow colour

## 7. Property `rounded_edges`

| **Type** | **Default** | **Description**                                                                                               |
| -------- | ----------- | ------------------------------------------------------------------------------------------------------------- |
| boolean  | false       | Use rounded ends on each segment. Segments that pass through midnight will still be flat for optimal visuals. |

**Description:** Use rounded ends on each segment. Segments that pass through midnight will still be flat for optimal visuals.

## 8. Property `show_time_ticks`

| **Type** | **Default** | **Description**                 |
| -------- | ----------- | ------------------------------- |
| boolean  | false       | Show time ticks on the timeline |

**Description:** Show time ticks on the timeline

## 9. Property `show_current_time`

| **Type** | **Default** | **Description**                               |
| -------- | ----------- | --------------------------------------------- |
| boolean  | true        | Show the current time marker on the timeline. |

**Description:** Show the current time marker on the timeline.

## 10. Property `marker_color`

| **Type** | **Default** | **Description**                   |
| -------- | ----------- | --------------------------------- |
| string   | -           | Color of the current time marker. |

**Description:** Color of the current time marker.

## 11. Property `highlight_active`

| **Type** | **Default** | **Description**                                                       |
| -------- | ----------- | --------------------------------------------------------------------- |
| boolean  | false       | Highlight segment icon when current time is within the segment period |

**Description:** Highlight segment icon when current time is within the segment period

## 12. Property `icon_settings`

| **Type** | **Default** | **Description**       |
| -------- | ----------- | --------------------- |
| object   | -           | Global icon settings. |

**Description:** Global icon settings.

| Property                                                        | Type    | Default | Description                                        |
| --------------------------------------------------------------- | ------- | ------- | -------------------------------------------------- |
| - [icon_color](#icon_settings_icon_color)                       | string  | -       | Icon colour                                        |
| - [icon_background_color](#icon_settings_icon_background_color) | string  | -       | Icon background colour                             |
| - [icon_size](#icon_settings_icon_size)                         | integer | 18      | Icon total size in pixels                          |
| - [icon_image_size](#icon_settings_icon_image_size)             | integer | 16      | Icon image size in pixels (max value is icon_size) |
| - [icon_outline_color](#icon_settings_icon_outline_color)       | string  | -       | Icon outline colour                                |
| - [icon_active_color](#icon_settings_icon_active_color)         | string  | -       | Icon active glow colour                            |

### 12.1. Property `icon_color`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | Icon colour     |

**Description:** Icon colour

### 12.2. Property `icon_background_color`

| **Type** | **Default** | **Description**        |
| -------- | ----------- | ---------------------- |
| string   | -           | Icon background colour |

**Description:** Icon background colour

### 12.3. Property `icon_size`

| **Type** | **Default** | **Description**           |
| -------- | ----------- | ------------------------- |
| integer  | 18          | Icon total size in pixels |

**Description:** Icon total size in pixels

### 12.4. Property `icon_image_size`

| **Type** | **Default** | **Description**                                    |
| -------- | ----------- | -------------------------------------------------- |
| integer  | 16          | Icon image size in pixels (max value is icon_size) |

**Description:** Icon image size in pixels (max value is icon_size)

### 12.5. Property `icon_outline_color`

| **Type** | **Default** | **Description**     |
| -------- | ----------- | ------------------- |
| string   | -           | Icon outline colour |

**Description:** Icon outline colour

### 12.6. Property `icon_active_color`

| **Type** | **Default** | **Description**         |
| -------- | ----------- | ----------------------- |
| string   | -           | Icon active glow colour |

**Description:** Icon active glow colour

## 13. Property `time_format`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property                                          | Type   | Default | Description                                                                     |
| ------------------------------------------------- | ------ | ------- | ------------------------------------------------------------------------------- |
| - [global_settings](#time_format_global_settings) | object | -       | Global time formatting configuration.                                           |
| - [timeline](#time_format_timeline)               | object | -       | Time formatting settings for the timeline. Overrides global formatting settings |
| - [tooltip](#time_format_tooltip)                 | object | -       | Time formatting settings for the tooltip. Overrides global formatting settings  |

### 13.1. Property `global_settings`

| **Type** | **Default** | **Description**                       |
| -------- | ----------- | ------------------------------------- |
| object   | -           | Global time formatting configuration. |

**Description:** Global time formatting configuration.

| Property                                                      | Type    | Default | Description                            |
| ------------------------------------------------------------- | ------- | ------- | -------------------------------------- |
| - [use_24_hour](#time_format_global_settings_use_24_hour)     | boolean | true    | Show time in 24-hour format            |
| - [append_suffix](#time_format_global_settings_append_suffix) | boolean | false   | Display AM/PM.                         |
| - [pad_hours](#time_format_global_settings_pad_hours)         | boolean | true    | Zero-pad hours e.g. 5:00 becomes 05:00 |
| - [show_minutes](#time_format_global_settings_show_minutes)   | boolean | true    | Show minutes in times                  |

#### 13.1.1. Property `use_24_hour`

| **Type** | **Default** | **Description**             |
| -------- | ----------- | --------------------------- |
| boolean  | true        | Show time in 24-hour format |

**Description:** Show time in 24-hour format

#### 13.1.2. Property `append_suffix`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| boolean  | false       | Display AM/PM.  |

**Description:** Display AM/PM.

#### 13.1.3. Property `pad_hours`

| **Type** | **Default** | **Description**                        |
| -------- | ----------- | -------------------------------------- |
| boolean  | true        | Zero-pad hours e.g. 5:00 becomes 05:00 |

**Description:** Zero-pad hours e.g. 5:00 becomes 05:00

#### 13.1.4. Property `show_minutes`

| **Type** | **Default** | **Description**       |
| -------- | ----------- | --------------------- |
| boolean  | true        | Show minutes in times |

**Description:** Show minutes in times

### 13.2. Property `timeline`

| **Type** | **Default** | **Description**                                                                 |
| -------- | ----------- | ------------------------------------------------------------------------------- |
| object   | -           | Time formatting settings for the timeline. Overrides global formatting settings |

**Description:** Time formatting settings for the timeline. Overrides global formatting settings

| Property                                                      | Type    | Default | Description                            |
| ------------------------------------------------------------- | ------- | ------- | -------------------------------------- |
| - [use_24_hour](#time_format_global_settings_use_24_hour)     | boolean | true    | Show time in 24-hour format            |
| - [append_suffix](#time_format_global_settings_append_suffix) | boolean | false   | Display AM/PM.                         |
| - [pad_hours](#time_format_global_settings_pad_hours)         | boolean | true    | Zero-pad hours e.g. 5:00 becomes 05:00 |
| - [show_minutes](#time_format_global_settings_show_minutes)   | boolean | true    | Show minutes in times                  |
| - [override](#time_format_timeline_override)                  | boolean | false   | Override global time formatting        |

#### 13.2.1. Property `use_24_hour`

| **Type** | **Default** | **Description**             |
| -------- | ----------- | --------------------------- |
| boolean  | true        | Show time in 24-hour format |

**Description:** Show time in 24-hour format

#### 13.2.2. Property `append_suffix`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| boolean  | false       | Display AM/PM.  |

**Description:** Display AM/PM.

#### 13.2.3. Property `pad_hours`

| **Type** | **Default** | **Description**                        |
| -------- | ----------- | -------------------------------------- |
| boolean  | true        | Zero-pad hours e.g. 5:00 becomes 05:00 |

**Description:** Zero-pad hours e.g. 5:00 becomes 05:00

#### 13.2.4. Property `show_minutes`

| **Type** | **Default** | **Description**       |
| -------- | ----------- | --------------------- |
| boolean  | true        | Show minutes in times |

**Description:** Show minutes in times

#### 13.2.5. Property `override`

| **Type** | **Default** | **Description**                 |
| -------- | ----------- | ------------------------------- |
| boolean  | false       | Override global time formatting |

**Description:** Override global time formatting

### 13.3. Property `tooltip`

| **Type** | **Default** | **Description**                                                                |
| -------- | ----------- | ------------------------------------------------------------------------------ |
| object   | -           | Time formatting settings for the tooltip. Overrides global formatting settings |

**Description:** Time formatting settings for the tooltip. Overrides global formatting settings

| Property                                                      | Type    | Default | Description                            |
| ------------------------------------------------------------- | ------- | ------- | -------------------------------------- |
| - [use_24_hour](#time_format_global_settings_use_24_hour)     | boolean | true    | Show time in 24-hour format            |
| - [append_suffix](#time_format_global_settings_append_suffix) | boolean | false   | Display AM/PM.                         |
| - [pad_hours](#time_format_global_settings_pad_hours)         | boolean | true    | Zero-pad hours e.g. 5:00 becomes 05:00 |
| - [show_minutes](#time_format_global_settings_show_minutes)   | boolean | true    | Show minutes in times                  |
| - [override](#time_format_timeline_override)                  | boolean | false   | Override global time formatting        |

#### 13.3.1. Property `use_24_hour`

| **Type** | **Default** | **Description**             |
| -------- | ----------- | --------------------------- |
| boolean  | true        | Show time in 24-hour format |

**Description:** Show time in 24-hour format

#### 13.3.2. Property `append_suffix`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| boolean  | false       | Display AM/PM.  |

**Description:** Display AM/PM.

#### 13.3.3. Property `pad_hours`

| **Type** | **Default** | **Description**                        |
| -------- | ----------- | -------------------------------------- |
| boolean  | true        | Zero-pad hours e.g. 5:00 becomes 05:00 |

**Description:** Zero-pad hours e.g. 5:00 becomes 05:00

#### 13.3.4. Property `show_minutes`

| **Type** | **Default** | **Description**       |
| -------- | ----------- | --------------------- |
| boolean  | true        | Show minutes in times |

**Description:** Show minutes in times

#### 13.3.5. Property `override`

| **Type** | **Default** | **Description**                 |
| -------- | ----------- | ------------------------------- |
| boolean  | false       | Override global time formatting |

**Description:** Override global time formatting

## 14. Property `ranges`

| **Type** | **Default** | **Description**                                |
| -------- | ----------- | ---------------------------------------------- |
| object   | -           | List of time ranges to display on the timeline |

**Description:** List of time ranges to display on the timeline

| Any of(Option)                                             |
| ---------------------------------------------------------- |
| [Array of range](#ranges_anyOf_i0)                         |
| [Dictionary of range with numbered keys](#ranges_anyOf_i1) |

### 14.1. Property `Array of range`

**Title:** Array of range

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| array    | -           | -               |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be | Description |
| ------------------------------- | ----------- |
| [range](#ranges_anyOf_i0_items) | -           |

#### 14.1.1. range

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property                                                    | Type   | Default | Description                                                                         |
| ----------------------------------------------------------- | ------ | ------- | ----------------------------------------------------------------------------------- |
| - [icon_settings](#ranges_anyOf_i0_items_icon_settings)     | object | -       | Icon settings for this range. Overrides global icon settings.                       |
| - [start_entity](#ranges_anyOf_i0_items_start_entity)       | string | -       | Entity whose state will be used as the start time (e.g. sensor.sun_next_dawn)<br /> |
| - [start_attribute](#ranges_anyOf_i0_items_start_attribute) | string | -       | Attribute to use instead of state                                                   |
| - [start](#ranges_anyOf_i0_items_start)                     | string | -       | Fixed start time (ignored if entity is set)                                         |
| - [end_entity](#ranges_anyOf_i0_items_end_entity)           | string | -       | Entity whose state will be used as the end time                                     |
| - [end_attribute](#ranges_anyOf_i0_items_end_attribute)     | string | -       | Attribute to use instead of state                                                   |
| - [end](#ranges_anyOf_i0_items_end)                         | string | -       | Fixed end time (ignored if entity is set)                                           |
| - [label](#ranges_anyOf_i0_items_label)                     | string | -       | Label to use for segment on tooltip                                                 |
| - [color](#ranges_anyOf_i0_items_color)                     | string | -       | Color to use for this segment on the timeline                                       |
| - [source_entities](#ranges_anyOf_i0_items_source_entities) | string | -       | Optional information to show in tooltip                                             |

##### 14.1.1.1. Property `icon_settings`

| **Type** | **Default** | **Description**                                               |
| -------- | ----------- | ------------------------------------------------------------- |
| object   | -           | Icon settings for this range. Overrides global icon settings. |

**Description:** Icon settings for this range. Overrides global icon settings.

| Property                                                        | Type    | Default | Description                                        |
| --------------------------------------------------------------- | ------- | ------- | -------------------------------------------------- |
| - [icon_color](#icon_settings_icon_color)                       | string  | -       | Icon colour                                        |
| - [icon_background_color](#icon_settings_icon_background_color) | string  | -       | Icon background colour                             |
| - [icon_size](#icon_settings_icon_size)                         | integer | 18      | Icon total size in pixels                          |
| - [icon_image_size](#icon_settings_icon_image_size)             | integer | 16      | Icon image size in pixels (max value is icon_size) |
| - [icon_outline_color](#icon_settings_icon_outline_color)       | string  | -       | Icon outline colour                                |
| - [icon_active_color](#icon_settings_icon_active_color)         | string  | -       | Icon active glow colour                            |

###### 14.1.1.1.1. Property `icon_color`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | Icon colour     |

**Description:** Icon colour

###### 14.1.1.1.2. Property `icon_background_color`

| **Type** | **Default** | **Description**        |
| -------- | ----------- | ---------------------- |
| string   | -           | Icon background colour |

**Description:** Icon background colour

###### 14.1.1.1.3. Property `icon_size`

| **Type** | **Default** | **Description**           |
| -------- | ----------- | ------------------------- |
| integer  | 18          | Icon total size in pixels |

**Description:** Icon total size in pixels

###### 14.1.1.1.4. Property `icon_image_size`

| **Type** | **Default** | **Description**                                    |
| -------- | ----------- | -------------------------------------------------- |
| integer  | 16          | Icon image size in pixels (max value is icon_size) |

**Description:** Icon image size in pixels (max value is icon_size)

###### 14.1.1.1.5. Property `icon_outline_color`

| **Type** | **Default** | **Description**     |
| -------- | ----------- | ------------------- |
| string   | -           | Icon outline colour |

**Description:** Icon outline colour

###### 14.1.1.1.6. Property `icon_active_color`

| **Type** | **Default** | **Description**         |
| -------- | ----------- | ----------------------- |
| string   | -           | Icon active glow colour |

**Description:** Icon active glow colour

##### 14.1.1.2. Property `start_entity`

| **Type** | **Default** | **Description**                                                               |
| -------- | ----------- | ----------------------------------------------------------------------------- |
| string   | -           | Entity whose state will be used as the start time (e.g. sensor.sun_next_dawn) |
|          |

**Description:** Entity whose state will be used as the start time (e.g. sensor.sun_next_dawn)

##### 14.1.1.3. Property `start_attribute`

| **Type** | **Default** | **Description**                   |
| -------- | ----------- | --------------------------------- |
| string   | -           | Attribute to use instead of state |

**Description:** Attribute to use instead of state

##### 14.1.1.4. Property `start`

| **Type** | **Default** | **Description**                             |
| -------- | ----------- | ------------------------------------------- |
| string   | -           | Fixed start time (ignored if entity is set) |

**Description:** Fixed start time (ignored if entity is set)

##### 14.1.1.5. Property `end_entity`

| **Type** | **Default** | **Description**                                 |
| -------- | ----------- | ----------------------------------------------- |
| string   | -           | Entity whose state will be used as the end time |

**Description:** Entity whose state will be used as the end time

##### 14.1.1.6. Property `end_attribute`

| **Type** | **Default** | **Description**                   |
| -------- | ----------- | --------------------------------- |
| string   | -           | Attribute to use instead of state |

**Description:** Attribute to use instead of state

##### 14.1.1.7. Property `end`

| **Type** | **Default** | **Description**                           |
| -------- | ----------- | ----------------------------------------- |
| string   | -           | Fixed end time (ignored if entity is set) |

**Description:** Fixed end time (ignored if entity is set)

##### 14.1.1.8. Property `label`

| **Type** | **Default** | **Description**                     |
| -------- | ----------- | ----------------------------------- |
| string   | -           | Label to use for segment on tooltip |

**Description:** Label to use for segment on tooltip

##### 14.1.1.9. Property `color`

| **Type** | **Default** | **Description**                               |
| -------- | ----------- | --------------------------------------------- |
| string   | -           | Color to use for this segment on the timeline |

**Description:** Color to use for this segment on the timeline

##### 14.1.1.10. Property `source_entities`

| **Type** | **Default** | **Description**                         |
| -------- | ----------- | --------------------------------------- |
| string   | -           | Optional information to show in tooltip |

**Description:** Optional information to show in tooltip

### 14.2. Property `Dictionary of range with numbered keys`

**Title:** Dictionary of range with numbered keys

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

---

Generated using [json-schema-for-humans](https://github.com/coveooss/json-schema-for-humans)
