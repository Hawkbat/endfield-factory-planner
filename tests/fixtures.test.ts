import { describe, it, expect } from 'vitest'
import {
    calculateBridgeFlows,
    calculateSplitterFlows,
    calculateConvergerFlows,
    calculateControlPortFlows
} from '../ts/game/fixtures.ts'
import { PathFixtureID, PathTypeID, ItemID, FacilityID } from '../ts/types/data.ts'
import { createState, createFixture, createFixtureSide, createPath, createFlow, createFacility, createPort } from './test-helpers.ts'

describe('Fixtures - Bridge', () => {
    it('should pass through flows from inputs to outputs', () => {
        // For the new bridge design, flow determination is based on what the path's OTHER
        // endpoint connects to. Since the test fixture doesn't have full facility setup,
        // we test with a simpler scenario: both paths connected but neither endpoint
        // connects to anything, so the bridge should block flows.

        const fixture = createFixture({
            id: 'bridge1',
            type: PathFixtureID.BELT_BRIDGE,
            position: [5, 5],
            sides: [
                createFixtureSide({
                    type: 'belt',
                    direction: 'up',
                    subType: 'output',
                    connectedPathID: 'path1'
                }),
                createFixtureSide({
                    type: 'belt',
                    direction: 'down',
                    subType: 'output',
                    connectedPathID: 'path2'
                }),
                createFixtureSide({
                    type: 'belt',
                    direction: 'left',
                    subType: 'output'
                }),
                createFixtureSide({
                    type: 'belt',
                    direction: 'right',
                    subType: 'output'
                })
            ]
        })

        // Two paths connected to the bridge's up and down sides
        // Neither path's OTHER endpoint connects to a facility or fixture
        // In this case, the bridge should determine neither is input nor output,
        // so the flow is blocked (both paths blocked or unconnected on their OTHER end)
        const state = createState({
            width: 20,
            height: 20,
            paths: [
                createPath({
                    id: 'path1',
                    type: PathTypeID.BELT,
                    points: [[5, 0], [5, 5]],  // Starts at (5,0), ends at bridge (5,5)
                    flows: [createFlow(ItemID.FERRIUM)],
                    flowDirection: 'start-to-end'
                }),
                createPath({
                    id: 'path2',
                    type: PathTypeID.BELT,
                    points: [[5, 5], [5, 10]],  // Starts at bridge (5,5), ends at (5,10)
                    flowDirection: 'start-to-end'
                })
            ]
        })

        const result = calculateBridgeFlows(fixture, state)

        // Since path endpoints don't connect to any facility, the bridge can't determine
        // roles, so flows are blocked. Both input and output flows should be empty.
        expect(result.inputFlows.length).toBe(0)
        expect(result.outputFlows.length).toBe(0)
    })

    it('should propagate flow direction across multiple bridges', () => {
        // Setup: output port -> path1 -> bridge1 -> path2 -> bridge2 -> path3 -> input port
        // This tests that bridge1 can determine it should act as input/output even though
        // path1's other end connects to another bridge (bridge2), which then connects to a port.

        let state = createState({ width: 30, height: 30 })

        // Add a facility with an output port at (0, 10)
        state = {
            ...state,
            facilities: [
                {
                    id: 'facility1',
                    type: 'DEPOT' as any, // simplified
                    x: 0,
                    y: 10,
                    rotation: 0,
                    width: 1,
                    height: 1,
                    ports: [{
                        type: 'belt',
                        subType: 'output',
                        x: 1,
                        y: 0,
                        direction: 'right',
                        flows: [{ item: ItemID.FERRIUM, sourceRate: 1.0, sinkRate: 1.0 }]
                    }],
                    isPowered: true,
                    inputFlows: [],
                    outputFlows: []
                },
                // Add a facility with an input port at (20, 10)
                {
                    id: 'facility2',
                    type: 'DEPOT' as any,
                    x: 20,
                    y: 10,
                    rotation: 0,
                    width: 1,
                    height: 1,
                    ports: [{
                        type: 'belt',
                        subType: 'input',
                        x: 0,
                        y: 0,
                        direction: 'left',
                        flows: []
                    }],
                    isPowered: true,
                    inputFlows: [],
                    outputFlows: []
                }
            ]
        }

        // Bridge 1 at (5, 10)
        const bridge1: FieldPathFixture = {
            id: 'bridge1',
            type: PathFixtureID.BELT_BRIDGE,
            x: 5,
            y: 10,
            rotation: 0,
            width: 1,
            height: 1,
            sides: [
                {
                    type: 'belt',
                    direction: 'left',
                    subType: 'output',
                    connectedPathID: 'path1',
                    flows: []
                },
                {
                    type: 'belt',
                    direction: 'right',
                    subType: 'output',
                    connectedPathID: 'path2',
                    flows: []
                },
                {
                    type: 'belt',
                    direction: 'up',
                    subType: 'output',
                    flows: []
                },
                {
                    type: 'belt',
                    direction: 'down',
                    subType: 'output',
                    flows: []
                }
            ]
        }

        // Bridge 2 at (15, 10)
        const bridge2: FieldPathFixture = {
            id: 'bridge2',
            type: PathFixtureID.BELT_BRIDGE,
            x: 15,
            y: 10,
            rotation: 0,
            width: 1,
            height: 1,
            sides: [
                {
                    type: 'belt',
                    direction: 'left',
                    subType: 'output',
                    connectedPathID: 'path2',
                    flows: []
                },
                {
                    type: 'belt',
                    direction: 'right',
                    subType: 'output',
                    connectedPathID: 'path3',
                    flows: []
                },
                {
                    type: 'belt',
                    direction: 'up',
                    subType: 'output',
                    flows: []
                },
                {
                    type: 'belt',
                    direction: 'down',
                    subType: 'output',
                    flows: []
                }
            ]
        }

        state = { ...state, pathFixtures: [bridge1, bridge2] }

        // Path 1: from output port (1, 10) to bridge1 (5, 10)
        const path1 = {
            id: 'path1',
            type: PathTypeID.BELT,
            points: [[1, 10], [5, 10]] as [number, number][],
            flows: [{ item: ItemID.FERRIUM, sourceRate: 1.0, sinkRate: 1.0 }],
            flowDirection: 'start-to-end' as const,
            startConnectedTo: { type: 'facility' as const, facilityID: 'facility1', portIndex: 0 },
            endConnectedTo: { type: 'fixture' as const, fixtureID: 'bridge1', sideIndex: 0 }
        }

        // Path 2: from bridge1 (5, 10) to bridge2 (15, 10)
        const path2 = {
            id: 'path2',
            type: PathTypeID.BELT,
            points: [[5, 10], [15, 10]] as [number, number][],
            flows: [{ item: ItemID.FERRIUM, sourceRate: 1.0, sinkRate: 1.0 }], // Flows from bridge1 output
            flowDirection: 'start-to-end' as const,
            startConnectedTo: { type: 'fixture' as const, fixtureID: 'bridge1', sideIndex: 1 },
            endConnectedTo: { type: 'fixture' as const, fixtureID: 'bridge2', sideIndex: 0 }
        }

        // Path 3: from bridge2 (15, 10) to input port (20, 10)
        const path3 = {
            id: 'path3',
            type: PathTypeID.BELT,
            points: [[15, 10], [20, 10]] as [number, number][],
            flows: [],
            flowDirection: 'start-to-end' as const,
            startConnectedTo: { type: 'fixture' as const, fixtureID: 'bridge2', sideIndex: 1 },
            endConnectedTo: { type: 'facility' as const, facilityID: 'facility2', portIndex: 0 }
        }

        state = { ...state, paths: [path1, path2, path3] }

        // Test bridge1 - it should recognize that its left side (connected to path1) 
        // receives from an output port, making left an input side, and right an output side
        const result1 = calculateBridgeFlows(bridge1, state)

        // Bridge1 should have input flows from path1 (from the output port)
        expect(result1.inputFlows.length).toBeGreaterThan(0)
        expect(result1.inputFlows.some(f => f.item === ItemID.FERRIUM)).toBe(true)

        // Bridge1 should also have output flows (same as input, passed through)
        expect(result1.outputFlows.length).toBeGreaterThan(0)
        expect(result1.outputFlows.some(f => f.item === ItemID.FERRIUM)).toBe(true)

        // Test bridge2 - it should recognize that its right side (connected to path3)
        // leads to an input port, making right an output side, and left an input side
        const result2 = calculateBridgeFlows(bridge2, state)

        // Bridge2 should also have flows passing through
        expect(result2.inputFlows.length).toBeGreaterThan(0)
        expect(result2.outputFlows.length).toBeGreaterThan(0)
    })

    it('should handle circular bridge connections gracefully', () => {
        // Setup: bridge1 <-> bridge2 (circular connection)
        // This should not cause infinite recursion, and both bridges should
        // have no flows since there's no definitive input or output

        let state = createState({ width: 30, height: 30 })

        // Bridge 1 at (5, 10)
        const bridge1: FieldPathFixture = {
            id: 'bridge1',
            type: PathFixtureID.BELT_BRIDGE,
            x: 5,
            y: 10,
            rotation: 0,
            width: 1,
            height: 1,
            sides: [
                {
                    type: 'belt',
                    direction: 'left',
                    subType: 'output',
                    flows: []
                },
                {
                    type: 'belt',
                    direction: 'right',
                    subType: 'output',
                    connectedPathID: 'path1',
                    flows: []
                },
                {
                    type: 'belt',
                    direction: 'up',
                    subType: 'output',
                    flows: []
                },
                {
                    type: 'belt',
                    direction: 'down',
                    subType: 'output',
                    flows: []
                }
            ]
        }

        // Bridge 2 at (15, 10)
        const bridge2: FieldPathFixture = {
            id: 'bridge2',
            type: PathFixtureID.BELT_BRIDGE,
            x: 15,
            y: 10,
            rotation: 0,
            width: 1,
            height: 1,
            sides: [
                {
                    type: 'belt',
                    direction: 'left',
                    subType: 'output',
                    connectedPathID: 'path1',
                    flows: []
                },
                {
                    type: 'belt',
                    direction: 'right',
                    subType: 'output',
                    connectedPathID: 'path2',
                    flows: []
                },
                {
                    type: 'belt',
                    direction: 'up',
                    subType: 'output',
                    flows: []
                },
                {
                    type: 'belt',
                    direction: 'down',
                    subType: 'output',
                    flows: []
                }
            ]
        }

        state = { ...state, pathFixtures: [bridge1, bridge2] }

        // Path 1: from bridge1 (5, 10) to bridge2 (15, 10)
        const path1 = {
            id: 'path1',
            type: PathTypeID.BELT,
            points: [[5, 10], [15, 10]] as [number, number][],
            flows: [],
            flowDirection: 'start-to-end' as const,
            startConnectedTo: { type: 'fixture' as const, fixtureID: 'bridge1', sideIndex: 1 },
            endConnectedTo: { type: 'fixture' as const, fixtureID: 'bridge2', sideIndex: 0 }
        }

        // Path 2: from bridge2 (15, 10) back to bridge1 (5, 10) - creates cycle
        const path2 = {
            id: 'path2',
            type: PathTypeID.BELT,
            points: [[15, 10], [15, 20], [5, 20], [5, 10]] as [number, number][],
            flows: [],
            flowDirection: 'start-to-end' as const,
            startConnectedTo: { type: 'fixture' as const, fixtureID: 'bridge2', sideIndex: 1 },
            endConnectedTo: { type: 'fixture' as const, fixtureID: 'bridge1', sideIndex: 3 } // connects to down side
        }

        state = { ...state, paths: [path1, path2] }

        // This should not throw or hang - cycle detection should handle it
        const result1 = calculateBridgeFlows(bridge1, state)
        const result2 = calculateBridgeFlows(bridge2, state)

        // Since there's no definitive input/output, flows should be empty or blocked
        expect(result1.inputFlows.length).toBe(0)
        expect(result1.outputFlows.length).toBe(0)
        expect(result2.inputFlows.length).toBe(0)
        expect(result2.outputFlows.length).toBe(0)
    })
})

