import type { Immutable } from "../utils/types.ts"
import type { FieldState, FieldPathFixture, ItemFlow, FieldPath, UserChange } from "../types/field.ts"
import { mergeItemFlows } from "./flows.ts"
import { pathFixtures, FixtureBehaviorType, getFixtureTypeForPath } from "../data/pathFixtures.ts"
import { getConnectedEntity, updateFixtureConnections } from "./connections.ts"
import { findSegmentContainingPoint, getPathSegments, findPerpendicularCrossing } from "./geometry.ts"
import { PathFixtureID, PathTypeID, type Direction } from "../types/data.ts"
import { items } from "../data/items.ts"

/**
 * Propagate across bridge fixtures to find the ultimate connection type.
 * This function recursively follows paths through bridge fixtures to determine
 * if the chain ultimately connects to an input or output port.
 * 
 * @param path Path to analyze
 * @param fromEndpoint Which endpoint we're coming from ('start' or 'end')
 * @param fieldState Current field state
 * @param visitedPaths Set of path IDs already visited (to prevent cycles)
 * @returns 'input', 'output', or null if no definitive connection found
 */
function propagateAcrossBridges(
    path: Immutable<FieldPath>,
    fromEndpoint: 'start' | 'end',
    fieldState: Immutable<FieldState>,
    visitedPaths: Set<string> = new Set()
): 'input' | 'output' | null {
    // Prevent cycles
    if (visitedPaths.has(path.id)) {
        return null
    }
    visitedPaths.add(path.id)
    
    // Check what's connected at the specified endpoint
    const connected = getConnectedEntity(path, fromEndpoint, fieldState)
    if (!connected) {
        return null
    }
    
    // If connected to a facility port, return its type
    if ('port' in connected) {
        return connected.port.subType
    }
    
    // If connected to a fixture
    if ('side' in connected) {
        const side = connected.side
        const fixture = connected.fixture
        const fixtureDef = pathFixtures[fixture.type]
        
        // If it's not a bridge, return the side's type
        if (!fixtureDef || fixtureDef.behaviorType !== FixtureBehaviorType.BRIDGE) {
            return side.subType
        }
        
        // It's a bridge - we need to continue propagating
        const bridgePosition: [number, number] = [fixture.x, fixture.y]
        
        // Find the path connected to the OTHER side of this bridge on the same axis
        // Determine axis based on the connected side's direction
        const connectedDirection = side.direction
        let oppositeSideDirection: Direction
        
        if (connectedDirection === 'up') {
            oppositeSideDirection = 'down'
        } else if (connectedDirection === 'down') {
            oppositeSideDirection = 'up'
        } else if (connectedDirection === 'left') {
            oppositeSideDirection = 'right'
        } else { // 'right'
            oppositeSideDirection = 'left'
        }
        
        // Find the opposite side
        const oppositeSide = fixture.sides.find(s => s.direction === oppositeSideDirection)
        if (!oppositeSide || !oppositeSide.connectedPathID) {
            return null
        }
        
        // Get the path connected to the opposite side
        const oppositePath = fieldState.paths.find(p => p.id === oppositeSide.connectedPathID)
        if (!oppositePath) {
            return null
        }
        
        // Determine which endpoint of the opposite path connects to this bridge
        const oppositeStartPoint = oppositePath.points[0]
        const oppositeEndPoint = oppositePath.points[oppositePath.points.length - 1]
        
        const oppositeStartAtBridge = 
            oppositeStartPoint[0] === bridgePosition[0] && 
            oppositeStartPoint[1] === bridgePosition[1]
        const oppositeEndAtBridge = 
            oppositeEndPoint[0] === bridgePosition[0] && 
            oppositeEndPoint[1] === bridgePosition[1]
        
        // Determine which endpoint to continue propagating from
        let oppositeFromEndpoint: 'start' | 'end'
        if (oppositeStartAtBridge && !oppositeEndAtBridge) {
            oppositeFromEndpoint = 'end'
        } else if (oppositeEndAtBridge && !oppositeStartAtBridge) {
            oppositeFromEndpoint = 'start'
        } else {
            return null
        }
        
        // Continue propagating through the opposite path
        return propagateAcrossBridges(oppositePath, oppositeFromEndpoint, fieldState, visitedPaths)
    }
    
    return null
}

/**
 * Determine what a path's OTHER endpoint (not the one connected to the given bridge side) connects to.
 * Used to determine if a bridge side should act as input or output.
 * Returns 'input', 'output', or null if the other endpoint doesn't connect to anything.
 * This function propagates across multiple bridge fixtures if necessary.
 */
