import { describe, it, expect } from 'vitest'
import { initializeFlowState, solveFlowSystem } from '../ts/game/solver.ts'
import { updateAllFacilityRecipes } from '../ts/game/recipes.ts'
import { FacilityID, ItemID, RecipeID, PathTypeID } from '../ts/types/data.ts'
import { createState, createFacility, createPort, createFlow, createPath } from './test-helpers.ts'
import { makeMutable } from '../ts/utils/types.ts'

describe('Solver - Flow Initialization', () => {
    it('should initialize all flows to zero', () => {
        const state = createState({
            width: 20,
            height: 20,
            facilities: [
                {
                    ...createFacility({
                        id: 'refinery1',
                        type: FacilityID.REFINING_UNIT,
                        position: [0, 0],
                        isPowered: true,
                        ports: [
                            createPort({
                                type: 'belt',
                                subType: 'input',
                                direction: 'down',
                                flows: [createFlow(ItemID.FERRIUM_ORE)]
                            })
                        ]
                    }),
                    inputFlows: [createFlow(ItemID.FERRIUM_ORE)],
                    outputFlows: []
                }
            ]
        })

        const result = initializeFlowState(state)
        
        expect(result.facilities[0].inputFlows.length).toBe(0)
        expect(result.facilities[0].outputFlows.length).toBe(0)
    })

    it('should initialize jump-started recipes with output flows', () => {
        const state = createState({
            width: 20,
            height: 20,
            facilities: [
                {
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
            ]
        })

        const result = initializeFlowState(state)
        
        expect(result.facilities[0].outputFlows.length).toBeGreaterThan(0)
    })
})

describe('Solver - Convergence', () => {
    it('should converge for simple linear flow', () => {
        const state = createState({
            width: 20,
            height: 20,
            facilities: [
                {
                    ...createFacility({
                        id: 'loader1',
                        type: FacilityID.DEPOT_LOADER,
                        position: [0, 0],
                        isPowered: true,
                        ports: [
                            {
                                ...createPort({
                                    type: 'belt',
                                    subType: 'output',
                                    position: [1, 0],
                                    direction: 'up'
                                }),
                                setItem: ItemID.FERRIUM_ORE,
                                external: 'depot',
                                connectedPathID: 'path1'
                            }
                        ]
                    })
                },
                {
                    ...createFacility({
                        id: 'refinery1',
                        type: FacilityID.REFINING_UNIT,
                        position: [1, 5],
                        isPowered: true,
                        ports: [
                            {
                                ...createPort({
                                    type: 'belt',
                                    subType: 'input',
                                    direction: 'up'
                                }),
                                connectedPathID: 'path1'
                            },
                            createPort({
                                type: 'belt',
                                subType: 'output',
                                position: [2, 0],
                                direction: 'right'
                            })
                        ]
                    }),
                    actualRecipe: RecipeID.FURNANCE_IRON_NUGGET_1
                }
            ],
            paths: [
                createPath({
                    id: 'path1',
                    type: PathTypeID.BELT,
                    points: [[1, 0], [1, 5]],
                    flowDirection: 'start-to-end'
                })
            ]
        })
        const result = solveFlowSystem(state)
        
        expect(result.converged).toBe(true)
        expect(result.iterations).toBeGreaterThan(0)
        expect(result.iterations).toBeLessThan(100)
    })

    it('should handle facilities with no recipe', () => {
        const state = createState({
            width: 20,
            height: 20,
            facilities: [
                createFacility({
                    id: 'refinery1',
                    type: FacilityID.REFINING_UNIT,
                    position: [0, 0],
                    isPowered: true,
                    ports: []
                })
            ]
        })

        const result = solveFlowSystem(state)
        
        expect(result.converged).toBe(true)
        expect(result.state.facilities[0].outputFlows.length).toBe(0)
    })

    it('should set throttle factor on facilities during solving', () => {
        const state = createState({
            width: 20,
            height: 20,
            facilities: [
                {
                    ...createFacility({
                        id: 'loader1',
                        type: FacilityID.DEPOT_LOADER,
                        position: [0, 0],
                        isPowered: true,
                        ports: [
                            {
                                ...createPort({
                                    type: 'belt',
                                    subType: 'output',
                                    position: [1, 0],
                                    direction: 'up'
                                }),
                                setItem: ItemID.FERRIUM_ORE,
                                external: 'depot',
                                connectedPathID: 'path1'
                            }
                        ]
                    })
                },
                {
                    ...createFacility({
                        id: 'refinery1',
                        type: FacilityID.REFINING_UNIT,
                        position: [1, 5],
                        isPowered: true,
                        ports: [
                            {
                                ...createPort({
                                    type: 'belt',
                                    subType: 'input',
                                    direction: 'up'
                                }),
                                connectedPathID: 'path1'
                            }
                        ]
                    }),
                    actualRecipe: RecipeID.FURNANCE_IRON_NUGGET_1
                }
            ],
            paths: [
                createPath({
                    id: 'path1',
                    type: PathTypeID.BELT,
                    points: [[1, 0], [1, 5]],
                    flowDirection: 'start-to-end'
                })
            ]
        })
        const result = solveFlowSystem(state)
        
        expect(result.state.facilities[1].throttleFactor).toBeDefined()
        expect(result.state.facilities[1].throttleFactor).toBeGreaterThanOrEqual(0)
        expect(result.state.facilities[1].throttleFactor).toBeLessThanOrEqual(1)
    })
})

describe('Solver - Complex Scenarios', () => {
    it('should handle production chains', () => {
        let state = createState({
            width: 30,
            height: 30,
            facilities: [
                {
                    ...createFacility({
                        id: 'refinery1',
                        type: FacilityID.REFINING_UNIT,
                        position: [0, 0],
                        isPowered: true,
                        ports: [
                            createPort({
                                type: 'belt',
                                subType: 'input',
                                direction: 'down'
                            }),
                            {
                                ...createPort({
                                    type: 'belt',
                                    subType: 'output',
                                    position: [2, 0],
                                    direction: 'left'
                                }),
                                connectedPathID: 'path1'
                            }
                        ]
                    }),
                    jumpStartRecipe: true,
                    setRecipe: RecipeID.FURNANCE_IRON_NUGGET_1
                },
                {
                    ...createFacility({
                        id: 'shredder1',
                        type: FacilityID.SHREDDING_UNIT,
                        position: [10, 0],
                        isPowered: true,
                        ports: [
                            {
                                ...createPort({
                                    type: 'belt',
                                    subType: 'input',
                                    direction: 'left'
                                }),
                                connectedPathID: 'path1'
                            }
                        ]
                    }),
                    actualRecipe: RecipeID.GRINDER_IRON_POWDER_1
                }
            ],
            paths: [
                createPath({
                    id: 'path1',
                    type: PathTypeID.BELT,
                    points: [[3, 0], [10, 0]],
                    flowDirection: 'start-to-end'
                })
            ]
        })

        // Update recipes before solving (as field.ts does)
        const recipeResult = updateAllFacilityRecipes(state)
        state = makeMutable(recipeResult.state)

        const result = solveFlowSystem(state)
        
        expect(result.converged).toBe(true)
        // Refinery should produce FERRIUM
        expect(result.state.facilities[0].outputFlows.some(f => f.item === ItemID.FERRIUM)).toBe(true)
    })
    
    it('should produce outputs for jump-started recipe without inputs', () => {
        let state = createState({
            width: 20,
            height: 20,
            facilities: [
                {
                    ...createFacility({
                        id: 'planter1',
                        type: FacilityID.PLANTING_UNIT,
                        position: [5, 5],
                        isPowered: true,
                        ports: [
                            createPort({
                                type: 'belt',
                                subType: 'output',
                                position: [2, 0],
                                direction: 'right'
                            })
                        ]
                    }),
                    setRecipe: RecipeID.PLANTER_PLANT_MOSS_1_1,
                    jumpStartRecipe: true
                }
            ]
        })

        // Update recipes before solving (as field.ts does)
        const recipeResult = updateAllFacilityRecipes(state)
        state = makeMutable(recipeResult.state)

        const result = solveFlowSystem(state)
        
        expect(result.converged).toBe(true)
        expect(result.iterations).toBeGreaterThan(0)
        
        const facility = result.state.facilities[0]
        
        // Facility should have actualRecipe set
        expect(facility.actualRecipe).toBe(RecipeID.PLANTER_PLANT_MOSS_1_1)
        
        // Facility should produce output even without inputs
        expect(facility.outputFlows.length).toBeGreaterThan(0)
        expect(facility.outputFlows[0].sourceRate).toBeGreaterThan(0)
        
        // Port flows should be empty because no path is connected
        // (distributeFacilityOutputs clears flows when no connected output paths)
        expect(facility.ports[0].flows.length).toBe(0)
    })
    
    it('should stop using jump-start once inputs arrive', () => {
        let state = createState({
            width: 20,
            height: 20,
            facilities: [
                {
                    ...createFacility({
                        id: 'planter1',
                        type: FacilityID.PLANTING_UNIT,
                        position: [5, 5],
                        isPowered: true,
                        ports: [
                            createPort({
                                type: 'belt',
                                subType: 'input',
                                direction: 'left',
                                flows: [createFlow(ItemID.SANDLEAF, 0.3, 0.3)]
                            }),
                            createPort({
                                type: 'belt',
                                subType: 'output',
                                position: [2, 0],
                                direction: 'right'
                            })
                        ]
                    }),
                    setRecipe: RecipeID.PLANTER_PLANT_MOSS_1_1,
                    jumpStartRecipe: true
                }
            ]
        })

        // Update recipes before solving (as field.ts does)
        const recipeResult = updateAllFacilityRecipes(state)
        state = makeMutable(recipeResult.state)

        const result = solveFlowSystem(state)
        
        expect(result.converged).toBe(true)
        
        const facility = result.state.facilities[0]
        
        // Facility should still have actualRecipe set
        expect(facility.actualRecipe).toBe(RecipeID.PLANTER_PLANT_MOSS_1_1)
        
        // Jump-start should NOT be used (inputs are present)
        // The facility should produce based on actual inputs, throttled by input availability
        expect(facility.throttleFactor).toBeGreaterThan(0)
        expect(facility.throttleFactor).toBeLessThanOrEqual(1)
    })
})
