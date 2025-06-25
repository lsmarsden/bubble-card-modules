# GitHub Copilot Instructions for Bubble Card Modules

## Project Overview

This project contains custom modules for Bubble Card Home Assistant integration. Each module is a self-contained JavaScript function that manipulates DOM elements based on Home Assistant entity states and user configuration.

## Core Development Principles

### 1. Test-Driven Development (TDD) - MANDATORY

**ALWAYS write tests BEFORE implementing any code changes or new features.**

#### TDD Process:

1. **Write failing test first** - Create integration tests that verify the expected behavior
2. **Run tests** - Confirm they fail as expected
3. **Implement minimal code** - Write just enough code to make tests pass
4. **Refactor** - Clean up while keeping tests green
5. **Repeat** - For each new feature or bug fix

#### For Bug Fixes:

- Write integration tests that reproduce the bug condition
- Write tests that verify the fix works correctly
- Example: For condition-based DOM cleanup, write tests that:
  - Verify DOM styling is applied when condition is true
  - Verify DOM styling is completely cleaned up when condition becomes false
  - Test rapid condition state changes

### 2. Testing Strategy - Comprehensive Coverage Required

#### Test Structure:

```javascript
describe("module_name", () => {
  describe("Unit Tests - Individual Features", () => {
    // Focused tests for specific functionality
    // Mock helper dependencies heavily
    // Test edge cases and error conditions
  });

  describe("Integration Tests - Real YAML Configs", () => {
    // End-to-end tests using real user configurations
    // Minimal mocking - let helpers run naturally
    // Comprehensive DOM property verification
  });
});
```

#### Integration Tests Must Verify:

- **All DOM properties** set by the module (CSS custom properties, classes, styles)
- **Entity querying** - verify correct entities were called
- **Helper function calls** - verify correct parameters passed
- **Condition handling** - test both true/false states with cleanup verification
- **Error graceful degradation** - missing entities, invalid values, etc.

#### Integration Test Mocking Strategy:

- **Minimal mocking only** - Only mock `hass` object with entity states/values
- **No helper mocking** - Let helper functions run naturally for true integration testing
- **Simple setup** - Use config object + mock hass states that make conditions true/false
- **GitHub issue references** - Include issue links in comments for bug-related tests

#### Real-World Test Configs:

- Use actual YAML examples from README files
- Test user-reported configurations when fixing bugs
- Cover all configuration combinations and edge cases

#### Test Structure Standards - MANDATORY:

**ALL tests must follow the three-section structure for clarity:**

```javascript
it("should describe the expected behavior", () => {
  // Setup - Arrange test data and mocks
  const config = {
    /* test configuration */
  };
  mockHass.states["entity.id"] = { state: "value" };

  // Exercise - Execute the functionality being tested
  module_function.call(mockThis, mockCard, mockHass);

  // Verify - Assert expected outcomes
  expect(mockElement.classList.add).toHaveBeenCalledWith("expected-class");
  expect(mockElement.style.setProperty).toHaveBeenCalledWith("--property", "value");
});
```

#### Unit vs Integration Test Separation - MANDATORY:

**Unit Tests** (`code.test.js`):

- **Heavy mocking**: Mock ALL helper dependencies
- **Focused testing**: Test individual functions/features in isolation
- **Fast execution**: Quick feedback for development
- **Edge cases**: Test error conditions, boundary values, invalid inputs

**Integration Tests** (`integration.test.js`):

- **Minimal mocking**: Only config, hass state, and basic DOM simulation
- **Real helper execution**: Let helper functions run naturally with global context
- **End-to-end scenarios**: Test complete user workflows
- **Bug reproduction**: Reference GitHub issues in test comments
- **Real configurations**: Use actual YAML examples from README files
- **JSDOM considerations**: Handle color conversion (hex to rgb), use real DOM elements

#### Integration Test Setup Requirements:

**JSDOM Environment:**

- All tests run in JSDOM environment (configured in `jest.config.mjs`)
- Unit tests should mock DOM heavily (use `mockElement` pattern)
- Integration tests should use real DOM elements (`document.createElement`, etc.)
- Both unit and integration tests must handle JSDOM color conversion (hex to rgb)

**File Separation - MANDATORY:**

- `code.test.js` - Unit tests only (heavy mocking, fast execution)
- `integration.test.js` - Integration tests only (minimal mocking, end-to-end)

```javascript
// integration.test.js setup
describe("module_name - Integration Tests", () => {
  beforeEach(() => {
    // Use real DOM elements with JSDOM
    document.body.innerHTML = "";
    mockCard = document.createElement("div");

    // Add realistic bubble card structure
    const mainIconContainer = document.createElement("div");
    mainIconContainer.className = "bubble-icon-container";
    mockCard.appendChild(mainIconContainer);

    document.body.appendChild(mockCard);

    // Mock global context for helpers (minimal)
    global.getComputedStyle = jest.fn().mockReturnValue({
      getPropertyValue: jest.fn().mockReturnValue(""),
    });

    // Mock hass with realistic states
    mockHass = {
      states: {
        "sensor.example": { state: "50" },
      },
    };
  });

  afterEach(() => {
    delete global.getComputedStyle;
  });
});
```

### 3. Module Architecture Standards

#### File Structure:

```
modules/module_name/
├── code.js              # Main module function (ES6 export)
├── editor.yaml          # Configuration editor
├── schema.yaml          # JSON schema for validation
├── styles.css           # Module-specific styles
├── README.md            # Documentation with examples
├── __tests__/
│   └── code.test.js     # Comprehensive tests
└── dist/               # Built artifacts (auto-generated)
```

