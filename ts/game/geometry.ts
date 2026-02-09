import type { Direction } from "../types/data.ts"
import { FacilityID } from "../types/data.ts"
import type { Immutable } from "../utils/types.ts"
import type { FieldState, FieldFacility, FieldPath, FieldPathFixture } from "../types/field.ts"
import { getDirectionFromPoints } from "./directions.ts"
import { pathFixtures } from "../data/pathFixtures.ts"
import { PathTypeID } from "../types/data.ts"

export const MAX_OUT_OF_BOUNDS_RANGE = 10

const OUT_OF_BOUNDS_ALLOWED_FACILITIES = new Set<FacilityID>([
    FacilityID.FLUID_PUMP,
    FacilityID.FLUID_SUPPLY_UNIT,
    FacilityID.SPRINKLER
])

function isWithinExtendedBounds(
    x: number,
    y: number,
    width: number,
    height: number,
    fieldState: Immutable<FieldState>
): boolean {
    return x >= -MAX_OUT_OF_BOUNDS_RANGE &&
        y >= -MAX_OUT_OF_BOUNDS_RANGE &&
        x + width <= fieldState.width + MAX_OUT_OF_BOUNDS_RANGE &&
        y + height <= fieldState.height + MAX_OUT_OF_BOUNDS_RANGE
}

function isPointWithinExtendedBounds(
    x: number,
    y: number,
    fieldState: Immutable<FieldState>
): boolean {
    return isWithinExtendedBounds(x, y, 1, 1, fieldState)
}

/**
 * Check if an entity is within the field bounds.
 * @param x Entity x position
 * @param y Entity y position
 * @param width Entity width
 * @param height Entity height
 * @param fieldState Current field state
 * @returns True if entity is completely within bounds
 */
export function isInBounds(x: number, y: number, width: number, height: number, fieldState: Immutable<FieldState>): boolean {
    return x >= 0 && y >= 0 && x + width <= fieldState.width && y + height <= fieldState.height
}

/**
 * Check if two rectangular entities overlap (share any area, not just edges).
 * @param entity1 First entity with x, y, width, height
 * @param entity2 Second entity with x, y, width, height
 * @returns True if entities have area overlap
 */
export function doEntitiesOverlap(
    entity1: { x: number, y: number, width: number, height: number },
    entity2: { x: number, y: number, width: number, height: number }
): boolean {
    // Check if there's NO overlap, then negate
    // No overlap if one is completely to the left, right, above, or below the other
    const noOverlap = 
        entity1.x + entity1.width <= entity2.x ||  // entity1 is completely to the left
        entity2.x + entity2.width <= entity1.x ||  // entity2 is completely to the left
        entity1.y + entity1.height <= entity2.y || // entity1 is completely above
        entity2.y + entity2.height <= entity1.y    // entity2 is completely above
    
    return !noOverlap
}

/**
 * Check if a path segment overlaps with a rectangular entity.
 * @param segmentStart Start point of segment [x, y]
 * @param segmentEnd End point of segment [x, y]
 * @param entity Entity with x, y, width, height
 * @returns True if segment crosses through entity area
 */
export function doesPathSegmentOverlapEntity(
    segmentStart: Immutable<[number, number]>,
    segmentEnd: Immutable<[number, number]>,
    entity: { x: number, y: number, width: number, height: number }
): boolean {
    const [x1, y1] = segmentStart
    const [x2, y2] = segmentEnd
    
    // Ensure start is less than end for easier logic
    const minX = Math.min(x1, x2)
    const maxX = Math.max(x1, x2)
    const minY = Math.min(y1, y2)
    const maxY = Math.max(y1, y2)
    
    const entityMinX = entity.x
    const entityMaxX = entity.x + entity.width - 1
    const entityMinY = entity.y
    const entityMaxY = entity.y + entity.height - 1
    
    // Check if segment's bounding box overlaps entity
    // Segment overlaps if ranges intersect
    const xOverlap = minX <= entityMaxX && maxX >= entityMinX
    const yOverlap = minY <= entityMaxY && maxY >= entityMinY
    
    return xOverlap && yOverlap
}

/**
 * Get path segments as individual line segments with directions.
 * @param path Path to extract segments from
 * @returns Array of segments with from, to, and direction
 */
