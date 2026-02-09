import { createContext, useContext, useMemo, useState } from "react"
import { en } from "../data/localizations/en.ts"
import type { FactoryRole, FacilityCategory, FacilityID, ItemID, Localization, PathFixtureID, PathTypeID, RegionFieldID, RegionID } from "../types/data.ts"
import { objectKeys } from "../utils/types.ts"

const localizations = {
    en,
}

export type LocalizationID = keyof typeof localizations

export interface LocalizationContext {
    localizationID: LocalizationID
    setLocalizationID: (id: LocalizationID) => void
    getLocalizationIDs: () => LocalizationID[]
    getItemName: (itemID: ItemID) => string
    getFacilityName: (facilityID: FacilityID) => string
    getPathTypeName: (pathType: PathTypeID) => string
    getPathFixtureName: (pathFixtureID: PathFixtureID) => string
    getFacilityCategoryName: (category: FacilityCategory) => string
    getRegionName(region: RegionID): string
    getFactoryRoleName: (role: FactoryRole) => string
    getRegionFieldName: (fieldID: RegionFieldID) => string
    getPortTypeName: (portType: 'belt' | 'pipe') => string
    getPortSubTypeName: (subType: 'input' | 'output') => string
    getDirectionName: (direction: string) => string
    ui: Localization['interface']
}

const localizationContext = createContext<LocalizationContext | undefined>(undefined)

export function LocalizationProvider({ children }: { children: React.ReactNode }) {
    const [localizationID, setLocalizationID] = useState<LocalizationID>('en')

    function getLocalizationIDs(): LocalizationID[] {
        return objectKeys(localizations)
    }

    function getItemName(itemID: ItemID): string {
        return localizations[localizationID].items[itemID] || itemID
    }

    function getFacilityName(facilityID: FacilityID): string {
        return getItemName(facilityID as string as ItemID)
    }

    function getPathTypeName(pathTypeID: PathTypeID): string {
        return getItemName(pathTypeID as string as ItemID)
    }

    function getPathFixtureName(pathFixtureID: PathFixtureID): string {
        return getItemName(pathFixtureID as string as ItemID)
    }

    function getFacilityCategoryName(category: FacilityCategory): string {
        return localizations[localizationID].facilityCategories[category] || category
    }

    function getRegionName(region: RegionID): string {
        return localizations[localizationID].regions[region] || region
    }

    function getFactoryRoleName(role: FactoryRole): string {
        return localizations[localizationID].factoryRoles[role] || role
    }

    function getRegionFieldName(fieldID: RegionFieldID): string {
        return localizations[localizationID].regionFields[fieldID] || fieldID
    }

    function getPortTypeName(portType: 'belt' | 'pipe'): string {
        const loc = localizations[localizationID]
        const names: Record<string, string> = {
            belt: loc.interface.portTypeBelt,
            pipe: loc.interface.portTypePipe,
        }
        return names[portType] || portType
    }

    function getPortSubTypeName(subType: 'input' | 'output'): string {
        const loc = localizations[localizationID]
        return subType === 'input' ? loc.interface.portSubTypeInput : loc.interface.portSubTypeOutput
    }

    function getDirectionName(direction: string): string {
        const loc = localizations[localizationID]
        const names: Record<string, string> = {
            up: loc.interface.directionUp,
            down: loc.interface.directionDown,
            left: loc.interface.directionLeft,
            right: loc.interface.directionRight,
        }
        return names[direction.toLowerCase()] || direction
    }

    const ctx = useMemo<LocalizationContext>(() => ({
        localizationID,
        setLocalizationID,
        getLocalizationIDs,
        getItemName,
        getFacilityName,
        getPathTypeName,
        getPathFixtureName,
        getFacilityCategoryName,
        getRegionName,
        getFactoryRoleName,
        getRegionFieldName,
        getPortTypeName,
        getPortSubTypeName,
        getDirectionName,
        ui: localizations[localizationID].interface,
    }), [localizationID])

    return <localizationContext.Provider value={ctx}>
        {children}
    </localizationContext.Provider>
}

export function useLocalization() {
    const ctx = useContext(localizationContext)
    if (!ctx) {
        throw new Error("useLocalization must be used within a LocalizationProvider")
    }
    return ctx
}