function getPathOtherEndConnectionType(
    path: Immutable<FieldPath>,
    bridgeSidePosition: [number, number],
    fieldState: Immutable<FieldState>
): 'input' | 'output' | null {
    // Find which end of the path is NOT connected to the bridge side
    const startPoint = path.points[0]
    const endPoint = path.points[path.points.length - 1]
    
    // Determine which end is connected to the bridge
    const startIsAtBridge = startPoint[0] === bridgeSidePosition[0] && startPoint[1] === bridgeSidePosition[1]
    const endIsAtBridge = endPoint[0] === bridgeSidePosition[0] && endPoint[1] === bridgeSidePosition[1]
    
    // The OTHER endpoint is the one that ISN'T at the bridge
    let otherEndpoint: 'start' | 'end'
    if (startIsAtBridge && !endIsAtBridge) {
        otherEndpoint = 'end'
    } else if (endIsAtBridge && !startIsAtBridge) {
        otherEndpoint = 'start'
    } else {
        // Neither or both at bridge - not a valid connection
        return null
    }
    
    // Use propagation to handle multiple bridges
    return propagateAcrossBridges(path, otherEndpoint, fieldState)
}

/**
 * Calculate flows for a Bridge fixture.
 * Bridge allows connections on all four sides and dynamically routes flows based on
 * what the connected paths' other endpoints connect to.
 * Left/right axis is independent from up/down axis.
 * @param fixture Bridge fixture
 * @param fieldState Current field state
 * @returns Input and output flows (mapped to each side)
 */
export function calculateBridgeFlows(
    fixture: Immutable<FieldPathFixture>,
    fieldState: Immutable<FieldState>
): { inputFlows: ItemFlow[], outputFlows: ItemFlow[] } {
    // Get the bridge position
    const bridgePos: [number, number] = [fixture.x, fixture.y]
    
    // Get sides by direction
    const sidesByDir: Record<string, Immutable<typeof fixture.sides[0]>> = {}
    for (const side of fixture.sides) {
        sidesByDir[side.direction] = side
    }
    
    const upSide = sidesByDir['up']
    const downSide = sidesByDir['down']
    const leftSide = sidesByDir['left']
    const rightSide = sidesByDir['right']
    
    // Helper to analyze one axis
    type AxisAnalysis = { inputSide: string | null; outputSide: string | null; isValid: boolean }
    function analyzeAxis(side1: Immutable<typeof fixture.sides[0]> | undefined, side1Dir: string, side2: Immutable<typeof fixture.sides[0]> | undefined, side2Dir: string): AxisAnalysis {
        const side1Connected = side1?.connectedPathID ? true : false
        const side2Connected = side2?.connectedPathID ? true : false
        
        if (!side1Connected && !side2Connected) {
            // Nothing connected on this axis
            return { inputSide: null, outputSide: null, isValid: false }
        }
        
        if (side1Connected && !side2Connected) {
            // Only side1 connected - block this axis
            return { inputSide: null, outputSide: null, isValid: false }
        }
        
        if (!side1Connected && side2Connected) {
            // Only side2 connected - block this axis
            return { inputSide: null, outputSide: null, isValid: false }
        }
        
        // Both connected - determine directions by checking what their OTHER endpoints connect to
        const side1Path = fieldState.paths.find(p => p.id === side1!.connectedPathID!)
        const side2Path = fieldState.paths.find(p => p.id === side2!.connectedPathID!)
        
        if (!side1Path || !side2Path) {
            return { inputSide: null, outputSide: null, isValid: false }
        }
        
        const side1EndType = getPathOtherEndConnectionType(side1Path, bridgePos, fieldState)
        const side2EndType = getPathOtherEndConnectionType(side2Path, bridgePos, fieldState)
        
        // Determine roles: if other end connects to output, this side is input (receives from output)
        // If other end connects to input, this side is output (sends to input)
        const side1IsInput = side1EndType === 'output'  // Receiving from output port
        const side1IsOutput = side1EndType === 'input'   // Sending to input port
        const side2IsInput = side2EndType === 'output'   // Receiving from output port
        const side2IsOutput = side2EndType === 'input'   // Sending to input port
        
        // Check for valid pairing: one side input, other output
        if (side1IsInput && side2IsOutput) {
            return { inputSide: side1Dir, outputSide: side2Dir, isValid: true }
        }
        if (side1IsOutput && side2IsInput) {
            return { inputSide: side2Dir, outputSide: side1Dir, isValid: true }
        }
        
        // Invalid: both outputs, both inputs, or unconnected on one side
        return { inputSide: null, outputSide: null, isValid: false }
    }
    
    // Analyze each axis independently
    const horizontalAnalysis = analyzeAxis(leftSide, 'left', rightSide, 'right')
    const verticalAnalysis = analyzeAxis(upSide, 'up', downSide, 'down')
    
    // Collect flows from input sides and pass to output sides on valid axes
    const inputFlowArrays: Immutable<ItemFlow[]>[] = []
    
    if (horizontalAnalysis.isValid && horizontalAnalysis.inputSide && horizontalAnalysis.outputSide) {
        const inputSide = sidesByDir[horizontalAnalysis.inputSide]
        if (inputSide?.connectedPathID) {
            const path = fieldState.paths.find(p => p.id === inputSide.connectedPathID)
            if (path) {
                inputFlowArrays.push(path.flows)
            }
        }
    }
    
    if (verticalAnalysis.isValid && verticalAnalysis.inputSide && verticalAnalysis.outputSide) {
        const inputSide = sidesByDir[verticalAnalysis.inputSide]
        if (inputSide?.connectedPathID) {
            const path = fieldState.paths.find(p => p.id === inputSide.connectedPathID)
            if (path) {
                inputFlowArrays.push(path.flows)
            }
        }
    }
    
    // Merge input flows by item type
    const inputFlows = mergeItemFlows(inputFlowArrays)
    
    // Output flows are same as input flows (pass-through)
    const outputFlows = inputFlows.map(flow => ({ ...flow }))
    
    return { inputFlows, outputFlows }
}

