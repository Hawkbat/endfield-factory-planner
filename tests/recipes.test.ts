import { describe, it, expect } from 'vitest'
import {
    findMatchingRecipe,
    getInputItemsForFacility,
    canRecipeActivate,
    shouldUseJumpStart,
    updateAllFacilityRecipes
} from '../ts/game/recipes.ts'
import type { FieldState, FieldFacility } from '../ts/types/field.ts'
import { FacilityID, ItemID, RecipeID } from '../ts/types/data.ts'
import { recipes } from '../ts/data/recipes.ts'
import { createFacility, createEmptyState } from './test-helpers.ts'

describe('Recipes - Input Detection', () => {
    it('should detect input items from facility input flows', () => {
        const facility: FieldFacility = createFacility({
            id: 'refinery1',
            type: FacilityID.REFINING_UNIT,
            position: [0, 0],
            isPowered: true,
            ports: [
                {
                    type: 'belt',
                    subType: 'input',
                    x: 0,
                    y: 0,
                    direction: 'down',
                    flows: [
                        { item: ItemID.FERRIUM_ORE, sourceRate: 1.0, sinkRate: 1.0 }
                    ]
                }
            ]
        })

        const recipe = findMatchingRecipe(facility, getInputItemsForFacility(facility))
        expect(recipe).toBe(RecipeID.FURNANCE_IRON_NUGGET_1)
    })

    it('should detect multiple input items', () => {
        const facility: FieldFacility = createFacility({
            id: 'filler1',
            type: FacilityID.FILLING_UNIT,
            position: [0, 0],
            isPowered: true,
            ports: [
                {
                    type: 'belt',
                    subType: 'input',
                    x: 0,
                    y: 0,
                    direction: 'down',
                    flows: [
                        { item: ItemID.AMETHYST_BOTTLE, sourceRate: 1.0, sinkRate: 1.0 },
                        { item: ItemID.CLEAN_WATER, sourceRate: 1.0, sinkRate: 1.0 }
                    ]
                }
            ]
        })

        const recipe = findMatchingRecipe(facility, getInputItemsForFacility(facility))
        expect(recipe).toBe(RecipeID.FILLING_BOTTLED_GLASS_WATER)
    })
})

describe('Recipes - Recipe Matching', () => {
    it('should match recipe for single input', () => {
        const facility: FieldFacility = createFacility({
            id: 'refinery1',
            type: FacilityID.REFINING_UNIT,
            position: [0, 0],
            isPowered: true,
            ports: [
                {
                    type: 'belt',
                    subType: 'input',
                    x: 0,
                    y: 0,
                    direction: 'down',
                    flows: [
                        { item: ItemID.AMETHYST_ORE, sourceRate: 1.0, sinkRate: 1.0 }
                    ]
                }
            ]
        })

        const recipe = findMatchingRecipe(facility, getInputItemsForFacility(facility))
        expect(recipe).toBe(RecipeID.FURNANCE_QUARTZ_GLASS_1)
    })

    it('should return null when no recipe matches', () => {
        const facility: FieldFacility = createFacility({
            id: 'refinery1',
            type: FacilityID.REFINING_UNIT,
            position: [0, 0],
            isPowered: true,
            ports: [
                {
                    type: 'belt',
                    subType: 'input',
                    x: 0,
                    y: 0,
                    direction: 'down',
                    flows: [
                        { item: ItemID.AMETHYST_BOTTLE, sourceRate: 1.0, sinkRate: 1.0 }
                    ]
                }
            ]
        })

        const recipe = findMatchingRecipe(facility, getInputItemsForFacility(facility))
        // REFINING_UNIT doesn't have a recipe for AMETHYST_BOTTLE
        expect(recipe).toBeNull()
    })

    it('should respect facility type when matching recipe', () => {
        const facility: FieldFacility = createFacility({
            id: 'shredder1',
            type: FacilityID.SHREDDING_UNIT,
            position: [0, 0],
            isPowered: true,
            ports: [
                {
                    type: 'belt',
                    subType: 'input',
                    x: 0,
                    y: 0,
                    direction: 'down',
                    flows: [
                        { item: ItemID.FERRIUM, sourceRate: 1.0, sinkRate: 1.0 }
                    ]
                }
            ]
        })

        const recipe = findMatchingRecipe(facility, getInputItemsForFacility(facility))
        expect(recipe).toBe(RecipeID.GRINDER_IRON_POWDER_1)
    })
})

