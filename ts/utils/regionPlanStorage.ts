import { regionFields } from "../data/regions.ts"
import { RegionID } from "../types/data.ts"
import type { RegionPlanAssignmentV1, RegionPlanJsonV1 } from "../types/external.ts"
import { isRegionPlanJsonV1 } from "../types/external.ts"

const REGION_PLAN_STORAGE_PREFIX = "endfield-factory-planner-region-plan-"

export function getRegionPlanStorageKey(region: RegionID): string {
    return `${REGION_PLAN_STORAGE_PREFIX}${region}`
}

export function buildRegionPlanAssignments(region: RegionID): RegionPlanAssignmentV1[] {
    return regionFields[region].map((field) => ({
        fieldId: field.id,
        projectGuid: null,
    }))
}

export function createRegionPlan(region: RegionID): RegionPlanJsonV1 {
    return {
        type: "endfield-factory-planner-region-plan",
        version: 1,
        region,
        assignments: buildRegionPlanAssignments(region),
    }
}

export function loadRegionPlan(region: RegionID): RegionPlanJsonV1 {
    try {
        const raw = localStorage.getItem(getRegionPlanStorageKey(region))
        if (!raw) {
            return createRegionPlan(region)
        }
        const parsed: unknown = JSON.parse(raw)
        if (isRegionPlanJsonV1(parsed) && parsed.region === region) {
            return parsed
        }
    } catch {
        return createRegionPlan(region)
    }
    return createRegionPlan(region)
}

export function saveRegionPlan(plan: RegionPlanJsonV1): void {
    localStorage.setItem(getRegionPlanStorageKey(plan.region), JSON.stringify(plan))
}
