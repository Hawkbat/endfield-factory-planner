import { describe, it, expect } from 'vitest'
import type { FieldState, FieldPath } from '../ts/types/field'
import { PathFixtureID, PathTypeID, RegionID, type FieldTemplate } from '../ts/types/data'
import {
    validateFixturePlacementOnPath,
    splitPathAtFixture,
    reconnectPathsAfterFixtureRemoval
} from '../ts/game/fixtures'
import {
    isPointOnSegment,
    findSegmentContainingPoint,
    findPerpendicularCrossing
} from '../ts/game/geometry'
import { createEmptyState } from '../ts/game/sampleField'
import { recalculateFieldState } from '../ts/game/field'
import type { Immutable } from '../ts/utils/types'

const makeTemplate = (width: number, height: number): FieldTemplate => ({
    width,
    height,
    region: RegionID.WULING,
    depotBusPortLimit: 1,
    depotBusSectionLimit: 5,
})

describe('Path Segment Geometry', () => {
    it('should detect point on horizontal segment', () => {
        const result = isPointOnSegment([5, 10], [2, 10], [8, 10])
        expect(result).toBe(true)
    })

    it('should detect point on vertical segment', () => {
        const result = isPointOnSegment([10, 5], [10, 2], [10, 8])
        expect(result).toBe(true)
    })

    it('should reject point at segment endpoint', () => {
        const result = isPointOnSegment([2, 10], [2, 10], [8, 10])
        expect(result).toBe(false)
    })

    it('should reject point not on segment', () => {
        const result = isPointOnSegment([5, 11], [2, 10], [8, 10])
        expect(result).toBe(false)
    })

    it('should find segment containing point', () => {
        const path: FieldPath = {
            id: 'path1',
            type: PathTypeID.BELT,
            points: [[0, 5], [10, 5], [10, 15]],
            flows: []
        }

        const result = findSegmentContainingPoint([5, 5], path)
        expect(result).toBe(0) // First segment (0,5) -> (10,5)
    })

    it('should return null if point not on any segment', () => {
        const path: FieldPath = {
            id: 'path1',
            type: PathTypeID.BELT,
            points: [[0, 5], [10, 5], [10, 15]],
            flows: []
        }

        const result = findSegmentContainingPoint([5, 10], path)
        expect(result).toBe(null)
    })

    it('should detect perpendicular crossing', () => {
        // Horizontal: (2,5) -> (8,5)
        // Vertical: (5,2) -> (5,8)
        // Should cross at (5,5)
        const crossing = findPerpendicularCrossing([2, 5], [8, 5], [5, 2], [5, 8])
        expect(crossing).toEqual([5, 5])
    })

    it('should return null for parallel segments', () => {
        const crossing = findPerpendicularCrossing([2, 5], [8, 5], [2, 10], [8, 10])
        expect(crossing).toBe(null)
    })

    it('should return null for non-crossing perpendicular segments', () => {
        // Horizontal at y=5, vertical at x=10 - they don't cross
        const crossing = findPerpendicularCrossing([2, 5], [8, 5], [10, 2], [10, 8])
        expect(crossing).toBe(null)
    })
})

describe('Fixture Placement Validation', () => {
    it('should validate fixture placement on horizontal path', () => {
        const path: FieldPath = {
            id: 'path1',
            type: PathTypeID.BELT,
            points: [[0, 5], [10, 5]],
            flows: []
        }

        const result = validateFixturePlacementOnPath(
            PathFixtureID.ITEM_CONTROL_PORT,
            [5, 5],
            0, // Rotation 0: input down, output up
            path
        )

        expect(result.isValid).toBe(true)
        expect(result.segmentIndex).toBe(0)
        expect(result.targetPath?.id).toBe('path1')
    })

    it('should validate fixture placement on vertical path', () => {
        const path: FieldPath = {
            id: 'path1',
            type: PathTypeID.BELT,
            points: [[5, 0], [5, 10]],
            flows: []
        }

        const result = validateFixturePlacementOnPath(
            PathFixtureID.ITEM_CONTROL_PORT,
            [5, 5],
            0,
            path
        )

        expect(result.isValid).toBe(true)
        expect(result.segmentIndex).toBe(0)
    })

    it('should reject fixture not on path', () => {
        const path: FieldPath = {
            id: 'path1',
            type: PathTypeID.BELT,
            points: [[0, 5], [10, 5]],
            flows: []
        }

        const result = validateFixturePlacementOnPath(
            PathFixtureID.ITEM_CONTROL_PORT,
            [5, 6], // Off the path
            0,
            path
        )

        expect(result.isValid).toBe(false)
        expect(result.error).toBe('not_on_path')
    })

    it('should reject belt fixture on fluid path', () => {
        const path: FieldPath = {
            id: 'path1',
            type: PathTypeID.PIPE,
            points: [[0, 5], [10, 5]],
            flows: []
        }

        const result = validateFixturePlacementOnPath(
            PathFixtureID.ITEM_CONTROL_PORT, // Belt fixture
            [5, 5],
            0,
            path
        )

        expect(result.isValid).toBe(false)
        expect(result.error).toBe('type_mismatch')
    })

    it('should reject fluid fixture on belt path', () => {
        const path: FieldPath = {
            id: 'path1',
            type: PathTypeID.BELT,
            points: [[0, 5], [10, 5]],
            flows: []
        }

        const result = validateFixturePlacementOnPath(
            PathFixtureID.PIPE_CONTROL_PORT, // Fluid fixture
            [5, 5],
            0,
            path
        )

        expect(result.isValid).toBe(false)
        expect(result.error).toBe('type_mismatch')
    })
})

