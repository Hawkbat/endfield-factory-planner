import { describe, it, expect } from 'vitest'
import { createSampleFieldState } from '../ts/game/sampleField'
import { recalculateFieldState } from '../ts/game/field'
import { PathFixtureID } from '../ts/types/data'
import type { UserChange } from '../ts/types/field'

describe('Debug fixture deletion in sample field', () => {
    it('should merge paths when deleting bridge from PAC to refining unit path', () => {
        // Start with sample field
        let state = createSampleFieldState()
        
        console.log('\n=== INITIAL STATE ===')
        console.log('Paths:', state.paths.length)
        console.log('Fixtures:', state.pathFixtures.length)
        
        // The path from PAC output to refining unit is: [[30, 31], [14, 31], [14, 28]]
        // The horizontal segment is from (30, 31) to (14, 31)
        // Let's place a fixture at (20, 31) which is on this segment
        const fixturePos: [number, number] = [20, 31]
        
        console.log('\nAll paths in sample field:')
        state.paths.forEach((p, i) => {
            console.log(`  Path ${i}: ${JSON.stringify(p.points)}`)
        })
        
        // Add a bridge at a midpoint on the horizontal segment
        const addFixtureChanges: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: fixturePos, rotation: 0 }
        ]
        
        state = recalculateFieldState(state, addFixtureChanges)
        
        console.log('\n=== AFTER ADDING BRIDGE ===')
        console.log('Paths:', state.paths.length)
        console.log('Fixtures:', state.pathFixtures.length)
        
        const addedFixture = state.pathFixtures.find(f => f.x === fixturePos[0] && f.y === fixturePos[1])
        expect(addedFixture).toBeDefined()
        
        console.log('\nFixture sides:')
        for (let i = 0; i < addedFixture!.sides.length; i++) {
            const side = addedFixture!.sides[i]
            console.log(`  Side ${i} (${side.direction}): connected to path ${side.connectedPathID || 'NONE'}`)
        }
        
        const connectedSides = addedFixture!.sides.filter(s => s.connectedPathID)
        console.log(`Connected sides: ${connectedSides.length}`)
        
        const pathCountWithFixture = state.paths.length
        const fixtureID = addedFixture!.id
        
        // Delete the fixture (simulating Delete key)
        const deleteChanges: UserChange[] = [
            { type: 'remove-path-fixture', fixtureID }
        ]
        
        state = recalculateFieldState(state, deleteChanges)
        
        console.log('\n=== AFTER DELETING BRIDGE ===')
        console.log('Paths:', state.paths.length)
        console.log('Fixtures:', state.pathFixtures.length)
        
        // Check if paths were merged
        const pathCountAfterDelete = state.paths.length
        console.log(`Path count: ${pathCountWithFixture} -> ${pathCountAfterDelete}`)
        
        expect(state.pathFixtures.find(f => f.id === fixtureID)).toBeUndefined()
        expect(pathCountAfterDelete).toBeLessThan(pathCountWithFixture)
    })
    
    it('should merge paths when deleting control port from PAC to refining unit path', () => {
        let state = createSampleFieldState()
        
        const fixturePos: [number, number] = [20, 31]
        
        // Control port needs rotation=90 to align with horizontal path (left/right instead of up/down)
        const addFixtureChanges: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.ITEM_CONTROL_PORT, position: fixturePos, rotation: 90 }
        ]
        
        state = recalculateFieldState(state, addFixtureChanges)
        
        console.log('\n=== CONTROL PORT DEBUG ===')
        const addedFixture = state.pathFixtures.find(f => f.x === fixturePos[0] && f.y === fixturePos[1])
        expect(addedFixture).toBeDefined()
        
        console.log('Fixture sides:')
        for (let i = 0; i < addedFixture!.sides.length; i++) {
            const side = addedFixture!.sides[i]
            console.log(`  Side ${i} (${side.direction}, ${side.subType}): connected to path ${side.connectedPathID || 'NONE'}`)
        }
        
        const pathCountWithFixture = state.paths.length
        const fixtureID = addedFixture!.id
        
        const deleteChanges: UserChange[] = [
            { type: 'remove-path-fixture', fixtureID }
        ]
        
        state = recalculateFieldState(state, deleteChanges)
        
        console.log(`Path count: ${pathCountWithFixture} -> ${state.paths.length}`)
        
        expect(state.pathFixtures.find(f => f.id === fixtureID)).toBeUndefined()
        expect(state.paths.length).toBeLessThan(pathCountWithFixture)
    })
    
    it('should merge paths when deleting splitter from PAC to refining unit path', () => {
        let state = createSampleFieldState()
        
        const fixturePos: [number, number] = [20, 31]
        
        const addFixtureChanges: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.SPLITTER, position: fixturePos, rotation: 0 }
        ]
        
        state = recalculateFieldState(state, addFixtureChanges)
        
        const addedFixture = state.pathFixtures.find(f => f.x === fixturePos[0] && f.y === fixturePos[1])
        expect(addedFixture).toBeDefined()
        
        const pathCountWithFixture = state.paths.length
        const fixtureID = addedFixture!.id
        
        const deleteChanges: UserChange[] = [
            { type: 'remove-path-fixture', fixtureID }
        ]
        
        state = recalculateFieldState(state, deleteChanges)
        
        expect(state.pathFixtures.find(f => f.id === fixtureID)).toBeUndefined()
        expect(state.paths.length).toBeLessThan(pathCountWithFixture)
    })
    
    it('should merge paths when deleting converger from PAC to refining unit path', () => {
        let state = createSampleFieldState()
        
        const fixturePos: [number, number] = [20, 31]
        
        const addFixtureChanges: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.CONVERGER, position: fixturePos, rotation: 0 }
        ]
        
        state = recalculateFieldState(state, addFixtureChanges)
        
        const addedFixture = state.pathFixtures.find(f => f.x === fixturePos[0] && f.y === fixturePos[1])
        expect(addedFixture).toBeDefined()
        
        const pathCountWithFixture = state.paths.length
        const fixtureID = addedFixture!.id
        
        const deleteChanges: UserChange[] = [
            { type: 'remove-path-fixture', fixtureID }
        ]
        
        state = recalculateFieldState(state, deleteChanges)
        
        expect(state.pathFixtures.find(f => f.id === fixtureID)).toBeUndefined()
        expect(state.paths.length).toBeLessThan(pathCountWithFixture)
    })
})
