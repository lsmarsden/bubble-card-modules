# `icon_border_progress`

- [1. icon_progress_config](#1-icon_progress_config)
  - [1.1. button_config](#11-button_config)
    - [1.1.1. Property `button`](#111-property-button)
    - [1.1.2. Property `source`](#112-property-source)
    - [1.1.3. Property `entity`](#113-property-entity)
    - [1.1.4. Property `invert`](#114-property-invert)
    - [1.1.5. Property `start`](#115-property-start)
      - [1.1.5.1. Property `item 0`](#1151-property-item-0)
      - [1.1.5.2. Property `item 1`](#1152-property-item-1)
    - [1.1.6. Property `end`](#116-property-end)
      - [1.1.6.1. Property `item 0`](#1161-property-item-0)
      - [1.1.6.2. Property `item 1`](#1162-property-item-1)
    - [1.1.7. Property `interpolate_colors`](#117-property-interpolate_colors)
    - [1.1.8. Property `color_stops`](#118-property-color_stops)
      - [1.1.8.1. color_stop](#1181-color_stop)
        - [1.1.8.1.1. Property `percent`](#11811-property-percent)
        - [1.1.8.1.2. Property `color`](#11812-property-color)
    - [1.1.9. Property `background_color`](#119-property-background_color)
    - [1.1.10. Property `backcolor`](#1110-property-backcolor)
    - [1.1.11. Property `remaining_color`](#1111-property-remaining_color)
    - [1.1.12. Property `remainingcolor`](#1112-property-remainingcolor)
    - [1.1.13. Property `condition`](#1113-property-condition)
      - [1.1.13.1. Property `condition`](#11131-property-condition)
        - [1.1.13.1.1. Property `item 0`](#111311-property-item-0)
          - [1.1.13.1.1.1. Property `condition`](#1113111-property-condition)
          - [1.1.13.1.1.2. Property `entity`](#1113112-property-entity)
          - [1.1.13.1.1.3. Property `attribute`](#1113113-property-attribute)
          - [1.1.13.1.1.4. Property `state`](#1113114-property-state)
            - [1.1.13.1.1.4.1. Property `item 0`](#11131141-property-item-0)
            - [1.1.13.1.1.4.2. Property `item 1`](#11131142-property-item-1)
            - [1.1.13.1.1.4.3. Property `item 2`](#11131143-property-item-2)
              - [1.1.13.1.1.4.3.1. item 2 items](#111311431-item-2-items)
                - [1.1.13.1.1.4.3.1.1. Property `item 0`](#1113114311-property-item-0)
                - [1.1.13.1.1.4.3.1.2. Property `item 1`](#1113114312-property-item-1)
        - [1.1.13.1.2. Property `item 1`](#111312-property-item-1)
          - [1.1.13.1.2.1. Property `condition`](#1113121-property-condition)
          - [1.1.13.1.2.2. Property `entity`](#1113122-property-entity)
          - [1.1.13.1.2.3. Property `attribute`](#1113123-property-attribute)
          - [1.1.13.1.2.4. Property `above`](#1113124-property-above)
            - [1.1.13.1.2.4.1. Property `item 0`](#11131241-property-item-0)
            - [1.1.13.1.2.4.2. Property `item 1`](#11131242-property-item-1)
          - [1.1.13.1.2.5. Property `below`](#1113125-property-below)
            - [1.1.13.1.2.5.1. Property `item 0`](#11131251-property-item-0)
            - [1.1.13.1.2.5.2. Property `item 1`](#11131252-property-item-1)
        - [1.1.13.1.3. Property `item 2`](#111313-property-item-2)
          - [1.1.13.1.3.1. Property `condition`](#1113131-property-condition)
          - [1.1.13.1.3.2. Property `entity`](#1113132-property-entity)
          - [1.1.13.1.3.3. Property `attribute`](#1113133-property-attribute)
        - [1.1.13.1.4. Property `item 3`](#111314-property-item-3)
          - [1.1.13.1.4.1. Property `condition`](#1113141-property-condition)
          - [1.1.13.1.4.2. Property `conditions`](#1113142-property-conditions)
            - [1.1.13.1.4.2.1. condition](#11131421-condition)
        - [1.1.13.1.5. Property `item 4`](#111315-property-item-4)
          - [1.1.13.1.5.1. Property `condition`](#1113151-property-condition)
          - [1.1.13.1.5.2. Property `conditions`](#1113152-property-conditions)
            - [1.1.13.1.5.2.1. condition](#11131521-condition)
        - [1.1.13.1.6. Property `item 5`](#111316-property-item-5)
          - [1.1.13.1.6.1. Property `condition`](#1113161-property-condition)
          - [1.1.13.1.6.2. Property `conditions`](#1113162-property-conditions)
            - [1.1.13.1.6.2.1. Property `condition`](#11131621-property-condition)
            - [1.1.13.1.6.2.2. Property `item 1`](#11131622-property-item-1)
              - [1.1.13.1.6.2.2.1. condition](#111316221-condition)
      - [1.1.13.2. Property `item 1`](#11132-property-item-1)
        - [1.1.13.2.1. condition](#111321-condition)
    - [1.1.14. Property `effects`](#1114-property-effects)
      - [1.1.14.1. effects items](#11141-effects-items)
    - [1.1.15. Property `border_radius`](#1115-property-border_radius)
      - [1.1.15.1. Property `item 0`](#11151-property-item-0)
      - [1.1.15.2. Property `item 1`](#11152-property-item-1)

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
| [button_config](#items_items)   | -           |

### 1.1. button_config

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property                                                | Type            | Default | Description                                                                                                                             |
| ------------------------------------------------------- | --------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| + button                                                | string          | -       | Button to apply progress to. Use 'main', 'main-button', or 'sub-button-N'                                                               |
| + source                                                | string          | -       | Source entity for progress value                                                                                                        |
| - [entity](#items_items_entity)                         | string          | -       | [DEPRECATED] Use 'source' instead. Source entity for progress value                                                                     |
| - [invert](#items_items_invert)                         | boolean         | false   | Invert the progress direction (default: false)                                                                                          |
| - [start](#items_items_start)                           | object          | 0       | Start value for progress range (default: 0)                                                                                             |
| - [end](#items_items_end)                               | object          | 100     | End value for progress range (default: 100)                                                                                             |
| - [interpolate_colors](#items_items_interpolate_colors) | boolean         | false   | Whether to interpolate colors between stops                                                                                             |
| - [color_stops](#items_items_color_stops)               | array           | -       | Array of color stops for progress visualization                                                                                         |
| - [background_color](#items_items_background_color)     | string          | -       | Background color of the icon (supports DER)                                                                                             |
| - [backcolor](#items_items_backcolor)                   | string          | -       | [DEPRECATED] Use 'background_color' instead                                                                                             |
| - [remaining_color](#items_items_remaining_color)       | string          | -       | Color of the remaining progress section (supports DER)                                                                                  |
| - [remainingcolor](#items_items_remainingcolor)         | string          | -       | [DEPRECATED] Use 'remaining_color' instead                                                                                              |
| - [condition](#items_items_condition)                   | object          | -       | Conditions to show the progress border                                                                                                  |
| - [effects](#items_items_effects)                       | array of object | -       | Array of visual effects to apply                                                                                                        |
| - [border_radius](#items_items_border_radius)           | object          | -       | Custom border radius for the progress border (overrides CSS border-radius). Can be a number (pixels) or CSS value (e.g., '10px', '50%') |

#### 1.1.1. Property `button`

| **Type** | **Default** | **Description**                                                           |
| -------- | ----------- | ------------------------------------------------------------------------- |
| string   | -           | Button to apply progress to. Use 'main', 'main-button', or 'sub-button-N' |

**Description:** Button to apply progress to. Use 'main', 'main-button', or 'sub-button-N'

#### 1.1.2. Property `source`

| **Type** | **Default** | **Description**                  |
| -------- | ----------- | -------------------------------- |
| string   | -           | Source entity for progress value |

**Description:** Source entity for progress value

#### 1.1.3. Property `entity`

| **Type** | **Default** | **Description**                                                     |
| -------- | ----------- | ------------------------------------------------------------------- |
| string   | -           | [DEPRECATED] Use 'source' instead. Source entity for progress value |

**Description:** [DEPRECATED] Use 'source' instead. Source entity for progress value

#### 1.1.4. Property `invert`

| **Type** | **Default** | **Description**                                |
| -------- | ----------- | ---------------------------------------------- |
| boolean  | false       | Invert the progress direction (default: false) |

**Description:** Invert the progress direction (default: false)

#### 1.1.5. Property `start`

| **Type** | **Default** | **Description**                             |
| -------- | ----------- | ------------------------------------------- |
| object   | 0           | Start value for progress range (default: 0) |

**Description:** Start value for progress range (default: 0)

| One of(Option)                        |
| ------------------------------------- |
| [item 0](#items_items_start_oneOf_i0) |
| [item 1](#items_items_start_oneOf_i1) |

##### 1.1.5.1. Property `item 0`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| number   | -           | -               |

##### 1.1.5.2. Property `item 1`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

#### 1.1.6. Property `end`

| **Type** | **Default** | **Description**                             |
| -------- | ----------- | ------------------------------------------- |
| object   | 100         | End value for progress range (default: 100) |

**Description:** End value for progress range (default: 100)

| One of(Option)                      |
| ----------------------------------- |
| [item 0](#items_items_end_oneOf_i0) |
| [item 1](#items_items_end_oneOf_i1) |

##### 1.1.6.1. Property `item 0`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| number   | -           | -               |

##### 1.1.6.2. Property `item 1`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

#### 1.1.7. Property `interpolate_colors`

| **Type** | **Default** | **Description**                             |
| -------- | ----------- | ------------------------------------------- |
| boolean  | false       | Whether to interpolate colors between stops |

**Description:** Whether to interpolate colors between stops

#### 1.1.8. Property `color_stops`

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

| Each item of this array must be              | Description |
| -------------------------------------------- | ----------- |
| [color_stop](#items_items_color_stops_items) | -           |

##### 1.1.8.1. color_stop

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property  | Type   | Default | Description                                        |
| --------- | ------ | ------- | -------------------------------------------------- |
| + percent | number | -       | Percentage value for this color stop               |
| + color   | string | -       | Color value (hex, rgb, named color, or DER entity) |

###### 1.1.8.1.1. Property `percent`

| **Type** | **Default** | **Description**                      |
| -------- | ----------- | ------------------------------------ |
| number   | -           | Percentage value for this color stop |

**Description:** Percentage value for this color stop

| Restrictions |          |
| ------------ | -------- |
| **Minimum**  | &ge; 0   |
| **Maximum**  | &le; 100 |

###### 1.1.8.1.2. Property `color`

| **Type** | **Default** | **Description**                                    |
| -------- | ----------- | -------------------------------------------------- |
| string   | -           | Color value (hex, rgb, named color, or DER entity) |

**Description:** Color value (hex, rgb, named color, or DER entity)

#### 1.1.9. Property `background_color`

| **Type** | **Default** | **Description**                             |
| -------- | ----------- | ------------------------------------------- |
| string   | -           | Background color of the icon (supports DER) |

**Description:** Background color of the icon (supports DER)

#### 1.1.10. Property `backcolor`

| **Type** | **Default** | **Description**                             |
| -------- | ----------- | ------------------------------------------- |
| string   | -           | [DEPRECATED] Use 'background_color' instead |

**Description:** [DEPRECATED] Use 'background_color' instead

#### 1.1.11. Property `remaining_color`

| **Type** | **Default** | **Description**                                        |
| -------- | ----------- | ------------------------------------------------------ |
| string   | -           | Color of the remaining progress section (supports DER) |

**Description:** Color of the remaining progress section (supports DER)

#### 1.1.12. Property `remainingcolor`

| **Type** | **Default** | **Description**                            |
| -------- | ----------- | ------------------------------------------ |
| string   | -           | [DEPRECATED] Use 'remaining_color' instead |

**Description:** [DEPRECATED] Use 'remaining_color' instead

#### 1.1.13. Property `condition`

| **Type** | **Default** | **Description**                        |
| -------- | ----------- | -------------------------------------- |
| object   | -           | Conditions to show the progress border |

**Description:** Conditions to show the progress border

| One of(Option)                               |
| -------------------------------------------- |
| [condition](#items_items_condition_oneOf_i0) |
| [item 1](#items_items_condition_oneOf_i1)    |

##### 1.1.13.1. Property `condition`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| One of(Option)                                     |
| -------------------------------------------------- |
| [item 0](#items_items_condition_oneOf_i0_oneOf_i0) |
| [item 1](#items_items_condition_oneOf_i0_oneOf_i1) |
| [item 2](#items_items_condition_oneOf_i0_oneOf_i2) |
| [item 3](#items_items_condition_oneOf_i0_oneOf_i3) |
| [item 4](#items_items_condition_oneOf_i0_oneOf_i4) |
| [item 5](#items_items_condition_oneOf_i0_oneOf_i5) |

###### 1.1.13.1.1. Property `item 0`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property                                                          | Type   | Default | Description |
| ----------------------------------------------------------------- | ------ | ------- | ----------- |
| + condition                                                       | const  | -       | -           |
| + entity                                                          | string | -       | -           |
| - [attribute](#items_items_condition_oneOf_i0_oneOf_i0_attribute) | string | -       | -           |
| + state                                                           | object | -       | -           |

###### 1.1.13.1.1.1. Property `condition`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| const    | -           | -               |

Specific value: `"state"`

###### 1.1.13.1.1.2. Property `entity`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.1.13.1.1.3. Property `attribute`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.1.13.1.1.4. Property `state`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| One of(Option)                                                    |
| ----------------------------------------------------------------- |
| [item 0](#items_items_condition_oneOf_i0_oneOf_i0_state_oneOf_i0) |
| [item 1](#items_items_condition_oneOf_i0_oneOf_i0_state_oneOf_i1) |
| [item 2](#items_items_condition_oneOf_i0_oneOf_i0_state_oneOf_i2) |

###### 1.1.13.1.1.4.1. Property `item 0`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.1.13.1.1.4.2. Property `item 1`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| number   | -           | -               |

###### 1.1.13.1.1.4.3. Property `item 2`

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

| Each item of this array must be                                               | Description |
| ----------------------------------------------------------------------------- | ----------- |
| [item 2 items](#items_items_condition_oneOf_i0_oneOf_i0_state_oneOf_i2_items) | -           |

###### 1.1.13.1.1.4.3.1. item 2 items

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| One of(Option)                                                                   |
| -------------------------------------------------------------------------------- |
| [item 0](#items_items_condition_oneOf_i0_oneOf_i0_state_oneOf_i2_items_oneOf_i0) |
| [item 1](#items_items_condition_oneOf_i0_oneOf_i0_state_oneOf_i2_items_oneOf_i1) |

###### 1.1.13.1.1.4.3.1.1. Property `item 0`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.1.13.1.1.4.3.1.2. Property `item 1`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| number   | -           | -               |

###### 1.1.13.1.2. Property `item 1`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property                                                          | Type   | Default | Description |
| ----------------------------------------------------------------- | ------ | ------- | ----------- |
| + condition                                                       | const  | -       | -           |
| + entity                                                          | string | -       | -           |
| - [attribute](#items_items_condition_oneOf_i0_oneOf_i1_attribute) | string | -       | -           |
| - [above](#items_items_condition_oneOf_i0_oneOf_i1_above)         | object | -       | -           |
| - [below](#items_items_condition_oneOf_i0_oneOf_i1_below)         | object | -       | -           |

###### 1.1.13.1.2.1. Property `condition`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| const    | -           | -               |

Specific value: `"numeric_state"`

###### 1.1.13.1.2.2. Property `entity`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.1.13.1.2.3. Property `attribute`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.1.13.1.2.4. Property `above`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| One of(Option)                                                    |
| ----------------------------------------------------------------- |
| [item 0](#items_items_condition_oneOf_i0_oneOf_i1_above_oneOf_i0) |
| [item 1](#items_items_condition_oneOf_i0_oneOf_i1_above_oneOf_i1) |

###### 1.1.13.1.2.4.1. Property `item 0`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| number   | -           | -               |

###### 1.1.13.1.2.4.2. Property `item 1`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.1.13.1.2.5. Property `below`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| One of(Option)                                                    |
| ----------------------------------------------------------------- |
| [item 0](#items_items_condition_oneOf_i0_oneOf_i1_below_oneOf_i0) |
| [item 1](#items_items_condition_oneOf_i0_oneOf_i1_below_oneOf_i1) |

###### 1.1.13.1.2.5.1. Property `item 0`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| number   | -           | -               |

###### 1.1.13.1.2.5.2. Property `item 1`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.1.13.1.3. Property `item 2`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property                                                          | Type   | Default | Description |
| ----------------------------------------------------------------- | ------ | ------- | ----------- |
| + condition                                                       | const  | -       | -           |
| + entity                                                          | string | -       | -           |
| - [attribute](#items_items_condition_oneOf_i0_oneOf_i2_attribute) | string | -       | -           |

###### 1.1.13.1.3.1. Property `condition`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| const    | -           | -               |

Specific value: `"exists"`

###### 1.1.13.1.3.2. Property `entity`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.1.13.1.3.3. Property `attribute`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

###### 1.1.13.1.4. Property `item 3`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property     | Type  | Default | Description |
| ------------ | ----- | ------- | ----------- |
| + condition  | const | -       | -           |
| + conditions | array | -       | -           |

###### 1.1.13.1.4.1. Property `condition`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| const    | -           | -               |

Specific value: `"and"`

###### 1.1.13.1.4.2. Property `conditions`

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

| Each item of this array must be                                        | Description |
| ---------------------------------------------------------------------- | ----------- |
| [condition](#items_items_condition_oneOf_i0_oneOf_i3_conditions_items) | -           |

###### 1.1.13.1.4.2.1. condition

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

###### 1.1.13.1.5. Property `item 4`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property     | Type  | Default | Description |
| ------------ | ----- | ------- | ----------- |
| + condition  | const | -       | -           |
| + conditions | array | -       | -           |

###### 1.1.13.1.5.1. Property `condition`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| const    | -           | -               |

Specific value: `"or"`

###### 1.1.13.1.5.2. Property `conditions`

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

| Each item of this array must be                                        | Description |
| ---------------------------------------------------------------------- | ----------- |
| [condition](#items_items_condition_oneOf_i0_oneOf_i4_conditions_items) | -           |

###### 1.1.13.1.5.2.1. condition

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

###### 1.1.13.1.6. Property `item 5`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| Property                                                            | Type   | Default | Description |
| ------------------------------------------------------------------- | ------ | ------- | ----------- |
| + condition                                                         | const  | -       | -           |
| - [conditions](#items_items_condition_oneOf_i0_oneOf_i5_conditions) | object | -       | -           |

###### 1.1.13.1.6.1. Property `condition`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| const    | -           | -               |

Specific value: `"not"`

###### 1.1.13.1.6.2. Property `conditions`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

| One of(Option)                                                            |
| ------------------------------------------------------------------------- |
| [condition](#items_items_condition_oneOf_i0_oneOf_i5_conditions_oneOf_i0) |
| [item 1](#items_items_condition_oneOf_i0_oneOf_i5_conditions_oneOf_i1)    |

###### 1.1.13.1.6.2.1. Property `condition`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

###### 1.1.13.1.6.2.2. Property `item 1`

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

| Each item of this array must be                                                 | Description |
| ------------------------------------------------------------------------------- | ----------- |
| [condition](#items_items_condition_oneOf_i0_oneOf_i5_conditions_oneOf_i1_items) | -           |

###### 1.1.13.1.6.2.2.1. condition

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

##### 1.1.13.2. Property `item 1`

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

| Each item of this array must be                    | Description |
| -------------------------------------------------- | ----------- |
| [condition](#items_items_condition_oneOf_i1_items) | -           |

###### 1.1.13.2.1. condition

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

#### 1.1.14. Property `effects`

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

| Each item of this array must be             | Description |
| ------------------------------------------- | ----------- |
| [effects items](#items_items_effects_items) | -           |

##### 1.1.14.1. effects items

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| object   | -           | -               |

#### 1.1.15. Property `border_radius`

| **Type** | **Default** | **Description**                                                                                                                         |
| -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| object   | -           | Custom border radius for the progress border (overrides CSS border-radius). Can be a number (pixels) or CSS value (e.g., '10px', '50%') |

**Description:** Custom border radius for the progress border (overrides CSS border-radius). Can be a number (pixels) or CSS value (e.g., '10px', '50%')

| One of(Option)                                |
| --------------------------------------------- |
| [item 0](#items_items_border_radius_oneOf_i0) |
| [item 1](#items_items_border_radius_oneOf_i1) |

##### 1.1.15.1. Property `item 0`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| number   | -           | -               |

| Restrictions |        |
| ------------ | ------ |
| **Minimum**  | &ge; 0 |

##### 1.1.15.2. Property `item 1`

| **Type** | **Default** | **Description** |
| -------- | ----------- | --------------- |
| string   | -           | -               |

---

Generated using [json-schema-for-humans](https://github.com/coveooss/json-schema-for-humans)
