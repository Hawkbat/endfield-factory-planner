import { describe, it, expect } from 'vitest'
import { createEmptyState, applyChanges } from './test-helpers.ts'
import { PathTypeID, PathFixtureID } from '../ts/types/data.ts'
import type { UserChange } from '../ts/types/field.ts'
import { updateFixtureConnections } from '../ts/game/connections.ts'
import { generateFixtureRelocationChanges } from '../ts/game/fixtures.ts'

describe('Moving fixture between segments of same path', () => {
    it('should merge original segments and split at new position when moving between segments', () => {
        // Create a multi-segment path: (5, 5) -> (10, 5) -> (10, 10)
        const state = createEmptyState(20, 20)
        
        const changes: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[5, 5], [10, 5], [10, 10]] }
        ]
        
        const stateWithPath = applyChanges(state, changes)
        expect(stateWithPath.paths).toHaveLength(1)
        const originalPath = stateWithPath.paths[0]
        expect(originalPath.points).toHaveLength(3)
        
        // Place a splitter at (7, 5) - in the middle of the first segment
        // Splitters split paths when placed
        const placeFixtureChanges: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.SPLITTER, position: [7, 5], rotation: 0 }
        ]
        
        const stateWithFixture = applyChanges(stateWithPath, placeFixtureChanges)
        
        // After placement, path should be split into two segments
        // Segment 1: (5, 5) -> (7, 5)
        // Segment 2: (7, 5) -> (10, 5) -> (10, 10)
        expect(stateWithFixture.paths.length).toBeGreaterThanOrEqual(2)
        expect(stateWithFixture.pathFixtures).toHaveLength(1)
        
        const fixture = stateWithFixture.pathFixtures[0]
        expect(fixture.x).toBe(7)
        expect(fixture.y).toBe(5)
        
        // Update fixture connections to see what it's connected to
        const fixtureWithConnections = updateFixtureConnections(fixture, stateWithFixture)
        const connectedPathIDs = fixtureWithConnections.sides
            .filter(s => s.connectedPathID)
            .map(s => s.connectedPathID!)
        
        console.log('Fixture connected to paths:', connectedPathIDs)
        console.log('Paths after placement:', stateWithFixture.paths.map(p => ({ id: p.id, points: p.points })))
        
        expect(connectedPathIDs.length).toBeGreaterThan(0)
        
        // Now move the fixture along the path from (7, 5) to (10, 7)
        // This moves it from the first segment to the second segment
        const newPosition: [number, number] = [10, 7]
        
        // Generate FULL relocation changes (which include reconnection and split)
        const allChanges = generateFixtureRelocationChanges(
            fixture,
            newPosition,
            stateWithFixture,
            stateWithFixture,  // This should be intermediate state after reconnection, but we only use paths so it's ok
            true  // Include reconnection
        )
        
        console.log('All relocation changes:', allChanges.map(c => c.type))
        
        // Apply all changes at once
        const finalState = applyChanges(stateWithFixture, allChanges)
        
        console.log('Final state paths:', finalState.paths.map(p => ({ id: p.id, points: p.points })))
        
        // Final state should have:
        // - Fixture at (10, 7)
        // - Paths split at the new position
        expect(finalState.pathFixtures).toHaveLength(1)
        expect(finalState.pathFixtures[0].x).toBe(10)
        expect(finalState.pathFixtures[0].y).toBe(7)
        
        // Should have at least 2 path segments (before and after the fixture)
        expect(finalState.paths.length).toBeGreaterThanOrEqual(2)
        
        // Check that paths are connected through the fixture at (10, 7)
        const pathsConnectedAtNewPos = finalState.paths.filter(p => 
            p.points.some(pt => pt[0] === 10 && pt[1] === 7)
        )
        expect(pathsConnectedAtNewPos.length).toBeGreaterThanOrEqual(2)

    })
    
    it('should handle moving from first segment to second segment', () => {
        // Create path with 3 segments: (5, 5) -> (10, 5) -> (10, 10) -> (15, 10)
        const state = createEmptyState(20, 20)
        
        const changes: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[5, 5], [10, 5], [10, 10], [15, 10]] }
        ]
        
        const stateWithPath = applyChanges(state, changes)
        
        // Place belt bridge on first segment at (7, 5)
        const placeChanges: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [7, 5], rotation: 0 }
        ]
        
        const stateWithFixture = applyChanges(stateWithPath, placeChanges)
        const fixture = stateWithFixture.pathFixtures[0]
        
        console.log('Initial placement paths:', stateWithFixture.paths.map(p => ({ id: p.id, points: p.points })))
        
        // Move to second segment at (10, 8)
        const newPosition: [number, number] = [10, 8]
        
        const reconnectionChanges = generateFixtureRelocationChanges(
            fixture,
            newPosition,
            stateWithFixture,
            stateWithFixture,
            true
        ).filter(c => c.type === 'remove-path' || c.type === 'add-path')
        
        const intermediateState = applyChanges(stateWithFixture, reconnectionChanges)
        
        console.log('After reconnection paths:', intermediateState.paths.map(p => ({ id: p.id, points: p.points })))
        
        const splitAndMoveChanges = generateFixtureRelocationChanges(
            fixture,
            newPosition,
            stateWithFixture,
            intermediateState,
            false
        )
        
        const finalState = applyChanges(stateWithFixture, [...reconnectionChanges, ...splitAndMoveChanges])
        
        console.log('Final paths:', finalState.paths.map(p => ({ id: p.id, points: p.points })))
        
        expect(finalState.pathFixtures[0].x).toBe(10)
        expect(finalState.pathFixtures[0].y).toBe(8)
        
        // Should have paths properly split at new position
        const pathsWithNewPos = finalState.paths.filter(p =>
            p.points.some(pt => pt[0] === 10 && pt[1] === 8)
        )
        expect(pathsWithNewPos.length).toBeGreaterThanOrEqual(2)
    })
})