/**
 * Calculate flows for a Splitter fixture.
 * Splitter divides input flow evenly among connected output sides.
 * @param fixture Splitter fixture
 * @param fieldState Current field state
 * @returns Input and output flows
 */
export function calculateSplitterFlows(
    fixture: Immutable<FieldPathFixture>,
    fieldState: Immutable<FieldState>
): { inputFlows: ItemFlow[], outputFlows: ItemFlow[] } {
    const inputFlows: ItemFlow[] = []
    
    // Collect input flows (should be from bottom side)
    for (const side of fixture.sides) {
        if (side.subType === 'input' && side.connectedPathID) {
            const path = fieldState.paths.find(p => p.id === side.connectedPathID)
            if (path) {
                for (const flow of path.flows) {
                    inputFlows.push({ ...flow })
                }
            }
        }
    }
    
    // Count connected output sides
    const connectedOutputSides = fixture.sides.filter(
        side => side.subType === 'output' && side.connectedPathID !== null && side.connectedPathID !== undefined
    )
    
    if (connectedOutputSides.length === 0) {
        // No outputs connected, everything is blocked
        return { inputFlows, outputFlows: [] }
    }
    
    // Divide input evenly among outputs (set equal sourceRate)
    const outputFlows: ItemFlow[] = []
    
    for (const inputFlow of inputFlows) {
        outputFlows.push({
            item: inputFlow.item,
            sourceRate: inputFlow.sinkRate / connectedOutputSides.length,
            sinkRate: inputFlow.sinkRate / connectedOutputSides.length
        })
    }
    
    return { inputFlows, outputFlows }
}

/**
 * Calculate flows for a Converger fixture.
 * Converger combines all input flows into single output.
 * @param fixture Converger fixture
 * @param fieldState Current field state
 * @returns Input and output flows
 */
export function calculateConvergerFlows(
    fixture: Immutable<FieldPathFixture>,
    fieldState: Immutable<FieldState>
): { inputFlows: Immutable<ItemFlow>[], outputFlows: Immutable<ItemFlow>[] } {
    const allInputFlows: Immutable<ItemFlow[]>[] = []
    
    // Collect flows from all input sides
    for (const side of fixture.sides) {
        if (side.subType === 'input' && side.connectedPathID) {
            const path = fieldState.paths.find(p => p.id === side.connectedPathID)
            if (path) {
                allInputFlows.push(path.flows)
            }
        }
    }
    
    // Merge all input flows
    const inputFlows = mergeItemFlows(allInputFlows)
    
    // Output is the combined input (subject to output path's throughput limit)
    const outputFlows = inputFlows.map(flow => ({ ...flow }))
    
    return { inputFlows, outputFlows }
}

/**
 * Calculate flows for a Control Port fixture.
 * Control Port filters flows by item type.
 * @param fixture Control Port fixture
 * @param fieldState Current field state
 * @returns Input and output flows
 */
