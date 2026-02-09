import { describe, it, expect } from 'vitest'
import type { UserChange } from '../ts/types/field.ts'
import { FacilityID, PathTypeID, PathFixtureID, ItemID } from '../ts/types/data.ts'
import { createEmptyState, applyChanges } from './test-helpers.ts'

describe('Changes - Facility Operations', () => {
    it('add-facility: should create facility with correct properties', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            {
                type: 'add-facility',
                facilityType: FacilityID.REFINING_UNIT,
                position: [5, 5],
                rotation: 0
            }
        ]

        const result = applyChanges(state, changes)

        expect(result.facilities).toHaveLength(1)
        expect(result.facilities[0].type).toBe(FacilityID.REFINING_UNIT)
        expect(result.facilities[0].x).toBe(5)
        expect(result.facilities[0].y).toBe(5)
        expect(result.facilities[0].rotation).toBe(0)
        expect(result.facilities[0].ports.length).toBeGreaterThan(0)
        expect(result.facilities[0].id).toBeDefined()
        expect(result.facilities[0].isPowered).toBe(false)
        expect(result.facilities[0].inputFlows).toEqual([])
        expect(result.facilities[0].outputFlows).toEqual([])
    })

    it('add-facility: should generate unique IDs', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [0, 0], rotation: 0 },
            { type: 'add-facility', facilityType: FacilityID.SHREDDING_UNIT, position: [5, 5], rotation: 0 }
        ]

        const result = applyChanges(state, changes)

        expect(result.facilities).toHaveLength(2)
        expect(result.facilities[0].id).not.toBe(result.facilities[1].id)
    })

    it('add-facility: should handle 90 degree rotation (swap dimensions)', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [5, 5], rotation: 90 }
        ]

        const result = applyChanges(state, changes)
        const facility = result.facilities[0]

        // Refining unit default is 2x2, so it shouldn't change on 90 degrees
        // But other facilities with different aspect ratios should swap
        expect(facility.rotation).toBe(90)
        expect(facility.x).toBe(5)
        expect(facility.y).toBe(5)
    })

    it('move-facility: should update facility position', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [5, 5], rotation: 0 },
            { type: 'move-facility', facilityID: 'facility_1', newPosition: [10, 10] }
        ]

        const result = applyChanges(state, changes)

        expect(result.facilities[0].x).toBe(10)
        expect(result.facilities[0].y).toBe(10)
    })

    it('move-facility: should clear connection state', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [5, 5], rotation: 0 },
            { type: 'add-facility', facilityType: FacilityID.DEPOT_UNLOADER, position: [6, 5], rotation: 0 },
            { type: 'move-facility', facilityID: 'facility_1', newPosition: [15, 15] }
        ]

        const result = applyChanges(state, changes)

        // After moving, ports should not have stale connection info
        expect(result.facilities[0].ports.every(p => !p.connectedPathID)).toBe(true)
        expect(result.facilities[0].inputFlows).toEqual([])
        expect(result.facilities[0].outputFlows).toEqual([])
    })

    it('rotate-facility: should update rotation', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [5, 5], rotation: 0 },
            { type: 'rotate-facility', facilityID: 'facility_1', newRotation: 90 }
        ]

        const result = applyChanges(state, changes)

        expect(result.facilities[0].rotation).toBe(90)
    })

    it('rotate-facility: should clear connection state', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [5, 5], rotation: 0 },
            { type: 'rotate-facility', facilityID: 'facility_1', newRotation: 90 }
        ]

        const result = applyChanges(state, changes)

        expect(result.facilities[0].ports.every(p => !p.connectedPathID)).toBe(true)
    })

    it('remove-facility: should delete facility', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [5, 5], rotation: 0 },
            { type: 'remove-facility', facilityID: 'facility_1' }
        ]

        const result = applyChanges(state, changes)

        expect(result.facilities).toHaveLength(0)
    })

    it('remove-facility: should remove only specified facility', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [0, 0], rotation: 0 },
            { type: 'add-facility', facilityType: FacilityID.SHREDDING_UNIT, position: [5, 5], rotation: 0 },
            { type: 'remove-facility', facilityID: 'facility_1' }
        ]

        const result = applyChanges(state, changes)

        expect(result.facilities).toHaveLength(1)
        expect(result.facilities[0].type).toBe(FacilityID.SHREDDING_UNIT)
    })
})

