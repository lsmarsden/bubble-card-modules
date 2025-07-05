# GitHub Copilot Instructions for Bubble Card Modules

**IMPORTANT**: Read `.github/agent_context.md` if it exists at the start of every session to maintain context efficiently and minimize token usage.

## Project Overview

This project contains custom modules for Bubble Card Home Assistant integration. Each module is a self-contained JavaScript function that manipulates DOM elements based on Home Assistant entity states and user configuration.

## Project Structure

```
bubble-card-modules/
├── .github/                    # GitHub configuration
│   ├── copilot-instructions.md # This file - development guidelines
│   ├── workflows/              # CI/CD pipelines
│   └── ISSUE_TEMPLATE/         # Bug report templates
├── modules/                    # Module implementations
│   ├── helpers/                # Shared helper functions
│   │   ├── *.js               # Individual helper modules
│   │   ├── README.md          # Helper documentation
│   │   └── __tests__/         # Helper unit tests
│   ├── module_name/           # Individual module (see Module Architecture)
│   └── templates/             # Module generation templates
├── scripts/                   # Build and development tools
│   ├── ts/                    # TypeScript build scripts
│   │   ├── build_modules.ts   # Parallel module builder
│   │   ├── generate_module.ts # New module scaffolding
│   │   ├── generate_docs.ts   # Schema documentation generator
│   │   ├── share_module.ts    # Module sharing utilities
│   │   └── helpers/           # Build script utilities
│   │       ├── extractors.ts  # Function extraction logic
│   │       ├── files.ts       # File system operations
│   │       ├── logging.ts     # Colored console output
│   │       └── __tests__/     # Build script tests
│   ├── py/                    # Python utilities
│   └── *.sh                   # Shell scripts for setup/reports
├── reports/                   # Generated test reports
│   ├── test-report.html       # Human-readable test results
│   └── junit.xml              # CI/CD compatible test results
├── coverage/                  # Generated coverage reports
│   └── index.html             # Interactive coverage visualization
├── agent_context.md           # AI context for efficient sessions
├── jest.config.mjs           # Test configuration
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

## Module Architecture Standards

**File Structure Pattern** (ALL modules follow this):

```
modules/module_name/
├── code.js              # Main function - ES6 export
├── editor.yaml          # Configuration UI
├── schema.yaml          # JSON validation schema
├── styles.css           # Module-specific CSS
├── README.md            # Documentation with YAML examples
├── __tests__/
│   ├── code.test.js     # Unit tests (heavy mocking)
│   └── integration.test.js # Integration tests (minimal mocking)
├── CONFIG_OPTIONS.md    # Auto-generated from schema
└── dist/                # Built artifacts (auto-generated)
```

**Code Requirements:**

- ES6 exports: `export function module_name(card, hass) { ... }`
- Helper imports from `../helpers/`
- DOM cleanup: Always clean previous state before applying new
- Error handling: Graceful degradation for missing entities/elements

## Core Development Principles

### 1. Test-Driven Development (TDD) - MANDATORY

**ALWAYS write tests BEFORE implementing any code changes or new features.**

#### TDD Process:

1. Write failing test first (integration tests for real scenarios)
2. Run tests to confirm they fail
3. Implement minimal code to make tests pass
4. Refactor while keeping tests green
5. Create test HTML page for visual iteration during development

### 2. Testing Strategy

**Unit Tests** (`code.test.js`): Heavy mocking, fast feedback, edge cases
**Integration Tests** (`integration.test.js`): Minimal mocking, real DOM + JSDOM, real YAML configs

**Test Structure** (3-section pattern):

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
});
```

### 4. DOM Manipulation Pattern

```javascript
// ALWAYS clean up first, then conditionally apply
element.classList.remove("progress-border", "has-bubble-border-radius");
element.style.background = "";
element.style.removeProperty("--custom-background-color");

// Then apply new state if conditions met
if (checkAllConditions(config.condition)) {
  // Apply styling
}
```

### 5. Key Helper Functions

Import from `../helpers/` - see `modules/helpers/README.md` for complete list:

- `checkAllConditions(condition)` - Condition evaluation
- `getState(entity, fallbackToRaw)` - Entity state resolution
- `resolveColor(color, defaultColor)` - Color resolution with CSS vars
- `applyEffects(element, effects)` - Visual effects application

### 6. Error Handling Standards

- **Missing DOM elements**: Continue processing other configurations
- **Invalid entity states**: Use fallback values (0, empty string, etc.)
- **Missing configuration**: Skip processing gracefully
- Use `console.warn()` for deprecated configuration usage

## Commands & Scripts

```bash
npm test                 # All tests with HTML/JUnit reports
npm run test:report      # Tests + open reports summary
npm run create-module    # Generate new module scaffold
npm run build           # Build all modules
npm run format          # Format all code
```

## Key Success Metrics

1. **TDD compliance** - tests written before code
2. **Comprehensive DOM verification** in integration tests
3. **Real configuration testing** using README examples
4. **Graceful error handling** for all edge cases

**Remember: Tests first, code second. Always.**