export function calculateControlPortFlows(
    fixture: Immutable<FieldPathFixture>,
    fieldState: Immutable<FieldState>
): { inputFlows: ItemFlow[], outputFlows: ItemFlow[] } {
    const inputFlowArrays: Immutable<ItemFlow[]>[] = []
    
    // Collect input flows from paths where items are arriving at this fixture
    // This needs to be agnostic to path point order:
    // - If path ends at fixture and flows start-to-end, items arrive
    // - If path starts at fixture and flows end-to-start, items arrive
    for (const path of fieldState.paths) {
        const endsAtFixture = path.endConnectedTo?.type === 'fixture' && path.endConnectedTo.fixtureID === fixture.id
        const startsAtFixture = path.startConnectedTo?.type === 'fixture' && path.startConnectedTo.fixtureID === fixture.id
        
        const flowsTowardEnd = path.flowDirection === 'start-to-end'
        const flowsTowardStart = path.flowDirection === 'end-to-start'
        
        if ((endsAtFixture && flowsTowardEnd) || (startsAtFixture && flowsTowardStart)) {
            // Items are arriving at our fixture
            inputFlowArrays.push(path.flows)
        }
    }
    
    // Merge input flows by item type
    const inputFlows = mergeItemFlows(inputFlowArrays)
    
    // Filter by set item (if any)
    const outputFlows: ItemFlow[] = []

    if (fixture.setItem) {
        const fixtureDef = pathFixtures[fixture.type]
        const isPipeFixture = fixtureDef?.pathType === PathTypeID.PIPE
        const isFluidItem = items[fixture.setItem]?.fluid === true

        if ((isPipeFixture && isFluidItem) || (!isPipeFixture && !isFluidItem)) {
            // Only pass through the specified item
            for (const flow of inputFlows) {
                if (flow.item === fixture.setItem) {
                    outputFlows.push({ ...flow })
                }
            }
        }
    }
    
    return { inputFlows, outputFlows }
}

/**
 * Calculate flows for any fixture based on its type.
 * @param fixture Fixture to calculate
 * @param fieldState Current field state
 * @returns Updated fixture with flows
 */
