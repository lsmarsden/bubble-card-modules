# `icon_border_progress`

- [1. icon_progress_config](#1-icon_progress_config)
  - [1.1. Property `button`](#11-property-button)
  - [1.2. Property `source`](#12-property-source)
  - [1.3. Property `entity`](#13-property-entity)
  - [1.4. Property `start`](#14-property-start)
    - [1.4.1. Property `item 0`](#141-property-item-0)
    - [1.4.2. Property `item 1`](#142-property-item-1)
  - [1.5. Property `end`](#15-property-end)
    - [1.5.1. Property `item 0`](#151-property-item-0)
    - [1.5.2. Property `item 1`](#152-property-item-1)
  - [1.6. Property `interpolate_colors`](#16-property-interpolate_colors)
  - [1.7. Property `color_stops`](#17-property-color_stops)
    - [1.7.1. color_stop](#171-color_stop)
      - [1.7.1.1. Property `percent`](#1711-property-percent)
      - [1.7.1.2. Property `color`](#1712-property-color)
  - [1.8. Property `background_color`](#18-property-background_color)
  - [1.9. Property `backcolor`](#19-property-backcolor)
  - [1.10. Property `remaining_color`](#110-property-remaining_color)
  - [1.11. Property `remainingcolor`](#111-property-remainingcolor)
  - [1.12. Property `condition`](#112-property-condition)
    - [1.12.1. Property `condition`](#1121-property-condition)
      - [1.12.1.1. Property `item 0`](#11211-property-item-0)
        - [1.12.1.1.1. Property `condition`](#112111-property-condition)
        - [1.12.1.1.2. Property `entity`](#112112-property-entity)
        - [1.12.1.1.3. Property `attribute`](#112113-property-attribute)
        - [1.12.1.1.4. Property `state`](#112114-property-state)
          - [1.12.1.1.4.1. Property `item 0`](#1121141-property-item-0)
          - [1.12.1.1.4.2. Property `item 1`](#1121142-property-item-1)
          - [1.12.1.1.4.3. Property `item 2`](#1121143-property-item-2)
            - [1.12.1.1.4.3.1. item 2 items](#11211431-item-2-items)
              - [1.12.1.1.4.3.1.1. Property `item 0`](#112114311-property-item-0)
              - [1.12.1.1.4.3.1.2. Property `item 1`](#112114312-property-item-1)
      - [1.12.1.2. Property `item 1`](#11212-property-item-1)
        - [1.12.1.2.1. Property `condition`](#112121-property-condition)
        - [1.12.1.2.2. Property `entity`](#112122-property-entity)
        - [1.12.1.2.3. Property `attribute`](#112123-property-attribute)
        - [1.12.1.2.4. Property `above`](#112124-property-above)
          - [1.12.1.2.4.1. Property `item 0`](#1121241-property-item-0)
          - [1.12.1.2.4.2. Property `item 1`](#1121242-property-item-1)
        - [1.12.1.2.5. Property `below`](#112125-property-below)
          - [1.12.1.2.5.1. Property `item 0`](#1121251-property-item-0)
          - [1.12.1.2.5.2. Property `item 1`](#1121252-property-item-1)
      - [1.12.1.3. Property `item 2`](#11213-property-item-2)
        - [1.12.1.3.1. Property `condition`](#112131-property-condition)
        - [1.12.1.3.2. Property `entity`](#112132-property-entity)
        - [1.12.1.3.3. Property `attribute`](#112133-property-attribute)
      - [1.12.1.4. Property `item 3`](#11214-property-item-3)
        - [1.12.1.4.1. Property `condition`](#112141-property-condition)
        - [1.12.1.4.2. Property `conditions`](#112142-property-conditions)
          - [1.12.1.4.2.1. condition](#1121421-condition)
      - [1.12.1.5. Property `item 4`](#11215-property-item-4)
        - [1.12.1.5.1. Property `condition`](#112151-property-condition)
        - [1.12.1.5.2. Property `conditions`](#112152-property-conditions)
          - [1.12.1.5.2.1. condition](#1121521-condition)
      - [1.12.1.6. Property `item 5`](#11216-property-item-5)
        - [1.12.1.6.1. Property `condition`](#112161-property-condition)
        - [1.12.1.6.2. Property `conditions`](#112162-property-conditions)
          - [1.12.1.6.2.1. Property `condition`](#1121621-property-condition)
          - [1.12.1.6.2.2. Property `item 1`](#1121622-property-item-1)
            - [1.12.1.6.2.2.1. condition](#11216221-condition)
    - [1.12.2. Property `item 1`](#1122-property-item-1)
      - [1.12.2.1. condition](#11221-condition)
  - [1.13. Property `effects`](#113-property-effects)
    - [1.13.1. effects items](#1131-effects-items)
  - [1.14. Property `border_radius`](#114-property-border_radius)
    - [1.14.1. Property `item 0`](#1141-property-item-0)
    - [1.14.2. Property `item 1`](#1142-property-item-1)

**Title:** `icon_border_progress`

| **Type** | **Default** | **Description**                                                                                                                   |
| -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| array    | -           | Array of icon progress configurations. The progress border automatically matches the icon's border radius for visual consistency. |

**Description:** Array of icon progress configurations. The progress border automatically matches the icon's border radius for visual consistency.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be | Description |
| ------------------------------- | ----------- |
| [icon_progress_config](#items)  | -           |

## 1. icon_progress_config

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property                                          | Type            | Default | Description                                                                                                                             |
| ------------------------------------------------- | --------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| + button                                          | string          | -       | Button to apply progress to. Use 'main', 'main-button', or 'sub-button-N'                                                               |
| + source                                          | string          | -       | Source entity for progress value                                                                                                        |
| - [entity](#items_entity)                         | string          | -       | [DEPRECATED] Use 'source' instead. Source entity for progress value                                                                     |
| - [start](#items_start)                           | object          | 0       | Start value for progress range (default: 0)                                                                                             |
| - [end](#items_end)                               | object          | 100     | End value for progress range (default: 100)                                                                                             |
| - [interpolate_colors](#items_interpolate_colors) | boolean         | false   | Whether to interpolate colors between stops                                                                                             |
| - [color_stops](#items_color_stops)               | array           | -       | Array of color stops for progress visualization                                                                                         |
| - [background_color](#items_background_color)     | string          | -       | Background color of the icon (supports DER)                                                                                             |
| - [backcolor](#items_backcolor)                   | string          | -       | [DEPRECATED] Use 'background_color' instead                                                                                             |
| - [remaining_color](#items_remaining_color)       | string          | -       | Color of the remaining progress section (supports DER)                                                                                  |
| - [remainingcolor](#items_remainingcolor)         | string          | -       | [DEPRECATED] Use 'remaining_color' instead                                                                                              |
| - [condition](#items_condition)                   | object          | -       | Conditions to show the progress border                                                                                                  |
| - [effects](#items_effects)                       | array of object | -       | Array of visual effects to apply                                                                                                        |
| - [border_radius](#items_border_radius)           | object          | -       | Custom border radius for the progress border (overrides CSS border-radius). Can be a number (pixels) or CSS value (e.g., '10px', '50%') |

### 1.1. Property `button`

| **Type** | **Default** | **Description**                                                           |
| -------- | ----------- | ------------------------------------------------------------------------- |
| string   | -           | Button to apply progress to. Use 'main', 'main-button', or 'sub-button-N' |

**Description:** Button to apply progress to. Use 'main', 'main-button', or 'sub-button-N'

### 1.2. Property `source`

| **Type** | **Default** | **Description**                  |
| -------- | ----------- | -------------------------------- |
| string   | -           | Source entity for progress value |

**Description:** Source entity for progress value

### 1.3. Property `entity`

| **Type** | **Default** | **Description**                                                     |
| -------- | ----------- | ------------------------------------------------------------------- |
| string   | -           | [DEPRECATED] Use 'source' instead. Source entity for progress value |

**Description:** [DEPRECATED] Use 'source' instead. Source entity for progress value

### 1.4. Property `start`

| **Type** | **Default** | **Description**                             |
| -------- | ----------- | ------------------------------------------- |
| object   | 0           | Start value for progress range (default: 0) |

**Description:** Start value for progress range (default: 0)

| One of(Option)                  |
| ------------------------------- |
| [item 0](#items_start_oneOf_i0) |
| [item 1](#items_start_oneOf_i1) |

#### 1.4.1. Property `item 0`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| number   | -           | -               |

#### 1.4.2. Property `item 1`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

### 1.5. Property `end`

| **Type** | **Default** | **Description**                             |
| -------- | ----------- | ------------------------------------------- |
| object   | 100         | End value for progress range (default: 100) |

**Description:** End value for progress range (default: 100)

| One of(Option)                |
| ----------------------------- |
| [item 0](#items_end_oneOf_i0) |
| [item 1](#items_end_oneOf_i1) |

#### 1.5.1. Property `item 0`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| number   | -           | -               |

#### 1.5.2. Property `item 1`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

### 1.6. Property `interpolate_colors`

| **Type** | **Default** | **Description**                             |
| -------- | ----------- | ------------------------------------------- |
| boolean  | false       | Whether to interpolate colors between stops |

**Description:** Whether to interpolate colors between stops

### 1.7. Property `color_stops`

| **Type** | **Default** | **Description**                                 |
| -------- | ----------- | ----------------------------------------------- |
| array    | -           | Array of color stops for progress visualization |

**Description:** Array of color stops for progress visualization

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be        | Description |
| -------------------------------------- | ----------- |
| [color_stop](#items_color_stops_items) | -           |

#### 1.7.1. color_stop

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property  | Type   | Default | Description                                        |
| --------- | ------ | ------- | -------------------------------------------------- |
| + percent | number | -       | Percentage value for this color stop               |
| + color   | string | -       | Color value (hex, rgb, named color, or DER entity) |

##### 1.7.1.1. Property `percent`

| **Type** | **Default** | **Description**                      |
| -------- | ----------- | ------------------------------------ |
| number   | -           | Percentage value for this color stop |

**Description:** Percentage value for this color stop

| Restrictions |          |
| ------------ | -------- |
| **Minimum**  | &ge; 0   |
| **Maximum**  | &le; 100 |

##### 1.7.1.2. Property `color`

| **Type** | **Default** | **Description**                                    |
| -------- | ----------- | -------------------------------------------------- |
| string   | -           | Color value (hex, rgb, named color, or DER entity) |

**Description:** Color value (hex, rgb, named color, or DER entity)

### 1.8. Property `background_color`

| **Type** | **Default** | **Description**                             |
| -------- | ----------- | ------------------------------------------- |
| string   | -           | Background color of the icon (supports DER) |

**Description:** Background color of the icon (supports DER)

### 1.9. Property `backcolor`

| **Type** | **Default** | **Description**                             |
| -------- | ----------- | ------------------------------------------- |
| string   | -           | [DEPRECATED] Use 'background_color' instead |

**Description:** [DEPRECATED] Use 'background_color' instead

### 1.10. Property `remaining_color`

| **Type** | **Default** | **Description**                                        |
| -------- | ----------- | ------------------------------------------------------ |
| string   | -           | Color of the remaining progress section (supports DER) |

**Description:** Color of the remaining progress section (supports DER)

### 1.11. Property `remainingcolor`

| **Type** | **Default** | **Description**                            |
| -------- | ----------- | ------------------------------------------ |
| string   | -           | [DEPRECATED] Use 'remaining_color' instead |

**Description:** [DEPRECATED] Use 'remaining_color' instead

### 1.12. Property `condition`

| **Type** | **Default** | **Description**                        |
| -------- | ----------- | -------------------------------------- |
| object   | -           | Conditions to show the progress border |

**Description:** Conditions to show the progress border

| One of(Option)                         |
| -------------------------------------- |
| [condition](#items_condition_oneOf_i0) |
| [item 1](#items_condition_oneOf_i1)    |

#### 1.12.1. Property `condition`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| One of(Option)                               |
| -------------------------------------------- |
| [item 0](#items_condition_oneOf_i0_oneOf_i0) |
| [item 1](#items_condition_oneOf_i0_oneOf_i1) |
| [item 2](#items_condition_oneOf_i0_oneOf_i2) |
| [item 3](#items_condition_oneOf_i0_oneOf_i3) |
| [item 4](#items_condition_oneOf_i0_oneOf_i4) |
| [item 5](#items_condition_oneOf_i0_oneOf_i5) |

##### 1.12.1.1. Property `item 0`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property                                                    | Type   | Default | Description |
| ----------------------------------------------------------- | ------ | ------- | ----------- |
| + condition                                                 | const  | -       | -           |
| + entity                                                    | string | -       | -           |
| - [attribute](#items_condition_oneOf_i0_oneOf_i0_attribute) | string | -       | -           |
| + state                                                     | object | -       | -           |

###### 1.12.1.1.1. Property `condition`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| const    | -           | -               |

Specific value: `"state"`

###### 1.12.1.1.2. Property `entity`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.12.1.1.3. Property `attribute`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.12.1.1.4. Property `state`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| One of(Option)                                              |
| ----------------------------------------------------------- |
| [item 0](#items_condition_oneOf_i0_oneOf_i0_state_oneOf_i0) |
| [item 1](#items_condition_oneOf_i0_oneOf_i0_state_oneOf_i1) |
| [item 2](#items_condition_oneOf_i0_oneOf_i0_state_oneOf_i2) |

###### 1.12.1.1.4.1. Property `item 0`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.12.1.1.4.2. Property `item 1`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| number   | -           | -               |

###### 1.12.1.1.4.3. Property `item 2`

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

| Each item of this array must be                                         | Description |
| ----------------------------------------------------------------------- | ----------- |
| [item 2 items](#items_condition_oneOf_i0_oneOf_i0_state_oneOf_i2_items) | -           |

###### 1.12.1.1.4.3.1. item 2 items

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| One of(Option)                                                             |
| -------------------------------------------------------------------------- |
| [item 0](#items_condition_oneOf_i0_oneOf_i0_state_oneOf_i2_items_oneOf_i0) |
| [item 1](#items_condition_oneOf_i0_oneOf_i0_state_oneOf_i2_items_oneOf_i1) |

###### 1.12.1.1.4.3.1.1. Property `item 0`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.12.1.1.4.3.1.2. Property `item 1`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| number   | -           | -               |

##### 1.12.1.2. Property `item 1`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property                                                    | Type   | Default | Description |
| ----------------------------------------------------------- | ------ | ------- | ----------- |
| + condition                                                 | const  | -       | -           |
| + entity                                                    | string | -       | -           |
| - [attribute](#items_condition_oneOf_i0_oneOf_i1_attribute) | string | -       | -           |
| - [above](#items_condition_oneOf_i0_oneOf_i1_above)         | object | -       | -           |
| - [below](#items_condition_oneOf_i0_oneOf_i1_below)         | object | -       | -           |

###### 1.12.1.2.1. Property `condition`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| const    | -           | -               |

Specific value: `"numeric_state"`

###### 1.12.1.2.2. Property `entity`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.12.1.2.3. Property `attribute`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.12.1.2.4. Property `above`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| One of(Option)                                              |
| ----------------------------------------------------------- |
| [item 0](#items_condition_oneOf_i0_oneOf_i1_above_oneOf_i0) |
| [item 1](#items_condition_oneOf_i0_oneOf_i1_above_oneOf_i1) |

###### 1.12.1.2.4.1. Property `item 0`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| number   | -           | -               |

###### 1.12.1.2.4.2. Property `item 1`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.12.1.2.5. Property `below`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| One of(Option)                                              |
| ----------------------------------------------------------- |
| [item 0](#items_condition_oneOf_i0_oneOf_i1_below_oneOf_i0) |
| [item 1](#items_condition_oneOf_i0_oneOf_i1_below_oneOf_i1) |

###### 1.12.1.2.5.1. Property `item 0`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| number   | -           | -               |

###### 1.12.1.2.5.2. Property `item 1`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

##### 1.12.1.3. Property `item 2`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property                                                    | Type   | Default | Description |
| ----------------------------------------------------------- | ------ | ------- | ----------- |
| + condition                                                 | const  | -       | -           |
| + entity                                                    | string | -       | -           |
| - [attribute](#items_condition_oneOf_i0_oneOf_i2_attribute) | string | -       | -           |

###### 1.12.1.3.1. Property `condition`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| const    | -           | -               |

Specific value: `"exists"`

###### 1.12.1.3.2. Property `entity`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.12.1.3.3. Property `attribute`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

##### 1.12.1.4. Property `item 3`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property     | Type  | Default | Description |
| ------------ | ----- | ------- | ----------- |
| + condition  | const | -       | -           |
| + conditions | array | -       | -           |

###### 1.12.1.4.1. Property `condition`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| const    | -           | -               |

Specific value: `"and"`

###### 1.12.1.4.2. Property `conditions`

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

| Each item of this array must be                                  | Description |
| ---------------------------------------------------------------- | ----------- |
| [condition](#items_condition_oneOf_i0_oneOf_i3_conditions_items) | -           |

###### 1.12.1.4.2.1. condition

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

##### 1.12.1.5. Property `item 4`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property     | Type  | Default | Description |
| ------------ | ----- | ------- | ----------- |
| + condition  | const | -       | -           |
| + conditions | array | -       | -           |

###### 1.12.1.5.1. Property `condition`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| const    | -           | -               |

Specific value: `"or"`

###### 1.12.1.5.2. Property `conditions`

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

| Each item of this array must be                                  | Description |
| ---------------------------------------------------------------- | ----------- |
| [condition](#items_condition_oneOf_i0_oneOf_i4_conditions_items) | -           |

###### 1.12.1.5.2.1. condition

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

##### 1.12.1.6. Property `item 5`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property                                                      | Type   | Default | Description |
| ------------------------------------------------------------- | ------ | ------- | ----------- |
| + condition                                                   | const  | -       | -           |
| - [conditions](#items_condition_oneOf_i0_oneOf_i5_conditions) | object | -       | -           |

###### 1.12.1.6.1. Property `condition`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| const    | -           | -               |

Specific value: `"not"`

###### 1.12.1.6.2. Property `conditions`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| One of(Option)                                                      |
| ------------------------------------------------------------------- |
| [condition](#items_condition_oneOf_i0_oneOf_i5_conditions_oneOf_i0) |
| [item 1](#items_condition_oneOf_i0_oneOf_i5_conditions_oneOf_i1)    |

###### 1.12.1.6.2.1. Property `condition`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

###### 1.12.1.6.2.2. Property `item 1`

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

| Each item of this array must be                                           | Description |
| ------------------------------------------------------------------------- | ----------- |
| [condition](#items_condition_oneOf_i0_oneOf_i5_conditions_oneOf_i1_items) | -           |

###### 1.12.1.6.2.2.1. condition

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

#### 1.12.2. Property `item 1`

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

| Each item of this array must be              | Description |
| -------------------------------------------- | ----------- |
| [condition](#items_condition_oneOf_i1_items) | -           |

##### 1.12.2.1. condition

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

### 1.13. Property `effects`

| **Type**        | **Default** | **Description**                  |
| --------------- | ----------- | -------------------------------- |
| array of object | -           | Array of visual effects to apply |

**Description:** Array of visual effects to apply

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be       | Description |
| ------------------------------------- | ----------- |
| [effects items](#items_effects_items) | -           |

#### 1.13.1. effects items

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

### 1.14. Property `border_radius`

| **Type** | **Default** | **Description**                                                                                                                         |
| -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| object   | -           | Custom border radius for the progress border (overrides CSS border-radius). Can be a number (pixels) or CSS value (e.g., '10px', '50%') |

**Description:** Custom border radius for the progress border (overrides CSS border-radius). Can be a number (pixels) or CSS value (e.g., '10px', '50%')

| One of(Option)                          |
| --------------------------------------- |
| [item 0](#items_border_radius_oneOf_i0) |
| [item 1](#items_border_radius_oneOf_i1) |

#### 1.14.1. Property `item 0`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| number   | -           | -               |

| Restrictions |        |
| ------------ | ------ |
| **Minimum**  | &ge; 0 |

#### 1.14.2. Property `item 1`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

---

Generated using [json-schema-for-humans](https://github.com/coveooss/json-schema-for-humans)