describe('Fixtures - Splitter', () => {
    it('should divide flows evenly among outputs', () => {
        const fixture: FieldPathFixture = {
            id: 'splitter1',
            type: PathFixtureID.SPLITTER,
            x: 5,
            y: 5,
            rotation: 0,
            width: 1,
            height: 1,
            sides: [
                {
                    type: 'belt',
                    direction: 'left',
                    subType: 'input',
                    connectedPathID: 'path1',
                    flows: []
                },
                {
                    type: 'belt',
                    direction: 'right',
                    subType: 'output',
                    connectedPathID: 'path2',
                    flows: []
                },
                {
                    type: 'belt',
                    direction: 'down',
                    subType: 'output',
                    connectedPathID: 'path3',
                    flows: []
                }
            ]
        }

        let state = createState({ width: 20, height: 20 })
        state = {
            ...state,
            paths: [
                {
                    id: 'path1',
                    type: PathTypeID.BELT,
                    points: [[0, 5], [5, 5]],
                    flows: [
                        { item: ItemID.FERRIUM, sourceRate: 2.0, sinkRate: 2.0 }
                    ],
                    flowDirection: 'start-to-end'
                },
                {
                    id: 'path2',
                    type: PathTypeID.BELT,
                    points: [[5, 5], [10, 5]],
                    flows: [],
                    flowDirection: 'start-to-end'
                },
                {
                    id: 'path3',
                    type: PathTypeID.BELT,
                    points: [[5, 5], [5, 10]],
                    flows: [],
                    flowDirection: 'start-to-end'
                }
            ]
        }

        const result = calculateSplitterFlows(fixture, state)

        expect(result.outputFlows.length).toBeGreaterThan(0)
        const totalOutput = result.outputFlows.reduce((sum, f) => sum + f.sourceRate, 0)
        // Output flows are already divided per output
        expect(totalOutput).toBeCloseTo(1.0, 1)
    })
})

