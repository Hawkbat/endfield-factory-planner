import { describe, it, expect } from 'vitest'
import { createCopyChanges, serializeCopyData, deserializeCopyData } from '../ts/game/entityOperations.ts'
import { TestFieldBuilder, createEmptyState, applyChanges } from './test-helpers.ts'
import { FacilityID, PathTypeID, PathFixtureID, ItemID, RecipeID } from '../ts/types/data.ts'
import type { UserChange, FieldFacility } from '../ts/types/field.ts'

describe('Copy/Paste - Reference Token System', () => {
    describe('Basic Copy/Paste', () => {
        it('should copy a single facility', () => {
            const builder = new TestFieldBuilder(30, 30)
            builder.addFacility(FacilityID.REFINING_UNIT, [5, 5])
            const state = builder.build()

            const facility = state.facilities[0]
            const selectedIDs = new Set([facility.id])

            const changes = createCopyChanges(selectedIDs, state)

            expect(changes).toHaveLength(1)
            expect(changes[0]).toMatchObject({
                type: 'add-facility',
                facilityType: FacilityID.REFINING_UNIT,
                position: [5, 5]
            })
        })

        it('should copy multiple facilities', () => {
            const builder = new TestFieldBuilder(30, 30)
            builder
                .addFacility(FacilityID.REFINING_UNIT, [5, 5])
                .addFacility(FacilityID.SHREDDING_UNIT, [10, 10])
            const state = builder.build()

            const selectedIDs = new Set(state.facilities.map(f => f.id))
            const changes = createCopyChanges(selectedIDs, state)

            expect(changes.filter(c => c.type === 'add-facility')).toHaveLength(2)
        })

        it('should copy paths and fixtures', () => {
            const builder = new TestFieldBuilder(30, 30)
            builder
                .addPath(PathTypeID.BELT, [[5, 5], [10, 5]])
                .addFixture(PathFixtureID.BELT_BRIDGE, [15, 15], 0)
            const state = builder.build()

            const selectedIDs = new Set([
                ...state.paths.map(p => p.id),
                ...state.pathFixtures.map(f => f.id)
            ])
            const changes = createCopyChanges(selectedIDs, state)

            expect(changes.filter(c => c.type === 'add-path')).toHaveLength(1)
            expect(changes.filter(c => c.type === 'add-path-fixture')).toHaveLength(1)
        })
    })

    describe('Copy with User Settings', () => {
        it('should copy facility recipe with reference token', () => {
            // Manually create a facility with a setRecipe (bypass recalculation)
            let state = createEmptyState(30, 30)
            const facility: FieldFacility = {
                id: 'facility_1',
                type: FacilityID.REFINING_UNIT,
                x: 5,
                y: 5,
                rotation: 0,
                width: 2,
                height: 2,
                ports: [],
                isPowered: false,
                inputFlows: [],
                outputFlows: [],
                setRecipe: RecipeID.FURNANCE_CARBON_MATERIAL_1,
                jumpStartRecipe: false
            }
            state = { ...state, facilities: [facility] }

            const selectedIDs = new Set([facility.id])
            const changes = createCopyChanges(selectedIDs, state)

            // Should have add-facility followed by set-facility-recipe with reference token
            expect(changes.length).toBeGreaterThanOrEqual(2)
            expect(changes[0]).toMatchObject({
                type: 'add-facility',
                facilityType: FacilityID.REFINING_UNIT
            })
            const recipeChange = changes.find(c => c.type === 'set-facility-recipe')
            expect(recipeChange).toBeDefined()
            expect(recipeChange).toMatchObject({
                type: 'set-facility-recipe',
                facilityID: '@ref:facility:0',
                recipeID: RecipeID.FURNANCE_CARBON_MATERIAL_1
            })
        })

        it('should copy depot port items with reference tokens', () => {
            // Use builder to create facility with proper port initialization
            const builder = new TestFieldBuilder(30, 30)
            builder.addFacility(FacilityID.PROTOCOL_AUTOMATION_CORE_PAC, [10, 10])
            const facilityID = builder.getFacility().id

            // Set items on first two depot output ports (indices 14 and 15 for PAC)
            builder.setPortItem(facilityID, 14, ItemID.FERRIUM_ORE)
            builder.setPortItem(facilityID, 15, ItemID.AMETHYST_ORE)

            const state = builder.build()
            const facility = state.facilities[0]

            const selectedIDs = new Set([facility.id])
            const changes = createCopyChanges(selectedIDs, state)

            // Should have add-facility followed by set-port-item changes with reference tokens
            const depotChanges = changes.filter(c => c.type === 'set-port-item')
            expect(depotChanges.length).toBeGreaterThan(0)
            // Find the change for port 14
            const port14Change = depotChanges.find((c: any) => c.portIndex === 14)
            expect(port14Change).toMatchObject({
                type: 'set-port-item',
                facilityID: '@ref:facility:0',
                portIndex: 14,
                itemID: ItemID.FERRIUM_ORE
            })
        })

        it('should copy fixture item filter with reference token', () => {
            const builder = new TestFieldBuilder(30, 30)
            builder.addFixture(PathFixtureID.ITEM_CONTROL_PORT, [5, 5], 0)

            // Manually set the fixture item (would need a setFixtureItem method in builder)
            let state = builder.build()
            const fixture = state.pathFixtures[0]

            // Apply set-fixture-item change
            builder.apply({
                type: 'set-fixture-item',
                fixtureID: fixture.id,
                itemID: ItemID.FERRIUM_ORE
            })
            state = builder.build()

            const selectedIDs = new Set([fixture.id])
            const changes = createCopyChanges(selectedIDs, state)

            // Should have add-path-fixture followed by set-fixture-item with reference token
            expect(changes).toHaveLength(2)
            expect(changes[1]).toMatchObject({
                type: 'set-fixture-item',
                fixtureID: '@ref:fixture:0',
                itemID: ItemID.FERRIUM_ORE
            })
        })
    })

    describe('Reference Resolution - Blank State', () => {
        it('should resolve references when pasting to blank state', () => {
            const builder = new TestFieldBuilder(30, 30)
            builder.addFacility(FacilityID.REFINING_UNIT, [5, 5])
            const facilityID = builder.getFacility().id
            builder.apply({ type: 'set-facility-recipe', facilityID, recipeID: RecipeID.FURNANCE_CARBON_MATERIAL_1, jumpStart: false })
            const sourceState = builder.build()

            const facility = sourceState.facilities[0]
            const selectedIDs = new Set([facility.id])

            // Create copy changes with reference tokens
            const copyChanges = createCopyChanges(selectedIDs, sourceState)

            // Apply to a blank state wrapped in a multi-change
            const blankState = createEmptyState(30, 30)
            const multiChange: UserChange = { type: 'multi', changes: copyChanges }
            const resultState = applyChanges(blankState, [multiChange])

            // Should have one facility with the recipe set
            expect(resultState.facilities).toHaveLength(1)
            expect(resultState.facilities[0].setRecipe).toBe(RecipeID.FURNANCE_CARBON_MATERIAL_1)
        })

        it('should resolve references for multiple facilities', () => {
            const builder = new TestFieldBuilder(30, 30)
            builder.addFacility(FacilityID.REFINING_UNIT, [5, 5])
            const facility1ID = builder.getFacility().id
            builder.apply({ type: 'set-facility-recipe', facilityID: facility1ID, recipeID: RecipeID.FURNANCE_CARBON_MATERIAL_1, jumpStart: false })

            builder.addFacility(FacilityID.SHREDDING_UNIT, [10, 10])
            const facility2ID = builder.getFacility().id
            builder.apply({ type: 'set-facility-recipe', facilityID: facility2ID, recipeID: RecipeID.COMPONENT_IRON_CMPT_1, jumpStart: false })
            const sourceState = builder.build()

            const selectedIDs = new Set(sourceState.facilities.map(f => f.id))
            const copyChanges = createCopyChanges(selectedIDs, sourceState)

            // Apply to blank state
            const blankState = createEmptyState(30, 30)
            const multiChange: UserChange = { type: 'multi', changes: copyChanges }
            const resultState = applyChanges(blankState, [multiChange])

            expect(resultState.facilities).toHaveLength(2)
            expect(resultState.facilities[0].setRecipe).toBe(RecipeID.FURNANCE_CARBON_MATERIAL_1)
            expect(resultState.facilities[1].setRecipe).toBe(RecipeID.COMPONENT_IRON_CMPT_1)
        })
    })

    describe('Reference Resolution - Existing State', () => {
        it('should resolve references when pasting to state with existing entities', () => {
            // Create source state with a facility that has a recipe
            const sourceBuilder = new TestFieldBuilder(30, 30)
            sourceBuilder.addFacility(FacilityID.REFINING_UNIT, [5, 5])
            const facilityID = sourceBuilder.getFacility().id
            sourceBuilder.apply({ type: 'set-facility-recipe', facilityID, recipeID: RecipeID.FURNANCE_CARBON_MATERIAL_1, jumpStart: false })
            const sourceState = sourceBuilder.build()

            const selectedIDs = new Set([sourceState.facilities[0].id])
            const copyChanges = createCopyChanges(selectedIDs, sourceState)

            // Create target state with existing facilities
            const targetBuilder = new TestFieldBuilder(30, 30)
            targetBuilder
                .addFacility(FacilityID.SHREDDING_UNIT, [15, 15])
                .addFacility(FacilityID.PACKAGING_UNIT, [20, 20])
            const targetState = targetBuilder.build()

            // Apply copy changes to target state
            const multiChange: UserChange = { type: 'multi', changes: copyChanges }
            const resultState = applyChanges(targetState, [multiChange])

            // Should have 3 facilities total
            expect(resultState.facilities).toHaveLength(3)
            // The new facility should have the recipe set
            const newFacility = resultState.facilities[2]
            expect(newFacility.type).toBe(FacilityID.REFINING_UNIT)
            expect(newFacility.setRecipe).toBe(RecipeID.FURNANCE_CARBON_MATERIAL_1)
        })

        it('should handle depot items with existing entities', () => {
            const sourceBuilder = new TestFieldBuilder(30, 30)
            sourceBuilder.addFacility(FacilityID.PROTOCOL_AUTOMATION_CORE_PAC, [10, 10])
            const facilityID = sourceBuilder.getFacility().id
            sourceBuilder.setPortItem(facilityID, 14, ItemID.FERRIUM_ORE) // Port 14 is first depot output
            const sourceState = sourceBuilder.build()

            const selectedIDs = new Set([sourceState.facilities[0].id])
            const copyChanges = createCopyChanges(selectedIDs, sourceState)

            // Target state with existing facilities
            const targetBuilder = new TestFieldBuilder(30, 30)
            targetBuilder.addFacility(FacilityID.REFINING_UNIT, [5, 5])
            const targetState = targetBuilder.build()

            // Apply copy
            const multiChange: UserChange = { type: 'multi', changes: copyChanges }
            const resultState = applyChanges(targetState, [multiChange])

            expect(resultState.facilities).toHaveLength(2)
            const newFacility = resultState.facilities[1]
            expect(newFacility.type).toBe(FacilityID.PROTOCOL_AUTOMATION_CORE_PAC)
            expect(newFacility.ports[14].setItem).toBe(ItemID.FERRIUM_ORE) // Check port 14
        })

        it('should handle fixtures with existing fixtures', () => {
            const sourceBuilder = new TestFieldBuilder(30, 30)
            sourceBuilder
                .addFixture(PathFixtureID.ITEM_CONTROL_PORT, [5, 5], 0)
                .apply({
                    type: 'set-fixture-item',
                    fixtureID: sourceBuilder.getFixture().id,
                    itemID: ItemID.FERRIUM_ORE
                })
            const sourceState = sourceBuilder.build()

            const selectedIDs = new Set([sourceState.pathFixtures[0].id])
            const copyChanges = createCopyChanges(selectedIDs, sourceState)

            // Target state with existing fixtures
            const targetBuilder = new TestFieldBuilder(30, 30)
            targetBuilder.addFixture(PathFixtureID.BELT_BRIDGE, [10, 10], 0)
            const targetState = targetBuilder.build()

            // Apply copy
            const multiChange: UserChange = { type: 'multi', changes: copyChanges }
            const resultState = applyChanges(targetState, [multiChange])

            expect(resultState.pathFixtures).toHaveLength(2)
            const newFixture = resultState.pathFixtures[1]
            expect(newFixture.type).toBe(PathFixtureID.ITEM_CONTROL_PORT)
            expect(newFixture.setItem).toBe(ItemID.FERRIUM_ORE)
        })
    })

    describe('Serialization/Deserialization', () => {
        it('should serialize and deserialize copy data', () => {
            const builder = new TestFieldBuilder(30, 30)
            builder.addFacility(FacilityID.REFINING_UNIT, [5, 5])
            const facilityID = builder.getFacility().id
            builder.apply({ type: 'set-facility-recipe', facilityID, recipeID: RecipeID.FURNANCE_CARBON_MATERIAL_1, jumpStart: false })
            const state = builder.build()

            const selectedIDs = new Set([state.facilities[0].id])
            const changes = createCopyChanges(selectedIDs, state)

            // Serialize
            const serialized = serializeCopyData(changes)
            expect(typeof serialized).toBe('string')

            // Deserialize
            const deserialized = deserializeCopyData(serialized)
            expect(deserialized).toEqual(changes)
        })

        it('should handle invalid JSON gracefully', () => {
            const result = deserializeCopyData('invalid json')
            expect(result).toBeNull()
        })

        it('should reject data without proper version', () => {
            const badData = JSON.stringify({ changes: [] })
            const result = deserializeCopyData(badData)
            expect(result).toBeNull()
        })

        it('should preserve reference tokens through serialization', () => {
            const builder = new TestFieldBuilder(30, 30)
            builder.addFacility(FacilityID.REFINING_UNIT, [5, 5])
            const facilityID = builder.getFacility().id
            builder.apply({ type: 'set-facility-recipe', facilityID, recipeID: RecipeID.FURNANCE_CARBON_MATERIAL_1, jumpStart: false })
            const state = builder.build()

            const selectedIDs = new Set([state.facilities[0].id])
            const changes = createCopyChanges(selectedIDs, state)

            const serialized = serializeCopyData(changes)
            const deserialized = deserializeCopyData(serialized)!

            // Check that reference token is preserved
            const recipeChange = deserialized.find(c => c.type === 'set-facility-recipe')
            expect(recipeChange).toBeDefined()
            expect((recipeChange as any).facilityID).toBe('@ref:facility:0')
        })
    })

    describe('Offset Application', () => {
        it('should apply offset to copied entities', () => {
            const builder = new TestFieldBuilder(30, 30)
            builder.addFacility(FacilityID.REFINING_UNIT, [5, 5])
            const state = builder.build()

            const selectedIDs = new Set([state.facilities[0].id])
            const changes = createCopyChanges(selectedIDs, state, { dx: 3, dy: 2 })

            const addChange = changes[0] as Extract<UserChange, { type: 'add-facility' }>
            expect(addChange.position).toEqual([8, 7])
        })

        it('should apply offset to paths', () => {
            const builder = new TestFieldBuilder(30, 30)
            builder.addPath(PathTypeID.BELT, [[5, 5], [10, 5], [10, 10]])
            const state = builder.build()

            const selectedIDs = new Set([state.paths[0].id])
            const changes = createCopyChanges(selectedIDs, state, { dx: 2, dy: 3 })

            const addChange = changes[0] as Extract<UserChange, { type: 'add-path' }>
            expect(addChange.points).toEqual([[7, 8], [12, 8], [12, 13]])
        })

        it('should apply offset to fixtures', () => {
            const builder = new TestFieldBuilder(30, 30)
            builder.addFixture(PathFixtureID.BELT_BRIDGE, [5, 5], 0)
            const state = builder.build()

            const selectedIDs = new Set([state.pathFixtures[0].id])
            const changes = createCopyChanges(selectedIDs, state, { dx: 1, dy: 1 })

            const addChange = changes[0] as Extract<UserChange, { type: 'add-path-fixture' }>
            expect(addChange.position).toEqual([6, 6])
        })
    })

    describe('Complex Scenarios', () => {
        it('should handle copying mixed selection with all features', () => {
            const builder = new TestFieldBuilder(30, 30)

            builder.addFacility(FacilityID.REFINING_UNIT, [5, 5])
            const facility1ID = builder.getFacility().id
            builder.apply({ type: 'set-facility-recipe', facilityID: facility1ID, recipeID: RecipeID.FURNANCE_CARBON_MATERIAL_1, jumpStart: false })

            builder.addFacility(FacilityID.PROTOCOL_AUTOMATION_CORE_PAC, [10, 10])
            const facility2ID = builder.getFacility().id
            builder.setPortItem(facility2ID, 14, ItemID.FERRIUM_ORE) // Port 14 is first depot output

            builder.addPath(PathTypeID.BELT, [[5, 7], [10, 7]])

            builder.addFixture(PathFixtureID.ITEM_CONTROL_PORT, [15, 15], 0)
            const fixtureID = builder.getFixture().id
            builder.apply({
                type: 'set-fixture-item',
                fixtureID,
                itemID: ItemID.AMETHYST_ORE
            })
            const sourceState = builder.build()

            const selectedIDs = new Set([
                ...sourceState.facilities.map(f => f.id),
                ...sourceState.paths.map(p => p.id),
                ...sourceState.pathFixtures.map(f => f.id)
            ])
            const copyChanges = createCopyChanges(selectedIDs, sourceState)

            // Apply to target state with existing entities
            const targetBuilder = new TestFieldBuilder(30, 30)
            targetBuilder.addFacility(FacilityID.SHREDDING_UNIT, [20, 20])
            const targetState = targetBuilder.build()

            const multiChange: UserChange = { type: 'multi', changes: copyChanges }
            const resultState = applyChanges(targetState, [multiChange])

            // Verify all entities were created with correct settings
            expect(resultState.facilities).toHaveLength(3)
            expect(resultState.paths).toHaveLength(1)
            expect(resultState.pathFixtures).toHaveLength(1)

            // Check facility recipes and depot items
            const refiningUnit = resultState.facilities.find(f => f.type === FacilityID.REFINING_UNIT)!
            expect(refiningUnit.setRecipe).toBe(RecipeID.FURNANCE_CARBON_MATERIAL_1)

            const depot = resultState.facilities.find(f => f.type === FacilityID.PROTOCOL_AUTOMATION_CORE_PAC)!
            expect(depot.ports[14].setItem).toBe(ItemID.FERRIUM_ORE) // Check port 14

            // Check fixture item
            const controlPort = resultState.pathFixtures[0]
            expect(controlPort.setItem).toBe(ItemID.AMETHYST_ORE)
        })
    })
})
