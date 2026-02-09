import { regionFields } from "../data/regions.ts"
import type { RegionFieldDefinition, RegionID } from "../types/data.ts"
import type { RegionPlanAssignmentV1, ProjectJsonMetaV1 } from "../types/external.ts"

export interface AssignedRegionField {
    field: RegionFieldDefinition
    assignment: RegionPlanAssignmentV1 | undefined
    assignedProject: ProjectJsonMetaV1 | null
}

export interface RegionAssignmentsSummary {
    assignedFields: AssignedRegionField[]
    assignedGuids: Set<string>
    projectLookup: Map<string, ProjectJsonMetaV1>
}

function isNonEmptyString(value: string | null): value is string {
    return typeof value === "string" && value.length > 0
}

export function buildRegionAssignments(
    region: RegionID,
    assignments: RegionPlanAssignmentV1[],
    projects: ProjectJsonMetaV1[]
): RegionAssignmentsSummary {
    const projectLookup = new Map(projects.map((project) => [project.guid, project]))
    const assignedFields = regionFields[region].map((field) => {
        const assignment = assignments.find((entry) => entry.fieldId === field.id)
        const assignedProject = assignment?.projectGuid ? projectLookup.get(assignment.projectGuid) ?? null : null
        return { field, assignment, assignedProject }
    })
    const assignedGuids = new Set(assignments.map((entry) => entry.projectGuid).filter(isNonEmptyString))

    return {
        assignedFields,
        assignedGuids,
        projectLookup,
    }
}
