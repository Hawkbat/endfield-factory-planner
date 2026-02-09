import { describe, it, expect } from 'vitest'
import { FacilityID, PathTypeID, ItemID } from '../ts/types/data.ts'
import { TestFieldBuilder } from './test-helpers.ts'
import { createSampleFieldState } from '../ts/game/sampleField.ts'

describe('Integration - Empty Field Creation', () => {
    it('should create empty field with correct dimensions', () => {
        const state = new TestFieldBuilder(20, 20).build()
        
        expect(state.width).toBe(20)
        expect(state.height).toBe(20)
        expect(state.facilities.length).toBe(0)
        expect(state.paths.length).toBe(0)
        expect(state.pathFixtures.length).toBe(0)
    })
})

describe('Integration - Facility Operations', () => {
    it('should add facility to field', () => {
        const result = new TestFieldBuilder(20, 20)
            .addFacility(FacilityID.REFINING_UNIT, [5, 5])
            .build()
        
        expect(result.facilities.length).toBe(1)
        expect(result.facilities[0].type).toBe(FacilityID.REFINING_UNIT)
        expect(result.facilities[0].x).toBe(5)
        expect(result.facilities[0].y).toBe(5)
    })

    it('should move facility', () => {
        const result = new TestFieldBuilder(20, 20)
            .addFacility(FacilityID.REFINING_UNIT, [5, 5])
            .moveFacility('facility_1', [10, 10])
            .build()
        
        expect(result.facilities[0].x).toBe(10)
        expect(result.facilities[0].y).toBe(10)
    })

    it('should remove facility', () => {
        const result = new TestFieldBuilder(20, 20)
            .addFacility(FacilityID.REFINING_UNIT, [5, 5])
            .removeFacility('facility_1')
            .build()
        
        expect(result.facilities.length).toBe(0)
    })
})

describe('Integration - Path Operations', () => {
    it('should add path to field', () => {
        const result = new TestFieldBuilder(20, 20)
            .addPath(PathTypeID.BELT, [[0, 0], [5, 0]])
            .build()
        
        expect(result.paths.length).toBe(1)
        expect(result.paths[0].type).toBe(PathTypeID.BELT)
        expect(result.paths[0].points.length).toBe(2)
    })

    it('should add path segment', () => {
        const result = new TestFieldBuilder(20, 20)
            .addPath(PathTypeID.BELT, [[0, 0], [5, 0]])
            .addPathSegment('path_1', 'end', [5, 5])
            .build()
        
        expect(result.paths[0].points.length).toBe(3)
        expect(result.paths[0].points[2]).toEqual([5, 5])
    })

    it('should remove path segment', () => {
        const result = new TestFieldBuilder(20, 20)
            .addPath(PathTypeID.BELT, [[0, 0], [5, 0], [5, 5]])
            .removePathSegment('path_1', 'end')
            .build()
        
        expect(result.paths[0].points.length).toBe(2)
    })

    it('should remove path', () => {
        const result = new TestFieldBuilder(20, 20)
            .addPath(PathTypeID.BELT, [[0, 0], [5, 0]])
            .removePath('path_1')
            .build()
        
        expect(result.paths.length).toBe(0)
    })
})

describe('Integration - Full Simulation Pipeline', () => {
    it('should run complete simulation with production chain', () => {
        const finalState = new TestFieldBuilder(30, 30)
            // Add depot loader (ore source)
            .addFacility(FacilityID.DEPOT_UNLOADER, [0, 0])
            // Add refinery
            .addFacility(FacilityID.REFINING_UNIT, [1, 5])
            // Add path connecting them
            .addPath(PathTypeID.BELT, [[1, 1], [1, 5]])
            .build()
        
        expect(finalState.facilities.length).toBe(2)
        expect(finalState.paths.length).toBe(1)
        expect(finalState.debugInfo).toBeDefined()
    })

    it('should detect and flag placement errors', () => {
        const finalState = new TestFieldBuilder(20, 20)
            .addFacility(FacilityID.REFINING_UNIT, [5, 5])
            .addFacility(FacilityID.SHREDDING_UNIT, [6, 6]) // Overlaps with previous facility
            .build()
        
        expect(finalState.facilities[1].errorFlags?.invalidPlacement).toBe(true)
    })

    it('should handle depot item assignment', () => {
        const result = new TestFieldBuilder(20, 20)
            .addFacility(FacilityID.DEPOT_UNLOADER, [0, 0])
            .setPortItem('facility_1', 0, ItemID.FERRIUM_ORE)
            .build()
        
        const depotPort = result.facilities[0].ports.find(p => p.external === 'depot')
        expect(depotPort?.setItem).toBe(ItemID.FERRIUM_ORE)
    })
})

