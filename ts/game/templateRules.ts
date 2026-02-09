import { facilities } from "../data/facilities.ts"
import { pathFixtures } from "../data/pathFixtures.ts"
import { pathTypeAllowedRegions } from "../data/pathTypes.ts"
import { resolveFieldTemplate } from "../data/templates.ts"
import { FacilityID } from "../types/data.ts"
import type { FieldFacility, FieldState } from "../types/field.ts"
import type { FieldTemplate } from "../types/data.ts"
import type { Immutable } from "../utils/types.ts"
import { rotateDirection } from "./directions.ts"

export interface TemplateDepotBusRect {
    x: number
    y: number
    width: number
    height: number
}

export interface TemplateDepotBusCells {
    ports: TemplateDepotBusRect[]
    sections: TemplateDepotBusRect[]
}

const DEPOT_BUS_PORT_SIZE = 4
const DEPOT_BUS_SECTION_BOTTOM_WIDTH = 8
const DEPOT_BUS_SECTION_BOTTOM_HEIGHT = 4
const DEPOT_BUS_SECTION_RIGHT_WIDTH = 4
const DEPOT_BUS_SECTION_RIGHT_HEIGHT = 8

function clampRange(value: number, max: number): number {
    if (value <= 0) return 0
    return Math.min(value, max)
}

function getTemplateDepotBusRanges(template: Immutable<FieldTemplate>, fieldWidth: number, fieldHeight: number): {
    bottomRange: { min: number, max: number } | null
    rightRange: { min: number, max: number } | null
} {
    const layout = template.depotBusLayout
    if (!layout) {
        return { bottomRange: null, rightRange: null }
    }

    const bottomCount = clampRange(layout.bottomSections, Math.floor(fieldWidth / DEPOT_BUS_SECTION_BOTTOM_WIDTH))
    const rightCount = clampRange(layout.rightSections ?? 0, Math.floor(fieldHeight / DEPOT_BUS_SECTION_RIGHT_HEIGHT))

    const bottomSpan = bottomCount * DEPOT_BUS_SECTION_BOTTOM_WIDTH + (layout.hasPort ? DEPOT_BUS_PORT_SIZE : 0)
    const rightSpan = rightCount * DEPOT_BUS_SECTION_RIGHT_HEIGHT + (layout.hasPort ? DEPOT_BUS_PORT_SIZE : 0)

    const bottomRange = bottomSpan > 0
        ? { min: Math.max(0, fieldWidth - bottomSpan), max: fieldWidth - 1 }
        : null
    const rightRange = rightSpan > 0
        ? { min: Math.max(0, fieldHeight - rightSpan), max: fieldHeight - 1 }
        : null

    return { bottomRange, rightRange }
}

export function getTemplateDepotBusCells(template: Immutable<FieldTemplate>, fieldWidth: number, fieldHeight: number): TemplateDepotBusCells {
    const layout = template.depotBusLayout
    if (!layout) {
        return { ports: [], sections: [] }
    }

    const cells: TemplateDepotBusCells = { ports: [], sections: [] }
    const bottomCount = clampRange(layout.bottomSections, Math.ceil(fieldWidth / DEPOT_BUS_SECTION_BOTTOM_WIDTH))
    const rightCount = clampRange(layout.rightSections ?? 0, Math.ceil(fieldHeight / DEPOT_BUS_SECTION_RIGHT_HEIGHT))

    if (layout.hasPort) {
        cells.ports.push({
            x: fieldWidth,
            y: fieldHeight,
            width: DEPOT_BUS_PORT_SIZE,
            height: DEPOT_BUS_PORT_SIZE,
        })
    }

    for (let i = 0; i < bottomCount; i += 1) {
        cells.sections.push({
            x: fieldWidth - (i + 1) * DEPOT_BUS_SECTION_BOTTOM_WIDTH,
            y: fieldHeight,
            width: DEPOT_BUS_SECTION_BOTTOM_WIDTH,
            height: DEPOT_BUS_SECTION_BOTTOM_HEIGHT,
        })
    }

    for (let i = 0; i < rightCount; i += 1) {
        cells.sections.push({
            x: fieldWidth,
            y: fieldHeight - (i + 1) * DEPOT_BUS_SECTION_RIGHT_HEIGHT,
            width: DEPOT_BUS_SECTION_RIGHT_WIDTH,
            height: DEPOT_BUS_SECTION_RIGHT_HEIGHT,
        })
    }

    return cells
}

