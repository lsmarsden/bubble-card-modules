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
│   │   ├── entity|ui|utils/   # Helper modules, grouped by concern
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
├── testing/                   # Shared test fixtures (Card harness, Jest global setup)
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
│   └── code.test.js     # Module tests through the Card harness
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

1. Write a failing test first, through the module interface (Card harness)
2. Run tests to confirm they fail
3. Implement minimal code to make tests pass
4. Refactor while keeping tests green
5. Create test HTML page for visual iteration during development

### 2. Testing Strategy

Test every module **through its interface**: the module function, run the way Bubble Card runs it.
Mock only what is truly external: Home Assistant (`hass`) and the browser APIs jsdom lacks.

**Module tests** (`modules/<module>/__tests__/code.test.js`) use the **Card harness** (`testing/cardHarness.js`):

```javascript
import { my_module } from "../code.js";
import { useCardHarness } from "../../../testing/cardHarness.js";

const h = useCardHarness({ states: { "sensor.progress": "75" } });

it("draws 75% progress", () => {
  h().run(my_module, [{ button: "main", source: "sensor.progress" }]);
  expect(h().$(".progress-path").getAttribute("stroke-dasharray")).toBe("0 0 225 75");
});
```

The harness mirrors Bubble Card's `code:` scope: `this` is the card (with `config`), `hass` is global,
and `onTeardown`/`hasChanged` are present in `"3.3+"` mode and absent in `"legacy"` mode. It builds card DOM
with upstream class names, stubs `getComputedStyle`/`getBoundingClientRect`/`requestAnimationFrame`, and pins
the clock (`now`, default `2025-07-01T12:00:00Z`) with fake timers. Jest runs with `TZ=UTC`.

**Helper tests** (`modules/helpers/**/__tests__/`) test pure logic at the helper's own interface. Use real
`hass` states via `useHass(states)` instead of mocking `hass.js` or other helpers.

**Conventions:**

- Don't mock helper modules (`jest.unstable_mockModule`) from module tests; assert on the DOM the module produces.
- Prefer `it.each` tables for variations; name each case by the behaviour it pins.
- Assert exact values (dash arrays, positions, CSS custom properties), not just "truthy".
- No comments that restate the code (`// Setup`, `// Exercise`, `// Verify`).
- When a test pins known-wrong behaviour, say so in a one-line comment and track the fix separately.

### 3. DOM Manipulation Pattern

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

### 4. Key Helper Functions

Import from `../helpers/` - see `modules/helpers/README.md` for complete list:

- `checkAllConditions(condition)` - Condition evaluation
- `getState(entity, fallbackToRaw)` - Entity state resolution
- `resolveColor(color, defaultColor)` - Color resolution with CSS vars
- `applyEffects(element, effects)` - Visual effects application
- `showProgress(ctx, element, options, render)` / `stopProgress(ctx, element)` - Progress reading: percent from a
  progress source (entity, timer, `start`/`end`, `override`, `invert`), kept current by a ticker for active timers.
  Pass `ctx = { host: this, onTeardown: typeof onTeardown === "function" ? onTeardown : undefined }`.

See `GLOSSARY.md` for domain terms and the Bubble Card runtime contract (names in `code:` scope, `onTeardown`, Jinja).

### 5. Error Handling Standards

- **Missing DOM elements**: Continue processing other configurations
- **Invalid entity states**: Use fallback values (0, empty string, etc.)
- **Missing configuration**: Skip processing gracefully
- Use `console.warn()` for deprecated configuration usage

## Commands & Scripts

```bash
npm test                 # All tests with HTML/JUnit reports
npm run create-module    # Generate new module scaffold
npm run build           # Build all modules
npm run format          # Format all code
```

## Key Success Metrics

1. **TDD compliance** - tests written before code
2. **Exact DOM verification** through the module interface
3. **Real configuration testing** using README examples
4. **Graceful error handling** for all edge cases

**Remember: Tests first, code second. Always.**