describe('Changes - Path Operations', () => {
    it('add-path: should create path with points', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[0, 5], [10, 5]] }
        ]

        const result = applyChanges(state, changes)

        expect(result.paths).toHaveLength(1)
        expect(result.paths[0].type).toBe(PathTypeID.BELT)
        expect(result.paths[0].points).toEqual([[0, 5], [10, 5]])
        expect(result.paths[0].flows).toEqual([])
        expect(result.paths[0].id).toBeDefined()
    })

    it('add-path: should generate unique IDs', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[0, 0], [5, 0]] },
            { type: 'add-path', pathType: PathTypeID.PIPE, points: [[10, 10], [15, 10]] }
        ]

        const result = applyChanges(state, changes)

        expect(result.paths).toHaveLength(2)
        expect(result.paths[0].id).not.toBe(result.paths[1].id)
    })

    it('add-path-segment: should add segment to end', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[0, 0], [5, 0]] },
            { type: 'add-path-segment', pathID: 'path_1', endpoint: 'end', newPoint: [5, 5] }
        ]

        const result = applyChanges(state, changes)

        expect(result.paths[0].points).toEqual([[0, 0], [5, 0], [5, 5]])
    })

    it('add-path-segment: should add segment to start', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[5, 5], [10, 5]] },
            { type: 'add-path-segment', pathID: 'path_1', endpoint: 'start', newPoint: [0, 5] }
        ]

        const result = applyChanges(state, changes)

        expect(result.paths[0].points).toEqual([[0, 5], [5, 5], [10, 5]])
    })

    it('move-path-point: should move specified point', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[0, 0], [5, 0], [5, 5]] },
            { type: 'move-path-point', pathID: 'path_1', pointIndex: 1, newPosition: [10, 0] }
        ]

        const result = applyChanges(state, changes)

        expect(result.paths[0].points).toEqual([[0, 0], [10, 0], [5, 5]])
    })

    it('remove-path-segment: should remove from end', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[0, 0], [5, 0], [5, 5]] },
            { type: 'remove-path-segment', pathID: 'path_1', endpoint: 'end' }
        ]

        const result = applyChanges(state, changes)

        expect(result.paths[0].points).toEqual([[0, 0], [5, 0]])
    })

    it('remove-path-segment: should remove from start', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[0, 0], [5, 0], [5, 5]] },
            { type: 'remove-path-segment', pathID: 'path_1', endpoint: 'start' }
        ]

        const result = applyChanges(state, changes)

        expect(result.paths[0].points).toEqual([[5, 0], [5, 5]])
    })

    it('remove-path: should delete path', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[0, 0], [10, 0]] },
            { type: 'remove-path', pathID: 'path_1' }
        ]

        const result = applyChanges(state, changes)

        expect(result.paths).toHaveLength(0)
    })
})

describe('Changes - Path Fixture Operations', () => {
    it('add-path-fixture: should create fixture', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            {
                type: 'add-path-fixture',
                fixtureType: PathFixtureID.BELT_BRIDGE,
                position: [5, 5],
                rotation: 0
            }
        ]

        const result = applyChanges(state, changes)

        expect(result.pathFixtures).toHaveLength(1)
        expect(result.pathFixtures[0].type).toBe(PathFixtureID.BELT_BRIDGE)
        expect(result.pathFixtures[0].x).toBe(5)
        expect(result.pathFixtures[0].y).toBe(5)
        expect(result.pathFixtures[0].rotation).toBe(0)
        expect(result.pathFixtures[0].sides.length).toBeGreaterThan(0)
        expect(result.pathFixtures[0].id).toBeDefined()
    })

    it('add-path-fixture: should generate unique IDs', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [5, 5], rotation: 0 },
            { type: 'add-path-fixture', fixtureType: PathFixtureID.SPLITTER, position: [10, 10], rotation: 0 }
        ]

        const result = applyChanges(state, changes)

        expect(result.pathFixtures).toHaveLength(2)
        expect(result.pathFixtures[0].id).not.toBe(result.pathFixtures[1].id)
    })

    it('move-path-fixture: should update position', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [5, 5], rotation: 0 },
            { type: 'move-path-fixture', fixtureID: 'fixture_1', newPosition: [10, 10] }
        ]

        const result = applyChanges(state, changes)

        expect(result.pathFixtures[0].x).toBe(10)
        expect(result.pathFixtures[0].y).toBe(10)
    })

    it('rotate-path-fixture: should update rotation', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [5, 5], rotation: 0 },
            { type: 'rotate-path-fixture', fixtureID: 'fixture_1', newRotation: 90 }
        ]

        const result = applyChanges(state, changes)

        expect(result.pathFixtures[0].rotation).toBe(90)
    })

    it('remove-path-fixture: should delete fixture', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [5, 5], rotation: 0 },
            { type: 'remove-path-fixture', fixtureID: 'fixture_1' }
        ]

        const result = applyChanges(state, changes)

        expect(result.pathFixtures).toHaveLength(0)
    })
})