function rangesOverlap(minA: number, maxA: number, minB: number, maxB: number): boolean {
    return minA <= maxB && maxA >= minB
}

function isFacilityAdjacentToTemplateBus(
    facility: Immutable<FieldFacility>,
    template: Immutable<FieldTemplate>,
    fieldState: Immutable<FieldState>,
    connectionSide: 'up' | 'down' | 'left' | 'right'
): boolean {
    const { bottomRange, rightRange } = getTemplateDepotBusRanges(template, fieldState.width, fieldState.height)

    if (connectionSide === 'down' && bottomRange) {
        const facilityBottom = facility.y + facility.height
        if (facilityBottom === fieldState.height) {
            const facilityMinX = facility.x
            const facilityMaxX = facility.x + facility.width - 1
            return rangesOverlap(facilityMinX, facilityMaxX, bottomRange.min, bottomRange.max)
        }
    }

    if (connectionSide === 'right' && rightRange) {
        const facilityRight = facility.x + facility.width
        if (facilityRight === fieldState.width) {
            const facilityMinY = facility.y
            const facilityMaxY = facility.y + facility.height - 1
            return rangesOverlap(facilityMinY, facilityMaxY, rightRange.min, rightRange.max)
        }
    }

    return false
}

function isFacilityAdjacentToBusFacilities(
    facility: Immutable<FieldFacility>,
    busFacilities: readonly Immutable<FieldFacility>[],
    connectionSide: 'up' | 'down' | 'left' | 'right'
): boolean {
    const facilityMinX = facility.x
    const facilityMaxX = facility.x + facility.width - 1
    const facilityMinY = facility.y
    const facilityMaxY = facility.y + facility.height - 1

    for (const bus of busFacilities) {
        const busMinX = bus.x
        const busMaxX = bus.x + bus.width - 1
        const busMinY = bus.y
        const busMaxY = bus.y + bus.height - 1

        if (connectionSide === 'up' && bus.y + bus.height === facility.y) {
            if (rangesOverlap(busMinX, busMaxX, facilityMinX, facilityMaxX)) {
                return true
            }
        }

        if (connectionSide === 'down' && bus.y === facility.y + facility.height) {
            if (rangesOverlap(busMinX, busMaxX, facilityMinX, facilityMaxX)) {
                return true
            }
        }

        if (connectionSide === 'left' && bus.x + bus.width === facility.x) {
            if (rangesOverlap(busMinY, busMaxY, facilityMinY, facilityMaxY)) {
                return true
            }
        }

        if (connectionSide === 'right' && bus.x === facility.x + facility.width) {
            if (rangesOverlap(busMinY, busMaxY, facilityMinY, facilityMaxY)) {
                return true
            }
        }
    }

    return false
}

function isFacilityAdjacentToDepotBus(
    facility: Immutable<FieldFacility>,
    fieldState: Immutable<FieldState>,
    template: Immutable<FieldTemplate>,
    busFacilities: readonly Immutable<FieldFacility>[]
): boolean {
    const facilityDef = facilities[facility.type]
    if (!facilityDef?.depotBusConnectionSide) {
        return true
    }

    const connectionSide = rotateDirection(facilityDef.depotBusConnectionSide, facility.rotation / 90)

    if (isFacilityAdjacentToTemplateBus(facility, template, fieldState, connectionSide)) {
        return true
    }

    return isFacilityAdjacentToBusFacilities(facility, busFacilities, connectionSide)
}

