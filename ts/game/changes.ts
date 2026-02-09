import type { UserChange, FieldState, FieldFacility, FieldPath, FieldPathFixture } from "../types/field.ts"
import { initializeFacilityPorts, initializeFixtureSides, preservePortProperties, updateFixtureConnections } from "./connections.ts"
import { facilities } from "../data/facilities.ts"
import { tuple, type Immutable } from "../utils/types.ts"
import { validateFixturePlacementOnPath, reconnectPathsAfterFixtureRemoval } from "./fixtures.ts"

/**
 * Generate a unique ID for a new entity.
 * @param prefix Prefix for the ID
 * @param existingIDs Array of existing IDs to avoid collisions
 * @returns New unique ID
 */
function generateUniqueID(prefix: string, existingIDs: string[]): string {
    let counter = 1
    let id = `${prefix}${counter}`
    
    while (existingIDs.includes(id)) {
        counter++
        id = `${prefix}${counter}`
    }
    
    return id
}

/**
 * Resolve reference tokens in a change to actual IDs.
 * Reference tokens like "@ref:facility:0" are replaced with actual entity IDs.
 */
function resolveChangeReferences(change: UserChange, refMap: Map<string, string>): UserChange {
    switch (change.type) {
        case 'set-port-item': {
            const facilityID = refMap.get(change.facilityID) || change.facilityID
            return { ...change, facilityID }
        }
        case 'set-facility-recipe': {
            const facilityID = refMap.get(change.facilityID) || change.facilityID
            return { ...change, facilityID }
        }
        case 'set-fixture-item': {
            const fixtureID = refMap.get(change.fixtureID) || change.fixtureID
            return { ...change, fixtureID }
        }
        case 'move-facility': {
            const facilityID = refMap.get(change.facilityID) || change.facilityID
            return { ...change, facilityID }
        }
        case 'rotate-facility': {
            const facilityID = refMap.get(change.facilityID) || change.facilityID
            return { ...change, facilityID }
        }
        case 'remove-facility': {
            const facilityID = refMap.get(change.facilityID) || change.facilityID
            return { ...change, facilityID }
        }
        case 'move-path-fixture': {
            const fixtureID = refMap.get(change.fixtureID) || change.fixtureID
            return { ...change, fixtureID }
        }
        case 'rotate-path-fixture': {
            const fixtureID = refMap.get(change.fixtureID) || change.fixtureID
            return { ...change, fixtureID }
        }
        case 'remove-path-fixture': {
            const fixtureID = refMap.get(change.fixtureID) || change.fixtureID
            return { ...change, fixtureID }
        }
        case 'update-path-points':
        case 'move-path-point':
        case 'add-path-segment':
        case 'remove-path-segment':
        case 'remove-path': {
            const pathID = refMap.get(change.pathID) || change.pathID
            return { ...change, pathID }
        }
        default:
            // No references to resolve in other change types
            return change
    }
}

/**
 * Apply loadState change.
 */
export function applyLoadState(
    _fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'loadState' }>
): Immutable<FieldState> {
    return {
        ...change.fieldState,
    }
}

/**
 * Apply add-facility change.
 */
export function applyAddFacility(
    fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'add-facility' }>
): Immutable<FieldState> {
    const facilityDef = facilities[change.facilityType]
    
    if (!facilityDef) {
        console.error(`Unknown facility type: ${change.facilityType}`)
        return { ...fieldState }
    }
    
    // Determine width and height based on rotation
    const swapDimensions = change.rotation === 90 || change.rotation === 270
    const width = swapDimensions ? facilityDef.height : facilityDef.width
    const height = swapDimensions ? facilityDef.width : facilityDef.height
    
    const existingIDs = fieldState.facilities.map(f => f.id)
    const newFacilityBase: Immutable<FieldFacility> = {
        id: generateUniqueID('facility_', existingIDs),
        type: change.facilityType,
        x: change.position[0],
        y: change.position[1],
        rotation: change.rotation,
        width,
        height,
        ports: [],
        isPowered: false,
        inputFlows: [],
        outputFlows: []
    }
    
    const newFacility: Immutable<FieldFacility> = {
        ...newFacilityBase,
        ports: initializeFacilityPorts(newFacilityBase)
    }
    
    return {
        ...fieldState,
        facilities: [...fieldState.facilities, newFacility]
    }
}

