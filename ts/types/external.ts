import type { FieldTemplate, FieldTemplateID, RegionFieldID, RegionID } from "./data.ts"
import type { UserChange } from "./field.ts"

export type UserChangeV1 = UserChange

export interface UserChangesJsonV1 {
    type: 'endfield-factory-planner-user-changes'
    version: 1
    changes: UserChangeV1[]
}

export function isUserChangesJsonV1(data: unknown): data is UserChangesJsonV1 {
    return typeof data === 'object' && data !== null &&
    'type' in data && typeof data.type === 'string' && data.type === 'endfield-factory-planner-user-changes' &&
    'version' in data && typeof data.version === 'number' && data.version === 1 &&
    'changes' in data && Array.isArray((data as any).changes)
}

export interface ProjectListingJsonV1 {
    type: 'endfield-factory-planner-project-listing'
    version: 1
    projects: ProjectJsonMetaV1[]
}

export interface ProjectJsonMetaV1 {
    guid: string
    name: string
    createdAt: string
    updatedAt: string
    hidden?: boolean
}

export interface ProjectJsonV1 {
    type: 'endfield-factory-planner-project'
    version: 1
    meta: ProjectJsonMetaV1
    template: FieldTemplateID | FieldTemplate
    changes: UserChangeV1[]
}

export function isProjectJsonV1(data: unknown): data is ProjectJsonV1 {
    return typeof data === 'object' && data !== null &&
    'type' in data && typeof data.type === 'string' && data.type === 'endfield-factory-planner-project' &&
    'version' in data && typeof data.version === 'number' && data.version === 1 &&
    'meta' in data && typeof data.meta === 'object' && data.meta !== null &&
    'guid' in data.meta && typeof data.meta.guid === 'string' &&
    'createdAt' in data.meta && typeof data.meta.createdAt === 'string' &&
    'updatedAt' in data.meta && typeof data.meta.updatedAt === 'string' &&
    'template' in data &&
    'changes' in data && Array.isArray((data as any).changes)
}

export interface RegionPlanAssignmentV1 {
    fieldId: RegionFieldID
    projectGuid: string | null
}

export interface RegionPlanJsonV1 {
    type: 'endfield-factory-planner-region-plan'
    version: 1
    region: RegionID
    assignments: RegionPlanAssignmentV1[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function isRegionPlanAssignmentV1(value: unknown): value is RegionPlanAssignmentV1 {
    if (!isRecord(value)) {
        return false
    }
    if (!('fieldId' in value) || typeof value.fieldId !== 'string') {
        return false
    }
    if (!('projectGuid' in value)) {
        return false
    }
    return typeof value.projectGuid === 'string' || value.projectGuid === null
}

export function isRegionPlanJsonV1(data: unknown): data is RegionPlanJsonV1 {
    if (!isRecord(data)) {
        return false
    }
    if (data.type !== 'endfield-factory-planner-region-plan') {
        return false
    }
    if (data.version !== 1) {
        return false
    }
    if (typeof data.region !== 'string') {
        return false
    }
    if (!Array.isArray(data.assignments)) {
        return false
    }
    return data.assignments.every(isRegionPlanAssignmentV1)
}