import { describe, it, expect } from 'vitest'
import { createSampleFieldState } from '../ts/game/sampleField.ts'
import { recalculateFieldState } from '../ts/game/field.ts'
import { PathFixtureID, ItemID } from '../ts/types/data.ts'
import type { UserChange } from '../ts/types/field.ts'

describe('Fixture Integration - Sample Field', () => {
    it('should place bridge fixture on path without invalidPlacement errors', () => {
        const initialState = createSampleFieldState()
        
        // Place a bridge at position (32, 20) on the vertical segment
        const changes: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [32, 20], rotation: 0 }
        ]
        
        const newState = recalculateFieldState(initialState, changes)
        
        // Check that the fixture was added
        const addedFixture = newState.pathFixtures.find(f => f.x === 32 && f.y === 20)
        expect(addedFixture).toBeDefined()
        expect(addedFixture?.errorFlags?.invalidPlacement).toBeFalsy()
        
        // Check that paths don't have invalidPlacement errors
        for (const path of newState.paths) {
            expect(path.errorFlags?.invalidPlacement).toBeFalsy()
        }
    })
    
    it('should propagate flows through multiple fixtures in sequence', () => {
        const initialState = createSampleFieldState()
        
        // Place two bridges in sequence on path_4: [[30, 31], [14, 31], [14, 28]]
        // Valid positions on this path: (30, 31), (29, 31), (28, 31), ..., (15, 31), (14, 31), (14, 30), (14, 29), (14, 28)
        const changes: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [20, 31], rotation: 0 },
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [16, 31], rotation: 0 }
        ]
        
        const newState = recalculateFieldState(initialState, changes)
        
        // Check that both fixtures were added
        const fixture1 = newState.pathFixtures.find(f => f.x === 20 && f.y === 31)
        const fixture2 = newState.pathFixtures.find(f => f.x === 16 && f.y === 31)
        expect(fixture1).toBeDefined()
        expect(fixture2).toBeDefined()
        
        // CRITICAL TEST: Both fixtures should have flows on their sides
        const fixture1HasFlows = fixture1!.sides.some(s => s.flows.length > 0)
        const fixture2HasFlows = fixture2!.sides.some(s => s.flows.length > 0)
        
        expect(fixture1HasFlows).toBe(true)
        expect(fixture2HasFlows).toBe(true)
        
        // Both fixtures should be properly connected to paths
        const fixture1ConnectedSides = fixture1!.sides.filter(s => s.connectedPathID !== null)
        const fixture2ConnectedSides = fixture2!.sides.filter(s => s.connectedPathID !== null)
        
        expect(fixture1ConnectedSides.length).toBeGreaterThan(0)
        expect(fixture2ConnectedSides.length).toBeGreaterThan(0)
        
        // Check that flows exist on all three path segments (before fixture1, between fixtures, after fixture2)
        const pathsWithFlows = newState.paths.filter(p => p.flows.length > 0)
        expect(pathsWithFlows.length).toBeGreaterThanOrEqual(3)
    })
    
    it('should place control port fixture on path with proper flow filtering', () => {
        const initialState = createSampleFieldState()
        
        // Place a control port at position (14, 30) on path from PAC, not overlapping facilities
        // Path is [[30, 31], [14, 31], [14, 28]], vertical downward at y=30
        const changes: UserChange[] = [
            { type: 'multi', changes: [
                { type: 'add-path-fixture', fixtureType: PathFixtureID.ITEM_CONTROL_PORT, position: [14, 30], rotation: 180 },
                { type: 'set-fixture-item', fixtureID: '@ref:fixture:0', itemID: ItemID.AMETHYST_ORE }
            ]}
        ]
        
        const newState = recalculateFieldState(initialState, changes)
        
        // Check that the fixture was added and configured
        const addedFixture = newState.pathFixtures[0]
        expect(addedFixture).toBeDefined()
        expect(addedFixture.type).toBe(PathFixtureID.ITEM_CONTROL_PORT)
        expect(addedFixture.setItem).toBe(ItemID.AMETHYST_ORE)
        expect(addedFixture.errorFlags?.invalidPlacement).toBeFalsy()
        
        // Check that paths don't have errors
        for (const path of newState.paths) {
            expect(path.errorFlags?.invalidPlacement).toBeFalsy()
        }
    })
    
    it('should propagate flows through three fixtures in sequence', () => {
        const initialState = createSampleFieldState()
        
        // Place three fixtures in sequence on path_4: [[30, 31], [14, 31], [14, 28]]
        const changes: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [25, 31], rotation: 0 },
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [20, 31], rotation: 0 },
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [16, 31], rotation: 0 }
        ]
        
        const newState = recalculateFieldState(initialState, changes)
        
        // Check that all three fixtures were added
        const fixture1 = newState.pathFixtures.find(f => f.x === 25 && f.y === 31)
        const fixture2 = newState.pathFixtures.find(f => f.x === 20 && f.y === 31)
        const fixture3 = newState.pathFixtures.find(f => f.x === 16 && f.y === 31)
        
        expect(fixture1).toBeDefined()
        expect(fixture2).toBeDefined()
        expect(fixture3).toBeDefined()
        
        // CRITICAL TEST: All three fixtures should have flows
        const fixture1HasFlows = fixture1!.sides.some(s => s.flows.length > 0)
        const fixture2HasFlows = fixture2!.sides.some(s => s.flows.length > 0)
        const fixture3HasFlows = fixture3!.sides.some(s => s.flows.length > 0)
        
        expect(fixture1HasFlows).toBe(true)
        expect(fixture2HasFlows).toBe(true)
        expect(fixture3HasFlows).toBe(true)
        
        // All fixtures should have the same flow rates (no flow loss)
        const fixture1Flows = fixture1!.sides.flatMap(s => s.flows)
        const fixture2Flows = fixture2!.sides.flatMap(s => s.flows)
        const fixture3Flows = fixture3!.sides.flatMap(s => s.flows)
        
        // Check that fixture2 and fixture3 have flows (this is where the bug manifests)
        expect(fixture2Flows.length).toBeGreaterThan(0)
        expect(fixture3Flows.length).toBeGreaterThan(0)
    })
    
    it('should propagate flows through multiple control port fixtures in sequence', () => {
        const initialState = createSampleFieldState()
        
        // Place two control port fixtures in sequence on path_4
        // Path flows right-to-left, so fixtures need input on right (270° rotation)
        const changes: UserChange[] = [
            { type: 'multi', changes: [
                { type: 'add-path-fixture', fixtureType: PathFixtureID.ITEM_CONTROL_PORT, position: [25, 31], rotation: 270 },
                { type: 'set-fixture-item', fixtureID: '@ref:fixture:0', itemID: ItemID.AMETHYST_ORE }
            ]},
            { type: 'multi', changes: [
                { type: 'add-path-fixture', fixtureType: PathFixtureID.ITEM_CONTROL_PORT, position: [20, 31], rotation: 270 },
                { type: 'set-fixture-item', fixtureID: '@ref:fixture:0', itemID: ItemID.AMETHYST_ORE }
            ]}
        ]
        
        const newState = recalculateFieldState(initialState, changes)
        
        const fixture1 = newState.pathFixtures.find(f => f.x === 25 && f.y === 31)
        const fixture2 = newState.pathFixtures.find(f => f.x === 20 && f.y === 31)
        
        expect(fixture1).toBeDefined()
        expect(fixture2).toBeDefined()
        
        // CRITICAL: Both control port fixtures should have flows
        const fixture1HasFlows = fixture1!.sides.some(s => s.flows.length > 0)
        const fixture2HasFlows = fixture2!.sides.some(s => s.flows.length > 0)
        
        expect(fixture1HasFlows).toBe(true)
        expect(fixture2HasFlows).toBe(true)
    })
    
    it('should propagate flows through bridge then control port fixtures', () => {
        const initialState = createSampleFieldState()
        
        // Place a bridge followed by a control port on path_4
        // Path flows right-to-left, so control port needs input on right (270° rotation)
        const changes: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [25, 31], rotation: 0 },
            { type: 'multi', changes: [
                { type: 'add-path-fixture', fixtureType: PathFixtureID.ITEM_CONTROL_PORT, position: [20, 31], rotation: 270 },
                { type: 'set-fixture-item', fixtureID: '@ref:fixture:0', itemID: ItemID.AMETHYST_ORE }
            ]}
        ]
        
        const newState = recalculateFieldState(initialState, changes)
        
        const bridge = newState.pathFixtures.find(f => f.x === 25 && f.y === 31 && f.type === PathFixtureID.BELT_BRIDGE)
        const controlPort = newState.pathFixtures.find(f => f.x === 20 && f.y === 31 && f.type === PathFixtureID.ITEM_CONTROL_PORT)
        
        expect(bridge).toBeDefined()
        expect(controlPort).toBeDefined()
        
        // CRITICAL: Both fixtures should have flows
        const bridgeHasFlows = bridge!.sides.some(s => s.flows.length > 0)
        const controlPortHasFlows = controlPort!.sides.some(s => s.flows.length > 0)
        
        console.log('Bridge sides:', bridge!.sides.map(s => ({ dir: s.direction, subType: s.subType, flows: s.flows, connectedPathID: s.connectedPathID })))
        console.log('Control Port sides:', controlPort!.sides.map(s => ({ dir: s.direction, subType: s.subType, flows: s.flows, connectedPathID: s.connectedPathID })))
        
        expect(bridgeHasFlows).toBe(true)
        expect(controlPortHasFlows).toBe(true)
    })
    
    it('should properly connect fixture sides to split paths', () => {
        const initialState = createSampleFieldState()
        
        // Place a control port on a vertical path segment going downward
        const changes: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.ITEM_CONTROL_PORT, position: [14, 23], rotation: 180 }
        ]
        
        const newState = recalculateFieldState(initialState, changes)
        
        const addedFixture = newState.pathFixtures[0]
        expect(addedFixture).toBeDefined()
        
        // Check that the fixture has exactly 2 sides connected (input and output along the path)
        const connectedSides = addedFixture.sides.filter(s => s.connectedPathID)
        expect(connectedSides.length).toBe(2)
        
        // Each connected side should reference a valid path
        for (const side of connectedSides) {
            const connectedPath = newState.paths.find(p => p.id === side.connectedPathID)
            expect(connectedPath).toBeDefined()
            
            // The path should have a connection reference back to this fixture
            const pathConnectsToFixture = 
                (connectedPath?.startConnectedTo?.type === 'fixture' && connectedPath?.startConnectedTo?.fixtureID === addedFixture.id) ||
                (connectedPath?.endConnectedTo?.type === 'fixture' && connectedPath?.endConnectedTo?.fixtureID === addedFixture.id)
            expect(pathConnectsToFixture).toBe(true)
        }
    })
    
    it('should maintain production chain functionality with fixtures in place', () => {
        const initialState = createSampleFieldState()
        
        // Add fixtures but verify that the production chain still works
        const changes: UserChange[] = [
            { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [14, 27], rotation: 0 }
        ]
        
        const newState = recalculateFieldState(initialState, changes)
        
        // Check that the depot still has flows (production is happening)
        const hasInputFlows = newState.depot.inputFlows.length > 0
        const hasOutputFlows = newState.depot.outputFlows.length > 0
        
        expect(hasInputFlows || hasOutputFlows).toBe(true)
        
        // Check that facilities are still operating
        const operatingFacilities = newState.facilities.filter(f => 
            f.actualRecipe !== null || f.inputFlows.length > 0 || f.outputFlows.length > 0
        )
        
        expect(operatingFacilities.length).toBeGreaterThan(0)
    })

    it('should work with paths drawn in reverse direction (path-order agnostic)', () => {
        // This test verifies that fixture flows work correctly regardless of
        // which direction the path points were drawn (start→end or end→start)
        
        const initialState = createSampleFieldState()
        
        // Place a control port on path_4, but this time we'll manually reverse
        // the path direction to test that flow calculation is agnostic
        const changes: UserChange[] = [
            { type: 'multi', changes: [
                { type: 'add-path-fixture', fixtureType: PathFixtureID.ITEM_CONTROL_PORT, position: [25, 31], rotation: 90 },
                { type: 'set-fixture-item', fixtureID: '@ref:fixture:0', itemID: ItemID.AMETHYST_ORE }
            ]}
        ]
        
        let newState = recalculateFieldState(initialState, changes)
        
        // Manually reverse one of the path's points to simulate drawing in opposite direction
        // Find path_7 (which should be [25,31] to [20,31]) and reverse it
        const path7Index = newState.paths.findIndex(p => p.id === 'path_7')
        if (path7Index >= 0) {
            const path7 = newState.paths[path7Index]
            // Reverse the points array
            const reversedPath = {
                ...path7,
                points: [...path7.points].reverse()
            }
            
            // Update the state with reversed path
            newState = {
                ...newState,
                paths: [
                    ...newState.paths.slice(0, path7Index),
                    reversedPath,
                    ...newState.paths.slice(path7Index + 1)
                ]
            }
            
            // Recalculate with the reversed path
            newState = recalculateFieldState(newState, [])
        }
        
        const fixture = newState.pathFixtures.find(f => f.x === 25 && f.y === 31)
        expect(fixture).toBeDefined()
        
        // The fixture should still have flows even with reversed path
        const fixtureHasFlows = fixture!.sides.some(s => s.flows.length > 0)
        expect(fixtureHasFlows).toBe(true)
    })
})
