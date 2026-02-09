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
    const facilitiesWithPorts = currentState.facilities.map(facility => {
        // Ports are already initialized in change handlers, but ensure they're up to date
        if (facility.ports.length === 0) {
            return {
                ...facility,
                ports: initializeFacilityPorts(facility)
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
export function updateFacilityPosition(facility, x, y) {
    if (facility.x === x && facility.y === y) {
        return facility;
    }
    return {
        ...facility,
        x,
        y,
        // Clear computed state to be recalculated
        ports: facility.ports.map(port => ({
            ...port,
            connectedPathID: null,
            flows: [],
        })),
        isPowered: false,
        inputFlows: [],
        outputFlows: [],
        actualRecipe: null,
    };
}
export function updateFacilityRotation(facility, rotation) {
    if (facility.rotation === rotation) {
        return facility;
    }
    // Adjust facility dimensions and port positions based on difference in rotation (always in 90-degree increments)
    const deltaRotation = (rotation - facility.rotation + 360) % 360;
    const deltaRotationSteps = Math.round(deltaRotation / 90);
    const swapWidthHeight = deltaRotation === 90 || deltaRotation === 270;
    // Store original dimensions before swapping for port rotation calculations
    const originalWidth = facility.width;
    const originalHeight = facility.height;
    return {
        ...facility,
        rotation,
        width: swapWidthHeight ? facility.height : facility.width,
        height: swapWidthHeight ? facility.width : facility.height,
        ports: facility.ports.map(port => {
            let direction = port.direction;
            let x = port.x;
            let y = port.y;
            for (let i = 0; i < deltaRotationSteps; i++) {
                direction = ROTATE_RIGHT_MAP[direction];
                // Rotate x and y 90 degrees clockwise (they are relative to the top-left corner of the facility)
                const oldX = x;
                const oldY = y;
                // When rotating 90° clockwise: new_x = old_y, new_y = width - 1 - old_x
                // Use the dimensions from before this rotation step
                const currentWidth = (i % 2 === 0) ? originalWidth : originalHeight;
                x = oldY;
                y = currentWidth - 1 - oldX;
            }
            return {
                ...port,
                x,
                y,
                direction: direction,
                // Clear computed state to be recalculated
                connectedPathID: null,
                flows: [],
            };
        }),
        // Clear computed state to be recalculated
        isPowered: false,
        inputFlows: [],
        outputFlows: [],
        actualRecipe: null,
    };
}
export function updateFacilityPoweredState(facility, fieldState) {
    let isPowered = false;
    const facilityDef = facilities[facility.type];
    if (!facilityDef.power) {
        // Facility does not require power
        isPowered = true;
    }
    else {
        fieldState.facilities.find(f => {
            const fDef = facilities[f.type];
            if (!fDef.powerArea) {
                return false;
            }
            // Check if this facility overlaps the power area
            var centerX = f.x + f.width / 2;
            var centerY = f.y + f.height / 2;
            var powerMinX = centerX - fDef.powerArea.width / 2;
            var powerMaxX = centerX + fDef.powerArea.width / 2;
            var powerMinY = centerY - fDef.powerArea.height / 2;
            var powerMaxY = centerY + fDef.powerArea.height / 2;
            var facilityMinX = facility.x;
            var facilityMaxX = facility.x + facility.width - 1;
            var facilityMinY = facility.y;
            var facilityMaxY = facility.y + facility.height - 1;
            if (powerMinX <= facilityMaxX && powerMaxX >= facilityMinX && powerMinY <= facilityMaxY && powerMaxY >= facilityMinY) {
                isPowered = true;
                return true;
            }
            return false;
        });
    }
    if (facility.isPowered === isPowered) {
        return facility;
    }
    return {
        ...facility,
        isPowered,
    };
}
export function updateFacilityPathConnections(facility, fieldState) {
    const updatedPorts = facility.ports.map(port => {
        // Find a path that connects to this port
        const portX = facility.x + port.x;
        const portY = facility.y + port.y;
        const connectedPath = fieldState.paths.find(path => {
            // Start or end point matches port position
            const startPoint = path.points[0];
            const endPoint = path.points[path.points.length - 1];
            return (startPoint[0] === portX && startPoint[1] === portY) || (endPoint[0] === portX && endPoint[1] === portY);
        });
        if (connectedPath) {
            return {
                ...port,
                connectedPathID: connectedPath.id,
                // Clear flows to be recalculated
                flows: [],
            };
        }
        else {
            return {
                ...port,
                connectedPathID: null,
                // Clear flows to be recalculated
                flows: [],
            };
        }
    });
    return {
        ...facility,
        ports: updatedPorts,
        // Clear computed state to be recalculated
        inputFlows: [],
        outputFlows: [],
        actualRecipe: null,
    };
}