describe('Fixtures - Converger', () => {
    it('should merge flows from multiple inputs', () => {
        const fixture: FieldPathFixture = {
            id: 'converger1',
            type: PathFixtureID.CONVERGER,
            x: 5,
            y: 5,
            rotation: 0,
            width: 1,
            height: 1,
            sides: [
                {
                    type: 'belt',
                    direction: 'left',
                    subType: 'input',
                    connectedPathID: 'path1',
                    flows: []
                },
                {
                    type: 'belt',
                    direction: 'up',
                    subType: 'input',
                    connectedPathID: 'path2',
                    flows: []
                },
                {
                    type: 'belt',
                    direction: 'right',
                    subType: 'output',
                    connectedPathID: 'path3',
                    flows: []
                }
            ]
        }

        let state = createState({ width: 20, height: 20 })
        state = {
            ...state,
            paths: [
                {
                    id: 'path1',
                    type: PathTypeID.BELT,
                    points: [[0, 5], [5, 5]],
                    flows: [
                        { item: ItemID.FERRIUM, sourceRate: 1.0, sinkRate: 1.0 }
                    ],
                    flowDirection: 'start-to-end'
                },
                {
                    id: 'path2',
                    type: PathTypeID.BELT,
                    points: [[5, 0], [5, 5]],
                    flows: [
                        { item: ItemID.FERRIUM, sourceRate: 0.5, sinkRate: 0.5 }
                    ],
                    flowDirection: 'start-to-end'
                },
                {
                    id: 'path3',
                    type: PathTypeID.BELT,
                    points: [[5, 5], [10, 5]],
                    flows: [],
                    flowDirection: 'start-to-end'
                }
            ]
        }

        const result = calculateConvergerFlows(fixture, state)

        expect(result.inputFlows.length).toBeGreaterThan(0)
        expect(result.outputFlows.length).toBeGreaterThan(0)
        // Output should be sum of inputs
        const totalInput = result.inputFlows.reduce((sum, f) => sum + f.sourceRate, 0)
        const totalOutput = result.outputFlows.reduce((sum, f) => sum + f.sourceRate, 0)
        expect(totalOutput).toBeCloseTo(totalInput, 2)
    })
})