/**
 * Apply move-facility change.
 */
export function applyMoveFacility(
    fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'move-facility' }>
): Immutable<FieldState> {
    const updatedFacilities = fieldState.facilities.map(facility => {
        if (facility.id === change.facilityID) {
            return {
                ...facility,
                x: change.newPosition[0],
                y: change.newPosition[1],
                // Clear computed state
                ports: facility.ports.map(port => ({
                    ...port,
                    connectedPathID: null,
                    flows: []
                })),
                isPowered: false,
                inputFlows: [],
                outputFlows: [],
                actualRecipe: null
            }
        }
        return facility
    })
    
    return {
        ...fieldState,
        facilities: updatedFacilities
    }
}

/**
 * Apply rotate-facility change.
 */
export function applyRotateFacility(
    fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'rotate-facility' }>
): Immutable<FieldState> {
    const updatedFacilities = fieldState.facilities.map(facility => {
        if (facility.id === change.facilityID) {
            const facilityDef = facilities[facility.type]
            const swapDimensions = change.newRotation === 90 || change.newRotation === 270
            
            const rotatedFacilityBase: Immutable<FieldFacility> = {
                ...facility,
                rotation: change.newRotation,
                width: swapDimensions ? facilityDef.height : facilityDef.width,
                height: swapDimensions ? facilityDef.width : facilityDef.height,
                isPowered: false,
                inputFlows: [],
                outputFlows: [],
                actualRecipe: null,
                // Preserve user-set properties
                setRecipe: facility.setRecipe,
                jumpStartRecipe: facility.jumpStartRecipe
            }
            
            const newPorts = initializeFacilityPorts(rotatedFacilityBase)
            
            return {
                ...rotatedFacilityBase,
                ports: preservePortProperties(facility.ports, newPorts)
            }
        }
        return facility
    })
    
    return {
        ...fieldState,
        facilities: updatedFacilities
    }
}

/**
 * Apply remove-facility change.
 */
export function applyRemoveFacility(
    fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'remove-facility' }>
): Immutable<FieldState> {
    return {
        ...fieldState,
        facilities: fieldState.facilities.filter(f => f.id !== change.facilityID)
    }
}

/**
 * Apply add-path change.
 */
export function applyAddPath(
    fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'add-path' }>
): Immutable<FieldState> {
    const existingIDs = fieldState.paths.map(p => p.id)
    const newPath: Immutable<FieldPath> = {
        id: generateUniqueID('path_', existingIDs),
        type: change.pathType,
        points: change.points,
        flows: [],
        flowDirection: 'none'
    }
    
    return {
        ...fieldState,
        paths: [...fieldState.paths, newPath]
    }
}

/**
 * Apply update-path-points change.
 */
export function applyUpdatePathPoints(
    fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'update-path-points' }>
): Immutable<FieldState> {
    const updatedPaths = fieldState.paths.map<Immutable<FieldPath>>(path => {
        if (path.id === change.pathID) {
            return {
                ...path,
                points: change.points,
                flows: [],
                flowDirection: 'none'
            }
        }
        return path
    })
    
    return {
        ...fieldState,
        paths: updatedPaths
    }
}

/**
 * Apply move-path-point change.
 */
export function applyMovePathPoint(
    fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'move-path-point' }>
): Immutable<FieldState> {
    const updatedPaths = fieldState.paths.map<Immutable<FieldPath>>(path => {
        if (path.id === change.pathID) {
            const newPoints = path.points.map(point => tuple(point[0], point[1]))
            if (change.pointIndex >= 0 && change.pointIndex < newPoints.length) {
                newPoints[change.pointIndex] = change.newPosition
            }
            
            return {
                ...path,
                points: newPoints,
                flows: [],
                flowDirection: 'none'
            }
        }
        return path
    })
    
    return {
        ...fieldState,
        paths: updatedPaths
    }
}

