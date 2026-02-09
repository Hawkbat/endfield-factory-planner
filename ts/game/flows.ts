import { PathTypeID, type ItemID, type RecipeID } from "../types/data.js"
import type { FieldState, FieldFacility, FieldPath, ItemFlow } from "../types/field.ts"
import { recipes } from "../data/recipes.ts"
import { items } from "../data/items.ts"
import { objectEntries, type Immutable } from "../utils/types.ts"
import { getConnectedEntity } from "./connections.ts"

/**
 * Convert recipe inputs/outputs to flow rates (items per second).
 * @param recipe Recipe to convert
 * @returns Flow rates for inputs and outputs
 */
export function recipeToFlowRates(recipe: Immutable<typeof recipes[RecipeID]>): {
    inputs: Partial<Record<ItemID, number>>,
    outputs: Partial<Record<ItemID, number>>
} {
    const inputs: Partial<Record<ItemID, number>> = {}
    const outputs: Partial<Record<ItemID, number>> = {}
    
    // Convert count / time to items per second
    for (const [itemID, count] of objectEntries(recipe.inputs)) {
        inputs[itemID] = count / recipe.time
    }
    
    for (const [itemID, count] of objectEntries(recipe.outputs)) {
        outputs[itemID] = count / recipe.time
    }
    
    return { inputs, outputs }
}

/**
 * Calculate the throttle factor for a facility based on input availability.
 * Returns the limiting ratio (0.0 to 1.0) based on the most constrained input.
 * @param facility Facility to calculate for
 * @param recipe Recipe being used
 * @returns Throttle factor (0.0 to 1.0)
 */
export function calculateFacilityThrottleFactor(
    facility: Immutable<FieldFacility>,
    recipe: Immutable<typeof recipes[RecipeID]>
): number {
    const flowRates = recipeToFlowRates(recipe)
    let minRatio = 1.0
    
    // Aggregate actual input flows by item type
    const actualInputs: Partial<Record<ItemID, number>> = {}
    
    for (const port of facility.ports) {
        if (port.subType === 'input') {
            for (const flow of port.flows) {
                if (actualInputs[flow.item] === undefined) {
                    actualInputs[flow.item] = flow.sinkRate
                } else {
                    actualInputs[flow.item]! += flow.sinkRate
                }
            }
        }
    }
    
    // Calculate ratio for each required input
    for (const [itemID, requiredRate] of objectEntries(flowRates.inputs)) {
        const actualRate = actualInputs[itemID] || 0
        const ratio = requiredRate > 0 ? actualRate / requiredRate : 1.0
        
        if (ratio < minRatio) {
            minRatio = ratio
        }
    }
    
    return Math.max(0, Math.min(1.0, minRatio))
}

/**
 * Calculate input flows for a facility based on connected paths.
 * @param facility Facility to calculate for
 * @param fieldState Current field state
 * @returns Array of aggregated input flows
 */
export function calculateFacilityInputFlows(
    facility: Immutable<FieldFacility>,
    fieldState: Immutable<FieldState>
): ItemFlow[] {
    const flowMap = new Map<ItemID, { sourceRate: number, sinkRate: number }>()
    
    // Aggregate flows from all input ports
    for (const port of facility.ports) {
        if (port.subType === 'input' && port.connectedPathID) {
            const path = fieldState.paths.find(p => p.id === port.connectedPathID)
            
            if (path) {
                for (const flow of path.flows) {
                    const existing = flowMap.get(flow.item)
                    if (existing) {
                        existing.sourceRate += flow.sourceRate
                        existing.sinkRate += flow.sinkRate
                    } else {
                        flowMap.set(flow.item, { 
                            sourceRate: flow.sourceRate, 
                            sinkRate: flow.sinkRate 
                        })
                    }
                }
            }
        }
    }
    
    // Convert map to array
    const flows: ItemFlow[] = []
    for (const [item, rates] of flowMap.entries()) {
        flows.push({
            item,
            sourceRate: rates.sourceRate,
            sinkRate: rates.sinkRate
        })
    }
    
    return flows
}

/**
 * Calculate output flows for a facility based on its recipe and throttle factor.
 * @param facility Facility to calculate for
 * @param recipe Recipe being used
 * @param throttle Throttle factor (0.0 to 1.0)
 * @returns Array of output flows
 */