export function getPathSegments(path: Immutable<FieldPath>): Array<{ from: Immutable<[number, number]>, to: Immutable<[number, number]>, direction: Direction }> {
    const segments: Array<{ from: Immutable<[number, number]>, to: Immutable<[number, number]>, direction: Direction }> = []
    
    for (let i = 0; i < path.points.length - 1; i++) {
        const from = path.points[i]
        const to = path.points[i + 1]
        const direction = getDirectionFromPoints(from, to)
        
        if (direction !== null) {
            segments.push({ from, to, direction })
        }
    }
    
    return segments
}

/**
 * Validate that a path has valid geometry (cardinal-aligned segments).
 * @param path Path to validate
 * @returns True if geometry is valid
 */
export function validatePathGeometry(path: Immutable<FieldPath>): boolean {
    if (path.points.length < 2) {
        return false
    }
    
    for (let i = 0; i < path.points.length - 1; i++) {
        const dir = getDirectionFromPoints(path.points[i], path.points[i + 1])
        if (dir === null) {
            return false
        }
    }
    
    return true
}

/**
 * Validate facility placement within field.
 * @param facility Facility to validate
 * @param fieldState Current field state
 * @returns Object with error flags
 */
export function validateFacilityPlacement(
    facility: Immutable<FieldFacility>,
    fieldState: Immutable<FieldState>
): { outOfBounds?: boolean, invalidPlacement?: boolean } {
    const errors: { outOfBounds?: boolean, invalidPlacement?: boolean } = {}
    
    // Check bounds
    if (!isInBounds(facility.x, facility.y, facility.width, facility.height, fieldState)) {
        const canBeOutOfBounds = OUT_OF_BOUNDS_ALLOWED_FACILITIES.has(facility.type)
        if (!canBeOutOfBounds || !isWithinExtendedBounds(facility.x, facility.y, facility.width, facility.height, fieldState)) {
            errors.outOfBounds = true
        }
    }
    
    // Check overlap with other facilities
    for (const other of fieldState.facilities) {
        if (other.id !== facility.id && doEntitiesOverlap(facility, other)) {
            errors.invalidPlacement = true
            break
        }
    }
    
    // Check overlap with fixtures
    if (!errors.invalidPlacement) {
        for (const fixture of fieldState.pathFixtures) {
            if (doEntitiesOverlap(facility, fixture)) {
                errors.invalidPlacement = true
                break
            }
        }
    }
    
    return errors
}

/**
 * Validate path fixture placement within field.
 * @param fixture Fixture to validate
 * @param fieldState Current field state
 * @returns Object with error flags
 */
export function validateFixturePlacement(
    fixture: Immutable<FieldPathFixture>,
    fieldState: Immutable<FieldState>
): { outOfBounds?: boolean, invalidPlacement?: boolean } {
    const errors: { outOfBounds?: boolean, invalidPlacement?: boolean } = {}

    const fixtureDef = pathFixtures[fixture.type]
    
    // Check bounds
    if (!isInBounds(fixture.x, fixture.y, fixture.width, fixture.height, fieldState)) {
        errors.outOfBounds = true
    }
    
    // Check overlap with facilities
    for (const facility of fieldState.facilities) {
        if (doEntitiesOverlap(fixture, facility)) {
            errors.invalidPlacement = true
            break
        }
    }
    
    // Check overlap with other fixtures
    if (!errors.invalidPlacement) {
        for (const other of fieldState.pathFixtures) {
            if (other.id !== fixture.id && doEntitiesOverlap(fixture, other)) {
                errors.invalidPlacement = true
                break
            }
        }
    }

    // Pipe fixtures cannot overlap belt paths
    if (!errors.invalidPlacement && fixtureDef.pathType === PathTypeID.PIPE) {
        for (const path of fieldState.paths) {
            if (path.type !== PathTypeID.BELT) continue
            const segments = getPathSegments(path)
            for (const segment of segments) {
                if (doesPathSegmentOverlapEntity(segment.from, segment.to, fixture)) {
                    errors.invalidPlacement = true
                    break
                }
            }
            if (errors.invalidPlacement) {
                break
            }
        }
    }
    
    return errors
}

/**
 * Validate path placement within field.
 * @param path Path to validate
 * @param fieldState Current field state
 * @returns Object with error flags
 */
