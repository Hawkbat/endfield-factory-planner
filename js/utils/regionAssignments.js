import { regionFields } from "../data/regions.js";
function isNonEmptyString(value) {
    return typeof value === "string" && value.length > 0;
}
export function buildRegionAssignments(region, assignments, projects) {
    const projectLookup = new Map(projects.map((project) => [project.guid, project]));
    const assignedFields = regionFields[region].map((field) => {
        const assignment = assignments.find((entry) => entry.fieldId === field.id);
        const assignedProject = assignment?.projectGuid ? projectLookup.get(assignment.projectGuid) ?? null : null;
        return { field, assignment, assignedProject };
    });
    const assignedGuids = new Set(assignments.map((entry) => entry.projectGuid).filter(isNonEmptyString));
    return {
        assignedFields,
        assignedGuids,
        projectLookup,
    };
}
