import { describe, it, expect } from 'vitest'
import {
    recipeToFlowRates,
    calculateFacilityThrottleFactor,
    calculateFacilityOutputFlows,
    mergeItemFlows,
    calculatePathFlows
} from '../ts/game/flows.ts'
import { ItemID, RecipeID, FacilityID, PathTypeID, RegionID, type FieldTemplate } from '../ts/types/data.ts'
import { recipes } from '../ts/data/recipes.ts'
import { createFacility, createFacilityWithPort, createState, createPath } from './test-helpers.ts'

const smallWulingTemplate: FieldTemplate = {
    width: 10,
    height: 10,
    region: RegionID.WULING,
    depotBusPortLimit: 1,
    depotBusSectionLimit: 5,
}

describe('Flows - Recipe Conversion', () => {
    it('should calculate output flow rates from recipe', () => {
        const recipe = recipes[RecipeID.FURNANCE_IRON_NUGGET_1]
        const rates = recipeToFlowRates(recipe)
        expect(rates.outputs[ItemID.FERRIUM]).toBeGreaterThan(0)
    })

    it('should calculate throttle factor from limited inputs', () => {
        const recipe = recipes[RecipeID.FURNANCE_IRON_NUGGET_1]
        const facility = createFacility({
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
                        { item: ItemID.FERRIUM_ORE, sourceRate: 0.5, sinkRate: 0.5 }
                    ]
                }
            ]
        })

        const throttle = calculateFacilityThrottleFactor(facility, recipe)
        expect(throttle).toBeGreaterThan(0)
        expect(throttle).toBeLessThanOrEqual(1)
    })

    it('should return zero throttle when required inputs are missing', () => {
        const recipe = recipes[RecipeID.FILLING_BOTTLED_GLASS_WATER]
        const facility = createFacility({
            id: 'filling1',
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
                        { item: ItemID.AMETHYST_BOTTLE, sourceRate: 1.0, sinkRate: 1.0 }
                    ]
                }
            ]
        })

        const throttle = calculateFacilityThrottleFactor(facility, recipe)
        expect(throttle).toBe(0)
    })

    it('should calculate throttle from most limiting input', () => {
        const recipe = recipes[RecipeID.FILLING_BOTTLED_GLASS_WATER]
        const facility = createFacility({
            id: 'filling1',
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
                        { item: ItemID.CLEAN_WATER, sourceRate: 0.3, sinkRate: 0.3 }
                    ]
                }
            ]
        })

        const throttle = calculateFacilityThrottleFactor(facility, recipe)
        expect(throttle).toBeCloseTo(0.6, 2)
    })
})

describe('Flows - Output Scaling', () => {
    it('should scale output flows by throttle factor', () => {
        const recipe = recipes[RecipeID.FURNANCE_IRON_NUGGET_1]
        const outputFlows = calculateFacilityOutputFlows(
            createFacility({
                id: 'refinery1',
                type: FacilityID.REFINING_UNIT,
                position: [0, 0],
                isPowered: true,
                ports: []
            }),
            recipe,
            0.5
        )
        
        expect(outputFlows[0].sourceRate).toBeCloseTo(0.25, 2)
    })

    it('should handle recipes with multiple outputs', () => {
        const recipe = recipes[RecipeID.DISMANTLER_GLASS_WATER_1]
        const outputFlows = calculateFacilityOutputFlows(
            createFacility({
                id: 'dismantler1',
                type: FacilityID.SEPARATING_UNIT,
                position: [0, 0],
                isPowered: true,
                ports: []
            }),
            recipe,
            1.0
        )
        
        expect(outputFlows.length).toBe(2)
        expect(outputFlows.some(f => f.item === ItemID.AMETHYST_BOTTLE)).toBe(true)
        expect(outputFlows.some(f => f.item === ItemID.CLEAN_WATER)).toBe(true)
    })
})

