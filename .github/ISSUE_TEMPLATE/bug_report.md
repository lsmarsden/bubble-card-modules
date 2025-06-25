---
name: Bug Report
about: Create a report to help us improve a module
title: "[MODULE] Brief description of the bug"
labels: ["type:bug", "status:needs-triage"]
assignees: ""
---

## Module

Please select the module this bug report is about:

- [ ] icon_border_progress
- [ ] separator_as_progress_bar
- [ ] separator_as_timeline
- [ ] circular_progress_bar
- [ ] helpers (shared functions)
- [ ] other (please specify)

## Bug Description

A clear and concise description of what the bug is.

## Expected Behavior

A clear and concise description of what you expected to happen.

## Actual Behavior

A clear and concise description of what actually happened.

## Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Reproducible Configuration

**⚠️ IMPORTANT: Please provide a complete, reproducible YAML configuration that demonstrates the bug.**

Remove any sensitive information (entity names, URLs, etc.) and replace with generic examples:

```yaml
# Complete bubble card configuration that reproduces the bug
type: custom:bubble-card
card_type: button
button_type: name
name: "Test Button"
icon: mdi:test-tube
entity: sensor.test_entity

# Module configuration that causes the issue
your_module_name:
  - button: main
    source: sensor.test_progress # Replace with your actual entity structure
    start: 0
    end: 100
    color_stops:
      - percent: 0
        color: "#ff0000"
      - percent: 100
        color: "#00ff00"
    # Add any other relevant configuration options
```

**Entity states for reproduction:**
If the bug depends on specific entity states, please provide example values:

```yaml
# Example entity states that trigger the bug
sensor.test_progress: "75"
sensor.test_start: "0"
sensor.test_end: "100"
```

## Environment

- Home Assistant version:
- Browser:
- Bubble Card version:
- Module version:

## Screenshots/Videos

If applicable, add screenshots or videos to help explain your problem.

## Console Errors

If there are any console errors, please include them here:

```
Paste console errors here
```

## Additional Context

Add any other context about the problem here.

## Checklist

- [ ] I have searched existing issues to ensure this is not a duplicate
- [ ] I have provided a clear and descriptive title
- [ ] I have included a complete, reproducible YAML configuration
- [ ] I have sanitized any sensitive information (entities, URLs, etc.)
- [ ] I have checked the console for errors
- [ ] I have tested with the latest version of the module
