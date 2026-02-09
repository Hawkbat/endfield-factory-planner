import { FacilityCategory, PathFixtureID, PathTypeID, RegionID } from "../types/data.js";
export var FixtureBehaviorType;
(function (FixtureBehaviorType) {
    FixtureBehaviorType["BRIDGE"] = "bridge";
    FixtureBehaviorType["SPLITTER"] = "splitter";
    FixtureBehaviorType["CONVERGER"] = "converger";
    FixtureBehaviorType["CONTROL_PORT"] = "control_port";
})(FixtureBehaviorType || (FixtureBehaviorType = {}));
export const pathFixtures = {
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
};
/**
 * Get the appropriate fixture type ID based on behavior type and path type.
 * @param behaviorType The behavior type of the fixture (bridge, splitter, etc.)
 * @param pathType The path type (belt or pipe)
 * @returns The corresponding PathFixtureID
 */
export function getFixtureTypeForPath(behaviorType, pathType) {
    const isBelt = pathType === PathTypeID.BELT;
    switch (behaviorType) {
        case FixtureBehaviorType.BRIDGE:
            return isBelt ? PathFixtureID.BELT_BRIDGE : PathFixtureID.PIPE_BRIDGE;
        case FixtureBehaviorType.SPLITTER:
            return isBelt ? PathFixtureID.SPLITTER : PathFixtureID.PIPE_SPLITTER;
        case FixtureBehaviorType.CONVERGER:
            return isBelt ? PathFixtureID.CONVERGER : PathFixtureID.PIPE_CONVERGER;
        case FixtureBehaviorType.CONTROL_PORT:
            return isBelt ? PathFixtureID.ITEM_CONTROL_PORT : PathFixtureID.PIPE_CONTROL_PORT;
    }
}