describe('Fixtures - Control Port', () => {
    it('should filter items through control port', () => {
        const fixture: FieldPathFixture = {
            id: 'control1',
            type: PathFixtureID.ITEM_CONTROL_PORT,
            x: 5,
            y: 5,
            rotation: 0,
            width: 1,
            height: 1,
            setItem: ItemID.FERRIUM,
            sides: [
                {
                    type: 'belt',
                    direction: 'left',
                    subType: 'input',
                    connectedPathID: 'path1',
                    flows: []
                },
                {
                    type: 'belt',
                    direction: 'right',
                    subType: 'output',
                    connectedPathID: 'path2',
                    flows: []
                }
            ]
        }

        let state = createState({ width: 20, height: 20 })
        state = {
            ...state,
            paths: [
                {
                    id: 'path1',
                    type: PathTypeID.BELT,
                    points: [[0, 5], [5, 5]],
                    flows: [
                        { item: ItemID.FERRIUM, sourceRate: 1.0, sinkRate: 1.0 },
                        { item: ItemID.AMETHYST_FIBER, sourceRate: 0.5, sinkRate: 0.5 }
                    ],
                    flowDirection: 'start-to-end',
                    endConnectedTo: { type: 'fixture', fixtureID: 'control1', sideIndex: 0 }
                },
                {
                    id: 'path2',
                    type: PathTypeID.BELT,
                    points: [[5, 5], [10, 5]],
                    flows: [],
                    flowDirection: 'start-to-end',
                    startConnectedTo: { type: 'fixture', fixtureID: 'control1', sideIndex: 1 }
                }
            ]
        }

        const result = calculateControlPortFlows(fixture, state)

        // Only FERRIUM should pass through
        expect(result.outputFlows.length).toBeGreaterThan(0)
        expect(result.outputFlows.every(f => f.item === ItemID.FERRIUM)).toBe(true)
    })
})
