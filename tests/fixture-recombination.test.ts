import { describe, it, expect } from 'vitest'
import { createEmptyState, applyChanges } from './test-helpers'
import { PathFixtureID, PathTypeID } from '../ts/types/data'
import type { FieldState, UserChange } from '../ts/types/field'
import type { Immutable } from '../ts/utils/types'

describe('Path recombination when deleting fixtures', () => {
    it('should merge two paths when deleting a fixture', () => {
        const state = createEmptyState(50, 50)
        
        // Create a path, add a fixture to split it, then remove the fixture
        const changes: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[10, 10], [20, 10]] },
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [15, 10], rotation: 0 }
        ]
        
        let field = applyChanges(state, changes)
        
        // After adding fixture, path should be split into 2
        expect(field.paths.length).toBeGreaterThanOrEqual(2)
        expect(field.pathFixtures).toHaveLength(1)
        
        const fixtureID = field.pathFixtures[0].id
        const pathCountWithFixture = field.paths.length
        
        // Delete the fixture
        field = applyChanges(field, [
            { type: 'remove-path-fixture', fixtureID }
        ])
        
        // Should be merged back - fewer paths than when split
        expect(field.pathFixtures).toHaveLength(0)
        expect(field.paths.length).toBeLessThan(pathCountWithFixture)
        
        // Check that we have a continuous path from start to end
        const allPoints = field.paths.flatMap(p => p.points)
        const hasStart = allPoints.some(pt => pt[0] === 10 && pt[1] === 10)
        const hasEnd = allPoints.some(pt => pt[0] === 20 && pt[1] === 10)
        expect(hasStart).toBe(true)
        expect(hasEnd).toBe(true)
    })
    
    it('should merge paths with complex routing', () => {
        const state = createEmptyState(50, 50)
        
        // Create an L-shaped path with a fixture on the horizontal segment
        const changes: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[10, 10], [20, 10], [20, 20]] },
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [15, 10], rotation: 0 }
        ]
        
        let field = applyChanges(state, changes)
        
        expect(field.paths.length).toBeGreaterThanOrEqual(2)
        expect(field.pathFixtures).toHaveLength(1)
        
        const fixtureID = field.pathFixtures[0].id
        const pathCountWithFixture = field.paths.length
        
        // Delete the fixture
        field = applyChanges(field, [
            { type: 'remove-path-fixture', fixtureID }
        ])
        
        // Should be merged back
        expect(field.pathFixtures).toHaveLength(0)
        expect(field.paths.length).toBeLessThan(pathCountWithFixture)
    })
    
    it('should merge three paths by preferring same axis', () => {
        const state = createEmptyState(50, 50)
        
        // Create a T-junction: horizontal path split by fixture, then vertical path connecting
        const changes: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[10, 20], [30, 20]] },
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [20, 20], rotation: 0 },
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[20, 10], [20, 20]] }
        ]
        
        let field = applyChanges(state, changes)
        
        // Should have 3 paths: 2 horizontal (split) + 1 vertical
        expect(field.paths).toHaveLength(3)
        expect(field.pathFixtures).toHaveLength(1)
        
        const fixtureID = field.pathFixtures[0].id
        
        // Delete the fixture
        field = applyChanges(field, [
            { type: 'remove-path-fixture', fixtureID }
        ])
        
        // Should merge the two horizontal paths, leave vertical disconnected
        expect(field.pathFixtures).toHaveLength(0)
        expect(field.paths).toHaveLength(2) // One merged horizontal + one vertical
        
        // Verify a horizontal path exists spanning the full width
        const horizontalPath = field.paths.find(p => {
            const xs = p.points.map(pt => pt[0])
            return Math.min(...xs) === 10 && Math.max(...xs) === 30
        })
        expect(horizontalPath).toBeDefined()
        
        // Verify the vertical path still exists
        const verticalPath = field.paths.find(p => {
            const ys = p.points.map(pt => pt[1])
            return Math.min(...ys) === 10 && Math.max(...ys) === 20
        })
        expect(verticalPath).toBeDefined()
    })
    
    it('should merge four paths into two opposite pairs', () => {
        const state = createEmptyState(50, 50)
        
        // Create a cross pattern by adding and splitting paths sequentially
        let field = applyChanges(state, [
            // Add horizontal path and split it
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[10, 20], [30, 20]] },
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [20, 20], rotation: 0 }
        ])
        
        // Now manually add vertical paths that connect to the fixture
        field = applyChanges(field, [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[20, 10], [20, 20]] },
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[20, 20], [20, 30]] }
        ])
        
        // Should have 4 paths: 2 horizontal (split) + 2 vertical
        expect(field.paths).toHaveLength(4)
        expect(field.pathFixtures).toHaveLength(1)
        
        const fixtureID = field.pathFixtures[0].id
        
        // Delete the fixture
        field = applyChanges(field, [
            { type: 'remove-path-fixture', fixtureID }
        ])
        
        // Should merge into 2 paths: one horizontal and one vertical
        expect(field.pathFixtures).toHaveLength(0)
        expect(field.paths).toHaveLength(2)
        
        // Verify full horizontal path
        const horizontalPath = field.paths.find(p => {
            const xs = p.points.map(pt => pt[0])
            return Math.min(...xs) === 10 && Math.max(...xs) === 30
        })
        expect(horizontalPath).toBeDefined()
        
        // Verify full vertical path
        const verticalPath = field.paths.find(p => {
            const ys = p.points.map(pt => pt[1])
            return Math.min(...ys) === 10 && Math.max(...ys) === 30
        })
        expect(verticalPath).toBeDefined()
    })
    
    it('should not merge paths of different types', () => {
        const state = createEmptyState(50, 50)
        
        // Create a path, split it, then manually change one segment type
        const changes: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[10, 10], [20, 10]] },
            { type: 'add-path-fixture', fixtureType: PathFixtureID.ITEM_CONTROL_PORT, position: [15, 10], rotation: 0 }
        ]
        
        let field = applyChanges(state, changes)
        
        expect(field.paths.length).toBeGreaterThanOrEqual(2)
        
        // Change one path segment to a different type
        const pathToChange = field.paths[0]
        field = {
            ...field,
            paths: field.paths.map(p => 
                p.id === pathToChange.id ? { ...p, type: PathTypeID.PIPE } : p
            )
        }
        
        const fixtureID = field.pathFixtures[0].id
        const pathCountBefore = field.paths.length
        
        // Delete the fixture
        field = applyChanges(field, [
            { type: 'remove-path-fixture', fixtureID }
        ])
        
        // Should NOT merge due to type mismatch
        expect(field.paths).toHaveLength(pathCountBefore)
        expect(field.pathFixtures).toHaveLength(0)
    })
    
    it('should handle fixture with no connected paths', () => {
        const state = createEmptyState(50, 50)
        
        // Manually add a fixture without any connected paths (edge case)
        let field: Immutable<FieldState> = {
            ...state,
            pathFixtures: [{
                id: 'fixture1',
                type: PathFixtureID.BELT_BRIDGE,
                x: 20,
                y: 20,
                rotation: 0,
                width: 1,
                height: 1,
                sides: []
            }]
        }
        
        // Delete the fixture
        field = applyChanges(field, [
            { type: 'remove-path-fixture', fixtureID: 'fixture1' }
        ])
        
        // Should just remove the fixture without errors
        expect(field.pathFixtures).toHaveLength(0)
        expect(field.paths).toHaveLength(0)
    })
    
    it('should handle deleting fixture with only one connected path', () => {
        const state = createEmptyState(50, 50)
        
        // Create a path and add a fixture at one end (edge case)
        const changes: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[10, 10], [20, 10]] },
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [10, 10], rotation: 0 }
        ]
        
        let field = applyChanges(state, changes)
        
        const fixtureID = field.pathFixtures[0]?.id
        expect(fixtureID).toBeDefined()
        
        const pathCountBefore = field.paths.length
        
        // Delete the fixture
        field = applyChanges(field, [
            { type: 'remove-path-fixture', fixtureID: fixtureID! }
        ])
        
        // Should just remove the fixture
        expect(field.pathFixtures).toHaveLength(0)
        // Path structure may change but should still exist
        expect(field.paths.length).toBeGreaterThan(0)
    })
})

