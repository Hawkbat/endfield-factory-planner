import type { Direction } from "../types/data.ts"
import type { FieldState, FieldFacility, FieldFacilityPort, FieldPath, FieldPathFixture, FieldPathFixtureSide, EntityConnectionRef } from "../types/field.ts"
import { calculatePathEndpointDirection } from "./directions.ts"
import { getOppositeDirection, rotateDirection } from "./directions.ts"
import { facilities } from "../data/facilities.ts"
import { pathFixtures, FixtureBehaviorType } from "../data/pathFixtures.ts"
import type { Immutable } from "../utils/types.ts"

/**
 * Find a facility port at a specific position and direction.
 * @param facility Facility to search
 * @param x Absolute x coordinate
 * @param y Absolute y coordinate
 * @param direction Direction the port should be facing
 * @returns Port index and port, or null if not found
 */
export function findPortAtPosition(
    facility: Immutable<FieldFacility>,
    x: number,
    y: number,
    direction: Direction
): { portIndex: number, port: Immutable<FieldFacilityPort> } | null {
    for (let i = 0; i < facility.ports.length; i++) {
        const port = facility.ports[i]
        const portX = facility.x + port.x
        const portY = facility.y + port.y
        
        if (portX === x && portY === y && port.direction === direction) {
            return { portIndex: i, port }
        }
    }
    
    return null
}

/**
 * Find a fixture side at a specific position and direction.
 * @param fixture Fixture to search
 * @param x Absolute x coordinate
 * @param y Absolute y coordinate
 * @param direction Direction the side should be facing
 * @returns Side index and side, or null if not found
 */
export function findFixtureSideAtPosition(
    fixture: Immutable<FieldPathFixture>,
    x: number,
    y: number,
    direction: Direction
): { sideIndex: number, side: Immutable<FieldPathFixtureSide> } | null {
    if (fixture.x !== x || fixture.y !== y) {
        return null
    }
    
    for (let i = 0; i < fixture.sides.length; i++) {
        const side = fixture.sides[i]
        if (side.direction === direction) {
            return { sideIndex: i, side }
        }
    }
    
    return null
}

/**
 * Get the entity (facility port or fixture side) connected to a path endpoint.
 * @param path Path to check
 * @param endpoint Which endpoint to check ('start' or 'end')
 * @param fieldState Current field state
 * @returns Connected entity (facility and port, or fixture and side), or null if not connected
 */
export function getConnectedEntity(
    path: Immutable<FieldPath>,
    endpoint: 'start' | 'end',
    fieldState: Immutable<FieldState>
): { facility: Immutable<FieldFacility>, port: Immutable<FieldFacilityPort>, portIndex: number } | 
   { fixture: Immutable<FieldPathFixture>, side: Immutable<FieldPathFixtureSide>, sideIndex: number } | 
   null {
    const connectionRef = endpoint === 'start' ? path.startConnectedTo : path.endConnectedTo
    if (!connectionRef) return null
    
    if (connectionRef.type === 'facility') {
        const facility = fieldState.facilities.find(f => f.id === connectionRef.facilityID)
        if (!facility) return null
        
        const port = facility.ports[connectionRef.portIndex]
        if (!port) return null
        
        return { facility, port, portIndex: connectionRef.portIndex }
    } else {
        const fixture = fieldState.pathFixtures.find(f => f.id === connectionRef.fixtureID)
        if (!fixture) return null
        
        const side = fixture.sides[connectionRef.sideIndex]
        if (!side) return null
        
        return { fixture, side, sideIndex: connectionRef.sideIndex }
    }
}

/**
 * Get the subType ('input' or 'output') of the entity connected to a path endpoint.
 * @param path Path to check
 * @param endpoint Which endpoint to check ('start' or 'end')
 * @param fieldState Current field state
 * @returns 'input', 'output', 'dynamic', or null if not connected
 */
export function getConnectedEntitySubType(
    path: Immutable<FieldPath>,
    endpoint: 'start' | 'end',
    fieldState: Immutable<FieldState>
): 'input' | 'output' | 'dynamic' | null {
    const connected = getConnectedEntity(path, endpoint, fieldState)
    if (!connected) return null
    
    if ('port' in connected) {
        return connected.port.subType
    } else {
        return connected.side.subType
    }
}

/**
 * Preserve user-set properties from old ports when initializing new ports.
 * Matches ports by position and type, preserving setItem for external/selected ports.
 * @param oldPorts Previous port array (may contain user-set properties)
 * @param newPorts Newly initialized port array
 * @returns New ports with preserved user properties where applicable
 */
