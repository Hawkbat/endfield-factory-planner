import { FacilityID, FieldTemplateID, RegionID, type FieldTemplate } from "../types/data.ts"
import type { Immutable } from "../utils/types.ts"

export const fieldTemplates: Immutable<Record<FieldTemplateID, FieldTemplate>> = {
    [FieldTemplateID.VALLEY_IV_MAIN]: {
        width: 70,
        height: 70,
        region: RegionID.VALLEY_IV,
        depotBusPortLimit: 0,
        depotBusSectionLimit: 0,
        initialFacilityType: FacilityID.PROTOCOL_AUTOMATION_CORE_PAC,
        depotBusLayout: {
            arrangement: 'bottom-right',
            bottomSections: 9,
            rightSections: 9,
            hasPort: true,
        }
    },
    [FieldTemplateID.VALLEY_IV_OUTPOST]: {
        width: 40,
        height: 40,
        region: RegionID.VALLEY_IV,
        depotBusPortLimit: 0,
        depotBusSectionLimit: 0,
        initialFacilityType: FacilityID.SUB_PAC,
        depotBusLayout: {
            arrangement: 'bottom',
            bottomSections: 5,
            hasPort: false,
        }
    },
    [FieldTemplateID.WULING_MAIN]: {
        width: 60,
        height: 60,
        region: RegionID.WULING,
        depotBusPortLimit: 1,
        depotBusSectionLimit: 5,
        initialFacilityType: FacilityID.PROTOCOL_AUTOMATION_CORE_PAC,
    },
    [FieldTemplateID.WULING_OUTPOST]: {
        width: 40,
        height: 40,
        region: RegionID.WULING,
        depotBusPortLimit: 1,
        depotBusSectionLimit: 6,
        initialFacilityType: FacilityID.SUB_PAC,
    },
}

export function resolveFieldTemplate(template: FieldTemplateID | Immutable<FieldTemplate>): Immutable<FieldTemplate> {
    if (typeof template === 'string') {
        return fieldTemplates[template]
    }
    return template
}