describe('Recipes - Recipe Activation', () => {
    it('should activate recipe when facility is powered and has inputs', () => {
        const facility: FieldFacility = {
            ...createFacility({
                id: 'refinery1',
                type: FacilityID.REFINING_UNIT,
                position: [0, 0],
                isPowered: true,
                ports: [
                    {
                        type: 'belt',
                        subType: 'input',
                        x: 0,
                        y: 0,
                        direction: 'down',
                        flows: [
                            { item: ItemID.FERRIUM_ORE, sourceRate: 1.0, sinkRate: 1.0 }
                        ]
                    }
                ]
            }),
            actualRecipe: RecipeID.FURNANCE_IRON_NUGGET_1
        }

        const activated = canRecipeActivate(recipes[RecipeID.FURNANCE_IRON_NUGGET_1], facility)
        expect(activated).toBe(true)
    })

    it('should not activate recipe when facility is unpowered', () => {
        const facility: FieldFacility = {
            ...createFacility({
                id: 'refinery1',
                type: FacilityID.REFINING_UNIT,
                position: [0, 0],
                isPowered: false,
                ports: [
                    {
                        type: 'belt',
                        subType: 'input',
                        x: 0,
                        y: 0,
                        direction: 'down',
                        flows: [
                            { item: ItemID.FERRIUM_ORE, sourceRate: 1.0, sinkRate: 1.0 }
                        ]
                    }
                ]
            }),
            actualRecipe: RecipeID.FURNANCE_IRON_NUGGET_1
        }

        const activated = canRecipeActivate(recipes[RecipeID.FURNANCE_IRON_NUGGET_1], facility)
        expect(activated).toBe(false)
    })

    it('should activate jump-started recipe even without inputs', () => {
        const facility: FieldFacility = {
            ...createFacility({
                id: 'planter1',
                type: FacilityID.PLANTING_UNIT,
                position: [0, 0],
                isPowered: true,
                ports: []
            }),
            jumpStartRecipe: true,
            setRecipe: RecipeID.PLANTER_PLANT_MOSS_1_1
        }

        expect(shouldUseJumpStart(facility)).toBe(true)
    })
    
    it('should NOT use jump-start when facility has active input flows', () => {
        const facility: FieldFacility = {
            ...createFacility({
                id: 'planter1',
                type: FacilityID.PLANTING_UNIT,
                position: [0, 0],
                isPowered: true,
                ports: [
                    {
                        type: 'belt',
                        subType: 'input',
                        x: 0,
                        y: 0,
                        direction: 'down',
                        flows: [
                            { item: ItemID.SANDLEAF, sourceRate: 0.5, sinkRate: 0.5 }
                        ]
                    }
                ]
            }),
            jumpStartRecipe: true,
            setRecipe: RecipeID.PLANTER_PLANT_MOSS_1_1
        }

        expect(shouldUseJumpStart(facility)).toBe(false)
    })
})

describe('Recipes - State Updates', () => {
    it('should update all facility recipes', () => {
        let state = createEmptyState(20, 20)
        state = { ...state, facilities: [
            createFacility({
                id: 'refinery1',
                type: FacilityID.REFINING_UNIT,
                position: [0, 0],
                isPowered: true,
                ports: [
                    {
                        type: 'belt',
                        subType: 'input',
                        x: 0,
                        y: 0,
                        direction: 'down',
                        flows: [
                            { item: ItemID.FERRIUM_ORE, sourceRate: 1.0, sinkRate: 1.0 }
                        ]
                    }
                ]
            })
        ]}

        const result = updateAllFacilityRecipes(state)
        expect(result.state.facilities[0].actualRecipe).toBe(RecipeID.FURNANCE_IRON_NUGGET_1)
    })

    it('should collect warnings for ambiguous matches', () => {
        let state = createEmptyState(20, 20)
        state = { ...state, facilities: [
            createFacility({
                id: 'refinery1',
                type: FacilityID.REFINING_UNIT,
                position: [0, 0],
                isPowered: true,
                ports: []
            })
        ]}

        const result = updateAllFacilityRecipes(state)
        expect(result.warnings).toBeDefined()
        expect(Array.isArray(result.warnings)).toBe(true)
    })
})