export function preservePortProperties(
    oldPorts: readonly Immutable<FieldFacilityPort>[] | undefined,
    newPorts: Immutable<FieldFacilityPort>[]
): Immutable<FieldFacilityPort>[] {
    if (!oldPorts || oldPorts.length === 0) {
        return newPorts
    }
    
    return newPorts.map((newPort, i) => {
        // Find matching old port by position and type
        const matchingOldPort = oldPorts[i]
        if (matchingOldPort && matchingOldPort.setItem !== undefined) {
            return {
                ...newPort,
                setItem: matchingOldPort.setItem
            }
        }
        
        return newPort
    })
}

/**
 * Initialize facility ports from facility definition.
 * @param facility Facility to initialize ports for
 * @param facilityDef Facility type definition
 * @returns Array of initialized ports
 */
export function initializeFacilityPorts(facility: Immutable<FieldFacility>): Immutable<FieldFacilityPort>[] {
    const facilityDef = facilities[facility.type]
    const ports: Immutable<FieldFacilityPort>[] = []
    const originalWidth = facilityDef.width
    const originalHeight = facilityDef.height

    const rotatePort = (
        x: number,
        y: number,
        direction: Direction
    ): { x: number, y: number, direction: Direction } => {
        const rotationSteps = facility.rotation / 90
        let rotatedX = x
        let rotatedY = y
        let rotatedDirection = direction
        let currentWidth = originalWidth
        let currentHeight = originalHeight

        for (let i = 0; i < rotationSteps; i++) {
            const oldX = rotatedX
            const oldY = rotatedY

            rotatedX = currentHeight - 1 - oldY
            rotatedY = oldX
            rotatedDirection = rotateDirection(rotatedDirection, 1)

            const temp = currentWidth
            currentWidth = currentHeight
            currentHeight = temp
        }

        return { x: rotatedX, y: rotatedY, direction: rotatedDirection }
    }
    
    // Helper to create ports from a side definition
    const createPortsFromSide = (
        sideDef: Direction | Immutable<[number, number, Direction][]> | undefined,
        type: 'belt' | 'pipe',
        subType: 'input' | 'output',
        external?: 'depot' | 'world'
    ) => {
        if (!sideDef) return
        
        if (typeof sideDef === 'string') {
            // Direction string - create ports along that side
            const side = sideDef
            const rotatedSide = rotateDirection(side, facility.rotation / 90)
            
            let x = 0, y = 0, width = 1, height = 1
            
            switch (rotatedSide) {
                case 'up':
                    x = 0
                    y = 0
                    width = facility.width
                    height = 1
                    break
                case 'down':
                    x = 0
                    y = facility.height - 1
                    width = facility.width
                    height = 1
                    break
                case 'left':
                    x = 0
                    y = 0
                    width = 1
                    height = facility.height
                    break
                case 'right':
                    x = facility.width - 1
                    y = 0
                    width = 1
                    height = facility.height
                    break
            }
            
            // Create ports for each cell along the side
            for (let dx = 0; dx < width; dx++) {
                for (let dy = 0; dy < height; dy++) {
                    ports.push({
                        type,
                        subType,
                        x: x + dx,
                        y: y + dy,
                        direction: rotatedSide,
                        external,
                        flows: []
                    })
                }
            }
        } else {
            // Array of explicit port positions
            const portArray = sideDef
            
            for (const [px, py, pdir] of portArray) {
                const rotatedPort = rotatePort(px, py, pdir)
                ports.push({
                    type,
                    subType,
                    x: rotatedPort.x,
                    y: rotatedPort.y,
                    direction: rotatedPort.direction,
                    external,
                    flows: []
                })
            }
        }
    }
    
    // Create ports from facility definition
    createPortsFromSide(facilityDef.beltInputs, 'belt', 'input')
    createPortsFromSide(facilityDef.beltOutputs, 'belt', 'output')
    createPortsFromSide(facilityDef.pipeInputs, 'pipe', 'input')
    createPortsFromSide(facilityDef.pipeOutputs, 'pipe', 'output')
    createPortsFromSide(facilityDef.depotInputs, 'belt', 'input', 'depot')
    createPortsFromSide(facilityDef.depotOutputs, 'belt', 'output', 'depot')
    if (facilityDef.ports) {
        for (const port of facilityDef.ports) {
            const [x, y, direction, type, subType, external] = port
            const rotatedPort = rotatePort(x, y, direction)
            ports.push({
                type,
                subType,
                x: rotatedPort.x,
                y: rotatedPort.y,
                direction: rotatedPort.direction,
                external,
                flows: []
            })
        }
    }
    
    return ports
}

