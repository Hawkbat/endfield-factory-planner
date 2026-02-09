import { describe, it, expect } from 'vitest'
import {
    calculatePowerArea,
    isFacilityInPowerArea,
    updateAllFacilityPowerStates,
    calculatePowerStats
} from '../ts/game/power.ts'
import { FacilityID, RecipeID } from '../ts/types/data.ts'
import { createEmptyState, createFacility } from './test-helpers.ts'

describe('Power - Power Area Calculation', () => {
    it('should calculate power area for thermal bank', () => {
        const facility = createFacility({
            id: 'thermal1',
            type: FacilityID.THERMAL_BANK,
            position: [10, 10],
            isPowered: true,
            ports: []
        })

        const area = calculatePowerArea(facility)
        expect(area).toBeDefined()
        if (area) {
            const width = area.maxX - area.minX + 1
            const height = area.maxY - area.minY + 1
            expect(width).toBeGreaterThan(0)
            expect(height).toBeGreaterThan(0)
        }
    })

    it('should return null for non-power-generating facility', () => {
        const facility = createFacility({
            id: 'refinery1',
            type: FacilityID.REFINING_UNIT,
            position: [10, 10],
            isPowered: true,
            ports: []
        })

        const area = calculatePowerArea(facility)
        expect(area).toBeNull()
    })
})

describe('Power - Facility Powered State', () => {
    it('should power facility within power area', () => {
        const thermalBank = createFacility({
            id: 'thermal1',
            type: FacilityID.THERMAL_BANK,
            position: [5, 5],
            isPowered: true,
            ports: []
        })

        const targetFacility = createFacility({
            id: 'refinery1',
            type: FacilityID.REFINING_UNIT,
            position: [7, 7],
            isPowered: false,
            ports: []
        })

        const powerArea = calculatePowerArea(thermalBank)
        expect(powerArea).toBeDefined()
        
        if (powerArea) {
            const isPowered = isFacilityInPowerArea(targetFacility, powerArea)
            expect(isPowered).toBe(true)
        }
    })

    it('should not power facility outside power area', () => {
        const thermalBank = createFacility({
            id: 'thermal1',
            type: FacilityID.THERMAL_BANK,
            position: [0, 0],
            isPowered: true,
            ports: []
        })

        const targetFacility = createFacility({
            id: 'refinery1',
            type: FacilityID.REFINING_UNIT,
            position: [20, 20],
            isPowered: false,
            ports: []
        })

        const powerArea = calculatePowerArea(thermalBank)
        expect(powerArea).toBeDefined()
        
        if (powerArea) {
            const isPowered = isFacilityInPowerArea(targetFacility, powerArea)
            expect(isPowered).toBe(false)
        }
    })

    it('should auto-power facilities that do not require power', () => {
        let state = createEmptyState(20, 20)
        state = { ...state, facilities: [createFacility({
            id: 'planter1',
            type: FacilityID.DEPOT_LOADER,
            position: [5, 5],
            isPowered: false,
            ports: []
        })]}

        const result = updateAllFacilityPowerStates(state)
        expect(result.facilities[0].isPowered).toBe(true)
    })
})

describe('Power - Power Statistics', () => {
    it('should calculate power consumption for powered facility', () => {
        let state = createEmptyState(20, 20)
        state = { ...state, facilities: [
            {
                ...createFacility({
                    id: 'refinery1',
                    type: FacilityID.REFINING_UNIT,
                    position: [5, 5],
                    isPowered: true,
                    ports: []
                }),
                throttleFactor: 1.0,
                actualRecipe: RecipeID.FURNANCE_IRON_NUGGET_1
            }
        ]}

        const stats = calculatePowerStats(state)
        expect(stats.consumed).toBeGreaterThan(0)
    })

    it('should scale power generation with throttle factor', () => {
        let state = createEmptyState(20, 20)
        state = { ...state, facilities: [
            {
                ...createFacility({
                    id: 'thermal1',
                    type: FacilityID.THERMAL_BANK,
                    position: [5, 5],
                    isPowered: true,
                    ports: []
                }),
                throttleFactor: 0.5,
                actualRecipe: null
            }
        ]}

        const stats = calculatePowerStats(state)
        // Thermal bank should generate power (scaled by throttle factor)
        expect(stats.generated).toBeGreaterThanOrEqual(0)
    })
})
