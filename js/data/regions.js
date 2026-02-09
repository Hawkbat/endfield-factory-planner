import { FactoryRole, FieldTemplateID, ItemID, RegionFieldID, RegionID } from "../types/data.js";
export const regionList = [
    RegionID.VALLEY_IV,
    RegionID.WULING,
];
export const regionResourceSupplies = {
    [RegionID.VALLEY_IV]: [
        { item: ItemID.ORIGINIUM_ORE, ratePerMinute: 560 },
        { item: ItemID.AMETHYST_ORE, ratePerMinute: 240 },
        { item: ItemID.FERRIUM_ORE, ratePerMinute: 1080 },
    ],
    [RegionID.WULING]: [
        { item: ItemID.ORIGINIUM_ORE, ratePerMinute: 360 },
        { item: ItemID.FERRIUM_ORE, ratePerMinute: 90 },
    ],
};
export const regionFields = {
    [RegionID.VALLEY_IV]: [
        {
            id: RegionFieldID.VALLEY_IV_CORE_AIC_AREA,
            region: RegionID.VALLEY_IV,
            template: FieldTemplateID.VALLEY_IV_MAIN,
            role: FactoryRole.CORE_AIC_AREA,
        },
        {
            id: RegionFieldID.VALLEY_IV_REFUGEE_CAMP,
            region: RegionID.VALLEY_IV,
            template: FieldTemplateID.VALLEY_IV_OUTPOST,
            role: FactoryRole.OUTPOST,
        },
        {
            id: RegionFieldID.VALLEY_IV_INFRA_STATION,
            region: RegionID.VALLEY_IV,
            template: FieldTemplateID.VALLEY_IV_OUTPOST,
            role: FactoryRole.OUTPOST,
        },
        {
            id: RegionFieldID.VALLEY_IV_RECONSTRUCTION_HQ,
            region: RegionID.VALLEY_IV,
            template: FieldTemplateID.VALLEY_IV_OUTPOST,
            role: FactoryRole.OUTPOST,
        },
    ],
    [RegionID.WULING]: [
        {
            id: RegionFieldID.WULING_CORE_AIC_AREA,
            region: RegionID.WULING,
            template: FieldTemplateID.WULING_MAIN,
            role: FactoryRole.CORE_AIC_AREA,
        },
        {
            id: RegionFieldID.WULING_SKY_KING_FLATS,
            region: RegionID.WULING,
            template: FieldTemplateID.WULING_OUTPOST,
            role: FactoryRole.OUTPOST,
        },
    ],
};
export const regionFieldLookup = {
    [RegionFieldID.VALLEY_IV_CORE_AIC_AREA]: regionFields[RegionID.VALLEY_IV][0],
    [RegionFieldID.VALLEY_IV_REFUGEE_CAMP]: regionFields[RegionID.VALLEY_IV][1],
    [RegionFieldID.VALLEY_IV_INFRA_STATION]: regionFields[RegionID.VALLEY_IV][2],
    [RegionFieldID.VALLEY_IV_RECONSTRUCTION_HQ]: regionFields[RegionID.VALLEY_IV][3],
    [RegionFieldID.WULING_CORE_AIC_AREA]: regionFields[RegionID.WULING][0],
    [RegionFieldID.WULING_SKY_KING_FLATS]: regionFields[RegionID.WULING][1],
};
