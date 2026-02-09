import { describe, it, expect } from 'vitest'
import { ItemID, RecipeID, FacilityID } from '../ts/types/data.ts'
import { findMatchingRecipe, getInputItemsForFacility } from '../ts/game/recipes.ts'
import { recipes } from '../ts/data/recipes.ts'
import type { FieldFacility } from '../ts/types/field.ts'
import { objectKeys } from '../ts/utils/types.ts'

describe('Debug - Recipe Matching', () => {
    it('should match component glass recipe when receiving amethyst fiber', () => {
        // Create a mock facility with input flows
        const mockFacility: FieldFacility = {
            id: 'fitting_1',
            type: FacilityID.FITTING_UNIT,
            x: 10,
            y: 20,
            rotation: 0,
            width: 3,
            height: 3,
            isPowered: true,
            ports: [
                {
                    type: 'belt' as const,
                    subType: 'input' as const,
                    x: 1,
                    y: 2,
                    direction: 'down' as const,
                    flows: [
                        {
                            item: ItemID.AMETHYST_FIBER,
                            sourceRate: 0.5,
                            sinkRate: 0.5
                        }
                    ]
                },
                {
                    type: 'belt' as const,
                    subType: 'output' as const,
                    x: 1,
                    y: 0,
                    direction: 'up' as const,
                    flows: []
                }
            ],
            inputFlows: [],
            outputFlows: [],
            actualRecipe: null
        }

        // Get input items
        const inputItems = getInputItemsForFacility(mockFacility)

        // Find matching recipe
        const matchedRecipe = findMatchingRecipe(mockFacility, inputItems)

        // Check what the component recipe expects
        const componentRecipe = recipes[RecipeID.COMPONENT_GLASS_CMPT_1]

            try {
                expect(inputItems.has(ItemID.AMETHYST_FIBER)).toBe(true)
                expect(matchedRecipe).toBe(RecipeID.COMPONENT_GLASS_CMPT_1)
            } catch (error) {
                console.log('\n=== DEBUG RECIPE TEST (FAILED) ===')
                console.log('ItemID.AMETHYST_FIBER:', ItemID.AMETHYST_FIBER)
                console.log('Facility type:', mockFacility.type)
                console.log('Input ports:', mockFacility.ports.filter(p => p.subType === 'input'))
                console.log('Detected input items:', Array.from(inputItems))
                console.log('Matched recipe:', matchedRecipe)
                console.log('Component recipe inputs:', objectKeys(componentRecipe.inputs))
                console.log('Component recipe outputs:', objectKeys(componentRecipe.outputs))
                throw error
            }
    })
})
