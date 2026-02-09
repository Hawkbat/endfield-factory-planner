import { type Direction, FacilityCategory, PathFixtureID, PathTypeID, RegionID } from "../types/data.ts"
import type { Immutable } from "../utils/types.ts"

export enum FixtureBehaviorType {
    BRIDGE = 'bridge',
    SPLITTER = 'splitter',
    CONVERGER = 'converger',
    CONTROL_PORT = 'control_port'
}

export interface PathFixtureDefinition {
    category: FacilityCategory
    behaviorType: FixtureBehaviorType
    pathType: PathTypeID
    sides: PathFixtureSideDefinition[]
    allowedRegions?: RegionID[]
}

export interface PathFixtureSideDefinition {
    direction: Direction
    type: 'belt' | 'pipe' | 'control'
    subType: 'input' | 'output'
}

export const pathFixtures: Immutable<Record<PathFixtureID, PathFixtureDefinition>> = {
    // Belt-based fixtures
    [PathFixtureID.ITEM_CONTROL_PORT]: {
        category: FacilityCategory.LOGISTICS,
        behaviorType: FixtureBehaviorType.CONTROL_PORT,
        pathType: PathTypeID.BELT,
        sides: [
            { direction: 'down', type: 'belt', subType: 'input' },
            { direction: 'up', type: 'belt', subType: 'output' },
        ]
    },
    [PathFixtureID.BELT_BRIDGE]: {
        category: FacilityCategory.LOGISTICS,
        behaviorType: FixtureBehaviorType.BRIDGE,
        pathType: PathTypeID.BELT,
        sides: [
            { direction: 'up', type: 'belt', subType: 'output' },
            { direction: 'down', type: 'belt', subType: 'output' },
            { direction: 'left', type: 'belt', subType: 'output' },
            { direction: 'right', type: 'belt', subType: 'output' },
        ]
    },
    [PathFixtureID.CONVERGER]: {
        category: FacilityCategory.LOGISTICS,
        behaviorType: FixtureBehaviorType.CONVERGER,
        pathType: PathTypeID.BELT,
        sides: [
            { direction: 'down', type: 'belt', subType: 'input' },
            { direction: 'left', type: 'belt', subType: 'input' },
            { direction: 'right', type: 'belt', subType: 'input' },
            { direction: 'up', type: 'belt', subType: 'output' },
        ]
    },
    [PathFixtureID.SPLITTER]: {
        category: FacilityCategory.LOGISTICS,
        behaviorType: FixtureBehaviorType.SPLITTER,
        pathType: PathTypeID.BELT,
        sides: [
            { direction: 'down', type: 'belt', subType: 'input' },
            { direction: 'up', type: 'belt', subType: 'output' },
            { direction: 'left', type: 'belt', subType: 'output' },
            { direction: 'right', type: 'belt', subType: 'output' },
        ]
    },
    
    // Fluid-based fixtures
    [PathFixtureID.PIPE_CONTROL_PORT]: {
        category: FacilityCategory.LOGISTICS,
        behaviorType: FixtureBehaviorType.CONTROL_PORT,
        pathType: PathTypeID.PIPE,
        allowedRegions: [RegionID.WULING],
        sides: [
            { direction: 'down', type: 'pipe', subType: 'input' },
            { direction: 'up', type: 'pipe', subType: 'output' },
        ]
    },
    [PathFixtureID.PIPE_BRIDGE]: {
        category: FacilityCategory.LOGISTICS,
        behaviorType: FixtureBehaviorType.BRIDGE,
        pathType: PathTypeID.PIPE,
        allowedRegions: [RegionID.WULING],
        sides: [
            { direction: 'up', type: 'pipe', subType: 'output' },
            { direction: 'down', type: 'pipe', subType: 'output' },
            { direction: 'left', type: 'pipe', subType: 'output' },
            { direction: 'right', type: 'pipe', subType: 'output' },
        ]
    },
    [PathFixtureID.PIPE_CONVERGER]: {
        category: FacilityCategory.LOGISTICS,
        behaviorType: FixtureBehaviorType.CONVERGER,
        pathType: PathTypeID.PIPE,
        allowedRegions: [RegionID.WULING],
        sides: [
            { direction: 'down', type: 'pipe', subType: 'input' },
            { direction: 'left', type: 'pipe', subType: 'input' },
            { direction: 'right', type: 'pipe', subType: 'input' },
            { direction: 'up', type: 'pipe', subType: 'output' },
        ]
    },
    [PathFixtureID.PIPE_SPLITTER]: {
        category: FacilityCategory.LOGISTICS,
        behaviorType: FixtureBehaviorType.SPLITTER,
        pathType: PathTypeID.PIPE,
        allowedRegions: [RegionID.WULING],
        sides: [
            { direction: 'down', type: 'pipe', subType: 'input' },
            { direction: 'up', type: 'pipe', subType: 'output' },
            { direction: 'left', type: 'pipe', subType: 'output' },
            { direction: 'right', type: 'pipe', subType: 'output' },
        ]
    },
}

/**
 * Get the appropriate fixture type ID based on behavior type and path type.
 * @param behaviorType The behavior type of the fixture (bridge, splitter, etc.)
 * @param pathType The path type (belt or pipe)
 * @returns The corresponding PathFixtureID
 */
export function getFixtureTypeForPath(
    behaviorType: FixtureBehaviorType,
    pathType: PathTypeID
): PathFixtureID {
    const isBelt = pathType === PathTypeID.BELT
    
    switch (behaviorType) {
        case FixtureBehaviorType.BRIDGE:
            return isBelt ? PathFixtureID.BELT_BRIDGE : PathFixtureID.PIPE_BRIDGE
        case FixtureBehaviorType.SPLITTER:
            return isBelt ? PathFixtureID.SPLITTER : PathFixtureID.PIPE_SPLITTER
        case FixtureBehaviorType.CONVERGER:
            return isBelt ? PathFixtureID.CONVERGER : PathFixtureID.PIPE_CONVERGER
        case FixtureBehaviorType.CONTROL_PORT:
            return isBelt ? PathFixtureID.ITEM_CONTROL_PORT : PathFixtureID.PIPE_CONTROL_PORT
    }
}