export function calculateFacilityOutputFlows(
    facility: Immutable<FieldFacility>,
    recipe: Immutable<typeof recipes[RecipeID]>,
    throttle: number
): ItemFlow[] {
    const flowRates = recipeToFlowRates(recipe)
    const flows: ItemFlow[] = []
    
    for (const [itemID, rate] of objectEntries(flowRates.outputs)) {
        const actualRate = rate * throttle
        flows.push({
            item: itemID,
            sourceRate: actualRate,
            sinkRate: actualRate  // Will be adjusted when distributed to ports
        })
    }
    
    return flows
}

/**
 * Distribute facility output flows among connected output ports.
 * Modifies the ports in place to set their individual flows.
 * Only distributes to regular crafting ports, not external ports.
 * @param outputs Output flows from facility
 * @param facility Facility with ports to update
 * @returns Updated facility with port flows set
 */
export function distributeFacilityOutputs(
    outputs: ItemFlow[],
    facility: Immutable<FieldFacility>
): Immutable<FieldFacility> {
    // Count connected output ports (excluding external ports)
    const connectedOutputPorts = facility.ports.filter(
        port => port.subType === 'output' &&
                !port.external &&
                port.connectedPathID !== null &&
                port.connectedPathID !== undefined
    )
    
    if (connectedOutputPorts.length === 0) {
        // No connected crafting outputs, all flows are blocked
        return {
            ...facility,
            ports: facility.ports.map(port => ({
                ...port,
                // Clear flows only for non-external output ports
                flows: (port.subType === 'output' && !port.external) ? [] : port.flows
            }))
        }
    }
    
    // Divide outputs evenly among connected crafting ports
    const outputsPerPort: ItemFlow[] = outputs.map(flow => ({
        item: flow.item,
        sourceRate: flow.sourceRate / connectedOutputPorts.length,
        sinkRate: flow.sinkRate / connectedOutputPorts.length
    }))
    
    // Update ports (only regular crafting ports, not external ports)
    const updatedPorts = facility.ports.map(port => {
        if (port.subType === 'output' && !port.external && port.connectedPathID) {
            return {
                ...port,
                flows: outputsPerPort
            }
        }
        return port
    })
    
    return {
        ...facility,
        ports: updatedPorts
    }
}

/**
 * Apply path throughput limit (0.5 items/sec total for belts, 2 for pipes).
 * Reduces sinkRates proportionally if total exceeds limit.
 * @param path Path to apply limit to
 * @returns Updated path with limited flows
 */
export function applyPathThroughputLimit(path: Immutable<FieldPath>): Immutable<FieldPath> {
    const THROUGHPUT_LIMIT = path.type === PathTypeID.BELT ? 0.5 : 2
    
    if (path.flows.length === 0) {
        return { ...path }
    }
    
    // Calculate total source rate
    const totalSourceRate = path.flows.reduce((sum, flow) => sum + flow.sourceRate, 0)
    
    if (totalSourceRate <= THROUGHPUT_LIMIT) {
        // No congestion, sinkRate = sourceRate
        const updatedFlows = path.flows.map(flow => ({
            ...flow,
            sinkRate: flow.sourceRate
        }))
        
        return {
            ...path,
            flows: updatedFlows,
            errorFlags: {
                ...path.errorFlags,
                congested: false
            }
        }
    }
    
    // Congestion: reduce all sinkRates proportionally
    const scaleFactor = THROUGHPUT_LIMIT / totalSourceRate
    
    const updatedFlows = path.flows.map(flow => ({
        ...flow,
        sinkRate: flow.sourceRate * scaleFactor
    }))
    
    return {
        ...path,
        flows: updatedFlows,
        errorFlags: {
            ...path.errorFlags,
            congested: true
        }
    }
}

/**
 * Calculate flows for a single path based on its connections.
 * Dynamically determines flow direction based on which end has flows available.
 * This is called iteratively during flow solving.
 * @param path Path to calculate
 * @param fieldState Current field state
 * @returns Updated path with flows and dynamically determined flow direction
 */
