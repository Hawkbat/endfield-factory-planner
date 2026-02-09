import { describe, it, expect } from 'vitest'
import { FacilityID, PathTypeID } from '../ts/types/data.ts'
import { TestFieldBuilder } from './test-helpers.ts'

describe('Debug - Path Connection Logic', () => {
    it('should connect path from output to input', () => {
        // Depot at (10, 10) with output port at (11, 10) facing up
        // Refining unit at (10, 5) has input ports on bottom (facing down)
        // at positions (10, 7), (11, 7), (12, 7)
        // Path from (11, 10) up to (11, 7) should connect both

        const result = new TestFieldBuilder(20, 20)
            .addFacility(FacilityID.DEPOT_UNLOADER, [10, 10])
            .addFacility(FacilityID.REFINING_UNIT, [10, 5])
            .addPath(PathTypeID.BELT, [[11, 10], [11, 7]])
            .build()

        const path = result.paths[0]

        try {
            // The path should be geometrically connected at both ends
            expect(path.startConnectedTo).toBeDefined()
            expect(path.endConnectedTo).toBeDefined()
            expect(path.startConnectedTo?.type).toBe('facility')
            expect(path.endConnectedTo?.type).toBe('facility')
        } catch (error) {
            console.log('\n=== DEPOT PORTS ===')
            result.facilities[0].ports.forEach((port, i) => {
                const absX = result.facilities[0].x + port.x
                const absY = result.facilities[0].y + port.y
                console.log(`Port ${i}: type=${port.type} subType=${port.subType} at (${absX}, ${absY}) dir=${port.direction}`)
            })

            console.log('\n=== PATH INFO ===')
            console.log(`Path: ${path.points[0]} → ${path.points[path.points.length - 1]}`)
            console.log(`Flow direction: ${path.flowDirection}`)
            console.log(`Error flags:`, path.errorFlags)
            throw error
        }
    })
})
