import { describe, it, expect } from 'vitest'
import { TestFieldBuilder } from './test-helpers.ts'
import { FacilityID, PathTypeID, PathFixtureID, ItemID } from '../ts/types/data.ts'

describe('TestFieldBuilder - Fluent API', () => {
    it('should build state fluently with chaining', () => {
        const builder = new TestFieldBuilder(30, 30)
        
        const state = builder
            .addFacility(FacilityID.REFINING_UNIT, [5, 5])
            .addFacility(FacilityID.SHREDDING_UNIT, [10, 10])
            .addPath(PathTypeID.BELT, [[6, 5], [6, 10]])
            .build()

        expect(state.facilities).toHaveLength(2)
        expect(state.paths).toHaveLength(1)
    })

    it('should retrieve last added entity by default', () => {
        const builder = new TestFieldBuilder()
        
        builder
            .addFacility(FacilityID.REFINING_UNIT, [0, 0])
            .addFacility(FacilityID.SHREDDING_UNIT, [5, 5])

        expect(builder.getFacility().type).toBe(FacilityID.SHREDDING_UNIT)
        expect(builder.getFacility(0).type).toBe(FacilityID.REFINING_UNIT)
        expect(builder.getFacility(1).type).toBe(FacilityID.SHREDDING_UNIT)
    })

    it('should track changes applied', () => {
        const builder = new TestFieldBuilder()
        
        builder
            .addFacility(FacilityID.REFINING_UNIT, [5, 5])
            .addPath(PathTypeID.BELT, [[0, 0], [10, 0]])

        const changes = builder.getChanges()
        expect(changes).toHaveLength(2)
        expect(changes[0].type).toBe('add-facility')
        expect(changes[1].type).toBe('add-path')
    })

    it('should apply multiple changes at once', () => {
        const builder = new TestFieldBuilder()
        
        builder.applyAll([
            { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [0, 0], rotation: 0 },
            { type: 'add-facility', facilityType: FacilityID.SHREDDING_UNIT, position: [5, 5], rotation: 0 },
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[0, 0], [10, 0]] }
        ])

        const state = builder.build()
        expect(state.facilities).toHaveLength(2)
        expect(state.paths).toHaveLength(1)
    })

    it('should reset state', () => {
        const builder = new TestFieldBuilder()
        
        builder
            .addFacility(FacilityID.REFINING_UNIT, [5, 5])
            .addPath(PathTypeID.BELT, [[0, 0], [10, 0]])

        expect(builder.build().facilities).toHaveLength(1)
        expect(builder.build().paths).toHaveLength(1)

        builder.reset()

        expect(builder.build().facilities).toHaveLength(0)
        expect(builder.build().paths).toHaveLength(0)
        expect(builder.getChanges()).toHaveLength(0)
    })

    it('should provide access to paths and fixtures', () => {
        const builder = new TestFieldBuilder()
        
        builder
            .addPath(PathTypeID.BELT, [[0, 0], [5, 0]])
            .addPath(PathTypeID.PIPE, [[0, 5], [5, 5]])
            .addFixture(PathFixtureID.BELT_BRIDGE, [5, 5])

        expect(builder.getPath(0).type).toBe(PathTypeID.BELT)
        expect(builder.getPath(1).type).toBe(PathTypeID.PIPE)
        expect(builder.getPath().type).toBe(PathTypeID.PIPE)
        expect(builder.getFixture().type).toBe(PathFixtureID.BELT_BRIDGE)
    })
})

describe('TestFieldBuilder - Complex Scenarios', () => {
    it('should build a simple production line', () => {
        const builder = new TestFieldBuilder()
        
        const state = builder
            // Add source facility
            .addFacility(FacilityID.DEPOT_UNLOADER, [0, 5])
            // Add processing facility
            .addFacility(FacilityID.REFINING_UNIT, [5, 5])
            // Add destination facility
            .addFacility(FacilityID.SHREDDING_UNIT, [10, 5])
            // Connect source to refinery
            .addPath(PathTypeID.BELT, [[1, 5], [5, 5]])
            // Connect refinery to shredder
            .addPath(PathTypeID.BELT, [[6, 5], [10, 5]])
            // Set depot item
            .setPortItem(builder.getFacility(0).id, 0, ItemID.FERRIUM_ORE)
            .build()

        expect(state.facilities).toHaveLength(3)
        expect(state.paths).toHaveLength(2)
        expect(state.facilities[0].ports.find(p => p.external === 'depot')?.setItem).toBe(ItemID.FERRIUM_ORE)
    })

    it('should build and modify structure iteratively', () => {
        const builder = new TestFieldBuilder()
        
        // Phase 1: Add initial structure
        builder.addFacility(FacilityID.REFINING_UNIT, [5, 5])
        expect(builder.build().facilities).toHaveLength(1)

        // Phase 2: Add more
        builder.addPath(PathTypeID.BELT, [[0, 5], [5, 5]])
        expect(builder.build().paths).toHaveLength(1)

        // Phase 3: Modify
        builder.moveFacility(builder.getFacility().id, [10, 10])
        expect(builder.getFacility().x).toBe(10)
        expect(builder.getFacility().y).toBe(10)

        // Phase 4: Remove
        builder.removePath(builder.getPath().id)
        expect(builder.build().paths).toHaveLength(0)
    })
})