/**
 * Apply add-path-segment change.
 */
export function applyAddPathSegment(
    fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'add-path-segment' }>
): Immutable<FieldState> {
    const updatedPaths = fieldState.paths.map<Immutable<FieldPath>>(path => {
        if (path.id === change.pathID) {
            const newPoints = path.points.map(point => tuple(point[0], point[1]))
            
            if (change.endpoint === 'start') {
                newPoints.unshift(change.newPoint)
            } else {
                newPoints.push(change.newPoint)
            }
            
            return {
                ...path,
                points: newPoints,
                flows: [],
                flowDirection: 'none'
            }
        }
        return path
    })
    
    return {
        ...fieldState,
        paths: updatedPaths
    }
}

/**
 * Apply remove-path-segment change.
 */
export function applyRemovePathSegment(
    fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'remove-path-segment' }>
): Immutable<FieldState> {
    const updatedPaths = fieldState.paths.map<Immutable<FieldPath>>(path => {
        if (path.id === change.pathID) {
            const newPoints = path.points.map(point => tuple(point[0], point[1]))
            
            if (change.endpoint === 'start' && newPoints.length > 2) {
                newPoints.shift()
            } else if (change.endpoint === 'end' && newPoints.length > 2) {
                newPoints.pop()
            }
            
            return {
                ...path,
                points: newPoints,
                flows: [],
                flowDirection: 'none'
            }
        }
        return path
    })
    
    return {
        ...fieldState,
        paths: updatedPaths
    }
}

/**
 * Apply remove-path change.
 */
export function applyRemovePath(
    fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'remove-path' }>
): Immutable<FieldState> {
    return {
        ...fieldState,
        paths: fieldState.paths.filter(p => p.id !== change.pathID)
    }
}

/**
 * Apply add-path-fixture change.
 */
export function applyAddPathFixture(
    fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'add-path-fixture' }>
): Immutable<FieldState> {
    const existingIDs = fieldState.pathFixtures.map(f => f.id)
    const newFixtureBase: Immutable<FieldPathFixture> = {
        id: generateUniqueID('fixture_', existingIDs),
        type: change.fixtureType,
        x: change.position[0],
        y: change.position[1],
        rotation: change.rotation,
        width: 1,
        height: 1,
        sides: []
    }
    
    const newFixture: Immutable<FieldPathFixture> = {
        ...newFixtureBase,
        sides: initializeFixtureSides(newFixtureBase)
    }
    
    // Find any path that contains this fixture position and split it
    let updatedState = {
        ...fieldState,
        pathFixtures: [...fieldState.pathFixtures, newFixture]
    }
    
    // Check each path to see if the fixture should split it
    for (const path of fieldState.paths) {
        const validation = validateFixturePlacementOnPath(
            change.fixtureType,
            change.position,
            change.rotation,
            path
        )
        
        if (validation.isValid && validation.segmentIndex !== undefined) {
            // This path needs to be split - but we need to do this differently
            // since we're already in the middle of applying a change.
            // We need to split the path manually here rather than generating more changes.
            
            const beforePoints: [number, number][] = []
            const afterPoints: [number, number][] = []
            
            // Add all points before the segment
            for (let i = 0; i <= validation.segmentIndex; i++) {
                beforePoints.push([path.points[i][0], path.points[i][1]])
            }
            
            // Add the fixture position as the end of the first path
            beforePoints.push([change.position[0], change.position[1]])
            
            // Add the fixture position as the start of the second path
            afterPoints.push([change.position[0], change.position[1]])
            
            // Add all points after the segment
            for (let i = validation.segmentIndex + 1; i < path.points.length; i++) {
                afterPoints.push([path.points[i][0], path.points[i][1]])
            }
            
            // Remove the original path and add the split paths
            updatedState = {
                ...updatedState,
                paths: updatedState.paths.filter(p => p.id !== path.id)
            }
            
            // Add the two new path segments if they have enough points
            const pathIDs: string[] = updatedState.paths.map(p => p.id)
            
            if (beforePoints.length >= 2) {
                const newPath1: FieldPath = {
                    id: generateUniqueID('path_', pathIDs),
                    type: path.type,
                    points: beforePoints,
                    flows: [],
                    flowDirection: 'none'
                }
                updatedState = {
                    ...updatedState,
                    paths: [...updatedState.paths, newPath1]
                }
                pathIDs.push(newPath1.id)
            }
            
            if (afterPoints.length >= 2) {
                const newPath2: FieldPath = {
                    id: generateUniqueID('path_', pathIDs),
                    type: path.type,
                    points: afterPoints,
                    flows: [],
                    flowDirection: 'none'
                }
                updatedState = {
                    ...updatedState,
                    paths: [...updatedState.paths, newPath2]
                }
            }
            
            // Only split the first matching path
            break
        }
    }
    
    return updatedState
}

