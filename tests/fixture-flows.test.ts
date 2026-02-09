import { describe, it, expect } from 'vitest'
import { createEmptyState, applyChanges } from './test-helpers.ts'
import { FacilityID, PathFixtureID, PathTypeID, ItemID } from '../ts/types/data.ts'
import type { UserChange } from '../ts/types/field.ts'

describe('Fixture Flow Behavior', () => {
    describe('Bridge Fixture', () => {
        it('should pass flows through without modification', () => {
            const state = createEmptyState(50, 50)
            
            // Create: Depot -> Path -> Bridge -> Path -> Facility
            const changes: UserChange[] = [
                // Add PAC depot
                { type: 'add-facility', facilityType: FacilityID.PROTOCOL_AUTOMATION_CORE_PAC, position: [10, 10], rotation: 0 },
                { type: 'set-port-item', facilityID: 'facility_1', portIndex: 14, itemID: ItemID.FERRIUM },
                
                // Add production facility
                { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [30, 10], rotation: 0 },
                
                // Create path with bridge
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[32, 11], [40, 11]] },
                { type: 'add-path-fixture', fixtureType: PathFixtureID.BELT_BRIDGE, position: [35, 11], rotation: 90 },
            ]
            
            const finalState = applyChanges(state, changes)
            
            // Find the bridge fixture
            const bridge = finalState.pathFixtures.find(f => f.type === PathFixtureID.BELT_BRIDGE)
            expect(bridge).toBeDefined()
            
            // Find connected paths
            const connectedSides = bridge!.sides.filter(s => s.connectedPathID)
            expect(connectedSides.length).toBeGreaterThanOrEqual(2)
            
            // Get input and output sides (bridges now have actual input/output subTypes)
            const sidesWithFlows = bridge!.sides.filter(s => s.flows.length > 0)
            const inputSide = sidesWithFlows.find(s => s.subType === 'input')
            const outputSide = sidesWithFlows.find(s => s.subType === 'output')
            
            if (inputSide && outputSide) {
                // Bridge should pass through items without modification
                expect(inputSide.flows.length).toBeGreaterThan(0)
                expect(outputSide.flows.length).toBeGreaterThan(0)
                
                // Output flows should match input flows (same items, same rates)
                for (const inputFlow of inputSide.flows) {
                    const matchingOutput = outputSide.flows.find(f => f.item === inputFlow.item)
                    expect(matchingOutput).toBeDefined()
                    expect(matchingOutput?.sourceRate).toBeCloseTo(inputFlow.sinkRate, 5)
                }
            }
        })
    })
    
    describe('Control Port Fixture', () => {
        it('should filter flows to only pass the specified item', () => {
            const state = createEmptyState(50, 50)
            
            // Create: Depot with multiple items -> Path -> Control Port -> Path -> Facility
            const changes: UserChange[] = [
                // Add PAC depot with two output items
                { type: 'add-facility', facilityType: FacilityID.PROTOCOL_AUTOMATION_CORE_PAC, position: [10, 10], rotation: 0 },
                { type: 'set-port-item', facilityID: 'facility_1', portIndex: 14, itemID: ItemID.FERRIUM },
                { type: 'set-port-item', facilityID: 'facility_1', portIndex: 15, itemID: ItemID.AMETHYST_ORE },
                
                // Add production facility
                { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [30, 10], rotation: 0 },
                
                // Create paths
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[32, 11], [30, 11]] },
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[32, 12], [30, 12]] },
                
                // Add control port on one path that filters for Ferrium only
                { type: 'multi', changes: [
                    { type: 'add-path-fixture', fixtureType: PathFixtureID.ITEM_CONTROL_PORT, position: [31, 11], rotation: 90 },
                    { type: 'set-fixture-item', fixtureID: '@ref:fixture:0', itemID: ItemID.FERRIUM }
                ]}
            ]
            
            const finalState = applyChanges(state, changes)
            
            // Find the control port
            const controlPort = finalState.pathFixtures.find(f => f.type === PathFixtureID.ITEM_CONTROL_PORT)
            expect(controlPort).toBeDefined()
            expect(controlPort?.setItem).toBe(ItemID.FERRIUM)
            
            // Get input and output sides
            const inputSide = controlPort!.sides.find(s => s.subType === 'input')
            const outputSide = controlPort!.sides.find(s => s.subType === 'output')
            
            expect(inputSide).toBeDefined()
            expect(outputSide).toBeDefined()
            
            if (outputSide && outputSide.flows.length > 0) {
                // Output should ONLY contain the filtered item (Ferrium)
                expect(outputSide.flows.every(f => f.item === ItemID.FERRIUM)).toBe(true)
                
                // No other items should pass through
                const hasOtherItems = outputSide.flows.some(f => f.item !== ItemID.FERRIUM)
                expect(hasOtherItems).toBe(false)
            }
        })
        
        it('should block all items when no filter item is set', () => {
            const state = createEmptyState(50, 50)
            
            const changes: UserChange[] = [
                { type: 'add-facility', facilityType: FacilityID.PROTOCOL_AUTOMATION_CORE_PAC, position: [10, 10], rotation: 0 },
                { type: 'set-port-item', facilityID: 'facility_1', portIndex: 14, itemID: ItemID.FERRIUM },
                { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [30, 10], rotation: 0 },
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[32, 11], [30, 11]] },
                
                // Add control port WITHOUT setting an item filter
                { type: 'add-path-fixture', fixtureType: PathFixtureID.ITEM_CONTROL_PORT, position: [31, 11], rotation: 90 }
            ]
            
            const finalState = applyChanges(state, changes)
            
            const controlPort = finalState.pathFixtures.find(f => f.type === PathFixtureID.ITEM_CONTROL_PORT)
            expect(controlPort).toBeDefined()
            expect(controlPort?.setItem).toBeUndefined()
            
            // Output should have no flows since no filter is set
            const outputSide = controlPort!.sides.find(s => s.subType === 'output')
            if (outputSide) {
                expect(outputSide.flows.length).toBe(0)
            }
        })
    })
    
    describe('Splitter Fixture', () => {
        it('should divide flows evenly between connected outputs', () => {
            const state = createEmptyState(50, 50)
            
            // Create scenario with 1 input, 2 outputs
            // Splitter has 1 input (down) and 3 outputs (up, left, right)
            const changes: UserChange[] = [
                // Depot source
                { type: 'add-facility', facilityType: FacilityID.PROTOCOL_AUTOMATION_CORE_PAC, position: [10, 20], rotation: 0 },
                { type: 'set-port-item', facilityID: 'facility_1', portIndex: 14, itemID: ItemID.FERRIUM },
                
                // Two destination facilities
                { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [30, 15], rotation: 0 },
                { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [30, 25], rotation: 0 },
                
                // Input path to splitter (connecting to 'down' input side at rotation 0)
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[25, 22], [25, 21]] },
                
                // Splitter (rotation 0: input from below, outputs up/left/right)
                { type: 'add-path-fixture', fixtureType: PathFixtureID.SPLITTER, position: [25, 21], rotation: 0 },
                
                // Output paths (connect to 'left' and 'right' output sides)
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[25, 21], [24, 21], [24, 17], [30, 17]] },
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[25, 21], [26, 21], [26, 25], [30, 25]] },
            ]
            
            const finalState = applyChanges(state, changes)
            
            const splitter = finalState.pathFixtures.find(f => f.type === PathFixtureID.SPLITTER)
            expect(splitter).toBeDefined()
            
            // Get input and output sides
            const inputSide = splitter!.sides.find(s => s.subType === 'input')
            const outputSides = splitter!.sides.filter(s => s.subType === 'output' && s.connectedPathID)
            
            expect(inputSide).toBeDefined()
            expect(outputSides.length).toBe(2) // Only 2 of the 3 output sides connected
            
            if (inputSide && inputSide.flows.length > 0 && outputSides.length === 2) {
                const totalInputRate = inputSide.flows.reduce((sum, f) => sum + f.sinkRate, 0)
                
                // Each output should get half the input rate
                for (const outputSide of outputSides) {
                    const outputRate = outputSide.flows.reduce((sum, f) => sum + f.sourceRate, 0)
                    expect(outputRate).toBeCloseTo(totalInputRate / 2, 5)
                }
                
                // Items should be preserved
                for (const inputFlow of inputSide.flows) {
                    for (const outputSide of outputSides) {
                        const matchingOutput = outputSide.flows.find(f => f.item === inputFlow.item)
                        expect(matchingOutput).toBeDefined()
                    }
                }
            }
        })
        
        it('should send all flow to single output when only one output is connected', () => {
            const state = createEmptyState(50, 50)
            
            const changes: UserChange[] = [
                { type: 'add-facility', facilityType: FacilityID.PROTOCOL_AUTOMATION_CORE_PAC, position: [10, 20], rotation: 0 },
                { type: 'set-port-item', facilityID: 'facility_1', portIndex: 14, itemID: ItemID.FERRIUM },
                { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [30, 20], rotation: 0 },
                
                // Input path connecting to 'down' side
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[25, 22], [25, 21]] },
                { type: 'add-path-fixture', fixtureType: PathFixtureID.SPLITTER, position: [25, 21], rotation: 0 },
                // Single output path connecting to 'up' side
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[25, 21], [25, 20], [30, 20]] },
                // No other output paths connected
            ]
            
            const finalState = applyChanges(state, changes)
            
            const splitter = finalState.pathFixtures.find(f => f.type === PathFixtureID.SPLITTER)
            const inputSide = splitter!.sides.find(s => s.subType === 'input')
            const outputSides = splitter!.sides.filter(s => s.subType === 'output' && s.connectedPathID)
            
            expect(outputSides.length).toBe(1) // Only 1 of 3 output sides connected
            
            if (inputSide && inputSide.flows.length > 0 && outputSides.length === 1) {
                const inputRate = inputSide.flows.reduce((sum, f) => sum + f.sinkRate, 0)
                const outputRate = outputSides[0].flows.reduce((sum, f) => sum + f.sourceRate, 0)
                
                // Single output gets full input rate
                expect(outputRate).toBeCloseTo(inputRate, 5)
            }
        })
    })
    
    describe('Converger Fixture', () => {
        it('should combine flows from multiple inputs into single output', () => {
            const state = createEmptyState(50, 50)
            
            // Create scenario with 2 inputs (different items), 1 output
            const changes: UserChange[] = [
                // Two depot sources with different items
                { type: 'add-facility', facilityType: FacilityID.PROTOCOL_AUTOMATION_CORE_PAC, position: [10, 15], rotation: 0 },
                { type: 'set-port-item', facilityID: 'facility_1', portIndex: 14, itemID: ItemID.FERRIUM },
                { type: 'set-port-item', facilityID: 'facility_1', portIndex: 15, itemID: ItemID.AMETHYST_ORE },
                
                // Destination facility
                { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [30, 20], rotation: 0 },
                
                // Input paths to converger
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[32, 16], [25, 16], [25, 20]] },
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[32, 17], [26, 17], [26, 20], [25, 20]] },
                
                // Converger (rotation 0: inputs from sides, output up)
                { type: 'add-path-fixture', fixtureType: PathFixtureID.CONVERGER, position: [25, 20], rotation: 0 },
                
                // Output path
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[25, 20], [25, 22], [30, 22]] },
            ]
            
            const finalState = applyChanges(state, changes)
            
            const converger = finalState.pathFixtures.find(f => f.type === PathFixtureID.CONVERGER)
            expect(converger).toBeDefined()
            
            // Get input and output sides
            const inputSides = converger!.sides.filter(s => s.subType === 'input' && s.connectedPathID)
            const outputSide = converger!.sides.find(s => s.subType === 'output')
            
            expect(inputSides.length).toBeGreaterThanOrEqual(2)
            expect(outputSide).toBeDefined()
            
            if (inputSides.length >= 2 && outputSide) {
                // Calculate total input rate across all inputs
                const totalInputRate = inputSides.reduce((sum, side) => 
                    sum + side.flows.reduce((s, f) => s + f.sinkRate, 0), 0)
                
                // Output rate should equal sum of all inputs
                const outputRate = outputSide.flows.reduce((sum, f) => sum + f.sourceRate, 0)
                expect(outputRate).toBeCloseTo(totalInputRate, 5)
                
                // All unique items from inputs should appear in output
                const inputItems = new Set<ItemID>()
                for (const inputSide of inputSides) {
                    for (const flow of inputSide.flows) {
                        inputItems.add(flow.item)
                    }
                }
                
                const outputItems = new Set(outputSide.flows.map(f => f.item))
                for (const item of inputItems) {
                    expect(outputItems.has(item)).toBe(true)
                }
            }
        })
        
        it('should preserve individual item rates when combining', () => {
            const state = createEmptyState(50, 50)
            
            const changes: UserChange[] = [
                { type: 'add-facility', facilityType: FacilityID.PROTOCOL_AUTOMATION_CORE_PAC, position: [10, 15], rotation: 0 },
                { type: 'set-port-item', facilityID: 'facility_1', portIndex: 14, itemID: ItemID.FERRIUM },
                { type: 'set-port-item', facilityID: 'facility_1', portIndex: 15, itemID: ItemID.FERRIUM }, // Same item
                { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [30, 20], rotation: 0 },
                
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[32, 16], [25, 16], [25, 20]] },
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[32, 17], [26, 17], [26, 20], [25, 20]] },
                { type: 'add-path-fixture', fixtureType: PathFixtureID.CONVERGER, position: [25, 20], rotation: 0 },
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[25, 20], [25, 22], [30, 22]] },
            ]
            
            const finalState = applyChanges(state, changes)
            
            const converger = finalState.pathFixtures.find(f => f.type === PathFixtureID.CONVERGER)
            const inputSides = converger!.sides.filter(s => s.subType === 'input' && s.flows.length > 0)
            const outputSide = converger!.sides.find(s => s.subType === 'output')
            
            if (inputSides.length >= 2 && outputSide) {
                // Calculate total rate of Ferrium from all inputs
                let totalFerriumInput = 0
                for (const inputSide of inputSides) {
                    const ferriumFlow = inputSide.flows.find(f => f.item === ItemID.FERRIUM)
                    if (ferriumFlow) {
                        totalFerriumInput += ferriumFlow.sinkRate
                    }
                }
                
                // Output should have combined Ferrium rate
                const ferriumOutput = outputSide.flows.find(f => f.item === ItemID.FERRIUM)
                expect(ferriumOutput).toBeDefined()
                expect(ferriumOutput?.sourceRate).toBeCloseTo(totalFerriumInput, 5)
            }
        })
    })
    
    describe('Complex Fixture Chains', () => {
        it('should handle splitter followed by control ports', () => {
            const state = createEmptyState(50, 50)
            
            // Split flow, then filter each branch for different items
            const changes: UserChange[] = [
                { type: 'add-facility', facilityType: FacilityID.PROTOCOL_AUTOMATION_CORE_PAC, position: [10, 20], rotation: 0 },
                { type: 'set-port-item', facilityID: 'facility_1', portIndex: 14, itemID: ItemID.FERRIUM },
                { type: 'set-port-item', facilityID: 'facility_1', portIndex: 15, itemID: ItemID.AMETHYST_ORE },
                
                { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [35, 15], rotation: 0 },
                { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [35, 25], rotation: 0 },
                
                // Main path to splitter input (from below, connecting to 'down' side)
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[25, 22], [25, 21]] },
                { type: 'add-path-fixture', fixtureType: PathFixtureID.SPLITTER, position: [25, 21], rotation: 0 },
                
                // Branch 1: splitter left output -> control port (Ferrium) -> facility
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[25, 21], [24, 21], [24, 17]] },
                { type: 'multi', changes: [
                    { type: 'add-path-fixture', fixtureType: PathFixtureID.ITEM_CONTROL_PORT, position: [24, 17], rotation: 0 },
                    { type: 'set-fixture-item', fixtureID: '@ref:fixture:0', itemID: ItemID.FERRIUM }
                ]},
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[24, 17], [24, 15], [35, 15]] },
                
                // Branch 2: splitter right output -> control port (Amethyst) -> facility  
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[25, 21], [26, 21], [26, 25]] },
                { type: 'multi', changes: [
                    { type: 'add-path-fixture', fixtureType: PathFixtureID.ITEM_CONTROL_PORT, position: [26, 25], rotation: 180 },
                    { type: 'set-fixture-item', fixtureID: '@ref:fixture:0', itemID: ItemID.AMETHYST_ORE }
                ]},
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[26, 25], [26, 27], [35, 27]] },
            ]
            
            const finalState = applyChanges(state, changes)
            
            // Verify fixtures exist
            const splitter = finalState.pathFixtures.find(f => f.type === PathFixtureID.SPLITTER)
            const controlPorts = finalState.pathFixtures.filter(f => f.type === PathFixtureID.ITEM_CONTROL_PORT)
            
            expect(splitter).toBeDefined()
            expect(controlPorts.length).toBe(2)
            
            // Each control port should only output its filtered item
            for (const controlPort of controlPorts) {
                const outputSide = controlPort.sides.find(s => s.subType === 'output')
                if (outputSide && outputSide.flows.length > 0) {
                    const expectedItem = controlPort.setItem
                    expect(outputSide.flows.every(f => f.item === expectedItem)).toBe(true)
                }
            }
        })
        
        it('should handle converger followed by splitter', () => {
            const state = createEmptyState(50, 50)
            
            // Combine multiple sources, then split to destinations
            const changes: UserChange[] = [
                { type: 'add-facility', facilityType: FacilityID.PROTOCOL_AUTOMATION_CORE_PAC, position: [10, 15], rotation: 0 },
                { type: 'set-port-item', facilityID: 'facility_1', portIndex: 14, itemID: ItemID.FERRIUM },
                { type: 'set-port-item', facilityID: 'facility_1', portIndex: 15, itemID: ItemID.AMETHYST_ORE },
                
                { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [40, 15], rotation: 0 },
                { type: 'add-facility', facilityType: FacilityID.REFINING_UNIT, position: [40, 25], rotation: 0 },
                
                // Inputs to converger
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[32, 16], [25, 16], [25, 20]] },
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[32, 17], [26, 17], [26, 20], [25, 20]] },
                { type: 'add-path-fixture', fixtureType: PathFixtureID.CONVERGER, position: [25, 20], rotation: 0 },
                
                // Converger output to splitter input (from below)
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[25, 20], [25, 22], [30, 22], [30, 21]] },
                { type: 'add-path-fixture', fixtureType: PathFixtureID.SPLITTER, position: [30, 21], rotation: 0 },
                
                // Splitter outputs to facilities (left and right outputs)
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[30, 21], [29, 21], [29, 17], [40, 17]] },
                { type: 'add-path', pathType: PathTypeID.BELT, points: [[30, 21], [31, 21], [31, 25], [40, 25]] },
            ]
            
            const finalState = applyChanges(state, changes)
            
            const converger = finalState.pathFixtures.find(f => f.type === PathFixtureID.CONVERGER)
            const splitter = finalState.pathFixtures.find(f => f.type === PathFixtureID.SPLITTER)
            
            expect(converger).toBeDefined()
            expect(splitter).toBeDefined()
            
            // Converger should combine inputs
            const convergerInputSides = converger!.sides.filter(s => s.subType === 'input' && s.flows.length > 0)
            const convergerOutputSide = converger!.sides.find(s => s.subType === 'output')
            
            if (convergerInputSides.length > 0 && convergerOutputSide) {
                const totalInput = convergerInputSides.reduce((sum, side) => 
                    sum + side.flows.reduce((s, f) => s + f.sinkRate, 0), 0)
                const convergerOutput = convergerOutputSide.flows.reduce((sum, f) => sum + f.sourceRate, 0)
                expect(convergerOutput).toBeCloseTo(totalInput, 5)
            }
            
            // Splitter should divide the combined flow
            const splitterInputSide = splitter!.sides.find(s => s.subType === 'input')
            const splitterOutputSides = splitter!.sides.filter(s => s.subType === 'output' && s.connectedPathID)
            
            if (splitterInputSide && splitterInputSide.flows.length > 0 && splitterOutputSides.length === 2) {
                const splitterInput = splitterInputSide.flows.reduce((sum, f) => sum + f.sinkRate, 0)
                
                for (const outputSide of splitterOutputSides) {
                    const outputRate = outputSide.flows.reduce((sum, f) => sum + f.sourceRate, 0)
                    expect(outputRate).toBeCloseTo(splitterInput / 2, 5)
                }
            }
        })
    })
})
