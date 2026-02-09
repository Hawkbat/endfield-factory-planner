import { describe, it, expect } from 'vitest'
import { createEmptyState } from '../ts/game/sampleField'
import { applyUserChange } from '../ts/game/changes'
import { FieldTemplateID, PathFixtureID, PathTypeID } from '../ts/types/data'
import type { UserChange, FieldState } from '../ts/types/field'

describe('Debug connection timing issue', () => {
    it('should show that connections are not set when applying changes sequentially', () => {
        let state = createEmptyState(FieldTemplateID.WULING_MAIN)
        
        console.log('\n=== Testing sequential change application ===\n')
        
        // Step 1: Add two path segments
        console.log('STEP 1: Add path [[10,10],[20,10]]')
        state = applyUserChange(state, {
            type: 'add-path',
            pathType: PathTypeID.BELT,
            points: [[10,10],[20,10]]
        })
        
        console.log('STEP 2: Add path [[20,10],[30,10]]')
        state = applyUserChange(state, {
            type: 'add-path',
            pathType: PathTypeID.BELT,
            points: [[20,10],[30,10]]
        })
        
        console.log(`Paths after adding: ${state.paths.length}`)
        
        // Step 2: Add a bridge at the junction
        console.log('\nSTEP 3: Add bridge at [20,10]')
        state = applyUserChange(state, {
            type: 'add-path-fixture',
            fixtureType: PathFixtureID.BELT_BRIDGE,
            position: [20,10],
            rotation: 0
        })
        
        console.log(`Paths after bridge: ${state.paths.length}`)
        console.log(`Fixtures: ${state.pathFixtures.length}`)
        
        if (state.pathFixtures.length > 0) {
            const bridge = state.pathFixtures[0]
            console.log(`\nBridge ID: ${bridge.id}`)
            console.log('Bridge sides (right after placement):')
            for (const side of bridge.sides) {
                console.log(`  ${side.direction} (${side.subType}): connectedPathID = ${side.connectedPathID || 'NULL'}`)
            }
        }
        
        // Step 3: Try to remove the bridge
        console.log('\nSTEP 4: Remove bridge')
        const fixtureID = state.pathFixtures[0].id
        
        // Look at fixture sides BEFORE calling applyUserChange
        const fixtureBeforeRemove = state.pathFixtures[0]
        console.log('\nFixture sides BEFORE applyUserChange(remove-path-fixture):')
        for (const side of fixtureBeforeRemove.sides) {
            console.log(`  ${side.direction}: connectedPathID = ${side.connectedPathID || 'NULL'}`)
        }
        
        const pathsBefore = state.paths.length
        
        state = applyUserChange(state, {
            type: 'remove-path-fixture',
            fixtureID
        })
        
        const pathsAfter = state.paths.length
        
        console.log(`\nPaths: ${pathsBefore} -> ${pathsAfter}`)
        
        if (pathsAfter >= pathsBefore) {
            console.log('\n❌ PROBLEM: Paths were NOT merged!')
            console.log('This is because connectedPathID is NULL when applyRemovePathFixture is called.')
            console.log('Connections are only calculated in recalculateFieldState Step 6.')
        } else {
            console.log('\n✅ Paths were merged')
        }
    })
})
