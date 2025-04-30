# `separator_as_timeline`

- [1. Property `icon_color`](#1-property-icon_color)
- [2. Property `icon_background_color`](#2-property-icon_background_color)
- [3. Property `icon_outline_color`](#3-property-icon_outline_color)
- [4. Property `icon_active_color`](#4-property-icon_active_color)
- [5. Property `rounded_edges`](#5-property-rounded_edges)
- [6. Property `show_time_ticks`](#6-property-show_time_ticks)
- [7. Property `show_current_time`](#7-property-show_current_time)
- [8. Property `marker_color`](#8-property-marker_color)
- [9. Property `highlight_active`](#9-property-highlight_active)
- [10. Property `time_format`](#10-property-time_format)
  - [10.1. Property `use_24_hour`](#101-property-use_24_hour)
  - [10.2. Property `append_suffix`](#102-property-append_suffix)
  - [10.3. Property `pad_hours`](#103-property-pad_hours)
  - [10.4. Property `show_minutes`](#104-property-show_minutes)
  - [10.5. Property `timeline`](#105-property-timeline)
    - [10.5.1. Property `use_24_hour`](#1051-property-use_24_hour)
    - [10.5.2. Property `append_suffix`](#1052-property-append_suffix)
    - [10.5.3. Property `pad_hours`](#1053-property-pad_hours)
    - [10.5.4. Property `show_minutes`](#1054-property-show_minutes)
    - [10.5.5. Property `override`](#1055-property-override)
  - [10.6. Property `tooltip`](#106-property-tooltip)
    - [10.6.1. Property `use_24_hour`](#1061-property-use_24_hour)
    - [10.6.2. Property `append_suffix`](#1062-property-append_suffix)
    - [10.6.3. Property `pad_hours`](#1063-property-pad_hours)
    - [10.6.4. Property `show_minutes`](#1064-property-show_minutes)
    - [10.6.5. Property `override`](#1065-property-override)
- [11. Property `ranges`](#11-property-ranges)
  - [11.1. Property `Array of range`](#111-property-array-of-range)
    - [11.1.1. range](#1111-range)
      - [11.1.1.1. Property `icon_color`](#11111-property-icon_color)
      - [11.1.1.2. Property `icon_background_color`](#11112-property-icon_background_color)
      - [11.1.1.3. Property `icon_outline_color`](#11113-property-icon_outline_color)
      - [11.1.1.4. Property `icon_active_color`](#11114-property-icon_active_color)
      - [11.1.1.5. Property `start_entity`](#11115-property-start_entity)
      - [11.1.1.6. Property `start_attribute`](#11116-property-start_attribute)
      - [11.1.1.7. Property `start`](#11117-property-start)
      - [11.1.1.8. Property `end_entity`](#11118-property-end_entity)
      - [11.1.1.9. Property `end_attribute`](#11119-property-end_attribute)
      - [11.1.1.10. Property `end`](#111110-property-end)
      - [11.1.1.11. Property `label`](#111111-property-label)
      - [11.1.1.12. Property `color`](#111112-property-color)
      - [11.1.1.13. Property `source_entities`](#111113-property-source_entities)
  - [11.2. Property `Dictionary of range with numbered keys`](#112-property-dictionary-of-range-with-numbered-keys)

**Title:** `separator_as_timeline`

| **Type** | **Default** | **Description**    |
| -------- | ----------- | ------------------ |
| object   | -           | Main config object |

**Description:** Main config object

| Property                                                                 | Type    | Default | Description                                                                                                   |
| ------------------------------------------------------------------------ | ------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| - [icon_color](#ranges_anyOf_i0_items_icon_color )                       | string  | -       | Icon colour                                                                                                   |
| - [icon_background_color](#ranges_anyOf_i0_items_icon_background_color ) | string  | -       | Icon background colour                                                                                        |
| - [icon_outline_color](#ranges_anyOf_i0_items_icon_outline_color )       | string  | -       | Icon outline colour                                                                                           |
| - [icon_active_color](#ranges_anyOf_i0_items_icon_active_color )         | string  | -       | Icon active glow colour                                                                                       |
| - [rounded_edges](#rounded_edges )                                       | boolean | false   | Use rounded ends on each segment. Segments that pass through midnight will still be flat for optimal visuals. |
| - [show_time_ticks](#show_time_ticks )                                   | boolean | false   | Show time ticks on the timeline                                                                               |
| - [show_current_time](#show_current_time )                               | boolean | true    | Show the current time marker on the timeline.                                                                 |
| - [marker_color](#marker_color )                                         | string  | -       | Color of the current time marker.                                                                             |
| - [highlight_active](#highlight_active )                                 | boolean | false   | Highlight segment icon when current time is within the segment period                                         |
| - [time_format](#time_format )                                           | object  | -       | Global time formatting configuration.                                                                         |
| - [ranges](#ranges )                                                     | object  | -       | List of time ranges to display on the timeline                                                                |

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

## 3. Property `icon_outline_color`

| **Type** | **Default** | **Description**     |
| -------- | ----------- | ------------------- |
| string   | -           | Icon outline colour |

**Description:** Icon outline colour

## 4. Property `icon_active_color`

| **Type** | **Default** | **Description**         |
| -------- | ----------- | ----------------------- |
| string   | -           | Icon active glow colour |

**Description:** Icon active glow colour

## 5. Property `rounded_edges`

| **Type** | **Default** | **Description**                                                                                               |
| -------- | ----------- | ------------------------------------------------------------------------------------------------------------- |
| boolean  | false       | Use rounded ends on each segment. Segments that pass through midnight will still be flat for optimal visuals. |

**Description:** Use rounded ends on each segment. Segments that pass through midnight will still be flat for optimal visuals.

## 6. Property `show_time_ticks`

| **Type** | **Default** | **Description**                 |
| -------- | ----------- | ------------------------------- |
| boolean  | false       | Show time ticks on the timeline |

**Description:** Show time ticks on the timeline

## 7. Property `show_current_time`

| **Type** | **Default** | **Description**                               |
| -------- | ----------- | --------------------------------------------- |
| boolean  | true        | Show the current time marker on the timeline. |

**Description:** Show the current time marker on the timeline.

## 8. Property `marker_color`

| **Type** | **Default** | **Description**                   |
| -------- | ----------- | --------------------------------- |
| string   | -           | Color of the current time marker. |

**Description:** Color of the current time marker.

## 9. Property `highlight_active`

| **Type** | **Default** | **Description**                                                       |
| -------- | ----------- | --------------------------------------------------------------------- |
| boolean  | false       | Highlight segment icon when current time is within the segment period |

**Description:** Highlight segment icon when current time is within the segment period

## 10. Property `time_format`

| **Type** | **Default** | **Description**                       |
| -------- | ----------- | ------------------------------------- |
| object   | -           | Global time formatting configuration. |

**Description:** Global time formatting configuration.

| Property                                                | Type    | Default | Description                                                                     |
| ------------------------------------------------------- | ------- | ------- | ------------------------------------------------------------------------------- |
| - [use_24_hour](#time_format_timeline_use_24_hour )     | boolean | true    | Show time in 24-hour format                                                     |
| - [append_suffix](#time_format_timeline_append_suffix ) | boolean | false   | Display AM/PM.                                                                  |
| - [pad_hours](#time_format_timeline_pad_hours )         | boolean | true    | Zero-pad hours e.g. 5:00 becomes 05:00                                          |
| - [show_minutes](#time_format_timeline_show_minutes )   | boolean | true    | Show minutes in times                                                           |
| - [timeline](#time_format_timeline )                    | object  | -       | Time formatting settings for the timeline. Overrides global formatting settings |
| - [tooltip](#time_format_tooltip )                      | object  | -       | Time formatting settings for the tooltip. Overrides global formatting settings  |

### 10.1. Property `use_24_hour`

| **Type** | **Default** | **Description**             |
| -------- | ----------- | --------------------------- |
| boolean  | true        | Show time in 24-hour format |

**Description:** Show time in 24-hour format

### 10.2. Property `append_suffix`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| boolean  | false       | Display AM/PM.  |

**Description:** Display AM/PM.

### 10.3. Property `pad_hours`

| **Type** | **Default** | **Description**                        |
| -------- | ----------- | -------------------------------------- |
| boolean  | true        | Zero-pad hours e.g. 5:00 becomes 05:00 |

**Description:** Zero-pad hours e.g. 5:00 becomes 05:00

### 10.4. Property `show_minutes`

| **Type** | **Default** | **Description**       |
| -------- | ----------- | --------------------- |
| boolean  | true        | Show minutes in times |

**Description:** Show minutes in times

### 10.5. Property `timeline`

| **Type** | **Default** | **Description**                                                                 |
| -------- | ----------- | ------------------------------------------------------------------------------- |
| object   | -           | Time formatting settings for the timeline. Overrides global formatting settings |

**Description:** Time formatting settings for the timeline. Overrides global formatting settings

| Property                                                | Type    | Default | Description                            |
| ------------------------------------------------------- | ------- | ------- | -------------------------------------- |
| - [use_24_hour](#time_format_timeline_use_24_hour )     | boolean | true    | Show time in 24-hour format            |
| - [append_suffix](#time_format_timeline_append_suffix ) | boolean | false   | Display AM/PM.                         |
| - [pad_hours](#time_format_timeline_pad_hours )         | boolean | true    | Zero-pad hours e.g. 5:00 becomes 05:00 |
| - [show_minutes](#time_format_timeline_show_minutes )   | boolean | true    | Show minutes in times                  |
| - [override](#time_format_timeline_override )           | boolean | false   | Override global time formatting        |

#### 10.5.1. Property `use_24_hour`

| **Type** | **Default** | **Description**             |
| -------- | ----------- | --------------------------- |
| boolean  | true        | Show time in 24-hour format |

**Description:** Show time in 24-hour format

#### 10.5.2. Property `append_suffix`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| boolean  | false       | Display AM/PM.  |

**Description:** Display AM/PM.

#### 10.5.3. Property `pad_hours`

| **Type** | **Default** | **Description**                        |
| -------- | ----------- | -------------------------------------- |
| boolean  | true        | Zero-pad hours e.g. 5:00 becomes 05:00 |

**Description:** Zero-pad hours e.g. 5:00 becomes 05:00

#### 10.5.4. Property `show_minutes`

| **Type** | **Default** | **Description**       |
| -------- | ----------- | --------------------- |
| boolean  | true        | Show minutes in times |

**Description:** Show minutes in times

#### 10.5.5. Property `override`

| **Type** | **Default** | **Description**                 |
| -------- | ----------- | ------------------------------- |
| boolean  | false       | Override global time formatting |

**Description:** Override global time formatting

### 10.6. Property `tooltip`

| **Type** | **Default** | **Description**                                                                |
| -------- | ----------- | ------------------------------------------------------------------------------ |
| object   | -           | Time formatting settings for the tooltip. Overrides global formatting settings |

**Description:** Time formatting settings for the tooltip. Overrides global formatting settings

| Property                                                | Type    | Default | Description                            |
| ------------------------------------------------------- | ------- | ------- | -------------------------------------- |
| - [use_24_hour](#time_format_timeline_use_24_hour )     | boolean | true    | Show time in 24-hour format            |
| - [append_suffix](#time_format_timeline_append_suffix ) | boolean | false   | Display AM/PM.                         |
| - [pad_hours](#time_format_timeline_pad_hours )         | boolean | true    | Zero-pad hours e.g. 5:00 becomes 05:00 |
| - [show_minutes](#time_format_timeline_show_minutes )   | boolean | true    | Show minutes in times                  |
| - [override](#time_format_timeline_override )           | boolean | false   | Override global time formatting        |

#### 10.6.1. Property `use_24_hour`

| **Type** | **Default** | **Description**             |
| -------- | ----------- | --------------------------- |
| boolean  | true        | Show time in 24-hour format |

**Description:** Show time in 24-hour format

#### 10.6.2. Property `append_suffix`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| boolean  | false       | Display AM/PM.  |

**Description:** Display AM/PM.

#### 10.6.3. Property `pad_hours`

| **Type** | **Default** | **Description**                        |
| -------- | ----------- | -------------------------------------- |
| boolean  | true        | Zero-pad hours e.g. 5:00 becomes 05:00 |

**Description:** Zero-pad hours e.g. 5:00 becomes 05:00

#### 10.6.4. Property `show_minutes`

| **Type** | **Default** | **Description**       |
| -------- | ----------- | --------------------- |
| boolean  | true        | Show minutes in times |

**Description:** Show minutes in times

#### 10.6.5. Property `override`

| **Type** | **Default** | **Description**                 |
| -------- | ----------- | ------------------------------- |
| boolean  | false       | Override global time formatting |

**Description:** Override global time formatting

## 11. Property `ranges`

| **Type** | **Default** | **Description**                                |
| -------- | ----------- | ---------------------------------------------- |
| object   | -           | List of time ranges to display on the timeline |

**Description:** List of time ranges to display on the timeline

| Any of(Option)                                             |
| ---------------------------------------------------------- |
| [Array of range](#ranges_anyOf_i0)                         |
| [Dictionary of range with numbered keys](#ranges_anyOf_i1) |

### 11.1. Property `Array of range`

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

#### 11.1.1. range

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property                                                                 | Type   | Default | Description                                                                         |
| ------------------------------------------------------------------------ | ------ | ------- | ----------------------------------------------------------------------------------- |
| - [icon_color](#ranges_anyOf_i0_items_icon_color )                       | string | -       | Icon colour                                                                         |
| - [icon_background_color](#ranges_anyOf_i0_items_icon_background_color ) | string | -       | Icon background colour                                                              |
| - [icon_outline_color](#ranges_anyOf_i0_items_icon_outline_color )       | string | -       | Icon outline colour                                                                 |
| - [icon_active_color](#ranges_anyOf_i0_items_icon_active_color )         | string | -       | Icon active glow colour                                                             |
| - [start_entity](#ranges_anyOf_i0_items_start_entity )                   | string | -       | Entity whose state will be used as the start time (e.g. sensor.sun_next_dawn)<br /> |
| - [start_attribute](#ranges_anyOf_i0_items_start_attribute )             | string | -       | Attribute to use instead of state                                                   |
| - [start](#ranges_anyOf_i0_items_start )                                 | string | -       | Fixed start time (ignored if entity is set)                                         |
| - [end_entity](#ranges_anyOf_i0_items_end_entity )                       | string | -       | Entity whose state will be used as the end time                                     |
| - [end_attribute](#ranges_anyOf_i0_items_end_attribute )                 | string | -       | Attribute to use instead of state                                                   |
| - [end](#ranges_anyOf_i0_items_end )                                     | string | -       | Fixed end time (ignored if entity is set)                                           |
| - [label](#ranges_anyOf_i0_items_label )                                 | string | -       | Label to use for segment on tooltip                                                 |
| - [color](#ranges_anyOf_i0_items_color )                                 | string | -       | Color to use for this segment on the timeline                                       |
| - [source_entities](#ranges_anyOf_i0_items_source_entities )             | string | -       | Optional information to show in tooltip                                             |

##### 11.1.1.1. Property `icon_color`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | Icon colour     |

**Description:** Icon colour

##### 11.1.1.2. Property `icon_background_color`

| **Type** | **Default** | **Description**        |
| -------- | ----------- | ---------------------- |
| string   | -           | Icon background colour |

**Description:** Icon background colour

##### 11.1.1.3. Property `icon_outline_color`

| **Type** | **Default** | **Description**     |
| -------- | ----------- | ------------------- |
| string   | -           | Icon outline colour |

**Description:** Icon outline colour

##### 11.1.1.4. Property `icon_active_color`

| **Type** | **Default** | **Description**         |
| -------- | ----------- | ----------------------- |
| string   | -           | Icon active glow colour |

**Description:** Icon active glow colour

##### 11.1.1.5. Property `start_entity`

| **Type** | **Default** | **Description**                                                                |
| -------- | ----------- | ------------------------------------------------------------------------------ |
| string   | -           | Entity whose state will be used as the start time (e.g. sensor.sun_next_dawn)
 |

**Description:** Entity whose state will be used as the start time (e.g. sensor.sun_next_dawn)

##### 11.1.1.6. Property `start_attribute`

| **Type** | **Default** | **Description**                   |
| -------- | ----------- | --------------------------------- |
| string   | -           | Attribute to use instead of state |

**Description:** Attribute to use instead of state

##### 11.1.1.7. Property `start`

| **Type** | **Default** | **Description**                             |
| -------- | ----------- | ------------------------------------------- |
| string   | -           | Fixed start time (ignored if entity is set) |

**Description:** Fixed start time (ignored if entity is set)

##### 11.1.1.8. Property `end_entity`

| **Type** | **Default** | **Description**                                 |
| -------- | ----------- | ----------------------------------------------- |
| string   | -           | Entity whose state will be used as the end time |

**Description:** Entity whose state will be used as the end time

##### 11.1.1.9. Property `end_attribute`

| **Type** | **Default** | **Description**                   |
| -------- | ----------- | --------------------------------- |
| string   | -           | Attribute to use instead of state |

**Description:** Attribute to use instead of state

##### 11.1.1.10. Property `end`

| **Type** | **Default** | **Description**                           |
| -------- | ----------- | ----------------------------------------- |
| string   | -           | Fixed end time (ignored if entity is set) |

**Description:** Fixed end time (ignored if entity is set)

##### 11.1.1.11. Property `label`

| **Type** | **Default** | **Description**                     |
| -------- | ----------- | ----------------------------------- |
| string   | -           | Label to use for segment on tooltip |

**Description:** Label to use for segment on tooltip

##### 11.1.1.12. Property `color`

| **Type** | **Default** | **Description**                               |
| -------- | ----------- | --------------------------------------------- |
| string   | -           | Color to use for this segment on the timeline |

**Description:** Color to use for this segment on the timeline

##### 11.1.1.13. Property `source_entities`

| **Type** | **Default** | **Description**                         |
| -------- | ----------- | --------------------------------------- |
| string   | -           | Optional information to show in tooltip |

**Description:** Optional information to show in tooltip

### 11.2. Property `Dictionary of range with numbered keys`

**Title:** Dictionary of range with numbered keys

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

---

Generated using [json-schema-for-humans](https://github.com/coveooss/json-schema-for-humans)
