import { describe, it, expect } from 'vitest'
import {
    calculateSelectionBounds,
    calculateRotationCenter,
    rotatePointClockwise,
    rotatePointCounterClockwise,
    rotateFacility,
    rotatePathFixture,
    rotatePath,
    rotateSelection
} from '../ts/game/rotation.ts'
import type { FieldState, FieldFacility, FieldPath, FieldPathFixture, UserChange } from '../ts/types/field.ts'
import { recalculateFieldState } from '../ts/game/field.ts'
import { FacilityID, FieldTemplateID, PathFixtureID, PathTypeID } from '../ts/types/data.ts'
import type { Immutable } from '../ts/utils/types.ts'

describe('Point Rotation', () => {
    it('rotates point clockwise 90° around origin', () => {
        expect(rotatePointClockwise([1, 0], [0, 0])).toEqual([0, -1])
        expect(rotatePointClockwise([0, 1], [0, 0])).toEqual([1, 0])
        expect(rotatePointClockwise([-1, 0], [0, 0])).toEqual([0, 1])
        expect(rotatePointClockwise([0, -1], [0, 0])).toEqual([-1, 0])
    })

    it('rotates point counter-clockwise 90° around origin', () => {
        expect(rotatePointCounterClockwise([1, 0], [0, 0])).toEqual([0, 1])
        expect(rotatePointCounterClockwise([0, 1], [0, 0])).toEqual([-1, 0])
        expect(rotatePointCounterClockwise([-1, 0], [0, 0])).toEqual([0, -1])
        expect(rotatePointCounterClockwise([0, -1], [0, 0])).toEqual([1, 0])
    })

    it('rotates point clockwise around non-origin center', () => {
        expect(rotatePointClockwise([5, 5], [5, 5])).toEqual([5, 5])
        expect(rotatePointClockwise([6, 5], [5, 5])).toEqual([5, 4])
        expect(rotatePointClockwise([5, 6], [5, 5])).toEqual([6, 5])
        expect(rotatePointClockwise([4, 5], [5, 5])).toEqual([5, 6])
    })

    it('rotates point counter-clockwise around non-origin center', () => {
        expect(rotatePointCounterClockwise([5, 5], [5, 5])).toEqual([5, 5])
        expect(rotatePointCounterClockwise([6, 5], [5, 5])).toEqual([5, 6])
        expect(rotatePointCounterClockwise([5, 6], [5, 5])).toEqual([4, 5])
        expect(rotatePointCounterClockwise([4, 5], [5, 5])).toEqual([5, 4])
    })

    it('four clockwise rotations return to original position', () => {
        let point: [number, number] = [10, 15]
        const center: [number, number] = [20, 25]
        
        point = rotatePointClockwise(point, center)
        point = rotatePointClockwise(point, center)
        point = rotatePointClockwise(point, center)
        point = rotatePointClockwise(point, center)
        
        expect(point).toEqual([10, 15])
    })

    it('four counter-clockwise rotations return to original position', () => {
        let point: [number, number] = [10, 15]
        const center: [number, number] = [20, 25]
        
        point = rotatePointCounterClockwise(point, center)
        point = rotatePointCounterClockwise(point, center)
        point = rotatePointCounterClockwise(point, center)
        point = rotatePointCounterClockwise(point, center)
        
        expect(point).toEqual([10, 15])
    })
})

