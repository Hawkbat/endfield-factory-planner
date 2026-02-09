import { PathTypeID, RegionID } from "../types/data.ts"
import type { Immutable } from "../utils/types.ts"

export const pathTypeAllowedRegions: Immutable<Record<PathTypeID, readonly RegionID[]>> = {
    [PathTypeID.BELT]: [RegionID.VALLEY_IV, RegionID.WULING],
    [PathTypeID.PIPE]: [RegionID.WULING],
}
