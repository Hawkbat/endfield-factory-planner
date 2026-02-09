import { describe, it, expect } from 'vitest'
import { calculatePathFlowDirection } from '../ts/game/connections.ts'
import { FacilityID, PathTypeID } from '../ts/types/data.ts'
import { createState, createPath, createFacilityWithPort } from './test-helpers.ts'

describe('Connections - Path Flow Direction', () => {
    it('should detect start-to-end flow when start connects to output', () => {
        const path = createPath({
            id: 'path1',
            type: PathTypeID.BELT,
            points: [[5, 5], [10, 5]]
        })

        const state = createState({
            width: 20,
            height: 20,
            facilities: [
                createFacilityWithPort({ id: 'out1', type: FacilityID.REFINING_UNIT, subType: 'output', position: [5, 5], direction: 'right' }),
                createFacilityWithPort({ id: 'in1', type: FacilityID.REFINING_UNIT, subType: 'input', position: [10, 5], direction: 'left' })
            ],
            paths: [path]
        })

        const result = calculatePathFlowDirection(path, state)
        
        expect(result.flowDirection).toBe('start-to-end')
        expect(result.errorFlags?.nothingConnected).toBeFalsy()
    })

    it('should detect end-to-start flow when end connects to output', () => {
        const path = createPath({
            id: 'path1',
            type: PathTypeID.BELT,
            points: [[0, 5], [5, 5]]
        })

        const state = createState({
            width: 20,
            height: 20,
            facilities: [
                createFacilityWithPort({ id: 'in1', type: FacilityID.REFINING_UNIT, subType: 'input', position: [0, 5], direction: 'left' }),
                createFacilityWithPort({ id: 'out1', type: FacilityID.REFINING_UNIT, subType: 'output', position: [5, 5], direction: 'right' })
            ],
            paths: [path]
        })

        const result = calculatePathFlowDirection(path, state)
        
        expect(result.flowDirection).toBe('end-to-start')
    })

    it('should set error flag when nothing is connected', () => {
        const path = createPath({
            id: 'path1',
            type: PathTypeID.BELT,
            points: [[0, 0], [5, 0]]
        })

        const state = createState({
            width: 20,
            height: 20,
            paths: [path]
        })

        const result = calculatePathFlowDirection(path, state)
        
        expect(result.flowDirection).toBe('none')
        expect(result.errorFlags?.nothingConnected).toBe(true)
    })

    it('should set error flag when both ends are inputs', () => {
        const path = createPath({
            id: 'path1',
            type: PathTypeID.BELT,
            points: [[0, 5], [10, 5]]
        })

        const state = createState({
            width: 20,
            height: 20,
            facilities: [
                createFacilityWithPort({ id: 'in1', type: FacilityID.REFINING_UNIT, subType: 'input', position: [0, 5], direction: 'left' }),
                createFacilityWithPort({ id: 'in2', type: FacilityID.REFINING_UNIT, subType: 'input', position: [10, 5], direction: 'left' })
            ],
            paths: [path]
        })

        const result = calculatePathFlowDirection(path, state)
        
        expect(result.flowDirection).toBe('none')
        expect(result.errorFlags?.bothInputs).toBe(true)
    })

    it('should set error flag when both ends are outputs', () => {
        const path = createPath({
            id: 'path1',
            type: PathTypeID.BELT,
            points: [[0, 5], [10, 5]]
        })

        const state = createState({
            width: 20,
            height: 20,
            facilities: [
                createFacilityWithPort({ id: 'out1', type: FacilityID.REFINING_UNIT, subType: 'output', position: [0, 5], direction: 'right' }),
                createFacilityWithPort({ id: 'out2', type: FacilityID.REFINING_UNIT, subType: 'output', position: [10, 5], direction: 'right' })
            ],
            paths: [path]
        })

        const result = calculatePathFlowDirection(path, state)
        
        expect(result.flowDirection).toBe('none')
        expect(result.errorFlags?.bothOutputs).toBe(true)
    })
})