/**
 * Initialize fixture sides from fixture definition.
 * @param fixture Fixture to initialize sides for
 * @returns Array of initialized sides
 */
export function initializeFixtureSides(fixture: Immutable<FieldPathFixture>): FieldPathFixtureSide[] {
    const fixtureDef = pathFixtures[fixture.type]
    const sides: FieldPathFixtureSide[] = []
    
    for (const sideDef of fixtureDef.sides) {
        // Rotate side direction based on fixture rotation
        const rotatedDirection = rotateDirection(sideDef.direction, fixture.rotation / 90)
        
        sides.push({
            type: sideDef.type,
            subType: sideDef.subType,
            direction: rotatedDirection,
            flows: []
        })
    }
    
    return sides
}

/**
 * Calculate the flow direction for a path based on its connections.
 * Also determines specific error flags for blocked paths.
 * @param path Path to analyze
 * @param fieldState Current field state
 * @returns Flow direction and error flags
 */
export function calculatePathFlowDirection(
    path: Immutable<FieldPath>,
    fieldState: Immutable<FieldState>
): { 
    flowDirection: 'start-to-end' | 'end-to-start' | 'none',
    errorFlags: Partial<NonNullable<FieldPath['errorFlags']>>
} {
    const errorFlags: Partial<NonNullable<FieldPath['errorFlags']>> = {}
    
    if (path.points.length < 2) {
        errorFlags.nothingConnected = true
        return { flowDirection: 'none', errorFlags }
    }
    
    const startPoint = path.points[0]
    const endPoint = path.points[path.points.length - 1]
    const startDirection = calculatePathEndpointDirection(path, 'start')
    const endDirection = calculatePathEndpointDirection(path, 'end')
    
    if (startDirection === null || endDirection === null) {
        errorFlags.nothingConnected = true
        return { flowDirection: 'none', errorFlags }
    }
    
    let startIsInput = false
    let startIsOutput = false
    let endIsInput = false
    let endIsOutput = false
    let startIsBridge = false
    let endIsBridge = false
    
    // Check facility connections
    for (const facility of fieldState.facilities) {
        // At start: check for output facing same direction (start-to-end flow)
        const startOutputSame = findPortAtPosition(
            facility,
            startPoint[0],
            startPoint[1],
            startDirection
        )
        if (startOutputSame && startOutputSame.port.subType === 'output') {
            startIsOutput = true
        }
        
        // At start: check for output facing opposite direction (end-to-start flow, output sends back along path)
        const startOutputOpposite = findPortAtPosition(
            facility,
            startPoint[0],
            startPoint[1],
            getOppositeDirection(startDirection)
        )
        if (startOutputOpposite && startOutputOpposite.port.subType === 'output') {
            startIsOutput = true
        }
        
        // At start: check for input facing opposite direction (start-to-end flow)
        const startInputOpposite = findPortAtPosition(
            facility,
            startPoint[0],
            startPoint[1],
            getOppositeDirection(startDirection)
        )
        if (startInputOpposite && startInputOpposite.port.subType === 'input') {
            startIsInput = true
        }
        
        // At start: check for input facing same direction (end-to-start flow, input receives from along path)
        const startInputSame = findPortAtPosition(
            facility,
            startPoint[0],
            startPoint[1],
            startDirection
        )
        if (startInputSame && startInputSame.port.subType === 'input') {
            startIsInput = true
        }
        
        // At end: check for output facing same direction (start-to-end flow)
        const endOutputSame = findPortAtPosition(
            facility,
            endPoint[0],
            endPoint[1],
            endDirection
        )
        if (endOutputSame && endOutputSame.port.subType === 'output') {
            endIsOutput = true
        }
        
        // At end: check for output facing opposite direction (end-to-start flow, output sends back along path)
        const endOutputOpposite = findPortAtPosition(
            facility,
            endPoint[0],
            endPoint[1],
            getOppositeDirection(endDirection)
        )
        if (endOutputOpposite && endOutputOpposite.port.subType === 'output') {
            endIsOutput = true
        }
        
        // At end: check for input facing opposite direction (start-to-end flow)
        const endInputOpposite = findPortAtPosition(
            facility,
            endPoint[0],
            endPoint[1],
            getOppositeDirection(endDirection)
        )
        if (endInputOpposite && endInputOpposite.port.subType === 'input') {
            endIsInput = true
        }
        
        // At end: check for input facing same direction (end-to-start flow)
        const endInputSame = findPortAtPosition(
            facility,
            endPoint[0],
            endPoint[1],
            endDirection
        )
        if (endInputSame && endInputSame.port.subType === 'input') {
            endIsInput = true
        }
    }
    
    // Check fixture connections
    for (const fixture of fieldState.pathFixtures) {
        const fixtureDef = pathFixtures[fixture.type]
        const isBridge = fixtureDef?.behaviorType === FixtureBehaviorType.BRIDGE
        
        // At start: check for output facing same direction as path
        const startOutputSame = findFixtureSideAtPosition(
            fixture,
            startPoint[0],
            startPoint[1],
            startDirection
        )
        if (startOutputSame && startOutputSame.side.subType === 'output') {
            startIsOutput = true
            if (isBridge) startIsBridge = true
        }
        
        // At start: check for input facing opposite direction (receiving from path)
        const startInputOpposite = findFixtureSideAtPosition(
            fixture,
            startPoint[0],
            startPoint[1],
            getOppositeDirection(startDirection)
        )
        if (startInputOpposite && startInputOpposite.side.subType === 'input') {
            startIsInput = true
            if (isBridge) startIsBridge = true
        }
        
        // At end: check for input facing opposite direction (receiving from path)
        const endInputOpposite = findFixtureSideAtPosition(
            fixture,
            endPoint[0],
            endPoint[1],
            getOppositeDirection(endDirection)
        )
        if (endInputOpposite && endInputOpposite.side.subType === 'input') {
            endIsInput = true
            if (isBridge) endIsBridge = true
        }
        
        // At end: check for output facing same direction as path
        const endOutputSame = findFixtureSideAtPosition(
            fixture,
            endPoint[0],
            endPoint[1],
            endDirection
        )
        if (endOutputSame && endOutputSame.side.subType === 'output') {
            endIsOutput = true
            if (isBridge) endIsBridge = true
        }
    }
    
    // Determine flow direction based on connections
    const startConnected = startIsInput || startIsOutput
    const endConnected = endIsInput || endIsOutput
    
    // Set specific error flags
    if (!startConnected && !endConnected) {
        errorFlags.nothingConnected = true
        return { flowDirection: 'none', errorFlags }
    }
    
    if (startIsOutput && endIsInput) {
        return { flowDirection: 'start-to-end', errorFlags }
    } else if (endIsOutput && startIsInput) {
        return { flowDirection: 'end-to-start', errorFlags }
    } else if (startIsInput && endIsInput) {
        // Skip bothInputs check if either endpoint is a bridge (roles determined dynamically)
        if (!startIsBridge && !endIsBridge) {
            errorFlags.bothInputs = true
        }
        return { flowDirection: 'none', errorFlags }
    } else if (startIsOutput && endIsOutput) {
        // Skip bothOutputs check if either endpoint is a bridge (roles determined dynamically)
        if (!startIsBridge && !endIsBridge) {
            errorFlags.bothOutputs = true
        }
        return { flowDirection: 'none', errorFlags }
    } else {
        // One end connected to static input/output, other end not or connected to dynamic side
        // Flow direction will be determined during propagation
        return { flowDirection: 'none', errorFlags }
    }
}

