import type { FieldState, ItemFlow, FieldFacility } from "../types/field.ts"
import { FacilityID } from "../types/data.ts"
import { 
    recipeToFlowRates, 
    calculateFacilityThrottleFactor, 
    calculateFacilityOutputFlows, 
    distributeFacilityOutputs,
    calculatePathFlows,
    mergeItemFlows
} from "./flows.ts"
import { calculateFixtureFlows } from "./fixtures.ts"
import { recipes } from "../data/recipes.ts"
import { shouldUseJumpStart, updateFacilityRecipe } from "./recipes.ts"
import { objectEntries, type Immutable } from "../utils/types.ts"

/**
 * Initialize flow state for iteration.
 * Sets all flows to zero except for jump-started facilities and external outputs.
 * @param fieldState Field state to initialize
 * @returns Initialized field state
 */
export function initializeFlowState(fieldState: Immutable<FieldState>): Immutable<FieldState> {
    const WORLD_OUTPUT_RATE_BELT = 0.5
    const WORLD_OUTPUT_RATE_PIPE = 2
    
    // Initialize all facilities with empty flows
    const initializedFacilities = fieldState.facilities.map(facility => {
        const initializedPorts = facility.ports.map(port => {
            if (port.external && port.subType === 'output' && port.setItem) {
                const rate = port.type === 'pipe' ? WORLD_OUTPUT_RATE_PIPE : WORLD_OUTPUT_RATE_BELT
                return {
                    ...port,
                    flows: [{ item: port.setItem, sourceRate: rate, sinkRate: rate }]
                }
            }
            return {
                ...port,
                flows: []
            }
        })
        
        let outputFlows: Immutable<ItemFlow>[] = []
        
        // Check if this facility should be jump-started
        if (shouldUseJumpStart(facility)) {
            const recipe = recipes[facility.setRecipe!]
            const flowRates = recipeToFlowRates(recipe)
            
            // Set initial output flows at max rate
            for (const [itemID, rate] of objectEntries(flowRates.outputs)) {
                outputFlows.push({
                    item: itemID,
                    sourceRate: rate,
                    sinkRate: rate
                })
            }
        }
        
        return {
            ...facility,
            ports: initializedPorts,
            inputFlows: [],
            outputFlows
        }
    })
    
    // Initialize all paths with empty flows
    const initializedPaths = fieldState.paths.map(path => ({
        ...path,
        flows: []
    }))
    
    // Initialize all fixtures with empty flows
    const initializedFixtures = fieldState.pathFixtures.map(fixture => ({
        ...fixture,
        sides: fixture.sides.map(side => ({
            ...side,
            flows: []
        }))
    }))
    
    return {
        ...fieldState,
        facilities: initializedFacilities,
        paths: initializedPaths,
        pathFixtures: initializedFixtures
    }
}

function distributeReactorCrucibleOutputs(
    facility: Immutable<FieldFacility>,
    outputs: ItemFlow[]
): Immutable<FieldFacility> {
    const availableByItem = new Map<ItemFlow['item'], number>()

    for (const flow of outputs) {
        availableByItem.set(flow.item, (availableByItem.get(flow.item) ?? 0) + flow.sourceRate)
    }

    for (const flow of facility.inputFlows) {
        availableByItem.set(flow.item, (availableByItem.get(flow.item) ?? 0) + flow.sinkRate)
    }

    const selectedPorts = facility.ports.filter(port => port.subType === 'output' && port.setItem)
    const portsByItem = new Map<ItemFlow['item'], Immutable<FieldFacility['ports']>>()

    for (const port of selectedPorts) {
        if (!port.setItem) {
            continue
        }
        const existing = portsByItem.get(port.setItem) ?? []
        portsByItem.set(port.setItem, [...existing, port])
    }

    const updatedPorts = facility.ports.map(port => {
        if (port.subType !== 'output') {
            return port
        }
        if (!port.setItem) {
            return { ...port, flows: [] }
        }

        if (!port.connectedPathID) {
            return { ...port, flows: [] }
        }

        const portsForItem = portsByItem.get(port.setItem) ?? []
        const connectedPortsForItem = portsForItem.filter(p => p.connectedPathID)
        const availableRate = availableByItem.get(port.setItem) ?? 0

        if (connectedPortsForItem.length === 0 || availableRate <= 0) {
            return { ...port, flows: [] }
        }

        const perPortRate = availableRate / connectedPortsForItem.length
        return {
            ...port,
            flows: [{ item: port.setItem, sourceRate: perPortRate, sinkRate: perPortRate }]
        }
    })

    const outputFlowArrays = updatedPorts
        .filter(port => port.subType === 'output')
        .map(port => port.flows)

    return {
        ...facility,
        ports: updatedPorts,
        outputFlows: mergeItemFlows(outputFlowArrays)
    }
}

