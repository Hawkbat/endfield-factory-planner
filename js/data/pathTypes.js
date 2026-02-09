import { PathTypeID, RegionID } from "../types/data.js";
export const pathTypeAllowedRegions = {
    [PathTypeID.BELT]: [RegionID.VALLEY_IV, RegionID.WULING],
    [PathTypeID.PIPE]: [RegionID.WULING],
};
