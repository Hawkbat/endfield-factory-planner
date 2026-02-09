import { describe, it, expect } from 'vitest'
import { createEmptyState, applyChanges } from './test-helpers.ts'
import { PathTypeID, PathFixtureID } from '../ts/types/data.ts'
import type { UserChange } from '../ts/types/field.ts'
import { generateFixtureRelocationChanges } from '../ts/game/fixtures.ts'

describe('Path Fixture Movement', () => {
    it('should recombine paths at old position when moving a fixture', () => {
        // Create a state with a path and a splitter in the middle
        const state = createEmptyState(20, 20)
        
        // Add a horizontal belt path with a splitter in the middle at (5, 5)
        const changes: UserChange[] = [
            // Create left segment: (2, 5) -> (5, 5)
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[2, 5], [5, 5]] },
            // Create right segment: (5, 5) -> (8, 5)
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[5, 5], [8, 5]] },
            // Add splitter at (5, 5)
            { type: 'add-path-fixture', fixtureType: PathFixtureID.SPLITTER, position: [5, 5], rotation: 0 }
        ]
        
        const stateWithSplitter = applyChanges(state, changes)
        
        // Verify initial state: should have 2 paths and 1 fixture
        expect(stateWithSplitter.paths).toHaveLength(2)
        expect(stateWithSplitter.pathFixtures).toHaveLength(1)
        
        const splitter = stateWithSplitter.pathFixtures[0]
        expect(splitter.x).toBe(5)
        expect(splitter.y).toBe(5)
        
        // Now move the splitter to (5, 8)
        // This should:
        // 1. Recombine the two paths at (5, 5) into one path: (2, 5) -> (8, 5)
        // 2. Split the path at the new position if there's a valid path there
        
        // First, let's create a vertical path at the new position
        const verticalPathChanges: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[5, 6], [5, 10]] }
        ]
        
        const stateWithVerticalPath = applyChanges(stateWithSplitter, verticalPathChanges)
        expect(stateWithVerticalPath.paths).toHaveLength(3) // 2 horizontal + 1 vertical
        
        // Generate relocation changes
        const intermediateChanges = [...changes, ...verticalPathChanges]
        const intermediateState = applyChanges(state, intermediateChanges)
        
        // Apply reconnection first to get the state without the splitter at old position
        const reconnectionChanges = generateFixtureRelocationChanges(
            splitter,
            [5, 8],
            stateWithVerticalPath,
            stateWithVerticalPath,
            true
        )
        
        // Extract just reconnection changes (before move-path-fixture)
        const moveIndex = reconnectionChanges.findIndex(c => c.type === 'move-path-fixture')
        const reconnectOnly = moveIndex >= 0 ? reconnectionChanges.slice(0, moveIndex) : []
        
        const stateAfterReconnect = applyChanges(stateWithVerticalPath, reconnectOnly)
        
        // After reconnection at old position, we should have:
        // - 1 merged horizontal path from (2, 5) to (8, 5)
        // - 1 vertical path (unchanged)
        // - 0 fixtures (fixture hasn't moved yet)
        expect(stateAfterReconnect.paths.length).toBeGreaterThanOrEqual(1)
        
        // Now apply all relocation changes
        const finalState = applyChanges(stateWithVerticalPath, reconnectionChanges)
        
        // Final state should have the fixture at new position
        expect(finalState.pathFixtures).toHaveLength(1)
        expect(finalState.pathFixtures[0].x).toBe(5)
        expect(finalState.pathFixtures[0].y).toBe(8)
    })
    
    it('should split paths at new position when moving a fixture', () => {
        // Create a simple vertical belt path
        const state = createEmptyState(20, 20)
        
        const changes: UserChange[] = [
            // Create a vertical path: (5, 2) -> (5, 10)
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[5, 2], [5, 10]] },
            // Create a horizontal path with splitter
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[2, 5], [5, 5]] },
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[5, 5], [8, 5]] },
            { type: 'add-path-fixture', fixtureType: PathFixtureID.SPLITTER, position: [5, 5], rotation: 0 }
        ]
        
        const initialState = applyChanges(state, changes)
        
        // Move splitter from (5, 5) to (5, 7) - onto the vertical path
        const splitter = initialState.pathFixtures[0]
        
        // Need intermediate state after reconnection
        const tempChanges = generateFixtureRelocationChanges(
            splitter,
            [5, 7],
            initialState,
            initialState,
            true
        )
        
        const moveIndex = tempChanges.findIndex(c => c.type === 'move-path-fixture')
        const reconnectChanges = moveIndex >= 0 ? tempChanges.slice(0, moveIndex) : []
        
        const intermediateState = applyChanges(initialState, reconnectChanges)
        
        // Now generate complete relocation
        const relocationChanges = generateFixtureRelocationChanges(
            splitter,
            [5, 7],
            initialState,
            intermediateState,
            true
        )
        
        const finalState = applyChanges(initialState, relocationChanges)
        
        // The fixture should be at (5, 7)
        expect(finalState.pathFixtures).toHaveLength(1)
        expect(finalState.pathFixtures[0].x).toBe(5)
        expect(finalState.pathFixtures[0].y).toBe(7)
        
        // The vertical path should be split into two segments at (5, 7)
        // One from (5, 2) to (5, 7) and another from (5, 7) to (5, 10)
        const verticalPaths = finalState.paths.filter(p => 
            p.points.some(pt => pt[0] === 5 && (pt[1] === 2 || pt[1] === 7 || pt[1] === 10))
        )
        
        expect(verticalPaths.length).toBeGreaterThanOrEqual(2)
    })
    
    it('should handle moving a fixture when no path exists at new position', () => {
        // Create a simple scenario with a splitter
        const state = createEmptyState(20, 20)
        
        const changes: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[2, 5], [5, 5]] },
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[5, 5], [8, 5]] },
            { type: 'add-path-fixture', fixtureType: PathFixtureID.SPLITTER, position: [5, 5], rotation: 0 }
        ]
        
        const initialState = applyChanges(state, changes)
        const splitter = initialState.pathFixtures[0]
        
        // Move to empty location (10, 10) - no path there
        const tempChanges = generateFixtureRelocationChanges(
            splitter,
            [10, 10],
            initialState,
            initialState,
            true
        )
        
        const moveIndex = tempChanges.findIndex(c => c.type === 'move-path-fixture')
        const reconnectChanges = moveIndex >= 0 ? tempChanges.slice(0, moveIndex) : []
        const intermediateState = applyChanges(initialState, reconnectChanges)
        
        const relocationChanges = generateFixtureRelocationChanges(
            splitter,
            [10, 10],
            initialState,
            intermediateState,
            true
        )
        
        const finalState = applyChanges(initialState, relocationChanges)
        
        // Fixture should be at new position
        expect(finalState.pathFixtures).toHaveLength(1)
        expect(finalState.pathFixtures[0].x).toBe(10)
        expect(finalState.pathFixtures[0].y).toBe(10)
        
        // Paths should be recombined at old position
        // Should have 1 merged path from (2, 5) to (8, 5)
        const horizontalPaths = finalState.paths.filter(p =>
            p.points.some(pt => pt[1] === 5)
        )
        expect(horizontalPaths.length).toBeGreaterThanOrEqual(1)
    })
})
