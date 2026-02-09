import { describe, it, expect } from 'vitest'
import { isPointOnSegment } from '../ts/game/geometry'

describe('Debug isPointOnSegment', () => {
    it('should find (2,0) on segment from (0,0) to (4,0)', () => {
        const result = isPointOnSegment([2, 0], [0, 0], [4, 0])
        try {
            expect(result).toBe(true)
        } catch (error) {
            console.log('isPointOnSegment([2, 0], [0, 0], [4, 0]):', result)
            throw error
        }
    })
})
