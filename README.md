# Endfield Factory Planner

A web app for planning factory layouts in the game Arknights: Endfield.

### Links

- Repository: https://github.com/Hawkbat/endfield-factory-planner
- Issues: https://github.com/Hawkbat/endfield-factory-planner/issues

### Architecture

This application is a minimal-dependency single-page web app built with React and TypeScript. It doesn't use a bundler; instead, it relies on modern browsers' native support for ES modules, and includes dependencies via CDN links.

The core of the application is a headless simulation engine that models the factory layout, production lines, and resource management as a single immutable state that is transformed through pure functions in response to semantic user actions. The UI layer is built with React components that interact with the simulation engine to provide a dynamic and interactive user experience.

### AI Slop Disclaimer

This project was largely vibe coded with the assistance of GitHub Copilot. The code is probably a buggy mess, but it mostly works. If you find any issues, please feel free to open an issue or submit a pull request.

### Attribution

This project was initially based on assets, data, and code from [endfield-calc](https://github.com/JamboChen/endfield-calc) by JamboChen which is available under the MIT License.

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.