/**
 * Propagate flows one iteration through the entire system.
 * @param state Current field state
 * @returns Updated field state after one propagation step
 */
export function propagateFlowsOneIteration(state: Immutable<FieldState>): Immutable<FieldState> {
    let updatedState = { ...state }

    const WORLD_OUTPUT_RATE_BELT = 0.5
    const WORLD_OUTPUT_RATE_PIPE = 2
    
    const applyDepotOutputFlows = (facility: Immutable<FieldFacility>): Immutable<FieldFacility> => {
        const updatedPorts = facility.ports.map((port: Immutable<FieldFacility['ports'][0]>) => {
            if (port.external && port.subType === 'output' && port.setItem) {
                const rate = port.type === 'pipe' ? WORLD_OUTPUT_RATE_PIPE : WORLD_OUTPUT_RATE_BELT
                return {
                    ...port,
                    flows: [{ item: port.setItem, sourceRate: rate, sinkRate: rate }]
                }
            }
            return port
        })
        
        return {
            ...facility,
            ports: updatedPorts
        }
    }
    
    // Step 1: Update facility outputs based on current inputs
    const updatedFacilities = updatedState.facilities.map(facility => {
        if (!facility.actualRecipe || !facility.isPowered) {
            // No recipe or not powered, no output
            const facilityWithOutputs = distributeFacilityOutputs([], facility)
            const facilityWithDepotOutputs = applyDepotOutputFlows(facilityWithOutputs)
            return {
                ...facilityWithDepotOutputs,
                outputFlows: [],
                throttleFactor: 0
            }
        }
        
        const recipe = recipes[facility.actualRecipe]
        
        // Check if jump-start should be used (facility has jump-start flag and no inputs)
        const useJumpStart = shouldUseJumpStart(facility)
        
        if (useJumpStart) {
            // Jump-start: produce at full throttle regardless of inputs
            const outputs = calculateFacilityOutputFlows(facility, recipe, 1.0)
            const facilityWithOutputs = distributeFacilityOutputs(outputs, facility)
            return {
                ...facilityWithOutputs,
                outputFlows: outputs,
                throttleFactor: 1.0
            }
        }
        
        // Normal operation: calculate throttle based on inputs
        const throttle = calculateFacilityThrottleFactor(facility, recipe)
        const outputs = calculateFacilityOutputFlows(facility, recipe, throttle)

        if (facility.type === FacilityID.REACTOR_CRUCIBLE) {
            const facilityWithOutputs = distributeReactorCrucibleOutputs(facility, outputs)
            return {
                ...facilityWithOutputs,
                outputFlows: facilityWithOutputs.outputFlows,
                throttleFactor: throttle
            }
        }
        
        const facilityWithOutputs = distributeFacilityOutputs(outputs, facility)
        return {
            ...facilityWithOutputs,
            outputFlows: outputs,
            throttleFactor: throttle
        }
    })
    
    updatedState = {
        ...updatedState,
        facilities: updatedFacilities
    }
    
    // Step 2: Update fixture flows
    const updatedFixtures = updatedState.pathFixtures.map(fixture =>
        calculateFixtureFlows(fixture, updatedState)
    )
    
    updatedState = {
        ...updatedState,
        pathFixtures: updatedFixtures
    }
    
    // Step 3: Update path flows based on sources
    const updatedPaths = updatedState.paths.map(path =>
        calculatePathFlows(path, updatedState)
    )
    
    updatedState = {
        ...updatedState,
        paths: updatedPaths
    }
    
    // Step 4: Update facility input flows based on connected paths
    const facilitiesWithInputs = updatedState.facilities.map(facility => {
        const inputFlowArrays: Immutable<ItemFlow[]>[] = []
        
        for (const port of facility.ports) {
            if (port.subType === 'input' && port.connectedPathID) {
                const path = updatedState.paths.find(p => p.id === port.connectedPathID)
                if (path) {
                    inputFlowArrays.push(path.flows)
                }
            }
        }
        
        // Merge input flows by item type
        const inputFlows = mergeItemFlows(inputFlowArrays)
        
        // Update port flows for input ports (no change needed for outputs since distributeFacilityOutputs already updated them)
        const updatedPorts = facility.ports.map(port => {
            if (port.subType === 'input' && port.connectedPathID) {
                const path = updatedState.paths.find(p => p.id === port.connectedPathID)
                if (path) {
                    return {
                        ...port,
                        flows: path.flows
                    }
                }
            }
            return port
        })
        
        // Aggregate output flows from output ports (which were already updated by distributeFacilityOutputs)
        const outputFlowArrays: Immutable<ItemFlow[]>[] = []
        for (const port of updatedPorts) {
            if (port.subType === 'output') {
                outputFlowArrays.push(port.flows)
            }
        }
        
        // Merge output flows by item type
        // Note: We should preserve outputFlows from Step 1 for jump-started facilities
        // because distributeFacilityOutputs may have cleared port flows if no paths are connected
        const outputFlows = facility.outputFlows && facility.outputFlows.length > 0
            ? facility.outputFlows
            : mergeItemFlows(outputFlowArrays)
        
        return {
            ...facility,
            ports: updatedPorts,
            inputFlows,
            outputFlows
        }
    })
    
    updatedState = {
        ...updatedState,
        facilities: facilitiesWithInputs
    }
    
    // Step 5: Update recipes for facilities that don't have setRecipe
    // This allows downstream facilities to infer recipes as flows reach them
    const facilitiesWithRecipes = updatedState.facilities.map(facility => {
        // Skip facilities with player-set recipes
        if (facility.setRecipe) {
            return facility
        }
        
        // Update recipe based on current input flows
        return updateFacilityRecipe(facility)
    })
    
    return {
        ...updatedState,
        facilities: facilitiesWithRecipes
    }
}

