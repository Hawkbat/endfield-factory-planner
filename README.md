# Endfield Factory Planner

A web application for planning factory layouts in the game Arknights: Endfield.

**Live App**

- Try the app in your browser: https://hawk.bar/endfield-factory-planner/
- If you only want to plan layouts and experiment with factories, open the link above — no installation required.

## Overview

- Purpose: design and simulate factory layouts, production lines, and resource flows for Endfield.
- Architecture: browser-first React + TypeScript app. The simulation is a headless engine that uses immutable state and pure functions; the UI is implemented as React components.

## Features

- Interactive factory layout editor
- Simulation of production flows and resources
- Template and region planning support
- Export / import project state

## For Non-Technical Users

- Visit the live app at https://hawk.bar/endfield-factory-planner/ to use the application immediately.
- Read the in-app help and tooltips for usage guidance.

## For Developers / Contributors

### Requirements

- Node.js (recommended LTS) for development and tests
- npm (comes with Node)

### Quick start

1. Clone the repository:

	git clone https://github.com/Hawkbat/endfield-factory-planner.git
2. Install dependencies:

	npm install
3. Build the TypeScript output to `js/`:

	npm run build
4. Serve the project locally (static serve):

	npm start

Notes:
- `npm start` uses a static server (`serve -s .`) and serves the compiled `js/` output and `index.html`.
- Use `npm run build:watch` during development to continuously compile TypeScript.

### Tests

- Run the full test suite: `npm test`
- Run tests in watch mode: `npm run test:watch`
- Type-check tests: `npm run test:typecheck`

### Contributing

- Please open issues for bugs or feature requests and submit PRs for fixes.
- Follow the TypeScript and styling guidelines in AGENTS.md and the project docs.

## Project Layout

- `ts/` — TypeScript source (compiled to `js/`)
- `js/` — Compiled JavaScript used by the site
- `data/`, `game/`, `components/`, `contexts/`, `utils/` — core runtime modules
- `tests/` — vitest tests and helpers

## Browser Support

- Targets modern evergreen browsers with native ES module support.

## Credits & Legal

### AI Slop Disclaimer

This project was largely vibe coded with the assistance of GitHub Copilot. The code is probably a buggy mess, but it mostly works. If you find any issues, please feel free to open an issue or submit a pull request.

### Attribution

This project was initially based on assets, data, and code from [endfield-calc](https://github.com/JamboChen/endfield-calc) by JamboChen which is available under the MIT License.

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.