import { recalculateFieldState } from "../../game/field.js";
import { FacilityID, ItemID, PathTypeID } from "../../types/data.js";
export function createEmptyState(width, height) {
    return {
        width,
        height,
        facilities: [],
        paths: [],
        pathFixtures: [],
        depot: {
            inputFlows: [],
            outputFlows: [],
            powerGenerated: 0,
            powerConsumed: 0,
        },
        debugInfo: {},
    };
}
export function createStateFromChanges(changes, width = 100, height = 100) {
    const emptyState = createEmptyState(width, height);
    return recalculateFieldState(emptyState, changes);
}
export function getSampleFieldChanges() {
    return [
        { type: "add-facility", facilityType: FacilityID.PROTOCOL_AUTOMATION_CORE_PAC, position: [30, 30], rotation: 0 },
        { type: "set-depot-port-item", facilityID: "facility_1", portIndex: 14, itemID: ItemID.AMETHYST_ORE },
        { type: "set-depot-port-item", facilityID: "facility_1", portIndex: 15, itemID: ItemID.ORIGINIUM_ORE },
        { type: "add-facility", facilityType: FacilityID.ELECTRIC_PYLON, position: [10, 25], rotation: 0 },
        { type: "add-facility", facilityType: FacilityID.ELECTRIC_PYLON, position: [10, 5], rotation: 0 },
        { type: "add-facility", facilityType: FacilityID.REFINING_UNIT, position: [13, 26], rotation: 0 },
        { type: "add-facility", facilityType: FacilityID.FITTING_UNIT, position: [13, 19], rotation: 0 },
        { type: "add-facility", facilityType: FacilityID.SHREDDING_UNIT, position: [6, 30], rotation: 0 },
        { type: "add-facility", facilityType: FacilityID.PACKAGING_UNIT, position: [10, 10], rotation: 0 },
        { type: "add-path", pathType: PathTypeID.TRANSPORT_BELT, points: [
                [32, 30],
                [32, 8],
                [10, 8],
                [10, 10],
            ] },
        { type: "add-path", pathType: PathTypeID.TRANSPORT_BELT, points: [
                [30, 34],
                [8, 34],
                [8, 32],
            ] },
        { type: "add-path", pathType: PathTypeID.TRANSPORT_BELT, points: [
                [8, 30],
                [8, 15],
                [10, 15],
                [10, 13],
            ] },
        { type: "add-path", pathType: PathTypeID.TRANSPORT_BELT, points: [
                [30, 31],
                [14, 31],
                [14, 28],
            ] },
        { type: "add-path", pathType: PathTypeID.TRANSPORT_BELT, points: [
                [14, 26],
                [14, 21],
            ] },
        { type: "add-path", pathType: PathTypeID.TRANSPORT_BELT, points: [
                [14, 19],
                [14, 13],
            ] },
    ];
}
export function createSampleFieldState() {
    return createStateFromChanges(getSampleFieldChanges(), 100, 100);
}
