import type { Immutable } from '../utils/types.ts';
import { FieldTemplateID, ItemID, type Direction, type FacilityID, type FieldTemplate, type PathFixtureID, type PathTypeID, type RecipeID } from './data.ts'

export type EntityConnectionRef = 
    | { type: 'facility'; facilityID: string; portIndex: number }
    | { type: 'fixture'; fixtureID: string; sideIndex: number }
    | null

export type UserChange =
    | { type: 'loadState'; fieldState: Immutable<FieldState> }
    | { type: 'multi'; changes: UserChange[] }
    | { type: 'move-facility'; facilityID: string; newPosition: [number, number] }
    | { type: 'rotate-facility'; facilityID: string; newRotation: number }
    | { type: 'add-facility'; facilityType: FacilityID; position: [number, number]; rotation: number }
    | { type: 'remove-facility'; facilityID: string }
    | { type: 'add-path'; pathType: PathTypeID; points: [number, number][] }
    | { type: 'update-path-points'; pathID: string; points: [number, number][] }
    | { type: 'move-path-point'; pathID: string; pointIndex: number; newPosition: [number, number] }
    | { type: 'add-path-segment'; pathID: string; endpoint: 'start' | 'end'; newPoint: [number, number] }
    | { type: 'remove-path-segment'; pathID: string; endpoint: 'start' | 'end' }
    | { type: 'remove-path'; pathID: string }
    | { type: 'add-path-fixture'; fixtureType: PathFixtureID; position: [number, number]; rotation: number }
    | { type: 'move-path-fixture'; fixtureID: string; newPosition: [number, number] }
    | { type: 'rotate-path-fixture'; fixtureID: string; newRotation: number }
    | { type: 'remove-path-fixture'; fixtureID: string }
    | { type: 'set-port-item'; facilityID: string; portIndex: number; itemID: ItemID | null }
    | { type: 'set-fixture-item'; fixtureID: string; itemID: ItemID | null }
    | { type: 'set-facility-recipe'; facilityID: string; recipeID: RecipeID | null, jumpStart: boolean }

export interface ItemFlow {
    item: ItemID
    sourceRate: number // Rate produced/distributed upstream (may exceed throughput limits)
    sinkRate: number // Rate actually accepted/delivered (limited by throughput constraints)
}

export interface FieldPath {
    id: string
    type: PathTypeID
    points: [x: number, y: number][]
    flows: ItemFlow[] // Item flows on this path
    flowDirection?: 'start-to-end' | 'end-to-start' | 'none' | 'blocked' // Direction items flow: none=undetermined, blocked=conflicting
    startConnectedTo?: EntityConnectionRef // Entity connected to start endpoint (first point)
    endConnectedTo?: EntityConnectionRef // Entity connected to end endpoint (last point)
    errorFlags?: {
        invalidLayout?: boolean // Path points don't form valid cardinal segments
        invalidPlacement?: boolean // Path overlaps with facilities, fixtures, or other paths (except valid connecting endpoints)
        invalidTemplate?: boolean // Path violates template rules (region restrictions, etc.)
        nothingConnected?: boolean // Neither end is connected to a port/fixture
        bothInputs?: boolean // Both ends connected to input ports
        bothOutputs?: boolean // Both ends connected to output ports
        congested?: boolean // Total sourceRate exceeds path throughput limit
    }
}

export interface FieldPathFixture {
    id: string
    type: PathFixtureID
    x: number
    y: number
    rotation: number
    width: 1 // Always 1; included here to allow uniform handling with facilities and doesn't need to be factored in to calculations on fixture position/rotation
    height: 1 // Same as above
    sides: FieldPathFixtureSide[] // Directional sides (up/down/left/right) with individual connection/flow tracking
    setItem?: ItemID | null // For Control Port fixtures only; filter item type
    errorFlags?: {
        outOfBounds?: boolean // Fixture position extends outside field bounds
        invalidPlacement?: boolean // Fixture overlaps with facilities or other fixtures
        invalidConnections?: boolean // Connected paths don't match fixture type/rotation expectations
        invalidTemplate?: boolean // Fixture violates template rules (region restrictions, etc.)
    }
}

export interface FieldPathFixtureSide {
    type: 'belt' | 'pipe' | 'control'
    subType: 'input' | 'output'
    direction: Direction
    connectedPathID?: string | null // Path connected to this side (if any)
    flows: ItemFlow[] // Item flows through this side
    errorFlags?: {
        invalidConnection?: boolean // Side position/direction doesn't match any path
        noItemAssigned?: boolean // For Control Port sides: no item filter explicitly set
    }
}

export interface FieldFacility {
    id: string
    type: FacilityID
    x: number
    y: number
    rotation: number
    width: number
    height: number
    ports: FieldFacilityPort[]
    isPowered: boolean
    jumpStartRecipe?: boolean // Whether the set recipe is jump-started (bypass input requirements once)
    setRecipe?: RecipeID | null // Player-explicitly-set recipe (fixed)
    actualRecipe?: RecipeID | null // Currently active recipe (calculated or set)
    throttleFactor?: number // Fraction of recipe capacity being used (0.0-1.0)
    inputFlows: ItemFlow[] // Aggregate input flows
    outputFlows: ItemFlow[] // Aggregate output flows
    errorFlags?: {
        outOfBounds?: boolean // Facility position extends outside field bounds
        invalidPlacement?: boolean // Facility overlaps with other facilities or fixtures
        invalidTemplate?: boolean // Facility violates template rules (region restrictions, limits, etc.)
        invalidDepotBusConnection?: boolean // Depot loader/unloader is not adjacent to a valid depot bus
        noValidRecipe?: boolean // No recipe found for current input items / insufficient input
        unpowered?: boolean // Requires power but is not in any power area
    }
}

export interface FieldFacilityPort {
    type: 'belt' | 'pipe'
    subType: 'input' | 'output'
    x: number
    y: number
    direction: Direction
    connectedPathID?: string | null // Path connected to this port (if any)
    setItem?: ItemID | null // For selectable output ports; null/undefined means no output
    external?: 'depot' | 'world' // External source/sink grouping for depot/world flows
    flows: ItemFlow[] // Item flows through this port
    errorFlags?: {
        invalidConnection?: boolean // Port position/direction doesn't match any path
        noItemAssigned?: boolean // For external output ports: no item explicitly set
    }
}

export interface DepotState {
    inputFlows: ItemFlow[]
    outputFlows: ItemFlow[]
    powerGenerated: number
    powerConsumed: number
}

export interface WorldState {
    inputFlows: ItemFlow[]
    outputFlows: ItemFlow[]
}

export interface DebugInfo {
    flowSolverIterations?: number
    flowSolverConverged?: boolean
    multipleRecipeMatchWarnings?: Array<{
        facilityId: string
        matchingRecipes: RecipeID[]
    }>
}

export interface FieldState {
    template: FieldTemplateID | Immutable<FieldTemplate>
    width: number
    height: number
    facilities: FieldFacility[]
    paths: FieldPath[]
    pathFixtures: FieldPathFixture[]
    depot: DepotState
    world: WorldState
    debugInfo?: DebugInfo
}