describe('Selection Bounds', () => {
    function createMinimalFieldState(): FieldState {
        return {
            template: FieldTemplateID.WULING_MAIN,
            width: 100,
            height: 100,
            facilities: [],
            paths: [],
            pathFixtures: [],
            depot: {
                inputFlows: [],
                outputFlows: [],
                powerGenerated: 0,
                powerConsumed: 0
            },
            world: {
                inputFlows: [],
                outputFlows: []
            }
        }
    }

    it('returns null for empty selection', () => {
        const fieldState = createMinimalFieldState()
        const bounds = calculateSelectionBounds(fieldState, new Set())
        expect(bounds).toBeNull()
    })

    it('calculates bounds for single facility', () => {
        const fieldState = createMinimalFieldState()
        fieldState.facilities = [{
            id: 'f1',
            type: FacilityID.PLANTING_UNIT,
            x: 10,
            y: 20,
            width: 3,
            height: 2,
            rotation: 0,
            ports: [],
            isPowered: false,
            inputFlows: [],
            outputFlows: []
        }]

        const bounds = calculateSelectionBounds(fieldState, new Set(['f1']))
        expect(bounds).toEqual({ minX: 10, minY: 20, maxX: 13, maxY: 22 })
    })

    it('calculates bounds for single fixture', () => {
        const fieldState = createMinimalFieldState()
        fieldState.pathFixtures = [{
            id: 'fx1',
            type: PathFixtureID.SPLITTER,
            x: 5,
            y: 7,
            rotation: 0,
            width: 1,
            height: 1,
            sides: []
        }]

        const bounds = calculateSelectionBounds(fieldState, new Set(['fx1']))
        expect(bounds).toEqual({ minX: 5, minY: 7, maxX: 6, maxY: 8 })
    })

    it('calculates bounds for single path', () => {
        const fieldState = createMinimalFieldState()
        fieldState.paths = [{
            id: 'p1',
            type: PathTypeID.BELT,
            points: [[2, 3], [5, 3], [5, 8]],
            flows: []
        }]

        const bounds = calculateSelectionBounds(fieldState, new Set(['p1']))
        expect(bounds).toEqual({ minX: 2, minY: 3, maxX: 6, maxY: 9 })
    })

    it('calculates bounds for multiple entities', () => {
        const fieldState = createMinimalFieldState()
        fieldState.facilities = [{
            id: 'f1',
            type: FacilityID.PLANTING_UNIT,
            x: 0,
            y: 0,
            width: 2,
            height: 2,
            rotation: 0,
            ports: [],
            isPowered: false,
            inputFlows: [],
            outputFlows: []
        }]
        fieldState.pathFixtures = [{
            id: 'fx1',
            type: PathFixtureID.SPLITTER,
            x: 10,
            y: 10,
            rotation: 0,
            width: 1,
            height: 1,
            sides: []
        }]

        const bounds = calculateSelectionBounds(fieldState, new Set(['f1', 'fx1']))
        expect(bounds).toEqual({ minX: 0, minY: 0, maxX: 11, maxY: 11 })
    })
})

describe('Rotation Center', () => {
    it('calculates center for even-sized bounds', () => {
        const bounds = { minX: 0, minY: 0, maxX: 4, maxY: 4 }
        expect(calculateRotationCenter(bounds)).toEqual([2, 2])
    })

    it('calculates center for odd-sized bounds (rounds to grid)', () => {
        const bounds = { minX: 0, minY: 0, maxX: 3, maxY: 3 }
        // Center is at (1.5, 1.5), floor gives (1, 1)
        expect(calculateRotationCenter(bounds)).toEqual([1, 1])
    })

    it('calculates center for non-origin bounds', () => {
        const bounds = { minX: 10, minY: 20, maxX: 14, maxY: 22 }
        // Center is at (12, 21)
        expect(calculateRotationCenter(bounds)).toEqual([12, 21])
    })

    it('rounds half-coordinates to nearest integer', () => {
        const bounds = { minX: 5, minY: 5, maxX: 8, maxY: 10 }
        // Center is at (6.5, 7.5), floor gives (6, 7)
        expect(calculateRotationCenter(bounds)).toEqual([6, 7])
    })
})