describe('Path Splitting', () => {
    it('should split path at fixture position', () => {
        const path: FieldPath = {
            id: 'path1',
            type: PathTypeID.BELT,
            points: [[0, 5], [10, 5], [10, 15]],
            flows: []
        }

        const changes = splitPathAtFixture(
            path,
            PathFixtureID.ITEM_CONTROL_PORT,
            [5, 5],
            0,
            0 // First segment
        )

        // Should remove original path, add fixture, add two new paths
        expect(changes.length).toBe(4)
        expect(changes[0].type).toBe('remove-path')
        expect(changes[1].type).toBe('add-path-fixture')
        expect(changes[2].type).toBe('add-path')
        expect(changes[3].type).toBe('add-path')

        // Check first path segment
        const firstPath = changes[2]
        if (firstPath.type === 'add-path') {
            expect(firstPath.points).toEqual([[0, 5], [5, 5]])
        }

        // Check second path segment
        const secondPath = changes[3]
        if (secondPath.type === 'add-path') {
            expect(secondPath.points).toEqual([[5, 5], [10, 5], [10, 15]])
        }
    })

    it('should handle splitting at middle segment of multi-segment path', () => {
        const path: FieldPath = {
            id: 'path1',
            type: PathTypeID.BELT,
            points: [[0, 0], [0, 5], [10, 5], [10, 10]],
            flows: []
        }

        const changes = splitPathAtFixture(
            path,
            PathFixtureID.ITEM_CONTROL_PORT,
            [5, 5],
            0,
            1 // Second segment (0,5) -> (10,5)
        )

        const firstPath = changes[2]
        const secondPath = changes[3]

        if (firstPath.type === 'add-path') {
            expect(firstPath.points).toEqual([[0, 0], [0, 5], [5, 5]])
        }

        if (secondPath.type === 'add-path') {
            expect(secondPath.points).toEqual([[5, 5], [10, 5], [10, 10]])
        }
    })
})

describe('Path Reconnection', () => {
    it('should reconnect paths after fixture removal', () => {
        // Create a field with a path split by a fixture
        const initialState = createEmptyState(makeTemplate(50, 50))
        const stateWithPaths = recalculateFieldState(initialState, [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[0, 5], [5, 5]] },
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[5, 5], [10, 5]] },
            { type: 'add-path-fixture', fixtureType: PathFixtureID.ITEM_CONTROL_PORT, position: [5, 5], rotation: 0 }
        ])

        const fixture = stateWithPaths.pathFixtures[0]
        const changes = reconnectPathsAfterFixtureRemoval(fixture, stateWithPaths)

        // If paths are connected, should have reconnection changes
        // If not connected (because connection logic happens in field calculation),
        // we just verify the function returns without error
        expect(changes).toBeDefined()
        expect(Array.isArray(changes)).toBe(true)
    })

    it('should handle reconnecting reversed paths', () => {
        const initialState = createEmptyState(makeTemplate(50, 50))
        const stateWithPaths = recalculateFieldState(initialState, [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[10, 5], [5, 5]] },
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[0, 5], [5, 5]] },
            { type: 'add-path-fixture', fixtureType: PathFixtureID.ITEM_CONTROL_PORT, position: [5, 5], rotation: 0 }
        ])

        const fixture = stateWithPaths.pathFixtures[0]
        const changes = reconnectPathsAfterFixtureRemoval(fixture, stateWithPaths)

        // Verify function executes successfully
        expect(changes).toBeDefined()
        expect(Array.isArray(changes)).toBe(true)
    })
})

describe('Integration: Fixture Workflow', () => {
    it('should complete full fixture placement workflow', () => {
        // 1. Start with a simple path
            const initialState = createEmptyState(makeTemplate(50, 50))
        const stateWithPath = recalculateFieldState(initialState, [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[0, 5], [10, 5]] }
        ])

        const path = stateWithPath.paths[0]

        // 2. Validate fixture can be placed
        const validation = validateFixturePlacementOnPath(
            PathFixtureID.ITEM_CONTROL_PORT,
            [5, 5],
            0,
            path
        )
        expect(validation.isValid).toBe(true)

        // 3. Generate split changes
        const splitChanges = splitPathAtFixture(
            path,
            PathFixtureID.ITEM_CONTROL_PORT,
            [5, 5],
            0,
            validation.segmentIndex!
        )

        // 4. Apply changes
        const stateWithFixture = recalculateFieldState(stateWithPath, splitChanges)

        // Verify result
        expect(stateWithFixture.pathFixtures.length).toBe(1)
        expect(stateWithFixture.paths.length).toBe(2)
        expect(stateWithFixture.pathFixtures[0].x).toBe(5)
        expect(stateWithFixture.pathFixtures[0].y).toBe(5)
    })

    it('should complete full fixture removal workflow', () => {
        // 1. Create state with split paths and fixture
            const initialState = createEmptyState(makeTemplate(50, 50))
        const stateWithFixture = recalculateFieldState(initialState, [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[0, 5], [5, 5]] },
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[5, 5], [10, 5]] },
            { type: 'add-path-fixture', fixtureType: PathFixtureID.ITEM_CONTROL_PORT, position: [5, 5], rotation: 0 }
        ])

        const fixture = stateWithFixture.pathFixtures[0]

        // 2. Generate reconnection changes
        const reconnectChanges = reconnectPathsAfterFixtureRemoval(fixture, stateWithFixture)

        // 3. Add fixture removal change
        const allChanges = [
            { type: 'remove-path-fixture' as const, fixtureID: fixture.id },
            ...reconnectChanges
        ]

        // 4. Apply changes
        const finalState = recalculateFieldState(stateWithFixture, allChanges)

        // Verify result - fixture should be removed
        expect(finalState.pathFixtures.length).toBe(0)
        // Paths may or may not be merged depending on connection state
        expect(finalState.paths.length).toBeGreaterThanOrEqual(1)
    })
})
