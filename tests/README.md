# Test Suite

This directory contains comprehensive unit and integration tests for the Endfield Factory Planner game logic.

## Running Tests

```bash
# Install dependencies first
npm install

# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

- **geometry.test.ts** - Tests for bounds checking, overlap detection, and placement validation
- **power.test.ts** - Tests for power area calculation, facility powered states, and power statistics
- **recipes.test.ts** - Tests for recipe matching, activation, and jump-start logic
- **flows.test.ts** - Tests for flow rate calculations, throttling, and item flow merging
- **fixtures.test.ts** - Tests for path fixture flow calculations (Bridge, Splitter, Converger, Control Port)
- **connections.test.ts** - Tests for path connection detection and flow direction determination
- **solver.test.ts** - Tests for iterative flow solver convergence and initialization
- **integration.test.ts** - End-to-end integration tests for complete simulation pipeline

## Coverage

Run `npm run test:coverage` to generate a coverage report. Coverage reports are generated in:
- Terminal output (text format)
- `coverage/index.html` (interactive HTML report)
- `coverage/lcov.info` (LCOV format for CI/CD)

## Project Structure

The test suite is configured to:
- Use Vitest as the test runner (fast, ESM-native)
- Target Node.js environment for test execution
- Import TypeScript source files directly (no compilation step)
- Maintain separation from browser-targeted production code

### TypeScript Configuration

- **tsconfig.json** - Main configuration for browser ESM output
- **tsconfig.test.json** - Extended configuration for test files with Node.js types
- Tests use `moduleResolution: "bundler"` for compatibility with Vitest
- Production code maintains `moduleResolution: "nodenext"` for pure ESM

This ensures tests can import game logic modules without introducing Node.js dependencies into the browser-targeted code.