describe('Flows - Path filtering', () => {
    it('should pick the highest-rate fluid item for pipes', () => {
        const facility = createFacilityWithPort({
            id: 'facility1',
            type: FacilityID.FLUID_PUMP,
            subType: 'output',
            position: [0, 0],
            direction: 'down',
            portType: 'pipe'
        })

        facility.ports[0].flows = [
            { item: ItemID.CLEAN_WATER, sourceRate: 1, sinkRate: 1 },
            { item: ItemID.JINCAO_SOLUTION, sourceRate: 2, sinkRate: 2 }
        ]

        const path = createPath({
            id: 'path1',
            type: PathTypeID.PIPE,
            points: [[0, 0], [1, 0]],
            startConnectedTo: { type: 'facility', facilityID: 'facility1', portIndex: 0 }
        })

        const state = createState({
            template: smallWulingTemplate,
            facilities: [facility],
            paths: [path]
        })

        const updatedPath = calculatePathFlows(path, state)
        expect(updatedPath.flows).toHaveLength(1)
        expect(updatedPath.flows[0].item).toBe(ItemID.JINCAO_SOLUTION)
    })

    it('should deterministically pick a fluid item on ties', () => {
        const facility = createFacilityWithPort({
            id: 'facility1',
            type: FacilityID.FLUID_PUMP,
            subType: 'output',
            position: [0, 0],
            direction: 'down',
            portType: 'pipe'
        })

        facility.ports[0].flows = [
            { item: ItemID.CLEAN_WATER, sourceRate: 1, sinkRate: 1 },
            { item: ItemID.JINCAO_SOLUTION, sourceRate: 1, sinkRate: 1 }
        ]

        const path = createPath({
            id: 'path1',
            type: PathTypeID.PIPE,
            points: [[0, 0], [1, 0]],
            startConnectedTo: { type: 'facility', facilityID: 'facility1', portIndex: 0 }
        })

        const state = createState({
            template: smallWulingTemplate,
            facilities: [facility],
            paths: [path]
        })

        const updatedPath = calculatePathFlows(path, state)
        const expectedItem = [ItemID.CLEAN_WATER, ItemID.JINCAO_SOLUTION][0]
        expect(updatedPath.flows[0].item).toBe(expectedItem)
    })

    it('should block fluid items on belt paths', () => {
        const facility = createFacilityWithPort({
            id: 'facility1',
            type: FacilityID.REFINING_UNIT,
            subType: 'output',
            position: [0, 0],
            direction: 'down',
            portType: 'belt'
        })

        facility.ports[0].flows = [
            { item: ItemID.CLEAN_WATER, sourceRate: 1, sinkRate: 1 },
            { item: ItemID.FERRIUM, sourceRate: 1, sinkRate: 1 }
        ]

        const path = createPath({
            id: 'path1',
            type: PathTypeID.BELT,
            points: [[0, 0], [1, 0]],
            startConnectedTo: { type: 'facility', facilityID: 'facility1', portIndex: 0 }
        })

        const state = createState({
            template: smallWulingTemplate,
            facilities: [facility],
            paths: [path]
        })

        const updatedPath = calculatePathFlows(path, state)
        expect(updatedPath.flows).toHaveLength(1)
        expect(updatedPath.flows[0].item).toBe(ItemID.FERRIUM)
    })
})

describe('Flows - Merging', () => {
    it('should merge item flows by item type', () => {
        const flowSet1: ItemFlow[] = [
            { item: ItemID.FERRIUM, sourceRate: 1.0, sinkRate: 1.0 }
        ]
        const flowSet2: ItemFlow[] = [
            { item: ItemID.FERRIUM, sourceRate: 0.5, sinkRate: 0.5 }
        ]

        const merged = mergeItemFlows([flowSet1, flowSet2])
        
        expect(merged.length).toBe(1)
        expect(merged[0].item).toBe(ItemID.FERRIUM)
        expect(merged[0].sourceRate).toBeCloseTo(1.5, 2)
        expect(merged[0].sinkRate).toBeCloseTo(1.5, 2)
    })

    it('should handle multiple different items', () => {
        const flowSet1: ItemFlow[] = [
            { item: ItemID.FERRIUM, sourceRate: 1.0, sinkRate: 1.0 }
        ]
        const flowSet2: ItemFlow[] = [
            { item: ItemID.AMETHYST_FIBER, sourceRate: 0.5, sinkRate: 0.5 }
        ]

        const merged = mergeItemFlows([flowSet1, flowSet2])
        
        expect(merged.length).toBe(2)
        expect(merged.some(f => f.item === ItemID.FERRIUM)).toBe(true)
        expect(merged.some(f => f.item === ItemID.AMETHYST_FIBER)).toBe(true)
    })

    it('should handle empty flow arrays', () => {
        const merged = mergeItemFlows([[], []])
        expect(merged.length).toBe(0)
    })
})
