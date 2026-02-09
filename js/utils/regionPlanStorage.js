import { regionFields } from "../data/regions.js";
import { RegionID } from "../types/data.js";
import { isRegionPlanJsonV1 } from "../types/external.js";
const REGION_PLAN_STORAGE_PREFIX = "endfield-factory-planner-region-plan-";
export function getRegionPlanStorageKey(region) {
    return `${REGION_PLAN_STORAGE_PREFIX}${region}`;
}
export function buildRegionPlanAssignments(region) {
    return regionFields[region].map((field) => ({
        fieldId: field.id,
        projectGuid: null,
    }));
}
export function createRegionPlan(region) {
    return {
        type: "endfield-factory-planner-region-plan",
        version: 1,
        region,
        assignments: buildRegionPlanAssignments(region),
    };
}
export function loadRegionPlan(region) {
    try {
        const raw = localStorage.getItem(getRegionPlanStorageKey(region));
        if (!raw) {
            return createRegionPlan(region);
        }
        const parsed = JSON.parse(raw);
        if (isRegionPlanJsonV1(parsed) && parsed.region === region) {
            return parsed;
        }
    }
    catch {
        return createRegionPlan(region);
    }
    return createRegionPlan(region);
}
export function saveRegionPlan(plan) {
    localStorage.setItem(getRegionPlanStorageKey(plan.region), JSON.stringify(plan));
}
