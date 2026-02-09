import type { Immutable } from "../utils/types.ts"
import type { FieldState, FieldFacility, FieldPath, FieldPathFixture, UserChange } from "../types/field.ts"

/**
 * Calculate the bounding box of a set of entities (facilities, fixtures, paths).
 * Returns min/max coordinates that encompass all selected entities.
 */
export function calculateSelectionBounds(
    fieldState: Immutable<FieldState>,
    selectedIDs: ReadonlySet<string>
): { minX: number, minY: number, maxX: number, maxY: number } | null {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    let hasAny = false

    for (const id of selectedIDs) {
        const facility = fieldState.facilities.find(f => f.id === id)
        if (facility) {
            hasAny = true
            minX = Math.min(minX, facility.x)
            minY = Math.min(minY, facility.y)
            maxX = Math.max(maxX, facility.x + facility.width)
            maxY = Math.max(maxY, facility.y + facility.height)
            continue
        }

        const fixture = fieldState.pathFixtures.find(f => f.id === id)
        if (fixture) {
            hasAny = true
            minX = Math.min(minX, fixture.x)
            minY = Math.min(minY, fixture.y)
            maxX = Math.max(maxX, fixture.x + 1)
            maxY = Math.max(maxY, fixture.y + 1)
            continue
        }

        const path = fieldState.paths.find(p => p.id === id)
        if (path) {
            hasAny = true
            for (const [x, y] of path.points) {
                minX = Math.min(minX, x)
                minY = Math.min(minY, y)
                maxX = Math.max(maxX, x + 1)
                maxY = Math.max(maxY, y + 1)
            }
        }
    }

    if (!hasAny) {
        return null
    }

    return { minX, minY, maxX, maxY }
}

/**
 * Calculate the center point for rotation.
 * Uses floor division to ensure consistent integer coordinates.
 */
export function calculateRotationCenter(bounds: {
    minX: number
    minY: number
    maxX: number
    maxY: number
}): [number, number] {
    // Use the geometric center, floored to ensure consistency
    // This gives us a stable, reproducible center point
    const centerX = Math.floor((bounds.minX + bounds.maxX) / 2)
    const centerY = Math.floor((bounds.minY + bounds.maxY) / 2)
    return [centerX, centerY]
}

/**
 * Rotate a point 90 degrees clockwise around a center point.
 * Uses integer math: new_x = cx + (old_y - cy), new_y = cy - (old_x - cx)
 */
export function rotatePointClockwise(
    point: Immutable<[number, number]>,
    center: Immutable<[number, number]>
): [number, number] {
    const [x, y] = point
    const [cx, cy] = center
    const relX = x - cx
    const relY = y - cy
    return [cx + relY, cy - relX]
}

/**
 * Rotate a point 90 degrees counter-clockwise around a center point.
 * Uses integer math: new_x = cx - (old_y - cy), new_y = cy + (old_x - cx)
 */
export function rotatePointCounterClockwise(
    point: Immutable<[number, number]>,
    center: Immutable<[number, number]>
): [number, number] {
    const [x, y] = point
    const [cx, cy] = center
    const relX = x - cx
    const relY = y - cy
    return [cx - relY, cy + relX]
}

/**
 * Generate UserChange objects to rotate a facility around a center point.
 * Updates both position and rotation.
 * 
 * Rotates all corners to find the new top-left, ensuring paths stay connected to ports.
 */