/**
 * Update all path connections in the field.
 * Performs initial static analysis of flow directions based on connected ports.
 * Paths with dynamic fixtures or ambiguous connections get 'none' and will be
 * resolved during solver iterations.
 * @param fieldState Current field state
 * @returns Updated field state with all paths connected
 */
export function updateAllPathConnections(fieldState: Immutable<FieldState>): Immutable<FieldState> {
    const updatedPaths = fieldState.paths.map<Immutable<FieldPath>>(path => {
        // Calculate initial flow direction based on static topology
        const { flowDirection, errorFlags } = calculatePathFlowDirection(path, fieldState)
        return {
            ...path,
            flowDirection,
            errorFlags: {
                ...path.errorFlags,
                ...errorFlags
            }
        }
    })
    
    return {
        ...fieldState,
        paths: updatedPaths
    }
}

/**
 * Update a path's connection references to entities at its endpoints.
 * Should be called after facilities and fixtures have been updated with connectedPathID.
 * @param path Path to update
 * @param fieldState Current field state (with updated facility/fixture connections)
 * @returns Updated path with startConnectedTo and endConnectedTo populated
 */
export function updatePathConnectionRefs(
    path: Immutable<FieldPath>,
    fieldState: Immutable<FieldState>
): Immutable<FieldPath> {
    if (path.points.length < 2) {
        return { ...path, startConnectedTo: null, endConnectedTo: null }
    }
    
    const startPoint = path.points[0]
    const endPoint = path.points[path.points.length - 1]
    
    let startConnectedTo: EntityConnectionRef = null
    let endConnectedTo: EntityConnectionRef = null
    
    // Check facilities for connections
    for (const facility of fieldState.facilities) {
        for (let portIndex = 0; portIndex < facility.ports.length; portIndex++) {
            const port = facility.ports[portIndex]
            
            if (port.connectedPathID === path.id) {
                const portX = facility.x + port.x
                const portY = facility.y + port.y
                
                if (portX === startPoint[0] && portY === startPoint[1]) {
                    startConnectedTo = { type: 'facility', facilityID: facility.id, portIndex }
                } else if (portX === endPoint[0] && portY === endPoint[1]) {
                    endConnectedTo = { type: 'facility', facilityID: facility.id, portIndex }
                }
            }
        }
    }
    
    // Check fixtures for connections
    for (const fixture of fieldState.pathFixtures) {
        for (let sideIndex = 0; sideIndex < fixture.sides.length; sideIndex++) {
            const side = fixture.sides[sideIndex]
            
            if (side.connectedPathID === path.id) {
                if (fixture.x === startPoint[0] && fixture.y === startPoint[1]) {
                    startConnectedTo = { type: 'fixture', fixtureID: fixture.id, sideIndex }
                } else if (fixture.x === endPoint[0] && fixture.y === endPoint[1]) {
                    endConnectedTo = { type: 'fixture', fixtureID: fixture.id, sideIndex }
                }
            }
        }
    }
    
    return {
        ...path,
        startConnectedTo,
        endConnectedTo
    }
}