/**
 * Apply move-path-fixture change.
 */
export function applyMovePathFixture(
    fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'move-path-fixture' }>
): Immutable<FieldState> {
    const updatedFixtures = fieldState.pathFixtures.map(fixture => {
        if (fixture.id === change.fixtureID) {
            return {
                ...fixture,
                x: change.newPosition[0],
                y: change.newPosition[1],
                sides: fixture.sides.map(side => ({
                    ...side,
                    connectedPathID: null,
                    flows: []
                }))
            }
        }
        return fixture
    })
    
    return {
        ...fieldState,
        pathFixtures: updatedFixtures
    }
}

/**
 * Apply rotate-path-fixture change.
 */
export function applyRotatePathFixture(
    fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'rotate-path-fixture' }>
): Immutable<FieldState> {
    const updatedFixtures = fieldState.pathFixtures.map(fixture => {
        if (fixture.id === change.fixtureID) {
            const rotatedFixtureBase: Immutable<FieldPathFixture> = {
                ...fixture,
                rotation: change.newRotation
            }
            
            return {
                ...rotatedFixtureBase,
                sides: initializeFixtureSides(rotatedFixtureBase)
            }
        }
        return fixture
    })
    
    return {
        ...fieldState,
        pathFixtures: updatedFixtures
    }
}

/**
 * Apply remove-path-fixture change.
 * Also reconnects paths that were connected to the fixture.
 */
export function applyRemovePathFixture(
    fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'remove-path-fixture' }>
): Immutable<FieldState> {
    // Find the fixture being removed
    const fixture = fieldState.pathFixtures.find(f => f.id === change.fixtureID)
    
    if (!fixture) {
        return fieldState
    }
    
    // IMPORTANT: We need to update connections BEFORE removing the fixture
    // because applyRemovePathFixture is called during Step 1 of recalculateFieldState,
    // but connections are only calculated in Step 6. We need the connection info
    // to know which paths to merge.
    
    // Temporarily recalculate just this fixture's connections
    const fixtureWithConnections = updateFixtureConnections(fixture, fieldState)
    
    // Remove the fixture
    let updatedState: Immutable<FieldState> = {
        ...fieldState,
        pathFixtures: fieldState.pathFixtures.filter(f => f.id !== change.fixtureID)
    }
    
    // Generate and apply reconnection changes using the fixture with updated connections
    const reconnectionChanges = reconnectPathsAfterFixtureRemoval(fixtureWithConnections, fieldState)
    
    for (const reconnectChange of reconnectionChanges) {
        updatedState = applyUserChange(updatedState, reconnectChange)
    }
    
    return updatedState
}

/**
/**
 * Apply set-port-item change.
 */
export function applySetPortItem(
    fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'set-port-item' }>
): Immutable<FieldState> {
    const updatedFacilities = fieldState.facilities.map(facility => {
        if (facility.id === change.facilityID) {
            const updatedPorts = facility.ports.map((port, index) => {
                if (index === change.portIndex && port.subType === 'output') {
                    return {
                        ...port,
                        setItem: change.itemID
                    }
                }
                return port
            })

            return {
                ...facility,
                ports: updatedPorts
            }
        }
        return facility
    })

    return {
        ...fieldState,
        facilities: updatedFacilities
    }
}