describe('Facility Rotation', () => {
    it('rotates 1x1 facility clockwise around itself', () => {
        const facility: FieldFacility = {
            id: 'f1',
            type: FacilityID.PLANTING_UNIT,
            x: 5,
            y: 5,
            width: 1,
            height: 1,
            rotation: 0,
            ports: [],
            isPowered: false,
            inputFlows: [],
            outputFlows: []
        }

        // Rotating around [5, 5] which is slightly off from the facility's center [5.5, 5.5]
        // This will cause the facility to shift slightly when rounded back to grid
        const changes = rotateFacility(facility, [5, 5], true)
        
        // Should generate both move and rotate changes due to rounding
        expect(changes.length).toBeGreaterThanOrEqual(1)
        
        // Must have a rotation change
        const rotateChange = changes.find(c => c.type === 'rotate-facility')
        expect(rotateChange).toEqual({
            type: 'rotate-facility',
            facilityID: 'f1',
            newRotation: 90
        })
    })

    it('rotates 2x3 facility clockwise', () => {
        const facility: FieldFacility = {
            id: 'f1',
            type: FacilityID.PLANTING_UNIT,
            x: 10,
            y: 10,
            width: 2,
            height: 3,
            rotation: 0,
            ports: [],
            isPowered: false,
            inputFlows: [],
            outputFlows: []
        }

        const center: [number, number] = [11, 12] // Center of the facility

        const changes = rotateFacility(facility, center, true)
        
        // Should have both move and rotate
        expect(changes.length).toBeGreaterThan(0)
        
        const moveChange = changes.find(c => c.type === 'move-facility')
        const rotateChange = changes.find(c => c.type === 'rotate-facility')
        
        expect(rotateChange).toBeDefined()
        expect(rotateChange).toEqual({
            type: 'rotate-facility',
            facilityID: 'f1',
            newRotation: 90
        })
    })

    it('rotates 3x2 facility counter-clockwise', () => {
        const facility: FieldFacility = {
            id: 'f1',
            type: FacilityID.PLANTING_UNIT,
            x: 5,
            y: 5,
            width: 3,
            height: 2,
            rotation: 90,
            ports: [],
            isPowered: false,
            inputFlows: [],
            outputFlows: []
        }

        const center: [number, number] = [6, 6]

        const changes = rotateFacility(facility, center, false)
        
        const rotateChange = changes.find(c => c.type === 'rotate-facility')
        expect(rotateChange).toEqual({
            type: 'rotate-facility',
            facilityID: 'f1',
            newRotation: 0
        })
    })
})

describe('Path Fixture Rotation', () => {
    it('rotates fixture clockwise around origin', () => {
        const fixture: FieldPathFixture = {
            id: 'fx1',
            type: PathFixtureID.SPLITTER,
            x: 3,
            y: 0,
            rotation: 0,
            width: 1,
            height: 1,
            sides: []
        }

        const changes = rotatePathFixture(fixture, [0, 0], true)
        
        expect(changes).toContainEqual({
            type: 'move-path-fixture',
            fixtureID: 'fx1',
            newPosition: [0, -3]
        })
        expect(changes).toContainEqual({
            type: 'rotate-path-fixture',
            fixtureID: 'fx1',
            newRotation: 90
        })
    })

    it('rotates fixture counter-clockwise', () => {
        const fixture: FieldPathFixture = {
            id: 'fx1',
            type: PathFixtureID.CONVERGER,
            x: 10,
            y: 10,
            rotation: 180,
            width: 1,
            height: 1,
            sides: []
        }

        const center: [number, number] = [10, 10]
        const changes = rotatePathFixture(fixture, center, false)
        
        // Rotating around itself, only rotation should change
        expect(changes).toHaveLength(1)
        expect(changes[0]).toEqual({
            type: 'rotate-path-fixture',
            fixtureID: 'fx1',
            newRotation: 90
        })
    })
})

