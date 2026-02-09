import { recalculateFieldState } from '../ts/game/field.ts'
import { initializeFacilityPorts } from '../ts/game/connections.ts'
import { facilities } from '../ts/data/facilities.ts'
import { fieldTemplates } from '../ts/data/templates.ts'
import { pathFixtures as pathFixturesData } from '../ts/data/pathFixtures.ts'
import type { UserChange, FieldState, FieldFacility, FieldFacilityPort, ItemFlow, FieldPath, FieldPathFixture, FieldPathFixtureSide } from '../ts/types/field.ts'
import { RegionID } from '../ts/types/data.ts'
import type { FieldTemplate, Direction, FacilityID, FieldTemplateID, PathTypeID, PathFixtureID, ItemID } from '../ts/types/data.ts'
import type { Immutable } from '../ts/utils/types.ts'

export function createStateFromTemplate(template: FieldTemplateID | FieldTemplate): Immutable<FieldState> {
    const templateDef = typeof template === "string" ? fieldTemplates[template] : template
    if (!templateDef) {
        throw new Error(`Unknown template ID: ${template}`)
    }
    return {
        template,
        width: templateDef.width,
        height: templateDef.height,
        facilities: [],
        paths: [],
        pathFixtures: [],
        depot: {
            inputFlows: [],
            outputFlows: [],
            powerGenerated: 0,
            powerConsumed: 0
        },
        world: {
            inputFlows: [],
            outputFlows: []
        },
        debugInfo: {}
    }
}

export function createEmptyState(width: number, height: number): Immutable<FieldState> {
    return createStateFromTemplate({
        width,
        height,
        region: RegionID.WULING,
        depotBusPortLimit: 1,
        depotBusSectionLimit: 5,
    })
}

export function applyChanges(
    state: Immutable<FieldState>,
    changes: UserChange[]
): Immutable<FieldState> {
    return recalculateFieldState(state, changes)
}

export function createFacility(options: {
    id?: string
    type: FacilityID
    position: [number, number]
    rotation?: number
    isPowered?: boolean
    ports?: FieldFacilityPort[]
    inputFlows?: ItemFlow[]
    outputFlows?: ItemFlow[]
}): FieldFacility {
    const facilityDef = facilities[options.type]
    if (!facilityDef) {
        throw new Error(`Unknown facility type: ${options.type}`)
    }

    const rotation = options.rotation ?? 0
    const swapDimensions = rotation === 90 || rotation === 270
    const width = swapDimensions ? facilityDef.height : facilityDef.width
    const height = swapDimensions ? facilityDef.width : facilityDef.height

    const base: FieldFacility = {
        id: options.id ?? 'facility_test',
        type: options.type,
        x: options.position[0],
        y: options.position[1],
        rotation,
        width,
        height,
        ports: [],
        isPowered: options.isPowered ?? false,
        inputFlows: options.inputFlows ?? [],
        outputFlows: options.outputFlows ?? []
    }

    const initializedPorts = initializeFacilityPorts(base).map(port => ({
        ...port,
        flows: [...port.flows]
    }))

    return {
        ...base,
        ports: options.ports ?? initializedPorts
    }
}

export function createFacilityWithPort(options: {
    id?: string
    type: FacilityID
    subType: 'input' | 'output'
    position: [number, number]
    direction: Direction
    portType?: FieldFacilityPort['type']
    isPowered?: boolean
}): FieldFacility {
    const portType = options.portType ?? 'belt'
    return createFacility({
        id: options.id,
        type: options.type,
        position: options.position,
        rotation: 0,
        isPowered: options.isPowered ?? true,
        ports: [
            {
                type: portType,
                subType: options.subType,
                x: 0,
                y: 0,
                direction: options.direction,
                flows: []
            }
        ]
    })
}

/**
 * Test helper for building field state using UserChanges.
 * This ensures test state is set up the same way users interact with the system.
 */
export class TestFieldBuilder {
    private state: Immutable<FieldState>
    private changes: UserChange[] = []

    constructor(width: number = 30, height: number = 30) {
        this.state = createEmptyState(width, height)
    }