/**
 * Apply set-fixture-item change.
 */
export function applySetFixtureItem(
    fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'set-fixture-item' }>
): Immutable<FieldState> {
    const updatedFixtures = fieldState.pathFixtures.map(fixture => {
        if (fixture.id === change.fixtureID) {
            return {
                ...fixture,
                setItem: change.itemID
            }
        }
        return fixture
    })
    
    return {
        ...fieldState,
        pathFixtures: updatedFixtures
    }
}

/**
 * Apply set-facility-recipe change.
 */
export function applySetFacilityRecipe(
    fieldState: Immutable<FieldState>,
    change: Extract<UserChange, { type: 'set-facility-recipe' }>
): Immutable<FieldState> {
    const updatedFacilities = fieldState.facilities.map(facility => {
        if (facility.id === change.facilityID) {
            return {
                ...facility,
                setRecipe: change.recipeID,
                jumpStartRecipe: change.jumpStart
            }
        }
        return facility
    })
    
    return {
        ...fieldState,
        facilities: updatedFacilities
    }
}

/**
 * Apply a single user change to the field state.
 */
export function applyUserChange(
    fieldState: Immutable<FieldState>,
    change: UserChange
): Immutable<FieldState> {
    switch (change.type) {
        case 'loadState':
            return applyLoadState(fieldState, change)
        case 'multi': {
            // Apply all changes with reference resolution
            // References like "@ref:facility:0" get resolved to actual IDs
            let currentState = fieldState
            const refMap = new Map<string, string>() // reference token -> actual ID
            let facilityRefIndex = 0
            let fixtureRefIndex = 0
            
            for (const subChange of change.changes) {
                // Track newly created entities for reference resolution
                const beforeFacilityCount = currentState.facilities.length
                const beforeFixtureCount = currentState.pathFixtures.length
                
                // Resolve any reference tokens in this change
                const resolvedChange = resolveChangeReferences(subChange, refMap)
                
                // Apply the change
                currentState = applyUserChange(currentState, resolvedChange)
                
                // If new entities were created, map their references
                if (currentState.facilities.length > beforeFacilityCount) {
                    const newFacility = currentState.facilities[currentState.facilities.length - 1]
                    refMap.set(`@ref:facility:${facilityRefIndex}`, newFacility.id)
                    facilityRefIndex++
                }
                if (currentState.pathFixtures.length > beforeFixtureCount) {
                    const newFixture = currentState.pathFixtures[currentState.pathFixtures.length - 1]
                    refMap.set(`@ref:fixture:${fixtureRefIndex}`, newFixture.id)
                    fixtureRefIndex++
                }
            }
            return currentState
        }
        case 'add-facility':
            return applyAddFacility(fieldState, change)
        case 'move-facility':
            return applyMoveFacility(fieldState, change)
        case 'rotate-facility':
            return applyRotateFacility(fieldState, change)
        case 'remove-facility':
            return applyRemoveFacility(fieldState, change)
        case 'add-path':
            return applyAddPath(fieldState, change)
        case 'update-path-points':
            return applyUpdatePathPoints(fieldState, change)
        case 'move-path-point':
            return applyMovePathPoint(fieldState, change)
        case 'add-path-segment':
            return applyAddPathSegment(fieldState, change)
        case 'remove-path-segment':
            return applyRemovePathSegment(fieldState, change)
        case 'remove-path':
            return applyRemovePath(fieldState, change)
        case 'add-path-fixture':
            return applyAddPathFixture(fieldState, change)
        case 'move-path-fixture':
            return applyMovePathFixture(fieldState, change)
        case 'rotate-path-fixture':
            return applyRotatePathFixture(fieldState, change)
        case 'remove-path-fixture':
            return applyRemovePathFixture(fieldState, change)
        case 'set-port-item':
            return applySetPortItem(fieldState, change)
        case 'set-fixture-item':
            return applySetFixtureItem(fieldState, change)
        case 'set-facility-recipe':
            return applySetFacilityRecipe(fieldState, change)
        default:
            console.error('Unknown change type:', change)
            return { ...fieldState }
    }
}