/**
 * Update facility path connections.
 * @param facility Facility to update
 * @param fieldState Current field state
 * @returns Updated facility with path connections
 */
export function updateFacilityConnections(
    facility: Immutable<FieldFacility>,
    fieldState: Immutable<FieldState>
): Immutable<FieldFacility> {
    const updatedPorts = facility.ports.map(port => {
        const portX = facility.x + port.x
        const portY = facility.y + port.y
        
        // Find path connected to this port
        const connectedPath = fieldState.paths.find(path => {
            if (path.points.length < 2) return false
            
            const startPoint = path.points[0]
            const endPoint = path.points[path.points.length - 1]
            const startDirection = calculatePathEndpointDirection(path, 'start')
            const endDirection = calculatePathEndpointDirection(path, 'end')
            
            if (startDirection === null || endDirection === null) return false
            
            // Path segment direction (toward endpoint) should be opposite port direction (away from facility)
            const startMatches = startPoint[0] === portX && startPoint[1] === portY && 
                                getOppositeDirection(startDirection) === port.direction
            const endMatches = endPoint[0] === portX && endPoint[1] === portY && 
                              getOppositeDirection(endDirection) === port.direction
            
            return startMatches || endMatches
        })
        
        return {
            ...port,
            connectedPathID: connectedPath?.id ?? null,
            flows: []
        }
    })
    
    return {
        ...facility,
        ports: updatedPorts
    }
}

/**
 * Update fixture connections.
 * @param fixture Fixture to update
 * @param fieldState Current field state
 * @returns Updated fixture with path connections
 */
export function updateFixtureConnections(
    fixture: Immutable<FieldPathFixture>,
    fieldState: Immutable<FieldState>
): FieldPathFixture {
    const updatedSides = fixture.sides.map(side => {
        // Find path connected to this side
        const connectedPath = fieldState.paths.find(path => {
            if (path.points.length < 2) return false
            
            const startPoint = path.points[0]
            const endPoint = path.points[path.points.length - 1]
            const startDirection = calculatePathEndpointDirection(path, 'start')
            const endDirection = calculatePathEndpointDirection(path, 'end')
            
            if (startDirection === null || endDirection === null) return false
            
            // Path segment direction (toward endpoint) should be opposite side direction (away from fixture)
            const startMatches = startPoint[0] === fixture.x && startPoint[1] === fixture.y && 
                                getOppositeDirection(startDirection) === side.direction
            const endMatches = endPoint[0] === fixture.x && endPoint[1] === fixture.y && 
                              getOppositeDirection(endDirection) === side.direction
            
            return startMatches || endMatches
        })
        
        return {
            ...side,
            connectedPathID: connectedPath?.id ?? null,
            flows: []
        }
    })
    
    return {
        ...fixture,
        sides: updatedSides
    }
}