export function calculateFixtureFlows(
    fixture: Immutable<FieldPathFixture>,
    fieldState: Immutable<FieldState>
): Immutable<FieldPathFixture> {
    let inputFlows: Immutable<ItemFlow>[] = []
    let outputFlows: Immutable<ItemFlow>[] = []
    
    // Look up fixture definition to determine behavior type
    const fixtureDef = pathFixtures[fixture.type]
    
    if (!fixtureDef) {
        // Unknown fixture type - no flows, just return fixture as-is
        inputFlows = []
        outputFlows = []
    } else {
        // Calculate flows based on behavior type
        switch (fixtureDef.behaviorType) {
            case FixtureBehaviorType.BRIDGE:
                const bridgeResult = calculateBridgeFlows(fixture, fieldState)
                inputFlows = bridgeResult.inputFlows
                outputFlows = bridgeResult.outputFlows
                break
            case FixtureBehaviorType.SPLITTER:
            case FixtureBehaviorType.SPLITTER:
                const splitterResult = calculateSplitterFlows(fixture, fieldState)
                inputFlows = splitterResult.inputFlows
                outputFlows = splitterResult.outputFlows
                break
            case FixtureBehaviorType.CONVERGER:
                const convergerResult = calculateConvergerFlows(fixture, fieldState)
                inputFlows = convergerResult.inputFlows
                outputFlows = convergerResult.outputFlows
                break
            case FixtureBehaviorType.CONTROL_PORT:
                const controlResult = calculateControlPortFlows(fixture, fieldState)
                inputFlows = controlResult.inputFlows
                outputFlows = controlResult.outputFlows
                break
        }
    }
    
    // Update side flows based on input/output
    // For Bridge fixtures, determine actual subType and flows per-side based on connected paths
    const updatedSides = fixture.sides.map(side => {
        if (fixtureDef?.behaviorType === FixtureBehaviorType.BRIDGE) {
            // For bridge sides, each output side should only receive flows from its OPPOSITE input side
            // on the same axis, NOT merged flows from all axes
            
            // Re-analyze to determine this side's role
            const sidesByDir: Record<string, Immutable<typeof fixture.sides[0]>> = {}
            for (const s of fixture.sides) {
                sidesByDir[s.direction] = s
            }
            
            let sideFlows: readonly Immutable<ItemFlow>[] = []
            let determinedSubType: 'input' | 'output' = 'output' // Default to output if undetermined
            
            if (side.direction === 'left' || side.direction === 'right') {
                // Horizontal axis
                const leftSide = sidesByDir['left']
                const rightSide = sidesByDir['right']
                const leftConnected = leftSide?.connectedPathID ? true : false
                const rightConnected = rightSide?.connectedPathID ? true : false
                
                if (leftConnected && rightConnected) {
                    const leftPath = fieldState.paths.find(p => p.id === leftSide!.connectedPathID!)
                    const rightPath = fieldState.paths.find(p => p.id === rightSide!.connectedPathID!)
                    
                    if (leftPath && rightPath) {
                        const leftEndType = getPathOtherEndConnectionType(
                            leftPath,
                            [fixture.x, fixture.y],
                            fieldState
                        )
                        const rightEndType = getPathOtherEndConnectionType(
                            rightPath,
                            [fixture.x, fixture.y],
                            fieldState
                        )
                        
                        const leftIsInput = leftEndType === 'output'
                        const rightIsInput = rightEndType === 'output'
                        
                        // Each side gets flows from the OPPOSITE side on this axis only
                        if (side.direction === 'left') {
                            if (rightIsInput) {
                                // Right is input, left is output - left gets flows from right
                                sideFlows = rightPath.flows
                                determinedSubType = 'output'
                            } else if (leftIsInput) {
                                // Left is input
                                determinedSubType = 'input'
                            }
                        } else if (side.direction === 'right') {
                            if (leftIsInput) {
                                // Left is input, right is output - right gets flows from left
                                sideFlows = leftPath.flows
                                determinedSubType = 'output'
                            } else if (rightIsInput) {
                                // Right is input
                                determinedSubType = 'input'
                            }
                        }
                    }
                }
            } else if (side.direction === 'up' || side.direction === 'down') {
                // Vertical axis
                const upSide = sidesByDir['up']
                const downSide = sidesByDir['down']
                const upConnected = upSide?.connectedPathID ? true : false
                const downConnected = downSide?.connectedPathID ? true : false
                
                if (upConnected && downConnected) {
                    const upPath = fieldState.paths.find(p => p.id === upSide!.connectedPathID!)
                    const downPath = fieldState.paths.find(p => p.id === downSide!.connectedPathID!)
                    
                    if (upPath && downPath) {
                        const upEndType = getPathOtherEndConnectionType(
                            upPath,
                            [fixture.x, fixture.y],
                            fieldState
                        )
                        const downEndType = getPathOtherEndConnectionType(
                            downPath,
                            [fixture.x, fixture.y],
                            fieldState
                        )
                        
                        const upIsInput = upEndType === 'output'
                        const downIsInput = downEndType === 'output'
                        
                        // Each side gets flows from the OPPOSITE side on this axis only
                        if (side.direction === 'up') {
                            if (downIsInput) {
                                // Down is input, up is output - up gets flows from down
                                sideFlows = downPath.flows
                                determinedSubType = 'output'
                            } else if (upIsInput) {
                                // Up is input
                                determinedSubType = 'input'
                            }
                        } else if (side.direction === 'down') {
                            if (upIsInput) {
                                // Up is input, down is output - down gets flows from up
                                sideFlows = upPath.flows
                                determinedSubType = 'output'
                            } else if (downIsInput) {
                                // Down is input
                                determinedSubType = 'input'
                            }
                        }
                    }
                }
            }
            
            return {
                ...side,
                subType: determinedSubType,
                flows: sideFlows
            }
        } else if (side.subType === 'input') {
            // Input sides don't have outgoing flows - they only receive
            return {
                ...side,
                flows: []
            }
        } else {
            // Output sides have the processed flows ready to send
            return {
                ...side,
                flows: side.connectedPathID ? outputFlows : []
            }
        }
    })
    
    return {
        ...fixture,
        sides: updatedSides
    }
}

/**
 * Validate if a fixture can be placed on a specific path at a given position.
 * Checks if the fixture sides align with the path and the path type matches fixture type.
 * @param fixtureType Type of fixture to place
 * @param position Position to place fixture [x, y]
 * @param rotation Fixture rotation (0, 90, 180, 270)
 * @param path Path to place fixture on
 * @returns Validation result with placement validity and split points if valid
 */
