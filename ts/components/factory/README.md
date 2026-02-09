# Factory Field UI Components

This directory contains the React components that render the interactive factory field visualization.

## Overview

The FactoryField component provides a pannable/zoomable SVG-based canvas for displaying and interacting with the factory simulation. It consumes an `Immutable<FieldState>` from the simulation layer and renders all entities (facilities, paths, fixtures) with visual feedback for their operational status.

## Component Architecture

### Core Components

#### **FactoryField.tsx**
The main container component that manages:
- Field state (currently initialized with a sample production line)
- Pan and zoom controls (mouse drag to pan, scroll wheel to zoom)
- SVG rendering canvas
- Coordinate transformations from grid space to screen space

Features:
- **Pan**: Click and drag to move the viewport
- **Zoom**: Scroll wheel to zoom in/out (0.25x to 3.5x)
- **Zoom to cursor**: Zooming centers on the mouse cursor position

#### **FieldGrid.tsx**
Renders the background grid that represents the discrete cell-based field layout. Shows:
- Grid lines for each cell
- Field boundary

#### **FieldHud.tsx**
Overlay component displaying simulation statistics:
- Entity counts (facilities, paths, fixtures)
- Power generation and consumption
- Depot input/output flows with item types and rates

### Entity Layers

#### **FacilitiesLayer.tsx**
Renders all facilities in the field. Delegates to `FacilityView` for each facility.

#### **FacilityView.tsx**
Renders an individual facility with:
- Colored rectangles indicating status:
  - Green: Powered and operational
  - Gray: Not powered or doesn't require power
  - Red: Placement errors
- Facility label and ID
- All facility ports (via `PortView`)

#### **PortView.tsx**
Renders individual facility ports as colored circles:
- **Purple**: Depot ports
- **Blue**: Input ports
- **Yellow**: Output ports
- Opacity indicates connection status

#### **PathsLayer.tsx**
Renders all transport paths. Delegates to `PathView` for each path.

#### **PathView.tsx**
Renders an individual path with:
- Polyline connecting waypoints
- Directional arrows showing flow direction
- Color coding:
  - Blue: Normal operation
  - Gray: Blocked (no flow)
  - Red: Placement errors
- Flow count indicator

#### **FixturesLayer.tsx**
Renders all path fixtures. Delegates to `FixtureView` for each fixture.

#### **FixtureView.tsx**
Renders an individual path fixture (e.g., splitters, convergers) as small squares.

### Utilities

#### **sampleField.ts**
Creates a sample field state with a complete LC Valley Battery production line:
- PAC (Protocol Automation Core) with depot outputs
- Multiple processing facilities (Refining, Fitting, Packaging, Shredding)
- Electric pylons for power distribution
- Transport belts connecting all facilities

This demonstrates a realistic factory setup and provides immediate visual feedback during development.

## Design Decisions

### CSS Classes vs Inline Styles
All visual styling is defined using CSS classes in [index.html](../../../index.html). This provides:
1. Centralized styling that's easier to maintain and theme
2. Better performance (styles are parsed once, not per-element)
3. Clear separation between structure (React/SVG) and presentation (CSS)
4. Support for state-based styling using multiple classes (e.g., `.facility.powered`, `.facility.error`)

The `cn` utility from [utils/react.ts](../../utils/react.ts) is used to combine CSS classes conditionally.

### Localization System
All user-facing text uses the localization system from [contexts/localization.tsx](../../contexts/localization.tsx):
- `useLocalization()` hook provides access to localized strings
- `getItemName()`, `getFacilityName()`, `getPathTypeName()`, `getPathFixtureName()` convert IDs to human-readable names
- Facility/Path/Fixture IDs are also item IDs, so the same localization data is used
- Easy to add new languages by adding to [data/localizations/](../../data/localizations/)

### SVG vs Canvas
We chose SVG over HTML5 Canvas because:
1. Individual entities need to be independently interactive (future drag-and-drop)
2. SVG handles pan/zoom transformations elegantly via `<g>` transforms
3. SVG elements can be styled with CSS and receive DOM events
4. Inspection and debugging is easier with DOM elements

### Coordinate System
- The field uses a grid-based coordinate system where each facility/path/fixture occupies discrete cells
- Cell size is 20px by default (`CELL_SIZE` constant)
- All entity coordinates are in grid space and converted to pixel space during rendering
- SVG `transform` handles the viewport transform (pan/zoom)

### Color Scheme
The UI uses a dark theme optimized for factory visualization:
- Background: Dark blue-gray (`#0f1116`)
- Grid: Subtle gray (`#222833`)
- Entities: Status-based colors (green for powered, gray for unpowered, red for errors)
- Paths: Cyan blue (`#4fc3f7`)

### Performance Considerations
- All state is immutable, enabling React's efficient reconciliation
- Pan/zoom updates don't trigger state changes (they update local component state only)
- Entity rendering is delegated to child components for granular re-renders
- SVG provides hardware-accelerated rendering in modern browsers

## Future Enhancements

The current implementation provides visualization only. Future additions will include:

1. **Selection**: Click to select entities
2. **Dragging**: Drag entities to move them
3. **Editing**: Double-click to edit entity properties (e.g., set depot port items)
4. **Placement**: Tools to add new facilities, paths, and fixtures
5. **Context menus**: Right-click for entity-specific actions
6. **Undo/Redo**: History management for user changes
7. **Tooltips**: Hover for detailed entity information
8. **Flow visualization**: Animated particles showing item movement
9. **Recipe indicators**: Show active recipes on facilities

## Usage

```tsx
import { FactoryField } from "./components/factory/FactoryField.tsx"

export function App() {
    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <FactoryField />
        </div>
    )
}
```

The component fills its container and handles its own internal state management. For production use, you'll want to lift the field state up and connect it to your application's state management system.