export function validatePathPlacement(
    path: Immutable<FieldPath>,
    fieldState: Immutable<FieldState>
): { invalidLayout?: boolean, invalidPlacement?: boolean } {
    const errors: { invalidLayout?: boolean, invalidPlacement?: boolean } = {}
    
    // Check geometry
    if (!validatePathGeometry(path)) {
        errors.invalidLayout = true
        return errors // Don't check placement if geometry is invalid
    }

    // Check bounds (belts must be in-bounds, pipes can extend within MAX_OUT_OF_BOUNDS_RANGE)
    for (const [x, y] of path.points) {
        const inBounds = x >= 0 && y >= 0 && x < fieldState.width && y < fieldState.height
        if (path.type === PathTypeID.BELT) {
            if (!inBounds) {
                errors.invalidPlacement = true
                return errors
            }
        } else if (!isPointWithinExtendedBounds(x, y, fieldState)) {
            errors.invalidPlacement = true
            return errors
        }
    }
    
    const segments = getPathSegments(path)
    const startPoint = path.points[0]
    const endPoint = path.points[path.points.length - 1]
    
    // Check overlap with facilities (except at connection points)
    for (const facility of fieldState.facilities) {
        for (const segment of segments) {
            // Check if this segment overlaps the facility
            if (doesPathSegmentOverlapEntity(segment.from, segment.to, facility)) {
                // Check if either endpoint is a valid connection point
                // If the path has connection refs, those endpoints are valid
                const startIsConnectedToThisFacility = 
                    path.startConnectedTo?.type === 'facility' && 
                    path.startConnectedTo.facilityID === facility.id
                const endIsConnectedToThisFacility = 
                    path.endConnectedTo?.type === 'facility' && 
                    path.endConnectedTo.facilityID === facility.id
                
                // Also check if path endpoint is within facility bounds (potential connection point)
                // even if connection ref isn't set yet
                const startWithinFacility = 
                    startPoint[0] >= facility.x && startPoint[0] < facility.x + facility.width &&
                    startPoint[1] >= facility.y && startPoint[1] < facility.y + facility.height
                const endWithinFacility =
                    endPoint[0] >= facility.x && endPoint[0] < facility.x + facility.width &&
                    endPoint[1] >= facility.y && endPoint[1] < facility.y + facility.height
                
                const isValidConnection = startIsConnectedToThisFacility || endIsConnectedToThisFacility ||
                                         startWithinFacility || endWithinFacility
                
                if (!isValidConnection) {
                    errors.invalidPlacement = true
                    return errors
                }
            }
        }
    }
    
    // Check overlap with fixtures (belt paths cannot overlap pipe fixtures)
    for (const fixture of fieldState.pathFixtures) {
        const fixtureDef = pathFixtures[fixture.type]
        if (path.type === PathTypeID.PIPE && fixtureDef.pathType === PathTypeID.BELT) {
            continue
        }
        for (const segment of segments) {
            if (doesPathSegmentOverlapEntity(segment.from, segment.to, fixture)) {
                if (path.type === PathTypeID.BELT && fixtureDef.pathType === PathTypeID.PIPE) {
                    errors.invalidPlacement = true
                    return errors
                }
                // Check if either endpoint is connected to this fixture
                const startIsConnectedToThisFixture = 
                    path.startConnectedTo?.type === 'fixture' && 
                    path.startConnectedTo.fixtureID === fixture.id
                const endIsConnectedToThisFixture = 
                    path.endConnectedTo?.type === 'fixture' && 
                    path.endConnectedTo.fixtureID === fixture.id
                
                // Also check if a path endpoint matches the fixture position exactly
                // (this handles cases where connection refs haven't been set yet)
                const startPointMatchesFixture = 
                    startPoint[0] === fixture.x && startPoint[1] === fixture.y
                const endPointMatchesFixture = 
                    endPoint[0] === fixture.x && endPoint[1] === fixture.y
                
                const isValidConnection = startIsConnectedToThisFixture || endIsConnectedToThisFixture ||
                                         startPointMatchesFixture || endPointMatchesFixture
                
                if (!isValidConnection) {
                    errors.invalidPlacement = true
                    return errors
                }
            }
        }
    }
    
    // Check overlap with other paths of the same type
    for (const other of fieldState.paths) {
        if (other.id === path.id) continue
        if (other.type !== path.type) continue

        const otherSegments = getPathSegments(other)

        for (const segment of segments) {
            for (const otherSegment of otherSegments) {
                // Check if segments overlap using proper line segment intersection
                if (doPathSegmentsOverlap(segment.from, segment.to, otherSegment.from, otherSegment.to)) {
                    // Check if they only overlap at a single point (shared endpoint)
                    // and if there's a fixture at that point
                    const sharedPoint = findSharedEndpoint(segment.from, segment.to, otherSegment.from, otherSegment.to)
                    if (sharedPoint) {
                        const fixtureAtPoint = fieldState.pathFixtures.find(f => 
                            f.x === sharedPoint[0] && f.y === sharedPoint[1]
                        )
                        if (fixtureAtPoint) {
                            // This is a valid connection through a fixture, not an error
                            continue
                        }
                    }

                    errors.invalidPlacement = true
                    return errors
                }
            }
        }
    }
    
    return errors
}

