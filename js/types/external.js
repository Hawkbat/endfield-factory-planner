export function isUserChangesJsonV1(data) {
    return typeof data === 'object' && data !== null &&
        'type' in data && typeof data.type === 'string' && data.type === 'endfield-factory-planner-user-changes' &&
        'version' in data && typeof data.version === 'number' && data.version === 1 &&
        'changes' in data && Array.isArray(data.changes);
}
export function isProjectJsonV1(data) {
    return typeof data === 'object' && data !== null &&
        'type' in data && typeof data.type === 'string' && data.type === 'endfield-factory-planner-project' &&
        'version' in data && typeof data.version === 'number' && data.version === 1 &&
        'meta' in data && typeof data.meta === 'object' && data.meta !== null &&
        'guid' in data.meta && typeof data.meta.guid === 'string' &&
        'createdAt' in data.meta && typeof data.meta.createdAt === 'string' &&
        'updatedAt' in data.meta && typeof data.meta.updatedAt === 'string' &&
        'template' in data &&
        'changes' in data && Array.isArray(data.changes);
}
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
function isRegionPlanAssignmentV1(value) {
    if (!isRecord(value)) {
        return false;
    }
    if (!('fieldId' in value) || typeof value.fieldId !== 'string') {
        return false;
    }
    if (!('projectGuid' in value)) {
        return false;
    }
    return typeof value.projectGuid === 'string' || value.projectGuid === null;
}
export function isRegionPlanJsonV1(data) {
    if (!isRecord(data)) {
        return false;
    }
    if (data.type !== 'endfield-factory-planner-region-plan') {
        return false;
    }
    if (data.version !== 1) {
        return false;
    }
    if (typeof data.region !== 'string') {
        return false;
    }
    if (!Array.isArray(data.assignments)) {
        return false;
    }
    return data.assignments.every(isRegionPlanAssignmentV1);
}
