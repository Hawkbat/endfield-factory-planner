import { describe, it, expect } from 'vitest'
import { recalculateFieldState } from '../ts/game/field'
import { createEmptyState } from './test-helpers'
import { PathFixtureID, PathTypeID } from '../ts/types/data'
import type { UserChange } from '../ts/types/field'

describe('Debug fixture deletion through recalculate', () => {
    it('should merge paths when deleting fixture using recalculateFieldState', () => {
        // Simulate exactly how the UI works
        let state = createEmptyState(50, 50)
        
        // Step 1: Create path with fixture (as UI would)
        const addChanges: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[10, 10], [20, 10]] },
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [15, 10], rotation: 0 }
        ]
        
        state = recalculateFieldState(state, addChanges)
        
        console.log('After adding fixture:')
        console.log('- Paths:', state.paths.length)
        console.log('- Fixtures:', state.pathFixtures.length)
        
        expect(state.paths.length).toBeGreaterThanOrEqual(2)
        expect(state.pathFixtures).toHaveLength(1)
        
        const fixture = state.pathFixtures[0]
        console.log('- Fixture sides:', fixture.sides.length)
        console.log('- Fixture sides with connections:', fixture.sides.filter(s => s.connectedPathID).length)
        
        for (let i = 0; i < fixture.sides.length; i++) {
            const side = fixture.sides[i]
            console.log(`  - Side ${i} (${side.direction}): connectedPathID = ${side.connectedPathID || 'null'}`)
        }
        
        const fixtureID = fixture.id
        const pathCountBefore = state.paths.length
        
        // Step 2: Delete fixture (as UI would - through createDeleteChanges pattern)
        const deleteChanges: UserChange[] = [
            { type: 'remove-path-fixture', fixtureID }
        ]
        
        state = recalculateFieldState(state, deleteChanges)
        
        console.log('After deleting fixture:')
        console.log('- Paths:', state.paths.length)
        console.log('- Fixtures:', state.pathFixtures.length)
        
        // Should be merged back
        expect(state.pathFixtures).toHaveLength(0)
        expect(state.paths.length).toBeLessThan(pathCountBefore)
    })
})