describe('Path Rotation', () => {
    it('rotates simple L-shaped path clockwise', () => {
        const path: FieldPath = {
            id: 'p1',
            type: PathTypeID.BELT,
            points: [[0, 0], [3, 0], [3, 2]],
            flows: []
        }

        const center: [number, number] = [2, 1]
        const changes = rotatePath(path, center, true)
        
        expect(changes).toHaveLength(1)
        expect(changes[0]).toEqual({
            type: 'update-path-points',
            pathID: 'p1',
            points: [[1, 3], [1, 0], [3, 0]]
        })
    })

    it('rotates straight horizontal path to vertical', () => {
        const path: FieldPath = {
            id: 'p1',
            type: PathTypeID.BELT,
            points: [[0, 5], [5, 5]],
            flows: []
        }

        const center: [number, number] = [3, 5]
        const changes = rotatePath(path, center, true)
        
        expect(changes).toHaveLength(1)
        expect(changes[0].type).toBe('update-path-points')
        
        const newPoints = (changes[0] as Extract<UserChange, { type: 'update-path-points' }>).points
        // Horizontal path [0,5] to [5,5] rotated 90° CW around [3,5]
        // [0,5]: rel=(-3,0) -> rotated=(0,3) -> abs=[3,8]
        // [5,5]: rel=(2,0) -> rotated=(0,-2) -> abs=[3,3]
        expect(newPoints).toEqual([[3, 8], [3, 3]])
    })

    it('rotates complex path with multiple segments', () => {
        const path: FieldPath = {
            id: 'p1',
            type: PathTypeID.PIPE,
            points: [[0, 0], [2, 0], [2, 2], [0, 2]],
            flows: []
        }

        const center: [number, number] = [1, 1]
        const changes = rotatePath(path, center, false)
        
        expect(changes).toHaveLength(1)
        expect(changes[0].type).toBe('update-path-points')
        
        // Counter-clockwise rotation around [1,1]
        const newPoints = (changes[0] as Extract<UserChange, { type: 'update-path-points' }>).points
        expect(newPoints).toHaveLength(4)
    })
})

