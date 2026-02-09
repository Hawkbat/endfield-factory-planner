import { facilities } from "../data/facilities.js";
function recalculateFieldState(fieldState) {
    // Recalculate item flows based on facility recipes, path connections, etc.
    // This is a complex function that would involve simulating the entire factory layout.
    // We'll want to update each facility's position and rotation first, then every facility's powered state, then path connections.
    // After that, we'll need to recursively update path flows, path fixture flows, facility recipes, and facility input/output flows. We'll need to be careful here because loops ARE possible and valid (e.g. self-supplying seed-picker -> planter -> seed-picker loops).
    // Finally, we can calculate total depot input/output flows for the user to track resource consumption/production for their entire factory.
    // TODO: Implement full recalculation logic, using helper functions to break down the steps.
    return fieldState;
}
const ROTATE_RIGHT_MAP = {
    'up': 'right',
    'right': 'down',
    'down': 'left',
    'left': 'up',
};
function updateFacilityPosition(facility, x, y) {
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
            pathID: null,
            flows: [],
        })),
        isPowered: false,
        inputFlows: [],
        outputFlows: [],
        recipe: null,
    };
}
function updateFacilityRotation(facility, rotation) {
    if (facility.rotation === rotation) {
        return facility;
    }
    // Adjust facility dimensions and port positions based on difference in rotation (always in 90-degree increments)
    const deltaRotation = (rotation - facility.rotation + 360) % 360;
    const deltaRotationSteps = Math.round(deltaRotation / 90);
    const swapWidthHeight = deltaRotation === 90 || deltaRotation === 270;
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
                // Rotate x and y 90 degrees (they are already relative to the top-left corner of the facility)
                const oldX = x;
                x = y;
                y = swapWidthHeight ? facility.width - 1 - oldX : facility.height - 1 - oldX;
            }
            return {
                ...port,
                x,
                y,
                direction: direction,
                // Clear computed state to be recalculated
                pathID: null,
                flows: [],
            };
        }),
        // Clear computed state to be recalculated
        isPowered: false,
        inputFlows: [],
        outputFlows: [],
        recipe: null,
    };
}
function updateFacilityPoweredState(facility, fieldState) {
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
function updateFacilityPathConnections(facility, fieldState) {
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
                pathID: connectedPath.id,
                // Clear flows to be recalculated
                flows: [],
            };
        }
        else {
            return {
                ...port,
                pathID: null,
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
        recipe: null,
    };
}
export function Field() {
}