export function validateFixturePlacementOnPath(
    fixtureType: PathFixtureID,
    position: readonly [number, number],
    rotation: number,
    path: Immutable<FieldPath>
): {
    isValid: boolean
    targetPath?: Immutable<FieldPath>
    segmentIndex?: number
    error?: 'not_on_path' | 'type_mismatch' | 'incompatible_sides'
} {
    const fixtureDef = pathFixtures[fixtureType]
    if (!fixtureDef) {
        return { isValid: false, error: 'incompatible_sides' }
    }
    
    // Check if position is on the path (not endpoints, but allow corners)
    const segmentIndex = findSegmentContainingPoint(position, path)
    if (segmentIndex === null) {
        return { isValid: false, error: 'not_on_path' }
    }
    
    // Check if path type matches fixture type (belt vs pipe)
    const fixtureSideType = fixtureDef.sides[0]?.type
    
    const isBeltFixture = fixtureSideType === 'belt'
    const isPipeFixture = fixtureSideType === 'pipe'
    const isControlFixture = fixtureSideType === 'control'
    const isBeltPath = path.type === PathTypeID.BELT
    const isPipePath = path.type === PathTypeID.PIPE
    
    // Belt fixtures work with belt paths, pipe fixtures with pipe paths
    // Control fixtures are a special type that also work with their respective path types
    if ((isBeltFixture && !isBeltPath) || (isPipeFixture && !isPipePath) || (isControlFixture && !isBeltPath && !isPipePath)) {
        return { isValid: false, error: 'type_mismatch' }
    }
    
    // For bridges, any rotation works with any path direction
    // For other fixtures, we need to check alignment but be more lenient
    // Most fixtures work if they have at least 2 sides to connect
    if (fixtureDef.sides.length < 2) {
        return { isValid: false, error: 'incompatible_sides' }
    }
    
    return {
        isValid: true,
        targetPath: path,
        segmentIndex
    }
}

/**
 * Generate changes to split a path at a fixture position.
 * Creates changes to remove the original path, add the fixture, and add new path segments
 * connecting to the fixture sides.
 * @param path Path to split
 * @param fixtureType Type of fixture to place
 * @param position Position to place fixture [x, y]
 * @param rotation Fixture rotation
 * @param segmentIndex Index of the segment containing the fixture position
 * @returns Array of user changes to perform the split
 */
export function splitPathAtFixture(
    path: Immutable<FieldPath>,
    fixtureType: PathFixtureID,
    position: readonly [number, number],
    rotation: number,
    segmentIndex: number
): UserChange[] {
    const changes: UserChange[] = []
    const fixtureDef = pathFixtures[fixtureType]
    
    // Split the path points at the fixture position
    const beforePoints: [number, number][] = []
    const afterPoints: [number, number][] = []
    
    // Add all points before the segment
    for (let i = 0; i <= segmentIndex; i++) {
        beforePoints.push([path.points[i][0], path.points[i][1]])
    }
    
    // Add the fixture position as the end of the first path
    beforePoints.push([position[0], position[1]])
    
    // Add the fixture position as the start of the second path
    afterPoints.push([position[0], position[1]])
    
    // Add all points after the segment
    for (let i = segmentIndex + 1; i < path.points.length; i++) {
        afterPoints.push([path.points[i][0], path.points[i][1]])
    }
    
    // Remove the original path
    changes.push({ type: 'remove-path', pathID: path.id })
    
    // Add the fixture
    changes.push({
        type: 'add-path-fixture',
        fixtureType,
        position: [position[0], position[1]],
        rotation
    })
    
    // Add the two new path segments if they have enough points
    if (beforePoints.length >= 2) {
        changes.push({
            type: 'add-path',
            pathType: path.type,
            points: beforePoints
        })
    }
    
    if (afterPoints.length >= 2) {
        changes.push({
            type: 'add-path',
            pathType: path.type,
            points: afterPoints
        })
    }
    
    return changes
}

/**
 * Find all paths connected to a fixture.
 * @param fixture Fixture to check
 * @param fieldState Current field state
 * @returns Array of connected paths with their side information
 */
export function findPathsConnectedToFixture(
    fixture: Immutable<FieldPathFixture>,
    fieldState: Immutable<FieldState>
): Array<{ path: Immutable<FieldPath>, sideIndex: number, sideDirection: Direction }> {
    const connected: Array<{ path: Immutable<FieldPath>, sideIndex: number, sideDirection: Direction }> = []
    
    for (let sideIndex = 0; sideIndex < fixture.sides.length; sideIndex++) {
        const side = fixture.sides[sideIndex]
        if (side.connectedPathID) {
            const path = fieldState.paths.find(p => p.id === side.connectedPathID)
            if (path) {
                connected.push({
                    path,
                    sideIndex,
                    sideDirection: side.direction
                })
            }
        }
    }
    
    return connected
}