/**
 * Find if two segments share exactly one endpoint.
 * @param seg1Start Start point of first segment
 * @param seg1End End point of first segment
 * @param seg2Start Start point of second segment
 * @param seg2End End point of second segment
 * @returns Shared endpoint or null if they don't share exactly one endpoint
 */
function findSharedEndpoint(
    seg1Start: readonly [number, number],
    seg1End: readonly [number, number],
    seg2Start: readonly [number, number],
    seg2End: readonly [number, number]
): readonly [number, number] | null {
    if (seg1Start[0] === seg2Start[0] && seg1Start[1] === seg2Start[1]) {
        return seg1Start
    }
    if (seg1Start[0] === seg2End[0] && seg1Start[1] === seg2End[1]) {
        return seg1Start
    }
    if (seg1End[0] === seg2Start[0] && seg1End[1] === seg2Start[1]) {
        return seg1End
    }
    if (seg1End[0] === seg2End[0] && seg1End[1] === seg2End[1]) {
        return seg1End
    }
    return null
}

/**
 * Check if two path segments overlap.
 * Path segments are axis-aligned line segments (horizontal or vertical).
 * Two segments overlap if they share any cells.
 * @param seg1Start Start point of first segment
 * @param seg1End End point of first segment
 * @param seg2Start Start point of second segment
 * @param seg2End End point of second segment
 * @returns True if segments overlap
 */
function doPathSegmentsOverlap(
    seg1Start: readonly [number, number],
    seg1End: readonly [number, number],
    seg2Start: readonly [number, number],
    seg2End: readonly [number, number]
): boolean {
    // Normalize segments so start is always less than or equal to end
    const [x1Min, x1Max] = [Math.min(seg1Start[0], seg1End[0]), Math.max(seg1Start[0], seg1End[0])]
    const [y1Min, y1Max] = [Math.min(seg1Start[1], seg1End[1]), Math.max(seg1Start[1], seg1End[1])]
    const [x2Min, x2Max] = [Math.min(seg2Start[0], seg2End[0]), Math.max(seg2Start[0], seg2End[0])]
    const [y2Min, y2Max] = [Math.min(seg2Start[1], seg2End[1]), Math.max(seg2Start[1], seg2End[1])]
    
    // Determine orientation of each segment
    const seg1IsHorizontal = y1Min === y1Max
    const seg2IsHorizontal = y2Min === y2Max
    
    if (seg1IsHorizontal && seg2IsHorizontal) {
        // Both horizontal - check if they're on the same row and overlap in X
        if (y1Min === y2Min) {
            // Check for X overlap
            return x1Max >= x2Min && x2Max >= x1Min
        }
        return false
    } else if (!seg1IsHorizontal && !seg2IsHorizontal) {
        // Both vertical - check if they're in the same column and overlap in Y
        if (x1Min === x2Min) {
            // Check for Y overlap
            return y1Max >= y2Min && y2Max >= y1Min
        }
        return false
    } else {
        // One horizontal, one vertical - check for intersection
        if (seg1IsHorizontal) {
            // seg1 horizontal, seg2 vertical
            // Check if seg2's X coordinate falls within seg1's X range
            // AND seg1's Y coordinate falls within seg2's Y range
            return (x2Min >= x1Min && x2Min <= x1Max) &&
                   (y1Min >= y2Min && y1Min <= y2Max)
        } else {
            // seg1 vertical, seg2 horizontal
            return (x1Min >= x2Min && x1Min <= x2Max) &&
                   (y2Min >= y1Min && y2Min <= y1Max)
        }
    }
}

