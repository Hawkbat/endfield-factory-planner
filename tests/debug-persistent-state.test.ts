import { describe, it, expect } from 'vitest'
import { createSampleFieldState } from '../ts/game/sampleField'
import { recalculateFieldState } from '../ts/game/field'
import { PathFixtureID } from '../ts/types/data'
import type { UserChange, FieldState } from '../ts/types/field'

describe('Debug persistent state fixture deletion', () => {
    it('should merge paths when deleting bridge in persistent state', () => {
        // Simulate exactly how the UI maintains state
        let currentState = createSampleFieldState()
        
        console.log('\n=== STEP 1: Initial state ===')
        console.log('Paths:', currentState.paths.length)
        console.log('Fixtures:', currentState.pathFixtures.length)
        
        // STEP 2: User places a bridge
        console.log('\n=== STEP 2: User places bridge ===')
        const addChanges: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [20, 31], rotation: 0 }
        ]
        
        // This is how the UI applies changes - each change goes through full recalculate
        currentState = recalculateFieldState(currentState, addChanges)
        
        console.log('Paths:', currentState.paths.length)
        console.log('Fixtures:', currentState.pathFixtures.length)
        
        const bridge = currentState.pathFixtures[0]
        console.log('Bridge ID:', bridge.id)
        console.log('Bridge sides:')
        for (const side of bridge.sides) {
            console.log(`  ${side.direction} (${side.subType}): path ${side.connectedPathID || 'NONE'}`)
        }
        
        const pathsBeforeDeletion = currentState.paths.length
        expect(pathsBeforeDeletion).toBe(7) // Should have split
        
        // STEP 3: User deletes the bridge
        console.log('\n=== STEP 3: User deletes bridge ===')
        
        // Get the fixture ID from the current state
        const fixtureToDelete = currentState.pathFixtures.find(f => f.type === PathFixtureID.BELT_BRIDGE)
        expect(fixtureToDelete).toBeDefined()
        
        console.log('Deleting fixture ID:', fixtureToDelete!.id)
        console.log('Fixture sides before deletion:')
        for (const side of fixtureToDelete!.sides) {
            console.log(`  ${side.direction}: path ${side.connectedPathID || 'NONE'}`)
        }
        
        const deleteChanges: UserChange[] = [
            { type: 'remove-path-fixture', fixtureID: fixtureToDelete!.id }
        ]
        
        // Apply deletion to persistent state
        currentState = recalculateFieldState(currentState, deleteChanges)
        
        console.log('Paths after deletion:', currentState.paths.length)
        console.log('Fixtures after deletion:', currentState.pathFixtures.length)
        
        // Should have merged back
        expect(currentState.pathFixtures.length).toBe(0)
        expect(currentState.paths.length).toBeLessThan(pathsBeforeDeletion)
    })
    
    it('should merge paths when deleting splitter in persistent state', () => {
        let currentState = createSampleFieldState()
        
        // Add splitter
        const addChanges: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.SPLITTER, position: [20, 31], rotation: 0 }
        ]
        currentState = recalculateFieldState(currentState, addChanges)
        
        console.log('\n=== SPLITTER TEST ===')
        const splitter = currentState.pathFixtures[0]
        console.log('Splitter sides:')
        for (const side of splitter.sides) {
            console.log(`  ${side.direction} (${side.subType}): path ${side.connectedPathID || 'NONE'}`)
        }
        
        const pathsBeforeDeletion = currentState.paths.length
        
        // Delete splitter
        const deleteChanges: UserChange[] = [
            { type: 'remove-path-fixture', fixtureID: splitter.id }
        ]
        currentState = recalculateFieldState(currentState, deleteChanges)
        
        console.log('Paths: %d -> %d', pathsBeforeDeletion, currentState.paths.length)
        
        expect(currentState.pathFixtures.length).toBe(0)
        expect(currentState.paths.length).toBeLessThan(pathsBeforeDeletion)
    })
    
    it('should merge paths when deleting converger in persistent state', () => {
        let currentState = createSampleFieldState()
        
        // Add converger
        const addChanges: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.CONVERGER, position: [20, 31], rotation: 0 }
        ]
        currentState = recalculateFieldState(currentState, addChanges)
        
        console.log('\n=== CONVERGER TEST ===')
        const converger = currentState.pathFixtures[0]
        console.log('Converger sides:')
        for (const side of converger.sides) {
            console.log(`  ${side.direction} (${side.subType}): path ${side.connectedPathID || 'NONE'}`)
        }
        
        const pathsBeforeDeletion = currentState.paths.length
        
        // Delete converger
        const deleteChanges: UserChange[] = [
            { type: 'remove-path-fixture', fixtureID: converger.id }
        ]
        currentState = recalculateFieldState(currentState, deleteChanges)
        
        console.log('Paths: %d -> %d', pathsBeforeDeletion, currentState.paths.length)
        
        expect(currentState.pathFixtures.length).toBe(0)
        expect(currentState.paths.length).toBeLessThan(pathsBeforeDeletion)
    })
    
    it('should handle multiple add/delete cycles', () => {
        let currentState = createSampleFieldState()
        
        console.log('\n=== MULTIPLE CYCLES TEST ===')
        
        for (let i = 0; i < 3; i++) {
            console.log(`\nCycle ${i + 1}:`)
            
            // Add bridge
            currentState = recalculateFieldState(currentState, [
                { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [20, 31], rotation: 0 }
            ])
            console.log(`  After add: ${currentState.paths.length} paths, ${currentState.pathFixtures.length} fixtures`)
            
            const fixture = currentState.pathFixtures[0]
            
            // Delete bridge
            currentState = recalculateFieldState(currentState, [
                { type: 'remove-path-fixture', fixtureID: fixture.id }
            ])
            console.log(`  After delete: ${currentState.paths.length} paths, ${currentState.pathFixtures.length} fixtures`)
            
            expect(currentState.paths.length).toBe(6) // Should be back to original
            expect(currentState.pathFixtures.length).toBe(0)
        }
    })
})