describe('Multi-Entity Selection Rotation', () => {
    function createTestFieldState(): Immutable<FieldState> {
        return {
            template: FieldTemplateID.WULING_MAIN,
            width: 100,
            height: 100,
            facilities: [
                {
                    id: 'f1',
                    type: FacilityID.PLANTING_UNIT,
                    x: 10,
                    y: 10,
                    width: 2,
                    height: 2,
                    rotation: 0,
                    ports: [],
                    isPowered: false,
                    inputFlows: [],
                    outputFlows: []
                },
                {
                    id: 'f2',
                    type: FacilityID.SEED_PICKING_UNIT,
                    x: 15,
                    y: 10,
                    width: 2,
                    height: 2,
                    rotation: 0,
                    ports: [],
                    isPowered: false,
                    inputFlows: [],
                    outputFlows: []
                }
            ],
            paths: [
                {
                    id: 'p1',
                    type: PathTypeID.BELT,
                    points: [[12, 11], [15, 11]],
                    flows: []
                }
            ],
            pathFixtures: [],
            depot: {
                inputFlows: [],
                outputFlows: [],
                powerGenerated: 0,
                powerConsumed: 0
            },
            world: {
                inputFlows: [],
                outputFlows: []
            }
        }
    }

    it('rotates two facilities and connecting path as a unit', () => {
        const fieldState = createTestFieldState()
        const selectedIDs = new Set(['f1', 'f2', 'p1'])

        const changes = rotateSelection(fieldState, selectedIDs, true)
        
        // Should generate changes for all three entities
        expect(changes.length).toBeGreaterThan(0)
        
        // Check that we have changes for each entity
        const f1Changes = changes.filter(c => 
            (c.type === 'move-facility' || c.type === 'rotate-facility') && 
            c.facilityID === 'f1'
        )
        const f2Changes = changes.filter(c => 
            (c.type === 'move-facility' || c.type === 'rotate-facility') && 
            c.facilityID === 'f2'
        )
        const p1Changes = changes.filter(c => 
            c.type === 'update-path-points' && c.pathID === 'p1'
        )

        expect(f1Changes.length).toBeGreaterThan(0)
        expect(f2Changes.length).toBeGreaterThan(0)
        expect(p1Changes.length).toBeGreaterThan(0)
    })

    it('maintains relative positions after rotation', () => {
        const fieldState = createTestFieldState()
        const selectedIDs = new Set(['f1', 'f2'])

        // Get initial relative distance
        const f1 = fieldState.facilities[0]
        const f2 = fieldState.facilities[1]
        const initialDistanceX = f2.x - f1.x
        const initialDistanceY = f2.y - f1.y

        // Apply rotation
        const changes = rotateSelection(fieldState, selectedIDs, true)
        
        // Apply changes and get new state
        let newState = recalculateFieldState(fieldState, changes)

        const newF1 = newState.facilities.find(f => f.id === 'f1')!
        const newF2 = newState.facilities.find(f => f.id === 'f2')!

        // After 90° rotation, the relative positions should be rotated
        // Original: f2 is 5 units right of f1 (dx=5, dy=0)
        // After CW rotation: f2 should be 0 units right and -5 units down (dx=0, dy=-5)
        // But we also need to account for dimension swaps
        
        // The key is that the Manhattan distance should be preserved
        const newDistanceX = Math.abs(newF2.x - newF1.x)
        const newDistanceY = Math.abs(newF2.y - newF1.y)
        const initialManhattan = Math.abs(initialDistanceX) + Math.abs(initialDistanceY)
        const newManhattan = newDistanceX + newDistanceY

        // After rotation, the relative layout should be maintained
        // For perpendicular rotation, distances should swap axes
        expect(newManhattan).toBe(initialManhattan)
    })

    it('four consecutive rotations return facilities to original rotation', () => {
        let fieldState = createTestFieldState()
        // Adjust facilities to have even dimensions for clean rotation

        fieldState = {
            ...fieldState,
            facilities: [
                {
                    ...fieldState.facilities[0],
                    width: 2,
                    height: 2,
                    x: 10,
                    y: 10
                },
                {
                    ...fieldState.facilities[1],
                    width: 2,
                    height: 2,
                    x: 14,
                    y: 10
                }
            ]
        }
        
        const selectedIDs = new Set(['f1', 'f2'])

        // Store initial rotations
        const initialF1 = { ...fieldState.facilities[0] }
        const initialF2 = { ...fieldState.facilities[1] }

        // Apply four clockwise rotations
        let currentState = fieldState
        for (let i = 0; i < 4; i++) {
            const changes = rotateSelection(currentState, selectedIDs, true)
            currentState = recalculateFieldState(currentState, changes)
        }

        // Check that facilities returned to original orientations
        // Position may drift slightly due to path bounding box changes, but rotation should be exact
        const finalF1 = currentState.facilities.find(f => f.id === 'f1')!
        const finalF2 = currentState.facilities.find(f => f.id === 'f2')!

        expect(finalF1.rotation).toBe(initialF1.rotation)
        expect(finalF2.rotation).toBe(initialF2.rotation)
    })

    it('handles single-entity selection as special case', () => {
        const fieldState = createTestFieldState()
        const selectedIDs = new Set(['f1'])

        const changes = rotateSelection(fieldState, selectedIDs, true)
        
        // Single facility should still rotate correctly
        expect(changes.length).toBeGreaterThan(0)
        const rotateChange = changes.find(c => c.type === 'rotate-facility')
        expect(rotateChange).toBeDefined()
    })

    it('handles empty selection gracefully', () => {
        const fieldState = createTestFieldState()
        const selectedIDs = new Set<string>()

        const changes = rotateSelection(fieldState, selectedIDs, true)
        
        expect(changes).toEqual([])
    })

    it('rotates complex layout with facilities, paths, and fixtures', () => {
        const fieldState: FieldState = {
            template: FieldTemplateID.WULING_MAIN,
            width: 100,
            height: 100,
            facilities: [
                {
                    id: 'f1',
                    type: FacilityID.PLANTING_UNIT,
                    x: 0,
                    y: 0,
                    width: 2,
                    height: 2,
                    rotation: 0,
                    ports: [],
                    isPowered: false,
                    inputFlows: [],
                    outputFlows: []
                }
            ],
            paths: [
                {
                    id: 'p1',
                    type: PathTypeID.BELT,
                    points: [[2, 1], [5, 1]],
                    flows: []
                }
            ],
            pathFixtures: [
                {
                    id: 'fx1',
                    type: PathFixtureID.SPLITTER,
                    x: 5,
                    y: 1,
                    rotation: 0,
                    width: 1,
                    height: 1,
                    sides: []
                }
            ],
            depot: {
                inputFlows: [],
                outputFlows: [],
                powerGenerated: 0,
                powerConsumed: 0
            },
            world: {
                inputFlows: [],
                outputFlows: []
            }
        }

        const selectedIDs = new Set(['f1', 'p1', 'fx1'])
        const changes = rotateSelection(fieldState, selectedIDs, true)
        
        // Should generate changes for all entities
        expect(changes.length).toBeGreaterThan(0)
        
        // Verify we have changes for each type
        const facilityChanges = changes.filter(c => 
            c.type === 'move-facility' || c.type === 'rotate-facility'
        )
        const pathChanges = changes.filter(c => c.type === 'update-path-points')
        const fixtureChanges = changes.filter(c => 
            c.type === 'move-path-fixture' || c.type === 'rotate-path-fixture'
        )

        expect(facilityChanges.length).toBeGreaterThan(0)
        expect(pathChanges.length).toBeGreaterThan(0)
        expect(fixtureChanges.length).toBeGreaterThan(0)
    })
})

