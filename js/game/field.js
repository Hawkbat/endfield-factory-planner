import { facilities } from "../data/facilities.js";
import { applyUserChange } from "./changes.js";
import { validateFacilityPlacement, validateFixturePlacement, validatePathPlacement } from "./geometry.js";
import { initializeFacilityPorts, initializeFixtureSides, updateFacilityConnections, updateFixtureConnections, updateAllPathConnections, updatePathConnectionRefs } from "./connections.js";
import { updateAllFacilityPowerStates, calculatePowerStats } from "./power.js";
import { updateAllFacilityRecipes } from "./recipes.js";
import { solveFlowSystem, initializeFlowState, propagateFlowsOneIteration } from "./solver.js";
import { mergeItemFlows } from "./flows.js";
import { objectValues } from "../utils/types.js";
import { ROTATE_RIGHT_MAP } from "./directions.js";
import { recipes } from "../data/recipes.js";
import { applyTemplateValidation } from "./templateRules.js";
import { FacilityID } from "../types/data.js";
import { resolveFieldTemplate } from "../data/templates.js";
export function recalculateFieldState(fieldState, changes) {
    let currentState = fieldState;
    // Step 1: Apply all user changes sequentially
    for (const change of changes) {
        currentState = applyUserChange(currentState, change);
    }
    // Step 2: Validate facility and fixture placements (paths validated later after connections)
    const facilitiesWithErrors = currentState.facilities.map(facility => {
        const errors = validateFacilityPlacement(facility, currentState);
        return {
            ...facility,
            errorFlags: {
                ...facility.errorFlags,
                ...errors
            }
        };
    });
    const fixturesWithErrors = currentState.pathFixtures.map(fixture => {
        const errors = validateFixturePlacement(fixture, currentState);
        return {
            ...fixture,
            errorFlags: {
                ...fixture.errorFlags,
                ...errors
            }
        };
    });
    currentState = {
        ...currentState,
        facilities: facilitiesWithErrors,
        pathFixtures: fixturesWithErrors
    };
    // Step 3: Initialize/update facility ports from definitions
    const template = resolveFieldTemplate(currentState.template);
    const regionID = template.region;
    const facilitiesWithPorts = currentState.facilities.map(facility => {
        // Ports are already initialized in change handlers, but ensure they're up to date
        if (facility.ports.length === 0) {
            return {
                ...facility,
                ports: initializeFacilityPorts(facility, regionID)
            };
        }
        return facility;
    });
    currentState = {
        ...currentState,
        facilities: facilitiesWithPorts
    };
    // Step 4: Initialize/update fixture sides from definitions
    const fixturesWithSides = currentState.pathFixtures.map(fixture => {
        // Sides are already initialized in change handlers, but ensure they're up to date
        if (fixture.sides.length === 0) {
            return {
                ...fixture,
                sides: initializeFixtureSides(fixture)
            };
        }
        return fixture;
    });
    currentState = {
        ...currentState,
        pathFixtures: fixturesWithSides
    };
    // Step 5: Update all power states
    currentState = updateAllFacilityPowerStates(currentState);
    // Step 6: Update all path connections to facilities and fixtures
    const facilitiesWithConnections = currentState.facilities.map(facility => updateFacilityConnections(facility, currentState));
    const fixturesWithConnections = currentState.pathFixtures.map(fixture => updateFixtureConnections(fixture, currentState));
    currentState = {
        ...currentState,
        facilities: facilitiesWithConnections,
        pathFixtures: fixturesWithConnections
    };
    // Step 6b: Update path connection references (startConnectedTo/endConnectedTo)
    const pathsWithConnectionRefs = currentState.paths.map(path => updatePathConnectionRefs(path, currentState));
    currentState = {
        ...currentState,
        paths: pathsWithConnectionRefs
    };
    // Step 6c: Validate path placements (now that connection refs are populated)
    const pathsWithErrors = currentState.paths.map(path => {
        const errors = validatePathPlacement(path, currentState);
        return {
            ...path,
            errorFlags: {
                ...path.errorFlags,
                ...errors
            }
        };
    });
    currentState = {
        ...currentState,
        paths: pathsWithErrors
    };
    // Step 6d: Apply template-based validation rules
    currentState = applyTemplateValidation(currentState);
    // Step 6e: Update all path connections and flow directions
    currentState = updateAllPathConnections(currentState);
    // Step 6f: Initialize external output flows and propagate them to connected facilities
    // This allows recipe inference to work based on what inputs facilities receive
    const flowInitialized = initializeFlowState(currentState);
    const flowPropagated = propagateFlowsOneIteration(flowInitialized);
    // Use the propagated flows to update facility input flows for recipe inference
    currentState = {
        ...currentState,
        facilities: flowPropagated.facilities,
        paths: flowPropagated.paths
    };
    // Step 7: Update all facility recipes (preserving setRecipes)
    // Now that external outputs have been propagated, facilities can infer recipes from inputs
    const recipeResult = updateAllFacilityRecipes(currentState);
    currentState = recipeResult.state;
    // Step 8: Solve flow system iteratively
    const solverResult = solveFlowSystem(currentState);
    currentState = solverResult.state;
    // Collect debug info
    const debugInfo = {
        flowSolverIterations: solverResult.iterations,
        flowSolverConverged: solverResult.converged,
        multipleRecipeMatchWarnings: recipeResult.warnings.length > 0 ? recipeResult.warnings : undefined
    };
    // Step 9: Calculate depot aggregate flows
    const depotInputFlowArrays = [];
    const depotOutputFlowArrays = [];
    const worldInputFlowArrays = [];
    const worldOutputFlowArrays = [];
    for (const facility of currentState.facilities) {
        // Protocol Stash sends excess input flows to the depot.
        // When no outputs are connected, outputFlows contains the full depot-bound amount.
        // When outputs are connected, outputFlows includes both port outputs and depot excess;
        // subtract port output flows to get the depot-only portion.
        if (facility.type === FacilityID.PROTOCOL_STASH && facility.outputFlows.length > 0) {
            const portOutputTotal = new Map();
            for (const port of facility.ports) {
                if (port.subType === 'output' && port.connectedPathID) {
                    for (const flow of port.flows) {
                        portOutputTotal.set(flow.item, (portOutputTotal.get(flow.item) ?? 0) + flow.sourceRate);
                    }
                }
            }
            const depotFlows = [];
            for (const flow of facility.outputFlows) {
                const portRate = portOutputTotal.get(flow.item) ?? 0;
                const depotRate = flow.sourceRate - portRate;
                if (depotRate > 0.0001) {
                    depotFlows.push({ item: flow.item, sourceRate: depotRate, sinkRate: depotRate });
                }
            }
            if (depotFlows.length > 0) {
                depotOutputFlowArrays.push(depotFlows);
            }
        }
        for (const port of facility.ports) {
            if (port.external === 'depot') {
                if (port.subType === 'output') {
                    depotInputFlowArrays.push(port.flows);
                }
                else if (port.subType === 'input') {
                    depotOutputFlowArrays.push(port.flows);
                }
            }
            else if (port.external === 'world') {
                if (port.subType === 'output') {
                    worldInputFlowArrays.push(port.flows);
                }
                else if (port.subType === 'input') {
                    worldOutputFlowArrays.push(port.flows);
                }
            }
        }
    }
    const depotInputFlows = mergeItemFlows(depotInputFlowArrays);
    const depotOutputFlows = mergeItemFlows(depotOutputFlowArrays);
    const worldInputFlows = mergeItemFlows(worldInputFlowArrays);
    const worldOutputFlows = mergeItemFlows(worldOutputFlowArrays);
    // Step 10: Calculate power generation/consumption
    const powerStats = calculatePowerStats(currentState);
    // Step 11: Update depot state
    currentState = {
        ...currentState,
        depot: {
            inputFlows: mergeItemFlows([depotInputFlows]),
            outputFlows: mergeItemFlows([depotOutputFlows]),
            powerGenerated: powerStats.generated,
            powerConsumed: powerStats.consumed
        },
        world: {
            inputFlows: mergeItemFlows([worldInputFlows]),
            outputFlows: mergeItemFlows([worldOutputFlows])
        }
    };
    // Step 12: Set additional error flags based on simulation results
    const facilitiesWithSimErrors = currentState.facilities.map(facility => {
        const errorFlags = { ...facility.errorFlags };
        // Check for unpowered facilities that require power
        if (!facility.isPowered && facilities[facility.type].power) {
            errorFlags.unpowered = true;
        }
        // Check for facilities with no valid recipe when they should have one
        if (facility.isPowered && !facility.actualRecipe) {
            const hasInputs = facility.inputFlows.length > 0;
            const hasPossibleRecipes = objectValues(recipes).some(recipe => recipe.facilityID === facility.type);
            if (hasInputs && hasPossibleRecipes) {
                errorFlags.noValidRecipe = true;
            }
        }
        return {
            ...facility,
            errorFlags
        };
    });
    // Path error flags (nothingConnected, bothInputs, bothOutputs) are already set
    // during connection detection in Step 6, so we don't need to guess them here
    return {
        ...currentState,
        facilities: facilitiesWithSimErrors,
        debugInfo
    };
}