/**
 * Check if flow state has converged (no significant changes).
 * @param oldState Previous state
 * @param newState New state
 * @param epsilon Maximum allowed difference
 * @returns True if converged
 */
export function hasFlowConverged(
    oldState: Immutable<FieldState>,
    newState: Immutable<FieldState>,
    epsilon: number = 0.001
): boolean {
    // Check facility flows
    for (let i = 0; i < oldState.facilities.length; i++) {
        const oldFacility = oldState.facilities[i]
        const newFacility = newState.facilities[i]
        
        // Check output flows
        if (oldFacility.outputFlows.length !== newFacility.outputFlows.length) {
            return false
        }
        
        for (let j = 0; j < oldFacility.outputFlows.length; j++) {
            const oldFlow = oldFacility.outputFlows[j]
            const newFlow = newFacility.outputFlows[j]
            
            if (oldFlow.item !== newFlow.item) return false
            if (Math.abs(oldFlow.sourceRate - newFlow.sourceRate) > epsilon) return false
            if (Math.abs(oldFlow.sinkRate - newFlow.sinkRate) > epsilon) return false
        }
    }
    
    // Check path flows
    for (let i = 0; i < oldState.paths.length; i++) {
        const oldPath = oldState.paths[i]
        const newPath = newState.paths[i]
        
        if (oldPath.flows.length !== newPath.flows.length) {
            return false
        }
        
        for (let j = 0; j < oldPath.flows.length; j++) {
            const oldFlow = oldPath.flows[j]
            const newFlow = newPath.flows[j]
            
            if (oldFlow.item !== newFlow.item) return false
            if (Math.abs(oldFlow.sourceRate - newFlow.sourceRate) > epsilon) return false
            if (Math.abs(oldFlow.sinkRate - newFlow.sinkRate) > epsilon) return false
        }
    }
    
    // Check fixture flows
    for (let i = 0; i < oldState.pathFixtures.length; i++) {
        const oldFixture = oldState.pathFixtures[i]
        const newFixture = newState.pathFixtures[i]
        
        // Check each side's flows
        for (let j = 0; j < oldFixture.sides.length; j++) {
            const oldSide = oldFixture.sides[j]
            const newSide = newFixture.sides[j]
            
            if (oldSide.flows.length !== newSide.flows.length) {
                return false
            }
            
            for (let k = 0; k < oldSide.flows.length; k++) {
                const oldFlow = oldSide.flows[k]
                const newFlow = newSide.flows[k]
                
                if (oldFlow.item !== newFlow.item) return false
                if (Math.abs(oldFlow.sourceRate - newFlow.sourceRate) > epsilon) return false
                if (Math.abs(oldFlow.sinkRate - newFlow.sinkRate) > epsilon) return false
            }
        }
    }
    
    return true
}

/**
 * Solve the flow system using iterative fixed-point iteration.
 * @param fieldState Field state to solve
 * @param maxIterations Maximum number of iterations
 * @returns Field state with converged flows and debug info
 */
export function solveFlowSystem(
    fieldState: Immutable<FieldState>,
    maxIterations: number = 100
): { state: Immutable<FieldState>, iterations: number, converged: boolean } {
    let currentState = initializeFlowState(fieldState)
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        const nextState = propagateFlowsOneIteration(currentState)
        
        if (hasFlowConverged(currentState, nextState)) {
            return {
                state: nextState,
                iterations: iteration + 1,
                converged: true
            }
        }
        
        currentState = nextState
    }
    
    return {
        state: currentState,
        iterations: maxIterations,
        converged: false
    }
}
