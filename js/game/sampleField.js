import { recalculateFieldState } from "./field.js";
import { facilities } from "../data/facilities.js";
import { FacilityID, FieldTemplateID, ItemID, PathTypeID } from "../types/data.js";
import { resolveFieldTemplate } from "../data/templates.js";
export function createEmptyState(template) {
    const resolvedTemplate = resolveFieldTemplate(template);
    return {
        template,
        width: resolvedTemplate.width,
        height: resolvedTemplate.height,
        facilities: [],
        paths: [],
        pathFixtures: [],
        depot: {
            inputFlows: [],
            outputFlows: [],
            powerGenerated: 0,
            powerConsumed: 0,
        },
        world: {
            inputFlows: [],
            outputFlows: [],
        },
        debugInfo: {},
    };
}
export function createStateFromChanges(changes, template = FieldTemplateID.WULING_MAIN) {
    const emptyState = createEmptyState(template);
    return recalculateFieldState(emptyState, changes);
}
export function createInitialTemplateChanges(template) {
    const resolvedTemplate = resolveFieldTemplate(template);
    if (!resolvedTemplate.initialFacilityType) {
        return [];
    }
    const facilityDef = facilities[resolvedTemplate.initialFacilityType];
    if (!facilityDef) {
        return [];
    }
    const x = Math.max(0, Math.floor((resolvedTemplate.width - facilityDef.width) / 2));
    const y = Math.max(0, Math.floor((resolvedTemplate.height - facilityDef.height) / 2));
    return [
        {
            type: "add-facility",
            facilityType: resolvedTemplate.initialFacilityType,
            position: [x, y],
            rotation: 0,
        }
    ];
}
export function getSampleFieldChanges() {
    return [
        { type: "add-facility", facilityType: FacilityID.PROTOCOL_AUTOMATION_CORE_PAC, position: [30, 30], rotation: 0 },
        { type: "set-port-item", facilityID: "facility_1", portIndex: 14, itemID: ItemID.AMETHYST_ORE },
        { type: "set-port-item", facilityID: "facility_1", portIndex: 15, itemID: ItemID.ORIGINIUM_ORE },
        { type: "add-facility", facilityType: FacilityID.ELECTRIC_PYLON, position: [10, 25], rotation: 0 },
        { type: "add-facility", facilityType: FacilityID.ELECTRIC_PYLON, position: [10, 5], rotation: 0 },
        { type: "add-facility", facilityType: FacilityID.REFINING_UNIT, position: [13, 26], rotation: 0 },
        { type: "add-facility", facilityType: FacilityID.FITTING_UNIT, position: [13, 19], rotation: 0 },
        { type: "add-facility", facilityType: FacilityID.SHREDDING_UNIT, position: [6, 30], rotation: 0 },
        { type: "add-facility", facilityType: FacilityID.PACKAGING_UNIT, position: [10, 10], rotation: 0 },
        { type: "add-path", pathType: PathTypeID.BELT, points: [
                [32, 30],
                [32, 8],
                [10, 8],
                [10, 10],
            ] },
        { type: "add-path", pathType: PathTypeID.BELT, points: [
                [30, 34],
                [8, 34],
                [8, 32],
            ] },
        { type: "add-path", pathType: PathTypeID.BELT, points: [
                [8, 30],
                [8, 15],
                [10, 15],
                [10, 13],
            ] },
        { type: "add-path", pathType: PathTypeID.BELT, points: [
                [30, 31],
                [14, 31],
                [14, 28],
            ] },
        { type: "add-path", pathType: PathTypeID.BELT, points: [
                [14, 26],
                [14, 21],
            ] },
        { type: "add-path", pathType: PathTypeID.BELT, points: [
                [14, 19],
                [14, 13],
            ] },
    ];
}
export function createSampleFieldState() {
    return createStateFromChanges(getSampleFieldChanges(), FieldTemplateID.WULING_MAIN);
}