/**
 * Generate changes to reconnect paths after a fixture is removed.
 * Merges paths that were connected to the fixture.
 * - 2 paths: merge them if they're on opposite sides
 * - 3 paths: merge the two that share an axis
 * - 4 paths: merge two opposite pairs
 * @param fixture Fixture being removed
 * @param fieldState Current field state
 * @returns Array of user changes to reconnect paths
 */
export function reconnectPathsAfterFixtureRemoval(
    fixture: Immutable<FieldPathFixture>,
    fieldState: Immutable<FieldState>
): UserChange[] {
    const changes: UserChange[] = []
    const connectedPaths = findPathsConnectedToFixture(fixture, fieldState)
    
    if (connectedPaths.length === 0) {
        return changes
    }
    
    // Group paths by opposite sides
    const oppositeSides: Record<string, string> = {
        'up': 'down',
        'down': 'up',
        'left': 'right',
        'right': 'left'
    }
    
    if (connectedPaths.length === 2) {
        // Try to merge the two paths if they're compatible
        const path1 = connectedPaths[0]
        const path2 = connectedPaths[1]
        
        // Merge them (handles all orientations)
        const mergeChanges = createPathMergeChanges(path1.path, path2.path, fixture)
        if (mergeChanges.length > 0) {
            changes.push(...mergeChanges)
        }
    } else if (connectedPaths.length === 3) {
        // Find two paths that share an axis (both horizontal or both vertical)
        const horizontal = connectedPaths.filter(c => c.sideDirection === 'left' || c.sideDirection === 'right')
        const vertical = connectedPaths.filter(c => c.sideDirection === 'up' || c.sideDirection === 'down')
        
        if (horizontal.length === 2) {
            // Merge the two horizontal paths
            const mergeChanges = createPathMergeChanges(horizontal[0].path, horizontal[1].path, fixture)
            if (mergeChanges.length > 0) {
                changes.push(...mergeChanges)
            }
        } else if (vertical.length === 2) {
            // Merge the two vertical paths
            const mergeChanges = createPathMergeChanges(vertical[0].path, vertical[1].path, fixture)
            if (mergeChanges.length > 0) {
                changes.push(...mergeChanges)
            }
        }
    } else if (connectedPaths.length === 4) {
        // Find opposite pairs and merge them
        const sidePairs: Array<[typeof connectedPaths[0], typeof connectedPaths[0]]> = []
        
        for (const conn1 of connectedPaths) {
            const oppositeDir = oppositeSides[conn1.sideDirection]
            const conn2 = connectedPaths.find(c => c.sideDirection === oppositeDir)
            
            if (conn2 && !sidePairs.some(pair => 
                (pair[0].path.id === conn1.path.id && pair[1].path.id === conn2.path.id) ||
                (pair[0].path.id === conn2.path.id && pair[1].path.id === conn1.path.id)
            )) {
                sidePairs.push([conn1, conn2])
            }
        }
        
        // Merge each opposite pair
        for (const [conn1, conn2] of sidePairs) {
            const mergeChanges = createPathMergeChanges(conn1.path, conn2.path, fixture)
            if (mergeChanges.length > 0) {
                changes.push(...mergeChanges)
            }
        }
    }
    
    return changes
}

/**
 * Create changes to merge two paths through a fixture position.
 * @param path1 First path
 * @param path2 Second path
 * @param fixture Fixture at the connection point
 * @returns Array of changes to merge the paths
 */