export function applyTemplateValidation(fieldState: Immutable<FieldState>): Immutable<FieldState> {
    const template = resolveFieldTemplate(fieldState.template)

    const busPortFacilities = fieldState.facilities.filter(entry => entry.type === FacilityID.DEPOT_BUS_PORT)
    const busSectionFacilities = fieldState.facilities.filter(entry => entry.type === FacilityID.DEPOT_BUS_SECTION)

    const allowedBusPortIds = new Set(busPortFacilities.slice(0, template.depotBusPortLimit).map(entry => entry.id))
    const allowedBusSectionIds = new Set(busSectionFacilities.slice(0, template.depotBusSectionLimit).map(entry => entry.id))

    const validBusFacilities = fieldState.facilities.filter(entry => {
        if (entry.type === FacilityID.DEPOT_BUS_PORT && !allowedBusPortIds.has(entry.id)) {
            return false
        }
        if (entry.type === FacilityID.DEPOT_BUS_SECTION && !allowedBusSectionIds.has(entry.id)) {
            return false
        }
        if (entry.errorFlags?.invalidPlacement || entry.errorFlags?.outOfBounds || entry.errorFlags?.invalidTemplate) {
            return false
        }
        const facilityDef = facilities[entry.type]
        if (facilityDef?.allowedRegions && !facilityDef.allowedRegions.includes(template.region)) {
            return false
        }
        return entry.type === FacilityID.DEPOT_BUS_PORT || entry.type === FacilityID.DEPOT_BUS_SECTION
    })

    const facilitiesWithTemplateErrors = fieldState.facilities.map(facility => {
        const facilityDef = facilities[facility.type]
        const allowedRegions = facilityDef?.allowedRegions
        const pipePortAllowedRegions = facilityDef?.pipePortsAllowedRegions

        const regionAllowed = !allowedRegions || allowedRegions.includes(template.region)
        const pipePortsAllowed = !pipePortAllowedRegions || pipePortAllowedRegions.includes(template.region)

        const isDepotBusPort = facility.type === FacilityID.DEPOT_BUS_PORT
        const isDepotBusSection = facility.type === FacilityID.DEPOT_BUS_SECTION
        const busWithinLimit = (!isDepotBusPort && !isDepotBusSection)
            || (isDepotBusPort && allowedBusPortIds.has(facility.id))
            || (isDepotBusSection && allowedBusSectionIds.has(facility.id))

        const hasPipePorts = Boolean(facilityDef?.pipeInputs || facilityDef?.pipeOutputs || facilityDef?.ports?.some(port => port[3] === 'pipe'))

        const invalidTemplate = !regionAllowed || !busWithinLimit || (hasPipePorts && !pipePortsAllowed)
        const invalidDepotBusConnection = facilityDef?.depotBusConnectionSide
            ? !isFacilityAdjacentToDepotBus(facility, fieldState, template, validBusFacilities)
            : false

        return {
            ...facility,
            errorFlags: {
                ...facility.errorFlags,
                invalidTemplate: invalidTemplate || undefined,
                invalidDepotBusConnection: invalidDepotBusConnection || undefined,
            }
        }
    })

    const fixturesWithTemplateErrors = fieldState.pathFixtures.map(fixture => {
        const fixtureDef = pathFixtures[fixture.type]
        const allowedRegions = fixtureDef?.allowedRegions
        const invalidTemplate = allowedRegions ? !allowedRegions.includes(template.region) : false

        return {
            ...fixture,
            errorFlags: {
                ...fixture.errorFlags,
                invalidTemplate: invalidTemplate || undefined,
            }
        }
    })

    const pathsWithTemplateErrors = fieldState.paths.map(path => {
        const allowedRegions = pathTypeAllowedRegions[path.type]
        const invalidTemplate = allowedRegions ? !allowedRegions.includes(template.region) : false

        return {
            ...path,
            errorFlags: {
                ...path.errorFlags,
                invalidTemplate: invalidTemplate || undefined,
            }
        }
    })

    return {
        ...fieldState,
        facilities: facilitiesWithTemplateErrors,
        pathFixtures: fixturesWithTemplateErrors,
        paths: pathsWithTemplateErrors,
    }
}