export function rotateFacility(
    facility: Immutable<FieldFacility>,
    center: [number, number],
    clockwise: boolean
): UserChange[] {
    // Calculate all four corners of the facility
    const topLeft: [number, number] = [facility.x, facility.y]
    const topRight: [number, number] = [facility.x + facility.width - 1, facility.y]
    const bottomLeft: [number, number] = [facility.x, facility.y + facility.height - 1]
    const bottomRight: [number, number] = [facility.x + facility.width - 1, facility.y + facility.height - 1]
    
    // Rotate all corners
    const rotatedCorners = [topLeft, topRight, bottomLeft, bottomRight].map(corner =>
        clockwise
            ? rotatePointClockwise(corner, center)
            : rotatePointCounterClockwise(corner, center)
    )
    
    // Find the new top-left (minimum x and y among all rotated corners)
    const newTopLeftX = Math.min(...rotatedCorners.map(c => c[0]))
    const newTopLeftY = Math.min(...rotatedCorners.map(c => c[1]))
    
    const finalX = newTopLeftX
    const finalY = newTopLeftY

    // Calculate new rotation
    const newRotation = (facility.rotation + (clockwise ? 90 : 270)) % 360

    const changes: UserChange[] = []

    // Move to new position
    if (finalX !== facility.x || finalY !== facility.y) {
        changes.push({
            type: 'move-facility',
            facilityID: facility.id,
            newPosition: [finalX, finalY]
        })
    }

    // Rotate (which will swap dimensions in the change handler)
    if (newRotation !== facility.rotation) {
        changes.push({
            type: 'rotate-facility',
            facilityID: facility.id,
            newRotation
        })
    }

    return changes
}

/**
 * Generate UserChange objects to rotate a path fixture around a center point.
 * Updates both position and rotation.
 */
export function rotatePathFixture(
    fixture: Immutable<FieldPathFixture>,
    center: [number, number],
    clockwise: boolean
): UserChange[] {
    // Calculate fixture's position after rotation
    const position: [number, number] = [fixture.x, fixture.y]
    const newPosition = clockwise
        ? rotatePointClockwise(position, center)
        : rotatePointCounterClockwise(position, center)

    // Calculate new rotation
    const newRotation = (fixture.rotation + (clockwise ? 90 : 270)) % 360

    const changes: UserChange[] = []

    // Move to new position
    if (newPosition[0] !== fixture.x || newPosition[1] !== fixture.y) {
        changes.push({
            type: 'move-path-fixture',
            fixtureID: fixture.id,
            newPosition
        })
    }

    // Rotate
    if (newRotation !== fixture.rotation) {
        changes.push({
            type: 'rotate-path-fixture',
            fixtureID: fixture.id,
            newRotation
        })
    }

    return changes
}

/**
 * Generate UserChange objects to rotate a path around a center point.
 * Updates all path points.
 */
export function rotatePath(
    path: Immutable<FieldPath>,
    center: [number, number],
    clockwise: boolean
): UserChange[] {
    // Rotate all points
    const newPoints = path.points.map(point =>
        clockwise
            ? rotatePointClockwise(point, center)
            : rotatePointCounterClockwise(point, center)
    )

    // Check if any points changed
    const hasChanges = newPoints.some((newPoint, i) =>
        newPoint[0] !== path.points[i][0] || newPoint[1] !== path.points[i][1]
    )

    if (!hasChanges) {
        return []
    }

    return [{
        type: 'update-path-points',
        pathID: path.id,
        points: newPoints
    }]
}

/**
 * Generate UserChange objects to rotate all selected entities around their collective center.
 * This treats the selection as a "blueprint" that rotates as a unit.
 */
export function rotateSelection(
    fieldState: Immutable<FieldState>,
    selectedIDs: ReadonlySet<string>,
    clockwise: boolean
): UserChange[] {
    // Calculate bounding box of selection
    const bounds = calculateSelectionBounds(fieldState, selectedIDs)
    if (!bounds) {
        return []
    }

    // Calculate rotation center
    const center = calculateRotationCenter(bounds)

    // Generate changes for each selected entity
    const changes: UserChange[] = []

    for (const id of selectedIDs) {
        const facility = fieldState.facilities.find(f => f.id === id)
        if (facility) {
            changes.push(...rotateFacility(facility, center, clockwise))
            continue
        }

        const fixture = fieldState.pathFixtures.find(f => f.id === id)
        if (fixture) {
            changes.push(...rotatePathFixture(fixture, center, clockwise))
            continue
        }

        const path = fieldState.paths.find(p => p.id === id)
        if (path) {
            changes.push(...rotatePath(path, center, clockwise))
        }
    }

    return changes
}