function createPathMergeChanges(
    path1: Immutable<FieldPath>,
    path2: Immutable<FieldPath>,
    fixture: Immutable<FieldPathFixture>
): UserChange[] {
    const changes: UserChange[] = []
    
    if (path1.type !== path2.type) {
        // Can't merge paths of different types
        return changes
    }
    
    const fixturePos: [number, number] = [fixture.x, fixture.y]
    
    // Determine which end of each path connects to the fixture
    const path1End = path1.points[path1.points.length - 1]
    const path1Start = path1.points[0]
    
    const path1EndsAtFixture = path1End[0] === fixturePos[0] && path1End[1] === fixturePos[1]
    const path1StartsAtFixture = path1Start[0] === fixturePos[0] && path1Start[1] === fixturePos[1]
    
    const path2End = path2.points[path2.points.length - 1]
    const path2Start = path2.points[0]
    const path2EndsAtFixture = path2End[0] === fixturePos[0] && path2End[1] === fixturePos[1]
    const path2StartsAtFixture = path2Start[0] === fixturePos[0] && path2Start[1] === fixturePos[1]
    
    // Build merged points
    let mergedPoints: [number, number][] = []
    
    if (path1EndsAtFixture && path2StartsAtFixture) {
        // path1 -> fixture -> path2
        mergedPoints = [...path1.points.slice(0, -1), ...path2.points.slice(1)] as [number, number][]
    } else if (path1StartsAtFixture && path2EndsAtFixture) {
        // path2 -> fixture -> path1
        mergedPoints = [...path2.points.slice(0, -1), ...path1.points.slice(1)] as [number, number][]
    } else if (path1EndsAtFixture && path2EndsAtFixture) {
        // path1 -> fixture <- path2 (reverse path2)
        const reversedPath2 = [...path2.points].reverse()
        mergedPoints = [...path1.points.slice(0, -1), ...reversedPath2.slice(1)] as [number, number][]
    } else if (path1StartsAtFixture && path2StartsAtFixture) {
        // path1 <- fixture -> path2 (reverse path1)
        const reversedPath1 = [...path1.points].reverse()
        mergedPoints = [...reversedPath1.slice(0, -1), ...path2.points.slice(1)] as [number, number][]
    }
    
    if (mergedPoints.length >= 2) {
        // Remove both original paths
        changes.push({ type: 'remove-path', pathID: path1.id })
        changes.push({ type: 'remove-path', pathID: path2.id })
        
        // Add merged path
        changes.push({
            type: 'add-path',
            pathType: path1.type,
            points: mergedPoints
        })
    }
    
    return changes
}

/**
 * Generate changes to relocate a path fixture.
 * This will:
 * 1. Recombine paths at the old position (like when deleting)
 * 2. Split paths at the new position (like when placing)
 * 
 * Note: The caller must provide an intermediate field state that has the reconnection
 * changes already applied, as we can't apply changes within this function due to
 * circular dependency concerns.
 * 
 * @param fixture Fixture being moved
 * @param newPosition New position [x, y]
 * @param originalFieldState Current field state (before any reconnection)
 * @param intermediateFieldState Field state after reconnection changes applied
 * @param includeReconnection If true, include reconnection changes; if false, only generate split/move changes
 * @returns Array of user changes to perform the relocation
 */
export function generateFixtureRelocationChanges(
    fixture: Immutable<FieldPathFixture>,
    newPosition: readonly [number, number],
    originalFieldState: Immutable<FieldState>,
    intermediateFieldState: Immutable<FieldState>,
    includeReconnection: boolean = true
): UserChange[] {
    const changes: UserChange[] = []
    
    // Step 1: Generate reconnection changes for the old position (if requested)
    if (includeReconnection) {
        const fixtureWithConnections = updateFixtureConnections(fixture, originalFieldState)
        const reconnectionChanges = reconnectPathsAfterFixtureRemoval(fixtureWithConnections, originalFieldState)
        changes.push(...reconnectionChanges)
    }
    
    // Step 2: Find the path at the new position and validate placement
    let pathToSplit: Immutable<FieldPath> | null = null
    let segmentIndex: number | undefined
    
    for (const path of intermediateFieldState.paths) {
        // Check if this fixture type is compatible with this path type
        const fixtureDef = pathFixtures[fixture.type]
        const expectedFixtureForThisPath = getFixtureTypeForPath(fixtureDef.behaviorType, path.type)
        
        // Skip if fixture type doesn't match what's expected for this path type
        if (expectedFixtureForThisPath !== fixture.type) {
            continue
        }
        
        const validation = validateFixturePlacementOnPath(
            fixture.type,
            newPosition,
            fixture.rotation,
            path
        )
        
        if (validation.isValid && validation.segmentIndex !== undefined) {
            pathToSplit = path
            segmentIndex = validation.segmentIndex
            break
        }
    }
    
    // Step 3: If we found a valid path, split it
    if (pathToSplit && segmentIndex !== undefined) {
        const splitChanges = splitPathAtFixture(
            pathToSplit,
            fixture.type,
            newPosition,
            fixture.rotation,
            segmentIndex
        )
        
        // Filter out the add-path-fixture change since we're moving, not adding
        const filteredSplitChanges = splitChanges.filter(c => c.type !== 'add-path-fixture')
        changes.push(...filteredSplitChanges)
    }
    
    // Step 4: Finally, add the actual move change
    changes.push({
        type: 'move-path-fixture',
        fixtureID: fixture.id,
        newPosition: [newPosition[0], newPosition[1]]
    })
    
    return changes
}