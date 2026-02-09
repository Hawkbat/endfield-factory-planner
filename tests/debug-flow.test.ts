import { describe, it, expect } from 'vitest'
import { FacilityID, PathTypeID, ItemID } from '../ts/types/data.ts'
import { TestFieldBuilder } from './test-helpers.ts'

describe('Debug - Path Flow Direction', () => {
    it('should connect path from output to input and flow start-to-end', () => {
        // Minimal test: path from PAC output to Refining input
        const state = new TestFieldBuilder(50, 50)
            // PAC at (30, 30) with output at (30, 31) facing left
            .addFacility(FacilityID.PROTOCOL_AUTOMATION_CORE_PAC, [30, 30])
            .setPortItem('facility_1', 14, ItemID.AMETHYST_ORE)
            
            // Refining at (10, 30) with input at (11, 32) facing down
            .addFacility(FacilityID.REFINING_UNIT, [10, 30])
            
            // Power
            .addFacility(FacilityID.ELECTRIC_PYLON, [10, 25])
            
            // Path from PAC output (30, 31) to Refining input (11, 32)
            // START: (30, 31) dir "left" → connects to PAC output (30, 31) facing "left" ✓
            // END: (11, 32) dir "down" → connects to Refining input (11, 32) facing "down" ✓
            .addPath(PathTypeID.BELT, [
                [30, 31],  // START
                [11, 31],  // Left
                [11, 32]   // END (down)
            ])
            .build()
        
        const path = state.paths[0]
        const pac = state.facilities[0]
        const refining = state.facilities[1]
        
            try {
                expect(path.flowDirection).toBe('start-to-end')
                expect(path.flows.length).toBeGreaterThan(0)
            } catch (error) {
                console.log('\n=== DEBUG TEST (FAILED) ===')
                console.log('Path:', path.id, 'points:', path.points)
                console.log('Flow direction:', path.flowDirection)
                console.log('Error flags:', path.errorFlags)
                console.log('\nPAC port 14:', pac.ports[14])
                console.log('\nRefining port 1:', refining.ports[1])
                throw error
            }
    })
})