#### Code Requirements:

- **ES6 exports**: `export function module_name(card, hass) { ... }`
- **Helper imports**: Import from `../helpers/` directory
- **Error handling**: Graceful degradation for missing entities/elements
- **DOM cleanup**: Always clean up previous state before applying new state
- **Condition support**: Implement condition-based show/hide with proper cleanup

### 4. Helper Function Guidelines

#### Available Helpers:

- `checkAllConditions(condition)` - Condition evaluation
- `getState(entity, fallbackToRaw)` - Entity state resolution
- `resolveColor(color, defaultColor)` - Color resolution with CSS var support
- `resolveColorFromStops(value, stops, interpolate)` - Color interpolation
- `applyEffects(element, effects)` - Apply visual effects
- `toArray(input)` - Normalize to array
- `resolveConfig(sources, defaultValue)` - Configuration resolution

#### Helper Best Practices:

- **Import at top**: Use ES6 imports for all helpers
- **Error handling**: All helpers gracefully handle undefined/null inputs
- **Consistent patterns**: Follow existing helper usage patterns
- **No direct DOM**: Helpers should not directly manipulate DOM

### 5. Build System & CI/CD

#### Parallel Processing:

- Build system runs modules in parallel for performance
- Error aggregation - collect all failures before reporting
- Comprehensive error messages with context

#### Test Strategy in CI:

- **lint-and-test**: Core helper tests (fail fast)
- **build**: All modules in parallel with error collection
- **test-changed-modules**: Module-specific tests for changed code
- **Test-only changes**: Don't trigger releases (configured in pipeline)

#### Release Automation:

- Only code changes trigger releases
- Test-only, documentation-only changes are ignored
- Version bumps required for functional changes

### 6. Configuration & Schema

#### Schema Requirements:

- Every module must have `schema.yaml` with complete JSON schema
- Auto-generate documentation from schema
- Support deprecated configuration with warnings
- Validate all configuration options

#### Configuration Patterns:

- Support both entity references and literal values
- Provide sensible defaults for all options
- Support arrays and single values (normalize with `toArray()`)
- Use `resolveConfig()` for flexible configuration resolution

### 7. DOM Manipulation Best Practices

#### State Management:

```javascript
// ALWAYS clean up first, then conditionally apply
element.classList.remove("progress-border", "has-bubble-border-radius");
element.style.background = "";
element.style.removeProperty("--custom-background-color");
// ... clean all properties

// Then apply new state if conditions met
if (checkAllConditions(config.condition)) {
  // Apply styling
}
```

#### Element Selection:

- Use specific selectors: `.bubble-icon-container`, `.bubble-sub-button-1`
- Handle missing elements gracefully
- Support flexible button targeting (main, sub-button-1, etc.)

### 8. Error Handling Standards

#### Required Error Handling:

- **Missing DOM elements**: Continue processing other configurations
- **Invalid entity states**: Use fallback values (0, empty string, etc.)
- **NaN calculations**: Default to safe values (0%, start value, etc.)
- **Missing configuration**: Skip processing gracefully
- **Helper failures**: Continue with degraded functionality

#### Logging:

- Use `console.warn()` for deprecated configuration usage
- No error logging for expected missing entities
- Clear error messages with context when failures occur

### 9. Documentation Requirements

#### README Structure:

- Clear feature description with visual examples
- Complete YAML configuration examples
- Installation instructions
- Contributing guidelines

#### Code Comments:

- Document complex calculations
- Explain non-obvious DOM manipulation
- Reference helper function purposes
- Include examples for complex configuration patterns

### 10. Issue Management & Debugging

#### Bug Report Requirements:

- Request complete reproducible YAML configuration
- Include entity states that trigger the issue
- Use GitHub issue templates for consistency

#### Debugging Process:

- Write integration test that reproduces the bug first
- Reference GitHub issue number in test comments
- Fix bug with minimal code changes
- Verify all existing tests still pass
- Add additional tests for edge cases discovered

### 11. Code Style & Formatting

#### Formatting:

- Use Prettier with 120 character line length
- Pre-commit hooks enforce formatting
- Template files excluded from formatting (placeholders preserved)

#### Naming Conventions:

- Module functions: `module_name(card, hass)`
- CSS classes: `progress-border`, `has-bubble-border-radius`
- CSS custom properties: `--progress`, `--orb-angle`, `--progress-color`

### 12. Performance Considerations

#### Optimization Guidelines:

- Minimize DOM queries - cache element references
- Use CSS custom properties for dynamic values
- Avoid unnecessary re-calculations
- Parallel processing where possible

## Commands & Scripts

```bash
# Development
npm test                     # Run all tests
npm run test:watch          # Watch mode for tests
npm run test:module         # Test specific module
npm run build               # Build all modules
npm run create-module       # Generate new module

# Quality
npm run format              # Format all code
npm run format:check        # Check formatting

# Setup
npm run setup:github-labels # Set up GitHub issue labels
```

## Key Success Metrics

1. **100% test coverage** for all modules
2. **TDD compliance** - tests written before code
3. **Zero breaking changes** in releases
4. **Comprehensive DOM verification** in integration tests
5. **Real configuration testing** using README examples
6. **Graceful error handling** for all edge cases

Remember: **Tests first, code second. Always.**