describe('Changes - Depot Operations', () => {
    it('set-port-item: should set item on external output port', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-facility', facilityType: FacilityID.DEPOT_UNLOADER, position: [0, 0], rotation: 0 },
            { type: 'set-port-item', facilityID: 'facility_1', portIndex: 0, itemID: ItemID.FERRIUM_ORE }
        ]

        const result = applyChanges(state, changes)

        const depotPort = result.facilities[0].ports.find(p => p.external === 'depot')
        expect(depotPort?.setItem).toBe(ItemID.FERRIUM_ORE)
    })

    it('set-port-item: should clear item with null', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-facility', facilityType: FacilityID.DEPOT_UNLOADER, position: [0, 0], rotation: 0 },
            { type: 'set-port-item', facilityID: 'facility_1', portIndex: 0, itemID: ItemID.FERRIUM_ORE },
            { type: 'set-port-item', facilityID: 'facility_1', portIndex: 0, itemID: null }
        ]

        const result = applyChanges(state, changes)

        const depotPort = result.facilities[0].ports.find(p => p.external === 'depot')
        expect(depotPort?.setItem).toBeNull()
    })
})

describe('Changes - Load State', () => {
    it('loadState: should replace entire field state', () => {
        const initialState = createEmptyState(10, 10)
        const newState = createEmptyState(20, 20)

        const changes: UserChange[] = [
            { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [5, 5], rotation: 0 },
            { type: 'loadState', fieldState: newState }
        ]

        const result = applyChanges(initialState, changes)

        expect(result.width).toBe(20)
        expect(result.height).toBe(20)
        expect(result.facilities).toHaveLength(0)
    })
})

describe('Changes - Complex Scenarios', () => {
    it('should handle multiple facilities and paths in sequence', () => {
        const state = createEmptyState(30, 30)
        const changes: UserChange[] = [
            { type: 'add-facility', facilityType: FacilityID.DEPOT_UNLOADER, position: [0, 0], rotation: 0 },
            { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [5, 5], rotation: 0 },
            { type: 'add-facility', facilityType: FacilityID.SHREDDING_UNIT, position: [10, 10], rotation: 0 },
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[1, 0], [1, 5]] },
            { type: 'add-path', pathType: PathTypeID.BELT, points: [[6, 5], [6, 10]] }
        ]

        const result = applyChanges(state, changes)

        expect(result.facilities).toHaveLength(3)
        expect(result.paths).toHaveLength(2)
    })

    it('should handle entity removal and replacement', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [5, 5], rotation: 0 },
            { type: 'remove-facility', facilityID: 'facility_1' },
            { type: 'add-facility', facilityType: FacilityID.SHREDDING_UNIT, position: [5, 5], rotation: 0 }
        ]

        const result = applyChanges(state, changes)

        expect(result.facilities).toHaveLength(1)
        expect(result.facilities[0].type).toBe(FacilityID.SHREDDING_UNIT)
    })

    it('should handle invalid ID references gracefully', () => {
        const state = createEmptyState(20, 20)
        const changes: UserChange[] = [
            { type: 'move-facility', facilityID: 'nonexistent', newPosition: [10, 10] }
        ]

        // Should not throw
        const result = applyChanges(state, changes)
        expect(result.facilities).toHaveLength(0)
    })
})
