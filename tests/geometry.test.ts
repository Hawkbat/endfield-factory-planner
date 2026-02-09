import { describe, it, expect } from 'vitest'
import {
    isInBounds,
    doEntitiesOverlap,
    doesPathSegmentOverlapEntity,
    validateFacilityPlacement
} from '../ts/game/geometry.ts'
import { FacilityID } from '../ts/types/data.ts'
import { createState, createFacility } from './test-helpers.ts'

describe('Geometry - Bounds Checking', () => {
    it('should validate entity within bounds', () => {
        const state = createState({ width: 10, height: 10 })
        expect(isInBounds(0, 0, 3, 3, state)).toBe(true)
        expect(isInBounds(7, 7, 3, 3, state)).toBe(true)
    })

    it('should reject entity extending outside bounds', () => {
        const state = createState({ width: 10, height: 10 })
        expect(isInBounds(8, 8, 2, 2, state)).toBe(true)
        expect(isInBounds(9, 9, 2, 2, state)).toBe(false)
    })

    it('should reject entity with negative coordinates', () => {
        const state = createState({ width: 10, height: 10 })
        expect(isInBounds(-1, 0, 2, 2, state)).toBe(false)
        expect(isInBounds(0, -1, 2, 2, state)).toBe(false)
    })
})

describe('Geometry - Entity Overlap', () => {
    it('should detect overlapping entities', () => {
        expect(doEntitiesOverlap(
            { x: 0, y: 0, width: 3, height: 3 },
            { x: 2, y: 2, width: 3, height: 3 }
        )).toBe(true)
    })

    it('should allow edge-adjacent entities', () => {
        expect(doEntitiesOverlap(
            { x: 0, y: 0, width: 3, height: 3 },
            { x: 3, y: 0, width: 3, height: 3 }
        )).toBe(false)
    })
})

describe('Geometry - Path Segment Overlap', () => {
    it('should detect overlap between segment and entity', () => {
        const entity = { x: 3, y: 3, width: 2, height: 2 }
        expect(doesPathSegmentOverlapEntity([0, 4], [6, 4], entity)).toBe(true)
    })

    it('should allow non-overlapping segment', () => {
        const entity = { x: 3, y: 3, width: 2, height: 2 }
        expect(doesPathSegmentOverlapEntity([0, 1], [6, 1], entity)).toBe(false)
    })
})

describe('Geometry - Facility Placement Validation', () => {
    it('should validate non-overlapping facility', () => {
        const state = createState({
            width: 20,
            height: 20,
            facilities: [
                createFacility({
                    id: 'fac1',
                    type: FacilityID.REFINING_UNIT,
                    position: [0, 0],
                    isPowered: true,
                    ports: []
                })
            ]
        })

        const candidate = createFacility({
            id: 'fac2',
            type: FacilityID.REFINING_UNIT,
            position: [5, 5],
            isPowered: true,
            ports: []
        })

        const result = validateFacilityPlacement(candidate, state)
        expect(result.invalidPlacement).toBeFalsy()
    })

    it('should reject overlapping facility', () => {
        const state = createState({
            width: 20,
            height: 20,
            facilities: [
                createFacility({
                    id: 'fac1',
                    type: FacilityID.REFINING_UNIT,
                    position: [5, 5],
                    isPowered: true,
                    ports: []
                })
            ]
        })

        const candidate = createFacility({
            id: 'fac2',
            type: FacilityID.REFINING_UNIT,
            position: [6, 6],
            isPowered: true,
            ports: []
        })

        const result = validateFacilityPlacement(candidate, state)
        expect(result.invalidPlacement).toBe(true)
    })
})