export function calculatePathFlows(
    path: Immutable<FieldPath>,
    fieldState: Immutable<FieldState>
): Immutable<FieldPath> {
    // Get connections at both ends
    const startConnection = getConnectedEntity(path, 'start', fieldState)
    const endConnection = getConnectedEntity(path, 'end', fieldState)
    
    // Check which end has output flows available
    let startHasFlows = false
    let endHasFlows = false
    
    if (startConnection && 'port' in startConnection) {
        if (startConnection.port.subType === 'output' && startConnection.port.flows.length > 0) {
            startHasFlows = true
        }
    } else if (startConnection && 'side' in startConnection) {
        if (startConnection.side.subType === 'output' && startConnection.side.flows.length > 0) {
            startHasFlows = true
        }
    }
    
    if (endConnection && 'port' in endConnection) {
        if (endConnection.port.subType === 'output' && endConnection.port.flows.length > 0) {
            endHasFlows = true
        }
    } else if (endConnection && 'side' in endConnection) {
        if (endConnection.side.subType === 'output' && endConnection.side.flows.length > 0) {
            endHasFlows = true
        }
    }
    
    // Determine or update flow direction based on current state and available flows
    let flowDirection: 'start-to-end' | 'end-to-start' | 'none' | 'blocked' = path.flowDirection ?? 'none'
    let flows: ItemFlow[] = []
    
    if (flowDirection === 'none') {
        // Undetermined - try to determine from available flows
        if (startHasFlows && !endHasFlows) {
            flowDirection = 'start-to-end'
            if (startConnection && 'port' in startConnection) {
                flows.push(...startConnection.port.flows)
            } else if (startConnection && 'side' in startConnection) {
                flows.push(...startConnection.side.flows)
            }
        } else if (endHasFlows && !startHasFlows) {
            flowDirection = 'end-to-start'
            if (endConnection && 'port' in endConnection) {
                flows.push(...endConnection.port.flows)
            } else if (endConnection && 'side' in endConnection) {
                flows.push(...endConnection.side.flows)
            }
        }
        // If both or neither have flows, remain 'none'
    } else if (flowDirection === 'start-to-end') {
        // Direction already set - check if flows match or conflict
        if (startHasFlows) {
            // Flows match expected direction - copy them
            if (startConnection && 'port' in startConnection) {
                flows.push(...startConnection.port.flows)
            } else if (startConnection && 'side' in startConnection) {
                flows.push(...startConnection.side.flows)
            }
        } else if (endHasFlows) {
            // Flows come from opposite end - conflict! Mark as blocked
            flowDirection = 'blocked'
        }
        // If no flows at either end, keep direction but no flows
    } else if (flowDirection === 'end-to-start') {
        // Direction already set - check if flows match or conflict
        if (endHasFlows) {
            // Flows match expected direction - copy them
            if (endConnection && 'port' in endConnection) {
                flows.push(...endConnection.port.flows)
            } else if (endConnection && 'side' in endConnection) {
                flows.push(...endConnection.side.flows)
            }
        } else if (startHasFlows) {
            // Flows come from opposite end - conflict! Mark as blocked
            flowDirection = 'blocked'
        }
        // If no flows at either end, keep direction but no flows
    }
    // If already 'blocked', remain blocked
    
    // Apply path-type filtering (belt vs pipe) and single-fluid selection
    const filteredFlows = filterFlowsForPathType(path, flows)

    // Apply throughput limit
    const pathWithFlows = {
        ...path,
        flows: filteredFlows,
        flowDirection
    }
    
    return applyPathThroughputLimit(pathWithFlows)
}

function filterFlowsForPathType(path: Immutable<FieldPath>, flows: ItemFlow[]): ItemFlow[] {
    if (flows.length === 0) {
        return flows
    }

    const isFluidItem = (itemID: ItemID) => items[itemID]?.fluid === true

    if (path.type === PathTypeID.BELT) {
        return flows.filter(flow => !isFluidItem(flow.item))
    }

    const fluidFlows = flows.filter(flow => isFluidItem(flow.item))
    if (fluidFlows.length === 0) {
        return []
    }

    const merged = mergeItemFlows([fluidFlows])
    let selected = merged[0]

    for (let i = 1; i < merged.length; i++) {
        const candidate = merged[i]
        if (candidate.sourceRate > selected.sourceRate) {
            selected = candidate
        }
    }

    return [selected]
}

/**
 * Merge multiple item flows (used for aggregating).
 * @param flows Array of flow arrays to merge
 * @returns Merged flows
 */
