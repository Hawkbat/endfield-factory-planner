import { tuple } from "../utils/types.js";
import { isUserChangesJsonV1 } from "../types/external.js";
/**
 * Create delete changes for all selected entities
 */
export function createDeleteChanges(selectedIDs, fieldState) {
    const deleteChanges = [];
    for (const id of selectedIDs) {
        const facility = fieldState.facilities.find(f => f.id === id);
        if (facility) {
            deleteChanges.push({ type: 'remove-facility', facilityID: id });
            continue;
        }
        const path = fieldState.paths.find(p => p.id === id);
        if (path) {
            deleteChanges.push({ type: 'remove-path', pathID: id });
            continue;
        }
        const fixture = fieldState.pathFixtures.find(f => f.id === id);
        if (fixture) {
            deleteChanges.push({ type: 'remove-path-fixture', fixtureID: id });
        }
    }
    return deleteChanges;
}
/**
 * Create nudge/move changes for all selected entities
 */
export function createNudgeChanges(selectedIDs, fieldState, dx, dy) {
    const nudgeChanges = [];
    for (const id of selectedIDs) {
        const facility = fieldState.facilities.find(f => f.id === id);
        if (facility) {
            nudgeChanges.push({
                type: 'move-facility',
                facilityID: id,
                newPosition: tuple(facility.x + dx, facility.y + dy),
            });
            continue;
        }
        const fixture = fieldState.pathFixtures.find(f => f.id === id);
        if (fixture) {
            nudgeChanges.push({
                type: 'move-path-fixture',
                fixtureID: id,
                newPosition: tuple(fixture.x + dx, fixture.y + dy),
            });
            continue;
        }
        const path = fieldState.paths.find(p => p.id === id);
        if (path) {
            const newPoints = path.points.map(([x, y]) => tuple(x + dx, y + dy));
            nudgeChanges.push({
                type: 'update-path-points',
                pathID: id,
                points: newPoints,
            });
        }
    }
    return nudgeChanges;
}
/**
 * Create changes to recreate selected entities (for copy/paste/duplicate)
 * Returns the changes needed to add copies of the entities
 *
 * Uses a reference-based approach: instead of predicting IDs, we use special
 * reference tokens like "@ref:facility:0" that get resolved when the multi-change
 * is applied. This makes the system more robust and less brittle.
 */
export function createCopyChanges(selectedIDs, fieldState, offset = { dx: 0, dy: 0 }) {
    const copyChanges = [];
    // Track entity index for creating references
    let facilityIndex = 0;
    const facilityRefMap = new Map(); // old ID -> reference token
    let fixtureIndex = 0;
    const fixtureRefMap = new Map(); // old ID -> reference token
    // First pass: copy facilities with reference tokens
    for (const id of selectedIDs) {
        const facility = fieldState.facilities.find(f => f.id === id);
        if (facility) {
            const refToken = `@ref:facility:${facilityIndex}`;
            facilityRefMap.set(id, refToken);
            copyChanges.push({
                type: 'add-facility',
                facilityType: facility.type,
                position: tuple(facility.x + offset.dx, facility.y + offset.dy),
                rotation: facility.rotation,
            });
            facilityIndex++;
            continue;
        }
    }
    // Second pass: copy paths
    for (const id of selectedIDs) {
        const path = fieldState.paths.find(p => p.id === id);
        if (path) {
            copyChanges.push({
                type: 'add-path',
                pathType: path.type,
                points: path.points.map(([x, y]) => tuple(x + offset.dx, y + offset.dy)),
            });
            continue;
        }
    }
    // Third pass: copy fixtures with reference tokens
    for (const id of selectedIDs) {
        const fixture = fieldState.pathFixtures.find(f => f.id === id);
        if (fixture) {
            const refToken = `@ref:fixture:${fixtureIndex}`;
            fixtureRefMap.set(id, refToken);
            copyChanges.push({
                type: 'add-path-fixture',
                fixtureType: fixture.type,
                position: tuple(fixture.x + offset.dx, fixture.y + offset.dy),
                rotation: fixture.rotation,
            });
            fixtureIndex++;
        }
    }
    // Fourth pass: add settings using reference tokens
    for (const id of selectedIDs) {
        const facility = fieldState.facilities.find(f => f.id === id);
        if (facility) {
            const refToken = facilityRefMap.get(id);
            // Copy depot port items
            for (let portIndex = 0; portIndex < facility.ports.length; portIndex++) {
                const port = facility.ports[portIndex];
                if (port.setItem !== undefined && port.setItem !== null) {
                    copyChanges.push({
                        type: 'set-port-item',
                        facilityID: refToken,
                        portIndex,
                        itemID: port.setItem,
                    });
                }
            }
            // Copy facility recipe
            if (facility.setRecipe !== undefined && facility.setRecipe !== null) {
                copyChanges.push({
                    type: 'set-facility-recipe',
                    facilityID: refToken,
                    recipeID: facility.setRecipe,
                    jumpStart: facility.jumpStartRecipe || false,
                });
            }
        }
        // Copy fixture setItem (for Control Ports)
        const fixture = fieldState.pathFixtures.find(f => f.id === id);
        if (fixture && fixture.setItem !== undefined && fixture.setItem !== null) {
            const refToken = fixtureRefMap.get(id);
            copyChanges.push({
                type: 'set-fixture-item',
                fixtureID: refToken,
                itemID: fixture.setItem,
            });
        }
    }
    return copyChanges;
}
/**
 * Serialize copy changes to JSON for clipboard
 */
export function serializeCopyData(changes) {
    const data = {
        type: 'endfield-factory-planner-user-changes',
        version: 1,
        changes,
    };
    return JSON.stringify(data);
}
/**
 * Deserialize copy changes from JSON
 */
export function deserializeCopyData(json) {
    let data = undefined;
    try {
        data = JSON.parse(json);
    }
    catch (e) {
        // Invalid JSON or structure
    }
    if (isUserChangesJsonV1(data)) {
        return data.changes;
    }
    return null;
}
