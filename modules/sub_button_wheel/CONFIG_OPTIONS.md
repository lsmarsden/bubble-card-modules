# `sub_button_wheel`

- [1. Property `wheel_opener`](#1-property-wheel_opener)
- [2. Property `layout_options`](#2-property-layout_options)
  - [2.1. Property `wheel_layout`](#21-property-wheel_layout)
  - [2.2. Property `double_ring_inner_count`](#22-property-double_ring_inner_count)
- [3. Property `animation_options`](#3-property-animation_options)
  - [3.1. Property `wheel_animation`](#31-property-wheel_animation)
  - [3.2. Property `animation_delay`](#32-property-animation_delay)
  - [3.3. Property `animation_duration`](#33-property-animation_duration)
- [4. Property `wheel_buttons`](#4-property-wheel_buttons)
  - [4.1. wheel_button](#41-wheel_button)
    - [4.1.1. Property `sub_button`](#411-property-sub_button)
    - [4.1.2. Property `position`](#412-property-position)

**Title:** `sub_button_wheel`

| **Type** | **Default** | **Description**                                         |
| -------- | ----------- | ------------------------------------------------------- |
| object   | -           | Configuration for sub-button wheel layout functionality |

**Description:** Configuration for sub-button wheel layout functionality

| Property                                  | Type   | Default | Description                                                      |
| ----------------------------------------- | ------ | ------- | ---------------------------------------------------------------- |
| + wheel_opener                            | string | -       | Button that opens the wheel (e.g., 'main', 'sub-button-1', etc.) |
| - [layout_options](#layout_options)       | object | -       | Layout configuration options                                     |
| - [animation_options](#animation_options) | object | -       | Animation configuration options                                  |
| + wheel_buttons                           | array  | -       | Array of sub-buttons to include in the wheel                     |

## 1. Property `wheel_opener`

| **Type** | **Default** | **Description**                                                  |
| -------- | ----------- | ---------------------------------------------------------------- |
| string   | -           | Button that opens the wheel (e.g., 'main', 'sub-button-1', etc.) |

**Description:** Button that opens the wheel (e.g., 'main', 'sub-button-1', etc.)

## 2. Property `layout_options`

| **Type** | **Default** | **Description**              |
| -------- | ----------- | ---------------------------- |
| object   | -           | Layout configuration options |

**Description:** Layout configuration options

| Property                                                             | Type             | Default       | Description                                               |
| -------------------------------------------------------------------- | ---------------- | ------------- | --------------------------------------------------------- |
| - [wheel_layout](#layout_options_wheel_layout)                       | enum (of string) | "even-circle" | Wheel layout style                                        |
| - [double_ring_inner_count](#layout_options_double_ring_inner_count) | integer          | 4             | Number of buttons in inner ring (double-ring layout only) |

### 2.1. Property `wheel_layout`

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

### 2.2. Property `double_ring_inner_count`

| **Type** | **Default** | **Description**                                           |
| -------- | ----------- | --------------------------------------------------------- |
| integer  | 4           | Number of buttons in inner ring (double-ring layout only) |

**Description:** Number of buttons in inner ring (double-ring layout only)

| Restrictions |        |
| ------------ | ------ |
| **Minimum**  | &ge; 1 |
| **Maximum**  | &le; 8 |

## 3. Property `animation_options`

| **Type** | **Default** | **Description**                 |
| -------- | ----------- | ------------------------------- |
| object   | -           | Animation configuration options |

**Description:** Animation configuration options

| Property                                                      | Type             | Default           | Description                                     |
| ------------------------------------------------------------- | ---------------- | ----------------- | ----------------------------------------------- |
| - [wheel_animation](#animation_options_wheel_animation)       | enum (of string) | "staggered-scale" | Animation style when wheel opens                |
| - [animation_delay](#animation_options_animation_delay)       | number           | 0.5               | Initial delay before animation starts (seconds) |
| - [animation_duration](#animation_options_animation_duration) | number           | 1.0               | Total duration of animation (seconds)           |

### 3.1. Property `wheel_animation`

| **Type**         | **Default**       | **Description**                  |
| ---------------- | ----------------- | -------------------------------- |
| enum (of string) | "staggered-scale" | Animation style when wheel opens |

**Description:** Animation style when wheel opens

Must be one of:

- "staggered-scale"
- "instant"

### 3.2. Property `animation_delay`

| **Type** | **Default** | **Description**                                 |
| -------- | ----------- | ----------------------------------------------- |
| number   | 0.5         | Initial delay before animation starts (seconds) |

**Description:** Initial delay before animation starts (seconds)

| Restrictions |         |
| ------------ | ------- |
| **Minimum**  | &ge; 0  |
| **Maximum**  | &le; 10 |

### 3.3. Property `animation_duration`

| **Type** | **Default** | **Description**                       |
| -------- | ----------- | ------------------------------------- |
| number   | 1.0         | Total duration of animation (seconds) |

**Description:** Total duration of animation (seconds)

| Restrictions |         |
| ------------ | ------- |
| **Minimum**  | N/A     |
| **Maximum**  | &le; 10 |

## 4. Property `wheel_buttons`

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

### 4.1. wheel_button

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property                                    | Type    | Default | Description                             |
| ------------------------------------------- | ------- | ------- | --------------------------------------- |
| + sub_button                                | string  | -       | Sub-button identifier (1, 2, 3, etc.)   |
| - [position](#wheel_buttons_items_position) | integer | -       | Fixed position in wheel (1-8, optional) |

#### 4.1.1. Property `sub_button`

| **Type** | **Default** | **Description**                       |
| -------- | ----------- | ------------------------------------- |
| string   | -           | Sub-button identifier (1, 2, 3, etc.) |

**Description:** Sub-button identifier (1, 2, 3, etc.)

#### 4.1.2. Property `position`

| **Type** | **Default** | **Description**                         |
| -------- | ----------- | --------------------------------------- |
| integer  | -           | Fixed position in wheel (1-8, optional) |

**Description:** Fixed position in wheel (1-8, optional)

| Restrictions |        |
| ------------ | ------ |
| **Minimum**  | &ge; 1 |
| **Maximum**  | &le; 8 |

---

Generated using [json-schema-for-humans](https://github.com/coveooss/json-schema-for-humans)
