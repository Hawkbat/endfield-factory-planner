import type { FieldTemplate, FieldTemplateID } from "../types/data.ts"
import type { UserChange } from "../types/field.ts"
import type { ProjectJsonMetaV1, ProjectJsonV1, ProjectListingJsonV1 } from "../types/external.ts"
import { isProjectJsonV1 } from "../types/external.ts"

export const PROJECT_LISTING_STORAGE_KEY = "endfield-factory-planner-project-listing-v1"
const PROJECT_STORAGE_PREFIX = "endfield-factory-planner-project-"

const emptyListing: ProjectListingJsonV1 = {
    type: "endfield-factory-planner-project-listing",
    version: 1,
    projects: [],
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

function isProjectMetaV1(value: unknown): value is ProjectJsonMetaV1 {
    if (!isRecord(value)) {
        return false
    }
    if (typeof value.guid !== "string") {
        return false
    }
    if (typeof value.name !== "string") {
        return false
    }
    if (typeof value.createdAt !== "string") {
        return false
    }
    if (typeof value.updatedAt !== "string") {
        return false
    }
    if ("hidden" in value && typeof value.hidden !== "boolean") {
        return false
    }
    return true
}

function isProjectListingJsonV1(value: unknown): value is ProjectListingJsonV1 {
    if (!isRecord(value)) {
        return false
    }
    if (value.type !== "endfield-factory-planner-project-listing") {
        return false
    }
    if (value.version !== 1) {
        return false
    }
    if (!Array.isArray(value.projects)) {
        return false
    }
    return value.projects.every(isProjectMetaV1)
}

export function getProjectStorageKey(guid: string): string {
    return `${PROJECT_STORAGE_PREFIX}${guid}`
}

export function loadProjectListing(): ProjectListingJsonV1 {
    try {
        const raw = localStorage.getItem(PROJECT_LISTING_STORAGE_KEY)
        if (!raw) {
            return emptyListing
        }
        const parsed: unknown = JSON.parse(raw)
        if (isProjectListingJsonV1(parsed)) {
            return parsed
        }
    } catch {
        return emptyListing
    }
    return emptyListing
}

export function saveProjectListing(listing: ProjectListingJsonV1): void {
    localStorage.setItem(PROJECT_LISTING_STORAGE_KEY, JSON.stringify(listing))
}

export function loadProject(guid: string): ProjectJsonV1 | null {
    try {
        const raw = localStorage.getItem(getProjectStorageKey(guid))
        if (!raw) {
            return null
        }
        const parsed: unknown = JSON.parse(raw)
        return isProjectJsonV1(parsed) ? parsed : null
    } catch {
        return null
    }
}

export function saveProject(project: ProjectJsonV1): void {
    localStorage.setItem(getProjectStorageKey(project.meta.guid), JSON.stringify(project))
}

export function createProjectMeta(name: string, now = new Date()): ProjectJsonMetaV1 {
    return {
        guid: crypto.randomUUID(),
        name,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
    }
}

export function ensureUniqueGuid(listing: ProjectListingJsonV1, guid: string): string {
    const existing = new Set(listing.projects.map((project) => project.guid))
    if (!existing.has(guid)) {
        return guid
    }
    let nextGuid = crypto.randomUUID()
    while (existing.has(nextGuid)) {
        nextGuid = crypto.randomUUID()
    }
    return nextGuid
}

export function upsertProjectMeta(listing: ProjectListingJsonV1, meta: ProjectJsonMetaV1): ProjectListingJsonV1 {
    const existingIndex = listing.projects.findIndex((project) => project.guid === meta.guid)
    if (existingIndex === -1) {
        return {
            ...listing,
            projects: [...listing.projects, meta],
        }
    }
    const nextProjects = [...listing.projects]
    nextProjects[existingIndex] = meta
    return {
        ...listing,
        projects: nextProjects,
    }
}

export function setProjectHidden(listing: ProjectListingJsonV1, guid: string, hidden: boolean): ProjectListingJsonV1 {
    return {
        ...listing,
        projects: listing.projects.map((project) =>
            project.guid === guid ? { ...project, hidden } : project
        ),
    }
}

export function buildProjectJson(meta: ProjectJsonMetaV1, template: FieldTemplateID | FieldTemplate, changes: UserChange[]): ProjectJsonV1 {
    return {
        type: "endfield-factory-planner-project",
        version: 1,
        meta,
        template,
        changes,
    }
}