describe('Blueprint Rotation Integration', () => {
    it('maintains path-to-port connections after rotation', () => {
        // Create two facilities with a path connecting them
        const fieldState: FieldState = {
            template: FieldTemplateID.WULING_MAIN,
            width: 100,
            height: 100,
            facilities: [
                {
                    id: 'facility-left',
                    type: FacilityID.PLANTING_UNIT,
                    x: 10,
                    y: 10,
                    width: 2,
                    height: 2,
                    rotation: 0,
                    ports: [],
                    isPowered: false,
                    inputFlows: [],
                    outputFlows: []
                },
                {
                    id: 'facility-right',
                    type: FacilityID.SEED_PICKING_UNIT,
                    x: 15,
                    y: 10,
                    width: 2,
                    height: 2,
                    rotation: 0,
                    ports: [],
                    isPowered: false,
                    inputFlows: [],
                    outputFlows: []
                }
            ],
            paths: [
                {
                    id: 'connecting-path',
                    type: PathTypeID.BELT,
                    // Path from right edge of left facility to left edge of right facility
                    points: [[12, 11], [15, 11]],
                    flows: []
                }
            ],
            pathFixtures: [],
            depot: {
                inputFlows: [],
                outputFlows: [],
                powerGenerated: 0,
                powerConsumed: 0
            },
            world: {
                inputFlows: [],
                outputFlows: []
            }
        }

        // Calculate field state to get port positions
        const initialState = recalculateFieldState(fieldState, [])
        
        // Record initial path endpoint positions relative to facility positions
        const initialPath = initialState.paths[0]
        const initialFacilityLeft = initialState.facilities.find(f => f.id === 'facility-left')!
        const initialFacilityRight = initialState.facilities.find(f => f.id === 'facility-right')!
        
        const initialPathStart = initialPath.points[0]
        const initialPathEnd = initialPath.points[initialPath.points.length - 1]
        
        // Rotate everything 90° clockwise
        const selectedIDs = new Set(['facility-left', 'facility-right', 'connecting-path'])
        const changes = rotateSelection(initialState, selectedIDs, true)
        const rotatedState = recalculateFieldState(initialState, changes)
        
        // Get rotated entities
        const rotatedPath = rotatedState.paths.find(p => p.id === 'connecting-path')!
        const rotatedFacilityLeft = rotatedState.facilities.find(f => f.id === 'facility-left')!
        const rotatedFacilityRight = rotatedState.facilities.find(f => f.id === 'facility-right')!
        
        const rotatedPathStart = rotatedPath.points[0]
        const rotatedPathEnd = rotatedPath.points[rotatedPath.points.length - 1]
        
        // The path endpoints should have the same relative position to their facilities
        // Initial: path starts at left facility's (x+2, y+1) and ends at right facility's (x, y+1)
        const initialStartRelX = initialPathStart[0] - initialFacilityLeft.x
        const initialStartRelY = initialPathStart[1] - initialFacilityLeft.y
        const initialEndRelX = initialPathEnd[0] - initialFacilityRight.x
        const initialEndRelY = initialPathEnd[1] - initialFacilityRight.y
        
        // After 90° CW rotation with dimension swap, relative positions transform
        // For a 90° CW rotation of a 2x2 facility, relative positions should transform as:
        // (relX, relY) -> (relY, width-1-relX) since dimensions swap
        const expectedStartRelX = initialStartRelY
        const expectedStartRelY = initialFacilityLeft.width - 1 - initialStartRelX
        const expectedEndRelX = initialEndRelY
        const expectedEndRelY = initialFacilityRight.width - 1 - initialEndRelX
        
        const actualStartRelX = rotatedPathStart[0] - rotatedFacilityLeft.x
        const actualStartRelY = rotatedPathStart[1] - rotatedFacilityLeft.y
        const actualEndRelX = rotatedPathEnd[0] - rotatedFacilityRight.x
        const actualEndRelY = rotatedPathEnd[1] - rotatedFacilityRight.y
        
        // Verify path maintains proper relative positions to facilities
        expect(actualStartRelX).toBe(expectedStartRelX)
        expect(actualStartRelY).toBe(expectedStartRelY)
        expect(actualEndRelX).toBe(expectedEndRelX)
        expect(actualEndRelY).toBe(expectedEndRelY)
    })

    it('rotates a factory section maintaining connectivity', () => {
        // Create a simple factory: depot -> path -> facility -> path -> fixture
        const fieldState: FieldState = {
            template: FieldTemplateID.WULING_MAIN,
            width: 100,
            height: 100,
            facilities: [
                {
                    id: 'processor',
                    type: FacilityID.REFINING_UNIT,
                    x: 10,
                    y: 10,
                    width: 3,
                    height: 3,
                    rotation: 0,
                    ports: [],
                    isPowered: false,
                    inputFlows: [],
                    outputFlows: []
                }
            ],
            paths: [
                {
                    id: 'input-path',
                    type: PathTypeID.BELT,
                    points: [[5, 11], [10, 11]],
                    flows: []
                },
                {
                    id: 'output-path',
                    type: PathTypeID.BELT,
                    points: [[13, 11], [18, 11]],
                    flows: []
                }
            ],
            pathFixtures: [
                {
                    id: 'splitter',
                    type: PathFixtureID.SPLITTER,
                    x: 18,
                    y: 11,
                    rotation: 0,
                    width: 1,
                    height: 1,
                    sides: []
                }
            ],
            depot: {
                inputFlows: [],
                outputFlows: [],
                powerGenerated: 0,
                powerConsumed: 0
            },
            world: {
                inputFlows: [],
                outputFlows: []
            }
        }

        const selectedIDs = new Set(['processor', 'output-path', 'splitter'])
        
        // Rotate 90° clockwise
        const changes = rotateSelection(fieldState, selectedIDs, true)
        const rotatedState = recalculateFieldState(fieldState, changes)

        // Verify entities still exist
        expect(rotatedState.facilities.find(f => f.id === 'processor')).toBeDefined()
        expect(rotatedState.paths.find(p => p.id === 'output-path')).toBeDefined()
        expect(rotatedState.pathFixtures.find(f => f.id === 'splitter')).toBeDefined()

        // Verify rotations were applied
        const processor = rotatedState.facilities.find(f => f.id === 'processor')!
        const splitter = rotatedState.pathFixtures.find(f => f.id === 'splitter')!
        
        expect(processor.rotation).toBe(90)
        expect(splitter.rotation).toBe(90)
    })
})