export function mergeItemFlows(flows: Immutable<ItemFlow[]>[]): Immutable<ItemFlow>[] {
    const flowMap = new Map<ItemID, { sourceRate: number, sinkRate: number }>()
    
    for (const flowArray of flows) {
        for (const flow of flowArray) {
            const existing = flowMap.get(flow.item)
            if (existing) {
                existing.sourceRate += flow.sourceRate
                existing.sinkRate += flow.sinkRate
            } else {
                flowMap.set(flow.item, {
                    sourceRate: flow.sourceRate,
                    sinkRate: flow.sinkRate
                })
            }
        }
    }
    
    const result: Immutable<ItemFlow>[] = []
    for (const [item, rates] of flowMap.entries()) {
        result.push({
            item,
            sourceRate: rates.sourceRate,
            sinkRate: rates.sinkRate
        })
    }
    
    return result
}

/**
 * Analyzes a facility's production to identify bottlenecks and flow issues.
 * @param facility Facility to analyze
 * @returns Flow analysis results
 */
export function analyzeFacilityFlows(
    facility: Immutable<FieldFacility>
): {
    insufficientFlows: Set<ItemID>
    bottleneckItem: ItemID | undefined
    overSuppliedFlows: Set<ItemID>
} {
    const actualRecipe = facility.actualRecipe ? recipes[facility.actualRecipe] : undefined
    if (!actualRecipe) {
        return { insufficientFlows: new Set<ItemID>(), bottleneckItem: undefined, overSuppliedFlows: new Set<ItemID>() }
    }

    const insufficientFlows = new Set<ItemID>()
    const overSuppliedFlows = new Set<ItemID>()
    let bottleneckItem: ItemID | undefined
    let bottleneckRatio = 1.0

    // Calculate the expected input rate for each item based on the recipe
    for (const [itemID, recipeAmount] of objectEntries(actualRecipe.inputs)) {
        const maxConsumptionRate = recipeAmount / actualRecipe.time
        const actualFlow = facility.inputFlows.find(f => f.item === itemID)
        const actualSinkRate = actualFlow?.sinkRate ?? 0
        const actualSourceRate = actualFlow?.sourceRate ?? 0

        // Check if more is being supplied than the facility can consume at max throughput
        if (actualSourceRate > maxConsumptionRate * 1.001) {
            overSuppliedFlows.add(itemID)
        }

        // Check if the actual rate is less than expected (with small tolerance for floating point errors)
        if (actualSinkRate < maxConsumptionRate * 0.999) {
            insufficientFlows.add(itemID)

            // Calculate the ratio of actual to expected rate
            const ratio = maxConsumptionRate > 0 ? actualSinkRate / maxConsumptionRate : 0
            if (ratio < bottleneckRatio) {
                bottleneckRatio = ratio
                bottleneckItem = itemID
            }
        }
    }

    return { insufficientFlows, bottleneckItem, overSuppliedFlows }
}

/**
 * Checks if a facility has any flow-related issues (bottlenecks, obstructions, over-supply).
 * @param facility Facility to check
 * @returns True if facility has flow issues
 */
export function hasFacilityFlowIssues(facility: Immutable<FieldFacility>): boolean {
    const analysis = analyzeFacilityFlows(facility)
    
    // Check for bottlenecks or over-supply
    if (analysis.insufficientFlows.size > 0 || analysis.overSuppliedFlows.size > 0) {
        return true
    }
    
    // Check for obstructed flows (sourceRate > sinkRate)
    for (const flow of facility.inputFlows) {
        if (flow.sourceRate > flow.sinkRate * 1.001) {
            return true
        }
    }
    
    for (const flow of facility.outputFlows) {
        if (flow.sourceRate > flow.sinkRate * 1.001) {
            return true
        }
    }
    
    // Check if producing at reduced rate
    if (facility.actualRecipe) {
        const recipe = recipes[facility.actualRecipe]
        if (recipe && facility.outputFlows.length > 0) {
            const theoreticalTotal = Object.values(recipe.outputs).reduce((sum, count) => sum + (count / recipe.time), 0)
            const actualTotal = facility.outputFlows.reduce((sum, flow) => sum + flow.sourceRate, 0)
            const percentage = theoreticalTotal > 0 ? (actualTotal / theoreticalTotal) * 100 : 0
            if (percentage < 99.9) {
                return true
            }
        }
    }
    
    return false
}
