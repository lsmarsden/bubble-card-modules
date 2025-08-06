# `sub_button_wheel`

- [1. Property `wheel_opener`](#1-property-wheel_opener)
- [2. Property `close_on_sub_button_click`](#2-property-close_on_sub_button_click)
- [3. Property `layout_options`](#3-property-layout_options)
  - [3.1. Property `wheel_layout`](#31-property-wheel_layout)
  - [3.2. Property `double_ring_inner_count`](#32-property-double_ring_inner_count)
- [4. Property `animation_options`](#4-property-animation_options)
  - [4.1. Property `wheel_animation`](#41-property-wheel_animation)
  - [4.2. Property `animation_delay`](#42-property-animation_delay)
  - [4.3. Property `animation_duration`](#43-property-animation_duration)
- [5. Property `wheel_buttons`](#5-property-wheel_buttons)
  - [5.1. wheel_button](#51-wheel_button)
    - [5.1.1. Property `sub_button`](#511-property-sub_button)
    - [5.1.2. Property `position`](#512-property-position)
    - [5.1.3. Property `close_on_click`](#513-property-close_on_click)

**Title:** `sub_button_wheel`

| **Type** | **Default** | **Description**                                         |
| -------- | ----------- | ------------------------------------------------------- |
| object   | -           | Configuration for sub-button wheel layout functionality |

**Description:** Configuration for sub-button wheel layout functionality

| Property                                                  | Type    | Default | Description                                                      |
| --------------------------------------------------------- | ------- | ------- | ---------------------------------------------------------------- |
| + wheel_opener                                            | string  | -       | Button that opens the wheel (e.g., 'main', 'sub-button-1', etc.) |
| - [close_on_sub_button_click](#close_on_sub_button_click) | boolean | false   | Close wheel when any sub-button is clicked (global setting)      |
| - [layout_options](#layout_options)                       | object  | -       | Layout configuration options                                     |
| - [animation_options](#animation_options)                 | object  | -       | Animation configuration options                                  |
| + wheel_buttons                                           | array   | -       | Array of sub-buttons to include in the wheel                     |

## 1. Property `wheel_opener`

| **Type** | **Default** | **Description**                                                  |
| -------- | ----------- | ---------------------------------------------------------------- |
| string   | -           | Button that opens the wheel (e.g., 'main', 'sub-button-1', etc.) |

**Description:** Button that opens the wheel (e.g., 'main', 'sub-button-1', etc.)

## 2. Property `close_on_sub_button_click`

| **Type** | **Default** | **Description**                                             |
| -------- | ----------- | ----------------------------------------------------------- |
| boolean  | false       | Close wheel when any sub-button is clicked (global setting) |

**Description:** Close wheel when any sub-button is clicked (global setting)

## 3. Property `layout_options`

| **Type** | **Default** | **Description**              |
| -------- | ----------- | ---------------------------- |
| object   | -           | Layout configuration options |

**Description:** Layout configuration options

| Property                                                             | Type             | Default       | Description                                               |
| -------------------------------------------------------------------- | ---------------- | ------------- | --------------------------------------------------------- |
| - [wheel_layout](#layout_options_wheel_layout)                       | enum (of string) | "even-circle" | Wheel layout style                                        |
| - [double_ring_inner_count](#layout_options_double_ring_inner_count) | integer          | 4             | Number of buttons in inner ring (double-ring layout only) |

### 3.1. Property `wheel_layout`

| **Type**         | **Default**   | **Description**    |
| ---------------- | ------------- | ------------------ |
| enum (of string) | "even-circle" | Wheel layout style |

**Description:** Wheel layout style

Must be one of:

- "even-circle"
- "progressive-arc"
- "compact-arc"
- "fixed-position"
- "double-ring"
- "smart-adaptive"

### 3.2. Property `double_ring_inner_count`

| **Type** | **Default** | **Description**                                           |
| -------- | ----------- | --------------------------------------------------------- |
| integer  | 4           | Number of buttons in inner ring (double-ring layout only) |

**Description:** Number of buttons in inner ring (double-ring layout only)

| Restrictions |        |
| ------------ | ------ |
| **Minimum**  | &ge; 1 |
| **Maximum**  | &le; 8 |

## 4. Property `animation_options`

| **Type** | **Default** | **Description**                 |
| -------- | ----------- | ------------------------------- |
| object   | -           | Animation configuration options |

**Description:** Animation configuration options

| Property                                                      | Type             | Default           | Description                                     |
| ------------------------------------------------------------- | ---------------- | ----------------- | ----------------------------------------------- |
| - [wheel_animation](#animation_options_wheel_animation)       | enum (of string) | "staggered-scale" | Animation style when wheel opens                |
| - [animation_delay](#animation_options_animation_delay)       | number           | 0.5               | Initial delay before animation starts (seconds) |
| - [animation_duration](#animation_options_animation_duration) | number           | 1.0               | Total duration of animation (seconds)           |

### 4.1. Property `wheel_animation`

| **Type**         | **Default**       | **Description**                  |
| ---------------- | ----------------- | -------------------------------- |
| enum (of string) | "staggered-scale" | Animation style when wheel opens |

**Description:** Animation style when wheel opens

Must be one of:

- "staggered-scale"
- "instant"

### 4.2. Property `animation_delay`

| **Type** | **Default** | **Description**                                 |
| -------- | ----------- | ----------------------------------------------- |
| number   | 0.5         | Initial delay before animation starts (seconds) |

**Description:** Initial delay before animation starts (seconds)

| Restrictions |         |
| ------------ | ------- |
| **Minimum**  | &ge; 0  |
| **Maximum**  | &le; 10 |

### 4.3. Property `animation_duration`

| **Type** | **Default** | **Description**                       |
| -------- | ----------- | ------------------------------------- |
| number   | 1.0         | Total duration of animation (seconds) |

**Description:** Total duration of animation (seconds)

| Restrictions |         |
| ------------ | ------- |
| **Minimum**  | N/A     |
| **Maximum**  | &le; 10 |

## 5. Property `wheel_buttons`

| **Type** | **Default** | **Description**                              |
| -------- | ----------- | -------------------------------------------- |
| array    | -           | Array of sub-buttons to include in the wheel |

**Description:** Array of sub-buttons to include in the wheel

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | 8                  |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be      | Description |
| ------------------------------------ | ----------- |
| [wheel_button](#wheel_buttons_items) | -           |

### 5.1. wheel_button

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property                                                | Type    | Default | Description                                                                                  |
| ------------------------------------------------------- | ------- | ------- | -------------------------------------------------------------------------------------------- |
| + sub_button                                            | string  | -       | Sub-button identifier (1, 2, 3, etc.)                                                        |
| - [position](#wheel_buttons_items_position)             | integer | -       | Fixed position in wheel (1-8, optional)                                                      |
| - [close_on_click](#wheel_buttons_items_close_on_click) | boolean | -       | Close wheel when this button is clicked (overrides global close_on_sub_button_click setting) |

#### 5.1.1. Property `sub_button`

| **Type** | **Default** | **Description**                       |
| -------- | ----------- | ------------------------------------- |
| string   | -           | Sub-button identifier (1, 2, 3, etc.) |

**Description:** Sub-button identifier (1, 2, 3, etc.)

#### 5.1.2. Property `position`

| **Type** | **Default** | **Description**                         |
| -------- | ----------- | --------------------------------------- |
| integer  | -           | Fixed position in wheel (1-8, optional) |

**Description:** Fixed position in wheel (1-8, optional)

| Restrictions |        |
| ------------ | ------ |
| **Minimum**  | &ge; 1 |
| **Maximum**  | &le; 8 |

#### 5.1.3. Property `close_on_click`

| **Type** | **Default** | **Description**                                                                              |
| -------- | ----------- | -------------------------------------------------------------------------------------------- |
| boolean  | -           | Close wheel when this button is clicked (overrides global close_on_sub_button_click setting) |

**Description:** Close wheel when this button is clicked (overrides global close_on_sub_button_click setting)

---

Generated using [json-schema-for-humans](https://github.com/coveooss/json-schema-for-humans)