    /**
     * Add a change and immediately apply it.
     */
    apply(change: UserChange): this {
        this.changes.push(change)
        this.state = recalculateFieldState(this.state, [change])
        return this
    }

    /**
     * Add multiple changes and apply them.
     */
    applyAll(changes: UserChange[]): this {
        for (const change of changes) {
            this.apply(change)
        }
        return this
    }

    addFacility(
        facilityType: Extract<UserChange, { type: 'add-facility' }>['facilityType'],
        position: [number, number],
        rotation: number = 0
    ): this {
        return this.apply({ type: 'add-facility', facilityType, position, rotation })
    }

    moveFacility(facilityID: string, newPosition: [number, number]): this {
        return this.apply({ type: 'move-facility', facilityID, newPosition })
    }

    rotateFacility(facilityID: string, newRotation: number): this {
        return this.apply({ type: 'rotate-facility', facilityID, newRotation })
    }

    removeFacility(facilityID: string): this {
        return this.apply({ type: 'remove-facility', facilityID })
    }

    addPath(
        pathType: Extract<UserChange, { type: 'add-path' }>['pathType'],
        points: [number, number][]
    ): this {
        return this.apply({ type: 'add-path', pathType, points })
    }

    addPathSegment(pathID: string, endpoint: 'start' | 'end', newPoint: [number, number]): this {
        return this.apply({ type: 'add-path-segment', pathID, endpoint, newPoint })
    }

    removePathSegment(pathID: string, endpoint: 'start' | 'end'): this {
        return this.apply({ type: 'remove-path-segment', pathID, endpoint })
    }

    removePath(pathID: string): this {
        return this.apply({ type: 'remove-path', pathID })
    }

    addFixture(
        fixtureType: Extract<UserChange, { type: 'add-path-fixture' }>['fixtureType'],
        position: [number, number],
        rotation: number = 0
    ): this {
        return this.apply({ type: 'add-path-fixture', fixtureType, position, rotation })
    }

    moveFixture(fixtureID: string, newPosition: [number, number]): this {
        return this.apply({ type: 'move-path-fixture', fixtureID, newPosition })
    }

    rotateFixture(fixtureID: string, newRotation: number): this {
        return this.apply({ type: 'rotate-path-fixture', fixtureID, newRotation })
    }

    removeFixture(fixtureID: string): this {
        return this.apply({ type: 'remove-path-fixture', fixtureID })
    }

    setPortItem(
        facilityID: string,
        portIndex: number,
        itemID: Extract<UserChange, { type: 'set-port-item' }>['itemID']
    ): this {
        return this.apply({ type: 'set-port-item', facilityID, portIndex, itemID })
    }

    /**
     * Get the current state.
     */
    build(): Immutable<FieldState> {
        return this.state
    }

    /**
     * Get all changes applied so far.
     */
    getChanges(): UserChange[] {
        return [...this.changes]
    }

    /**
     * Reset to initial empty state.
     */
    reset(): this {
        this.state = createEmptyState(this.state.width, this.state.height)
        this.changes = []
        return this
    }

    /**
     * Get a facility by index (returns the last added if no index given).
     */
    getFacility(index?: number) {
        if (index !== undefined) {
            return this.state.facilities[index]
        }
        return this.state.facilities[this.state.facilities.length - 1]
    }

    /**
     * Get a path by index (returns the last added if no index given).
     */
    getPath(index?: number) {
        if (index !== undefined) {
            return this.state.paths[index]
        }
        return this.state.paths[this.state.paths.length - 1]
    }

    /**
     * Get a fixture by index (returns the last added if no index given).
     */
    getFixture(index?: number) {
        if (index !== undefined) {
            return this.state.pathFixtures[index]
        }
        return this.state.pathFixtures[this.state.pathFixtures.length - 1]
    }

    /**
     * Find a facility by ID.
     */
    findFacility(id: string) {
        return this.state.facilities.find(f => f.id === id)
    }

    /**
     * Find a path by ID.
     */
    findPath(id: string) {
        return this.state.paths.find(p => p.id === id)
    }