describe('Integration - Complete Production Line (LC Valley Battery)', () => {
    it('should verify item flow through complete production pipeline using actual game data', () => {
        // Build production line with actual facility recipes:
        // PAC → (Amethyst Ore) → Refining Unit → (Amethyst Fiber) → Fitting Unit → (Amethyst Part) 
        //                                                                                    ↓
        // PAC ← (LC Valley Battery) ← Packaging Unit ←──────────────────────────────────────┘
        //   ↓                                   ↑
        //   └─→ (Originium Ore) → Shredding Unit → (Originium Powder) ──────────────────────┘
        
        const fieldState = createSampleFieldState()
        
        const pac = fieldState.facilities.find((f) => f.type === FacilityID.PROTOCOL_AUTOMATION_CORE_PAC)
        const refining = fieldState.facilities.find((f) => f.type === FacilityID.REFINING_UNIT)
        const fitting = fieldState.facilities.find((f) => f.type === FacilityID.FITTING_UNIT)
        const packaging = fieldState.facilities.find((f) => f.type === FacilityID.PACKAGING_UNIT)
        const shredding = fieldState.facilities.find((f) => f.type === FacilityID.SHREDDING_UNIT)
        
            try {
                // Verify all entities aren't in error states
                for (const fac of fieldState.facilities) {
                    expect(Object.values(fac.errorFlags ?? {}).some((v) => v)).toBe(false)
                }
                for (const fixture of fieldState.pathFixtures) {
                    expect(Object.values(fixture.errorFlags ?? {}).some((v) => v)).toBe(false)
                }
                for (const path of fieldState.paths) {
                    expect(Object.values(path.errorFlags ?? {}).some((v) => v)).toBe(false)
                }

                // Verify all facilities are powered
                expect(refining?.isPowered).toBe(true)
                expect(fitting?.isPowered).toBe(true)
                expect(packaging?.isPowered).toBe(true)
                expect(shredding?.isPowered).toBe(true)
            
                // Verify depot outputs are producing item flows
                const depotOutputPorts = pac?.ports.filter((p) => p.external === 'depot' && p.subType === 'output')
                const quartzOutput = depotOutputPorts?.find((p) => p.setItem === ItemID.AMETHYST_ORE)
                const oreOutput = depotOutputPorts?.find((p) => p.setItem === ItemID.ORIGINIUM_ORE)
            
                expect(quartzOutput).toBeDefined()
                expect(quartzOutput?.flows.length).toBeGreaterThan(0)
                expect(oreOutput).toBeDefined()
                expect(oreOutput?.flows.length).toBeGreaterThan(0)
            
                // Verify all paths are connected and have flow direction
                expect(fieldState.paths.length).toBe(6)
                fieldState.paths.forEach((path) => {
                    expect(path.flowDirection).not.toBe('blocked')
                })
            
                // Verify at least some paths have flows
                const pathsWithFlows = fieldState.paths.filter((p) => p.flows.length > 0)
                expect(pathsWithFlows.length).toBeGreaterThan(0)
            } catch (error) {
                // Debug output - only shown on failure
                console.log('\n=== PRODUCTION LINE TEST (FAILED) ===')
                console.log('PAC:', pac ? `@(${pac.x},${pac.y}) size=${pac.width}×${pac.height}` : 'NOT FOUND')
                console.log('Refining:', refining ? `@(${refining.x},${refining.y}) size=${refining.width}×${refining.height} powered=${refining.isPowered}` : 'NOT FOUND')
                console.log('Fitting:', fitting ? `@(${fitting.x},${fitting.y}) size=${fitting.width}×${fitting.height} powered=${fitting.isPowered}` : 'NOT FOUND')
                console.log('Packaging:', packaging ? `@(${packaging.x},${packaging.y}) size=${packaging.width}×${packaging.height} powered=${packaging.isPowered}` : 'NOT FOUND')
                console.log('Shredding:', shredding ? `@(${shredding.x},${shredding.y}) size=${shredding.width}×${shredding.height} powered=${shredding.isPowered}` : 'NOT FOUND')
            
                console.log('\n=== PAC PORTS ===')
                pac?.ports.forEach((port, i) => {
                    const absX = pac.x + port.x
                    const absY = pac.y + port.y
                    console.log(`Port ${i}: type=${port.type} subType=${port.subType} at (${absX}, ${absY}) dir=${port.direction} setItem=${port.setItem || 'none'} connectedPath=${port.connectedPathID || 'none'} flows=${port.flows.length}`)
                })
            
                console.log('\n=== REFINING PORTS ===')
                refining?.ports.forEach((port, i) => {
                    const absX = refining.x + port.x
                    const absY = refining.y + port.y
                    console.log(`Port ${i}: type=${port.type} subType=${port.subType} at (${absX}, ${absY}) dir=${port.direction} connectedPath=${port.connectedPathID || 'none'} flows=${port.flows.length}`)
                })
            
                console.log('\n=== PATH INFO ===')
                fieldState.paths.forEach((p) => {
                    const start = p.points[0]
                    const end = p.points[p.points.length - 1]
                    console.log(`${p.id}: ${start} → ${end}, flowDir=${p.flowDirection}, flows=${p.flows.length}`)
                    if (p.errorFlags) {
                        console.log(`  errors:`, p.errorFlags)
                    }
                })
            
                console.log('\n=== ALL FLOWS IN SYSTEM ===')
                fieldState.facilities.forEach((fac) => {
                    const totalPortFlows = fac.ports.reduce((sum, p) => sum + p.flows.length, 0)
                    const inputItems = new Set()
                    fac.ports.forEach((port) => {
                        if (port.subType === 'input') {
                            port.flows.forEach((flow) => {
                                if (flow.sourceRate > 0) inputItems.add(flow.item)
                            })
                        }
                    })
                    if (totalPortFlows > 0 || fac.inputFlows.length > 0 || fac.outputFlows.length > 0) {
                        console.log(`${fac.type}:`, { 
                            portFlows: totalPortFlows, 
                            inputFlows: fac.inputFlows.length, 
                            outputFlows: fac.outputFlows.length, 
                            actualRecipe: fac.actualRecipe || 'NONE',
                            detectedInputItems: Array.from(inputItems)
                        })
                    }
                })
            
                throw error
            }
    })
})
