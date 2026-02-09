# Endfield Factory Planner - Simulation Design

This file contains a deterministic immutable simulation of a player-built factory layout in "Endfield". It is intended as a planning tool to help players design and optimize factory layouts before building in-game.

The simulation operates as a pure function: given a field state and a sequence of user changes, it produces a new field state with all derived values (recipes, flows, power, etc.) recalculated.

## Grid and Basic Layout

- The field is a 2D grid of fixed size (width × height). All entities are grid-aligned with no partial cell placement.
- Grid coordinates use [x, y] where (0, 0) is the top-left corner, x increases rightward, y increases downward.
- Entities placed outside field bounds are kept in the invalid state but excluded from simulation (treated as if they don't exist), unless explicitly allowed (see Paths and World IO below). Error flags indicate to the UI that the entity needs to be repositioned.

## Factory Area Templates

The factory field is defined by a **template**. Templates control grid dimensions, region-specific mechanics, and depot bus limits. The template can be changed at any time; existing structures remain in place, but violations are flagged with template-specific error flags (e.g., invalid region or bus limits).

### Preset Templates

**Valley IV Core AIC Area**
- Region: Valley IV
- Size: 70 × 70
- Static Depot Bus layout: **bottom + right** (outside the field bounds), with 9 sections along the bottom edge and 9 sections along the right edge, plus a port at the bottom-right corner. Depot Bus Port is 4×4; bottom sections are 8×4 and right sections are 4×8.

**Valley IV Outpost**
- Region: Valley IV
- Size: 40 × 40
- Static Depot Bus layout: **bottom only**, with 5 sections along the bottom edge and **no port**. Depot Bus Sections are 8×4.

**Wuling Core AIC Area**
- Region: Wuling
- Size: 60 × 60
- No static bus layout; users may place up to **1 Depot Bus Port** and **5 Depot Bus Sections**.

**Wuling Outpost**
- Region: Wuling
- Size: 40 × 40
- No static bus layout; users may place up to **1 Depot Bus Port** and **4 Depot Bus Sections**.

### Custom Template

Users can select **Custom** to override size, region, and depot bus limits. Depot bus limits are only applicable in Wuling; in Valley IV they are treated as 0 (static bus sections are handled separately by template layout).

### Region Restrictions

The **Wuling** region enables additional features, which are invalid in **Valley IV**:
- Fluid facilities: Reactor Crucible, Forge of the Sky, Separating Unit, Sprinkler, Fluid Supply Unit, Fluid Pump
- Pipe paths and pipe fixtures
- Planting Unit fluid port
- Xiranite power facilities: Xiranite Pylon, Xiranite Relay
- Depot Bus Port and Depot Bus Section placement

Attempting to place region-restricted content outside its allowed region results in a **template error flag**.

### Initial Core Facility

Templates may specify an initial core facility placed approximately centered in the field:
- Main templates place a **Protocol Automation Core (PAC)** by default.
- Outpost templates place a **Sub-PAC** by default.

This placement is performed via the normal user-change system, so the facility can be deleted, moved, or otherwise modified by the player.

### Collision and Overlap Rules

- Facilities cannot have area overlap with other facilities,fixtures, or paths (with one exception for port connections, see below). Edge-adjacent placement is allowed. Overlapping facilities are marked with `invalidPlacement` error flags and excluded from simulation.
- Fixtures cannot have area overlap with other fixtures (with one exception for pipe vs belt overlap, see below), facilities, or paths (with two exceptions for pipe vs belt overlap and fixture side connections, see below). Edge-adjacent placement is allowed. Overlapping fixtures are marked with `invalidPlacement` error flags and excluded from simulation.
- Paths cannot overlap with facilities, fixtures, and other paths, except for path endpoints which can overlap in order to connect to facility ports or fixture sides for a valid connection. Path segments that cross over or run through a facility or fixture's area create overlap violations and are marked with `invalidPlacement` errors and excluded from simulation.
- **Asymmetrical belt/pipe overlap**: belt paths and belt fixtures can overlap pipe paths. Pipe paths can overlap belt paths and belt fixtures, but pipe fixtures cannot overlap belt paths or belt fixtures. This allows belts and pipes to cross each other without interaction, but prevents pipe fixtures from interfering with belt networks. Overlaps between belts and pipes do not generate errors and do not affect simulation.


## Facilities

- Facilities are rectangular entities aligned to the grid; rotation is always in 90-degree increments.
- Each facility has a defined type (e.g., planter, harvester, ore processor) from the facilities.ts data.
- Facilities may or may not require power to operate. Power-generating facilities output power but also require some input items to do so (treated as a recipe like any other).

### Facility Ports and Connection

- Facilities have defined input and output ports for items. Ports include:
  - **Belt ports**: transport non-fluid items on conveyors, can handle multiple different items simultaneously
  - **Pipe ports**: transport fluid items, can only handle one fluid item type at a time
  - **Depot ports**: special ports that connect directly to the depot (unlimited external supply/consumption)
- Each port has a position (relative to the facility's top-left corner), a direction (up/down/left/right), and a subtype (input or output).
- **Port Direction**: Ports face outward from facilities into the surrounding space (e.g., a port on the left side of a facility typically faces 'left', away from the facility).
- Depot output ports may have an item explicitly assigned by the player. Depot output ports output nothing if no item is assigned. All other ports have their item flows determined dynamically based on recipes and connected paths.
- **Selectable output constraints**: Any output port or fixture that allows item selection (depot outputs, control ports, and other special output ports) must restrict the possible selectable items to those compatible with the connected path type: belt = non-fluid items, pipe = fluid items. Only the selected item may flow through that port/fixture side; all other item types are blocked (or distributed among the other valid output paths).
- **Reactor Crucible outputs**: each belt/pipe output port on Reactor Crucible facilities can have a specific item set for them. When set, the port outputs only that item, sourcing from either the facility’s crafted outputs or its incoming inputs (whichever provides the selected item). If unset, that port outputs nothing.
- **Depot loader/unloader bus connection**: Depot Loaders and Unloaders must be adjacent (on the side opposite their depot port) to a valid Depot Bus Port/Section. In Valley IV, the static template bus layout serves as a valid connection when the facility is placed along the appropriate boundary segment; in Wuling, adjacency is checked against player-placed Depot Bus facilities. Lack of adjacency produces a template-related error flag.

### Out-of-Bounds Fluid Structures

- **Fluid Pump**, **Fluid Supply Unit**, and **Sprinkler** facilities may be placed outside field bounds within a limited, configurable distance (still on-grid) so they can connect to in-bounds pipes. Current limit: `MAX_OUT_OF_BOUNDS_RANGE = 10` grid squares.
- Out-of-bounds facilities still participate in connections and flow simulation as long as they are within the allowed distance.
- **Sprinkler irrigation area**: sprinklers expose an “irrigation area” rectangle adjacent to their top edge (centered to align with the sprinkler) for UI visualization while selected. No crop simulation logic is applied yet.
- Multiple depot output ports can output the same item; each has unlimited throughput from the depot (capped by the connected path's throughput limit). Input/output ports (non-depot) can handle multiple item types simultaneously, sharing the path's throughput capacity.

### Facility Power

- Power is provided wirelessly within a rectangular power area generated by power-producing facilities.
- Power area is an N×M rectangle centered on the power-generating facility that extends to its grid boundaries.
- A facility is powered if it either: (1) requires no power, or (2) at least partially overlaps with the power area of any power-generating facility (edge-touching alone is insufficient; must have area overlap).
- Power is tracked as total kW/h generated and consumed by all powered facilities. We calculate but don't enforce power limits; we display the deficit/surplus for user information while assuming all powered facilities operate at full capacity.
- If a facility becomes unpowered, its recipe is cleared, all flows are blocked, and flows are flagged as blocked.

### Facility Recipes and Operation

- A facility's recipe is determined by the items being fed to its input ports. The recipe determines input requirements and output production rates.

#### Recipe Selection Algorithm

1. Start with player-explicitly-set recipes (these are fixed)
2. For all other facilities, determine their recipe based on current input items
3. Recipe matching: Aggregate all input item types across all input ports (ignoring rates, just item types with non-zero incoming flow), then find a recipe where recipe.inputs item set exactly matches the aggregated input item types AND the recipe's facilityID matches the facility type
4. The recipe list is designed such that at most one recipe matches a given set of input items
5. If multiple recipes somehow match (simulation bug), use the first valid recipe and log a warning

#### Recipe Activation

Recipe activation requires:

1. Facility is powered (or doesn't require power)
2. All input items required by the recipe have non-zero incoming flows

If a facility has no valid activated recipe, it produces no outputs, all inputs are fully blocked, and an error flag is set for the UI.

#### Partial Input Bottlenecking

If all required inputs have non-zero incoming flows but some inputs are insufficient to reach the recipe's maximum throughput, the facility operates at a reduced rate determined by its most limited input. The output is scaled down proportionally, and excess inputs (beyond what's needed for the reduced production) are blocked.

**Example**: a recipe requires 1 wheat and 1 stone per second. If the facility receives 1 wheat/s but only 0.6 stone/s, the facility operates at 60% throughput, consuming 0.6 wheat and 0.6 stone per second. The excess 0.4 wheat/s is blocked (sinkRate = 0.6, sourceRate = 1.0).

#### Jump-Start Recipes for Self-Loops

The player can mark a facility's set recipe as "jump-started", indicating it will be provided with the required input items manually (outside the simulation). This guarantees an initial output at the recipe's maximum throughput. Once the facility has active input flows from the simulation, the jump-start flag is ignored and the facility operates normally. This allows self-supplied loops like seed-picker → planter → seed-picker to bootstrap themselves.

#### Processing Rate and Flow Calculation

Recipes define input/output as (count per crafting duration). We convert to average flow rates (items/second) for simulation:

$$\text{flow\_rate} = \frac{\text{count}}{\text{duration\_seconds}}$$

- Facilities can only process one recipe instance at a time
- If inputs exceed recipe demand, excess is blocked (backpressure)
- If inputs fall short of recipe demand, the facility scales down output proportionally

Flow calculation uses iterative convergence to handle cycles:

1. Initialize all flows to 0 (except jump-started recipes which start at recipe max output)
2. Calculate facility outputs based on current inputs
3. Propagate flows through facilities, paths and fixtures, updating all flows and path flow directions
4. Repeat until flows converge (max delta < 0.001) or max iterations reached (e.g., 100)
5. This handles cycles, feedback loops, and complex path networks


## Paths

- Paths connect facilities and path fixtures, forming delivery routes for items.
- There are two path types: belts (for non-fluid items) and pipes (for fluid items).
- Belts only carry non-fluid items. Pipes only carry fluid items.
- Pipes can carry only a single fluid item type at a time; flows of other item types are blocked before entering the pipe. Belts can carry multiple non-fluid item types simultaneously (up to the path's throughput limit).
- Each path is a sequence of connected grid points, forming straight line segments aligned to cardinal directions.

### Path Geometry

- Path segments run between grid coordinates; a segment from (2,3) to (5,3) runs horizontally
- Segments can only run N/S/E/W (cardinal directions), never diagonals
- Paths can bend at points (e.g., segment 1: (0,0)→(3,0), segment 2: (3,0)→(3,5))
- Path segments cannot directly overlap each other but can run adjacent
- **Out-of-bounds placement**: belt path points must remain within field bounds. Pipe path points may extend outside the bounds within a limited, configurable distance to connect to out-of-bounds fluid structures. Current limit: `MAX_OUT_OF_BOUNDS_RANGE = 10` grid squares.
- Granular path operations: Users can add/remove segments from path ends, allowing for fine-grained path editing

### Path Collision Rules

- Paths cannot have area overlap with fixtures or other paths of the same type (belt vs belt, pipe vs pipe).
- **Belt vs Pipe Overlap**: Paths and path fixtures of different types (belt vs pipe) can freely overlap and do not interact between each other at all; the pipe is layered over top of the belts. Overlap between a belt and a pipe (including their fixtures) is always allowed and does not generate any error or affect simulation.
- **Same-Type Overlap**: Paths and fixtures of the same type (belt vs belt, pipe vs pipe) cannot overlap except at endpoints (see below).
- **Exception**: Path endpoints that successfully connect to a facility port or fixture side are allowed to share that cell.
- Non-connecting overlaps (of the same type) are marked with `invalidPlacement` error flags and excluded from simulation logic.

### Path Endpoints and Direction

- Each path has a start point (first point) and end point (last point)
  - **Important**: Start/end are purely geometric labels for the path's two endpoints; they have NO semantic meaning for flow direction
  - Items can flow from start→end OR end→start depending on connections and available flows
  - A path drawn "backwards" (output to input) works identically to one drawn "forwards" (input to output)
- **Path Endpoint Geometric Direction**: The direction from the second-nearest point toward the endpoint
  - For the start point: direction from `points[1]` toward `points[0]`
  - For the end point: direction from `points[n-2]` toward `points[n-1]`
  - This represents the direction the path segment points as it enters the endpoint
  - Used ONLY for geometric connection matching (see Path Connectivity below)
- A path's overall **flow direction** (start→end, end→start, none, or blocked) is determined dynamically during flow calculation based on which endpoint has flows available

## Path Connectivity

Paths are inherently directionless - items can potentially flow from start-to-end or end-to-start depending on how item flows are propagated through them from connected facilities and fixtures. The flow direction is determined after connections are made.

### Geometric Connection Rules

A path endpoint connects to a port or fixture side when:

1. **Position Match**: The path endpoint coordinates match the port/fixture coordinates exactly
2. **Direction Match**: The path's geometric direction (extending outward from the path segment endpoint) is **opposite** the port's outward direction (which is away from the facility, into open space). In other words, the path segment must point **into** the port/fixture from the open space side.

**Critical Understanding**: This geometric connection is TOPOLOGY ONLY:
- The connection check is completely agnostic of port/side subType (input vs output)
- It applies identically to path start and path end endpoints
- A path can geometrically connect to any port/side that spatially aligns, regardless of whether it's "correct" for item flow
- Whether items actually flow through the connection is determined separately during flow calculation

**Example**: A path endpoint can geometrically connect to an output port even if items would flow "into" that output port along the path. The flow calculation will determine that no items flow in that configuration, but the geometric connection still exists.

### Flow Direction Determination

After geometric connections are established:

1. **Start-to-end flow**: Start connects to output port, end connects to input port
2. **End-to-start flow**: End connects to output port, start connects to input port  
3. **Blocked (no flow)**: 
   - One or both ends unconnected
   - Both ends connect to input ports
   - Both ends connect to output ports

### Throughput Limits

- **Belt**: 0.5 items/second total across all non-fluid item types
- **Pipe**: 2 units/second of a single fluid item type
- For belts, multiple item flows share this capacity; if total sourced flow exceeds max throughput (0.5/sec), flows are congested
- When congested: sourceRate remains the rate generated by upstream, but sinkRate is reduced proportionally so that total sinkRate across all flows = 0.5
- Excess flow (sourced but not sunk) is lost entirely; it does not back up or slow upstream production


## Path Fixtures

- Path fixtures are mini-facilities that connect multiple paths together with various effects. They sit at grid coordinates and have directional sides (up/down/left/right) based on rotation.
- Each fixture has a list of side states that tracks the state of each directional side independently, including which path is connected to that side and the flows through it.
- **Fixture Connection**: A path connects to a fixture side using the same geometric rules as facility ports - path endpoint must match fixture coordinates and path geometric direction (the direction extending out the end of the line segment) must be opposite the fixture side direction.
- Fixture sides have very similar semantics to facility ports: they have directions, connected paths, and flows.
- Control ports (belt/pipe) must only allow item selection compatible with the fixture’s path type (belt = non-fluid, pipe = fluid).
- Path fixtures are NOT placed in the middle of paths; they occupy their own coordinate and connect to the path's endpoints. It's possible for a path to have both endpoints connect to different sides of a fixture (e.g., a "figure-8" with a Bridge in the middle appears as one continuous line but is two separate path entities).
- Fixtures can connect 0-4 paths on their sides, depending on fixture type and player design.
- Fixture type definitions (which sides are inputs/outputs) must be defined in a pathFixtures.ts data file.

### Fixture Types

#### Bridge

Allows up to four paths to connect on all cardinal sides (up, down, left, right). Unlike standard ports, bridge sides do not have fixed input/output roles; instead, they inherit flow direction from the paths connected to them.

**Flow Direction Logic:**

The bridge defers to the connected paths to determine flow direction, with flow directions propagating to the opposite sides.

**Left/Right Axis and Up/Down Axis Independence:**

The left/right axis operates independently from the up/down axis. A single bridge can simultaneously:
- Pass flows from left (input) to right (output) or vice-versa
- Pass flows from up (input) to down (output) or vice-versa
- Block one axis while passing the other
- Have any combination of blocked/passing states on each axis

#### Splitter

Takes input on 'bottom' side, outputs on 1-3 other sides. Takes all input flow and divides it evenly among all connected output sides (sets equal sourceRate to all outputs). If 3 outputs are connected, each gets ~33.3% of input flow. If only 1 output is connected, it gets 100% of input flow. Each output path applies its own throughput limit independently; the splitter does not compensate for downstream congestion.

#### Converger

Takes input on up to 3 sides, outputs on 'top' side. Combines all input flows into a single output flow, subject to the path's maximum throughput limit. If combined input sourceRate exceeds 0.5, the path becomes congested.

#### Control Port

Single input on 'bottom' side, single output on the 'top' side. Player-settable filter: optional; only the specified item type passes through to output; all other item types are blocked.

**Special case**: If a control port is placed directly adjacent to a facility output port (exactly 1 grid cell away in the direction the facility port faces, with the control port's input direction aligned with the facility port's output direction), and the facility's recipe outputs an item that doesn't match the control port's filter, the facility treats that output port as if it's unconnected for flow calculation purposes. This allows the player to prevent incorrect items from being output by a facility. If the item does match the filter, it's passed through as if the path connected to the control port were connected directly to the facility output port.


## Item Flows and Throughput Tracking

### Flow Rate Semantics

ItemFlow objects track two values for each item on each path, port, or fixture:

**sourceRate**: The rate that an item is being produced/distributed onto that entity by upstream
- **Path**: rate generated by connected input port/fixture, may exceed path's 0.5 limit
- **Facility input port**: rate on the connected path's output
- **Facility output port**: rate actually produced by the facility (may be less than facility's theoretical production if the facility output is split among multiple paths)
- **Fixture output side**: rate produced by the fixture (e.g., 50% of input for a 2-way splitter)

**sinkRate**: The rate actually accepted/passed through by this entity, limited by throughput constraints
- **Path**: capped to 0.5 items/sec (shared across all item types on this path)
- **Facility input port**: rate accepted by the facility for the recipe
- **Facility output port**: rate accepted by the connected path
- **Fixture output side**: rate actually delivered to the connected path

**Congestion** is indicated when sourceRate > sinkRate; the difference is excess flow that is lost

### Path-Level Flows

- A belt path's ItemFlow.sourceRate may exceed 0.5 items/sec if the input port generates more than max throughput
- When this happens, ALL flows on that belt path are reduced proportionally so their combined sinkRate = 0.5
- For pipe paths, only the single selected fluid item type is allowed onto the path; all other item types are blocked before entering the pipe. The pipe’s flow is then capped to 2 units/sec.
- **Example**: path with two items, both with sourceRate 0.4, total = 0.8. Both are reduced to 0.25 sinkRate. Each is congested (0.4 source → 0.25 sink).

### Facility-Level Flows

- Each facility port has its own ItemFlow. Facility ports are not subject to a shared 0.5 limit like paths.
- Facilities can have multiple input ports; combined input flows are summed for recipe demand checking.
- Facilities can have multiple output ports; output flows are divided evenly among all connected output ports only (unconnected ports are excluded from distribution and receive zero flow). Each connected output port gets an equal fraction of the facility's production. If some ports have congested paths, those ports' flows will reflect the congestion, but the facility continues to produce equally among connected ports. (Excess flow on congested ports is discarded; the facility does not reroute to uncongested ports.)

### Depot-Level Flows

- **Depot input flows**: aggregate of all input from facilities/fixtures via depot input ports
- **Depot output flows**: aggregate of all output to facilities/fixtures via depot output ports
- These are purely informational for tracking resource consumption/production rates for the factory

### World (External) Flows

- Fluids can enter the field via **Fluid Pump** facilities (player selects a fluid item to output at an effectively unlimited rate, subject to pipe throughput).
- Fluids can leave the field via **Fluid Supply Unit** facilities (act as unlimited sinks).
- **Sprinklers** behave like Fluid Supply Units in terms of infinite fluid consumption.
- These external flows are aggregated separately from depot flows and reported under a “world” summary.

## State Management and Recalculation

### User Changes

Changes are applied sequentially in the order received. Invalid changes (e.g., out-of-bounds placements, non-existent facility IDs) keep the entity in an invalid state, which is excluded from simulation logic. Error flags are set so the UI can indicate the problem to the user.

#### Change Types

- `loadState`: Replace entire field state
- `move-facility`, `rotate-facility`, `add-facility`, `remove-facility`
- `add-path`, `move-path-point`, `remove-path`
- `add-path-fixture`, `move-path-fixture`, `rotate-path-fixture`, `remove-path-fixture`
- `set-port-item`

### Recalculation Sequence

When recalculating from changes, the flow is:

1. Apply structural changes (add/remove/move/rotate entities)
2. Update all facility powered states (based on power area geometry)
3. Update all path connections to facilities and fixtures (match endpoints and directions)
4. Resolve facility recipes:
   - Keep player-set recipes fixed
   - Keep depot output items fixed
   - Determine recipes for all other facilities based on current input items
   - Mark any facilities with jump-start recipes and loop them with their initial output
5. Calculate facility input/output flows and path flows
   - Use fixed-point iteration or similar to handle cycles
   - Resolve flow rates, accounting for throughput limits and congestion
   - Resolve flow directions on paths and fixtures based on connected ports and active flows
6. Flag any invalid states (unpowered, invalid recipe, congestion, out-of-bounds, etc.)
7. Calculate total depot item flows, factory power flows, and world item flows for aggregate reporting