    /**
     * Find a fixture by ID.
     */
    findFixture(id: string) {
        return this.state.pathFixtures.find(f => f.id === id)
    }
}

/**
 * Create a path with sensible defaults.
 * For low-level unit tests that don't use the full field calculation pipeline.
 */
export function createPath(options: {
    id?: string
    type: PathTypeID
    points: [number, number][]
    flows?: ItemFlow[]
    flowDirection?: FieldPath['flowDirection']
    startConnectedTo?: FieldPath['startConnectedTo']
    endConnectedTo?: FieldPath['endConnectedTo']
    errorFlags?: FieldPath['errorFlags']
}): FieldPath {
    return {
        id: options.id ?? 'path_test',
        type: options.type,
        points: options.points,
        flows: options.flows ?? [],
        flowDirection: options.flowDirection ?? 'none',
        startConnectedTo: options.startConnectedTo,
        endConnectedTo: options.endConnectedTo,
        errorFlags: options.errorFlags
    }
}

/**
 * Create a path fixture with sensible defaults.
 * For low-level unit tests that don't use the full field calculation pipeline.
 */
export function createFixture(options: {
    id?: string
    type: PathFixtureID
    position: [number, number]
    rotation?: number
    sides?: FieldPathFixtureSide[]
}): FieldPathFixture {
    const fixtureDef = pathFixturesData[options.type]
    if (!fixtureDef) {
        throw new Error(`Unknown fixture type: ${options.type}`)
    }

    const rotation = options.rotation ?? 0
    // Note: All fixtures are 1x1
    return {
        id: options.id ?? 'fixture_test',
        type: options.type,
        x: options.position[0],
        y: options.position[1],
        rotation,
        width: 1,
        height: 1,
        sides: options.sides ?? []
    }
}

/**
 * Create a flow object.
 */
export function createFlow(item: ItemID, sourceRate: number = 1.0, sinkRate: number = sourceRate): ItemFlow {
    return { item, sourceRate, sinkRate }
}

/**
 * Create a port object.
 */
export function createPort(options: {
    type: FieldFacilityPort['type']
    subType: 'input' | 'output'
    position?: [number, number]
    direction: Direction
    flows?: ItemFlow[]
}): FieldFacilityPort {
    return {
        type: options.type,
        subType: options.subType,
        x: options.position?.[0] ?? 0,
        y: options.position?.[1] ?? 0,
        direction: options.direction,
        flows: options.flows ?? []
    }
}

/**
 * Create a fixture side object.
 */
export function createFixtureSide(options: {
    type: 'belt' | 'pipe'
    subType: 'input' | 'output'
    direction: Direction
    connectedPathID?: string
    flows?: ItemFlow[]
}): FieldPathFixtureSide {
    return {
        type: options.type,
        direction: options.direction,
        subType: options.subType,
        connectedPathID: options.connectedPathID,
        flows: options.flows ?? []
    }
}

/**
 * Helper for building FieldState objects directly (without UserChanges).
 * Use this only when testing low-level functions that don't rely on the full field calculation pipeline.
 * For integration tests, prefer TestFieldBuilder.
 */
export function createState(options: {
    width?: number
    height?: number
    template?: FieldTemplateID | FieldTemplate
    facilities?: FieldFacility[]
    paths?: FieldPath[]
    pathFixtures?: FieldPathFixture[]
}): FieldState {
    const baseState = options.template
        ? createStateFromTemplate(options.template)
        : createEmptyState(options.width ?? 30, options.height ?? 30)

    // Create a mutable FieldState by manually constructing the object
    // This avoids the readonly arrays from Immutable<FieldState>
    const state: FieldState = {
        template: baseState.template,
        width: baseState.width,
        height: baseState.height,
        facilities: options.facilities ?? [],
        paths: options.paths ?? [],
        pathFixtures: options.pathFixtures ?? [],
        depot: {
            inputFlows: [],
            outputFlows: [],
            powerGenerated: 0,
            powerConsumed: 0
        },
        world: {
            inputFlows: [],
            outputFlows: []
        },
        debugInfo: {}
    }
    
    return state
}
