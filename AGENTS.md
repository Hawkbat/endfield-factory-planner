# Copilot Instructions for Endfield Factory Planner

## ⚠️ CRITICAL: Accuracy First
**If you discover any information in these instructions is inaccurate or outdated, STOP immediately and flag it to the user before proceeding.**

Similarly, if you discover key insights into the codebase that took you significant effort to discover, please inform the user to help improve these instructions.

Always confirm to the user that you have read and understood these instructions before starting any work on the Endfield Factory Planner project. These guidelines are essential for maintaining code quality, consistency, and project integrity.

## Project Structure & Architecture

### Project Purpose
- A web-based factory planning tool for the game Arknights: Endfield, which contains complex factory-building mechanics
- Allows users to design and optimize factory layouts and production chains
- Simulates production processes based on user-defined configurations
- Helps players plan efficient factories before building them in-game

### Runtime Environment
- **Browser-only**: Targets evergreen browsers using native ESM modules
- **No NPM at runtime**: Node/NPM packages can only be used as dev dependencies or as references to ESM modules hosted on CDNs
- No build step for production; TypeScript compiles to ES modules

### TypeScript Standards
- **Advanced TypeScript features required**: Use mapped types, discriminated unions, null coalescing operators, string enums, etc.
- **Never cast to `any`**: Cast to `unknown` and use type guards to narrow types when runtime type is uncertain
- **Avoid explicit casting**: Explicit casting (e.g., `as Type`) is almost always a sign of incorrectly defined variable/parameter types
- **Type utilities**: [ts/utils/types.ts](ts/utils/types.ts) contains helper functions for edge cases where TypeScript cannot infer types correctly

### Styling & CSS
- All CSS styles live in [index.html](index.html)
- **Component styling pattern**: Use component-specific class names combined with generic helper classes
  - Example: `.field-facility` + `.field-facility.disabled` 
  - Avoid standalone generic classes like `.disabled` without component context

### Game Simulation Logic
- **Design documentation**: [SIMULATION_DESIGN.md](SIMULATION_DESIGN.md) explains game logic but may be outdated
  - **Always prompt user to clarify ambiguities** before implementing game logic changes
- **Pure functional architecture**: Simulation uses pure functions transforming immutable state objects
- **Helper functions**: [ts/utils/types.ts](ts/utils/types.ts) contains related types and helper functions for immutable state management
- **Immutable state updates**: Use spread operators and helper functions to create new state objects instead of mutating existing ones

### Testing
- Test suites in [tests/](tests/)
- **Use test helpers**: [tests/test-helpers.ts](tests/test-helpers.ts) provides functions to build simulation states and modify them change-by-change; use these instead of manually manipulating state objects in tests
- **Leverage existing logic**: Reuse game logic functions and types wherever possible
- **Debug with tests**: Use tests to reproduce and debug suspected game logic issues
- **Run tests frequently**: Run tests after every significant code change to catch regressions early with the command `npm test`
- **Type-check Tests**: Tests are written in TypeScript and should be type-checked to ensure they are testing the intended scenarios; use the command `npm run test:typecheck` to check for type errors in tests

### Type Definitions
- **Primary types**: [ts/types/data.ts](ts/types/data.ts) contains most interfaces and enums
- **Use enums for static IDs**: Always use enums over string literals for static data identifiers

### Localization
- **All UI text must be localized**: No hardcoded strings in components
- **Localization interface**: [ts/types/data.ts](ts/types/data.ts) defines available string keys
- **English strings**: [ts/data/localizations/en.ts](ts/data/localizations/en.ts) contains actual English text
- **React integration**: [ts/contexts/localization.tsx](ts/contexts/localization.tsx) provides React context for retrieving localized text