/**
 * Check if a point lies on a path segment (exclusive of endpoints).
 * @param point Point to check [x, y]
 * @param segmentStart Start point of segment
 * @param segmentEnd End point of segment
 * @returns True if point is on the segment (not at endpoints)
 */
export function isPointOnSegment(
    point: readonly [number, number],
    segmentStart: readonly [number, number],
    segmentEnd: readonly [number, number]
): boolean {
    const [px, py] = point
    const [x1, y1] = segmentStart
    const [x2, y2] = segmentEnd
    
    // Check if segment is horizontal or vertical
    const isHorizontal = y1 === y2
    const isVertical = x1 === x2
    
    if (!isHorizontal && !isVertical) {
        // Not an axis-aligned segment
        return false
    }
    
    if (isHorizontal) {
        // Check if point is on the same row and within X range (exclusive)
        const minX = Math.min(x1, x2)
        const maxX = Math.max(x1, x2)
        return py === y1 && px > minX && px < maxX
    } else {
        // Vertical segment
        const minY = Math.min(y1, y2)
        const maxY = Math.max(y1, y2)
        return px === x1 && py > minY && py < maxY
    }
}

/**
 * Find which segment of a path contains a given point, if any.
 * @param point Point to check
 * @param path Path to search
 * @returns Segment index if found, or null if point is not on any segment
 */
export function findSegmentContainingPoint(
    point: readonly [number, number],
    path: Immutable<FieldPath>
): number | null {
    const segments = getPathSegments(path)
    
    // Check if point is a corner (interior point, not endpoints)
    for (let i = 1; i < path.points.length - 1; i++) {
        const pt = path.points[i]
        if (pt[0] === point[0] && pt[1] === point[1]) {
            // Return the segment before this corner
            return i - 1
        }
    }
    // Fallback: check if point is on a segment (not endpoints)
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]
        if (isPointOnSegment(point, segment.from, segment.to)) {
            return i
        }
    }
    return null
}

/**
 * Check if two path segments cross each other perpendicularly at a single point.
 * @param seg1Start Start point of first segment
 * @param seg1End End point of first segment
 * @param seg2Start Start point of second segment
 * @param seg2End End point of second segment
 * @returns Crossing point [x, y] if segments cross perpendicularly, null otherwise
 */
export function findPerpendicularCrossing(
    seg1Start: readonly [number, number],
    seg1End: readonly [number, number],
    seg2Start: readonly [number, number],
    seg2End: readonly [number, number]
): [number, number] | null {
    const [x1Min, x1Max] = [Math.min(seg1Start[0], seg1End[0]), Math.max(seg1Start[0], seg1End[0])]
    const [y1Min, y1Max] = [Math.min(seg1Start[1], seg1End[1]), Math.max(seg1Start[1], seg1End[1])]
    const [x2Min, x2Max] = [Math.min(seg2Start[0], seg2End[0]), Math.max(seg2Start[0], seg2End[0])]
    const [y2Min, y2Max] = [Math.min(seg2Start[1], seg2End[1]), Math.max(seg2Start[1], seg2End[1])]
    
    const seg1IsHorizontal = y1Min === y1Max
    const seg2IsHorizontal = y2Min === y2Max
    
    // Must be perpendicular (one horizontal, one vertical)
    if (seg1IsHorizontal === seg2IsHorizontal) {
        return null
    }
    
    if (seg1IsHorizontal) {
        // seg1 horizontal, seg2 vertical
        const crossX = x2Min // X coordinate of vertical segment
        const crossY = y1Min // Y coordinate of horizontal segment
        
        // Check if crossing point is within both segments (exclusive of endpoints)
        if (crossX > x1Min && crossX < x1Max && crossY > y2Min && crossY < y2Max) {
            return [crossX, crossY]
        }
    } else {
        // seg1 vertical, seg2 horizontal
        const crossX = x1Min // X coordinate of vertical segment
        const crossY = y2Min // Y coordinate of horizontal segment
        
        // Check if crossing point is within both segments (exclusive of endpoints)
        if (crossX > x2Min && crossX < x2Max && crossY > y1Min && crossY < y1Max) {
            return [crossX, crossY]
        }
    }
    
    return null
}
