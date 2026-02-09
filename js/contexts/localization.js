import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/contexts/localization.tsx";
import { createContext, useContext, useMemo, useState } from "react";
import { en } from "../data/localizations/en.js";
import { objectKeys } from "../utils/types.js";
const localizations = {
    en,
};
const localizationContext = createContext(undefined);
export function LocalizationProvider({ children }) {
    const [localizationID, setLocalizationID] = useState('en');
    function getLocalizationIDs() {
        return objectKeys(localizations);
    }
    function getItemName(itemID) {
        return localizations[localizationID].items[itemID] || itemID;
    }
    function getFacilityName(facilityID) {
        return getItemName(facilityID);
    }
    function getPathTypeName(pathTypeID) {
        return getItemName(pathTypeID);
    }
    function getPathFixtureName(pathFixtureID) {
        return getItemName(pathFixtureID);
    }
    function getFacilityCategoryName(category) {
        return localizations[localizationID].facilityCategories[category] || category;
    }
    function getRegionName(region) {
        return localizations[localizationID].regions[region] || region;
    }
    function getFactoryRoleName(role) {
        return localizations[localizationID].factoryRoles[role] || role;
    }
    function getRegionFieldName(fieldID) {
        return localizations[localizationID].regionFields[fieldID] || fieldID;
    }
    function getPortTypeName(portType) {
        const loc = localizations[localizationID];
        const names = {
            belt: loc.interface.portTypeBelt,
            pipe: loc.interface.portTypePipe,
        };
        return names[portType] || portType;
    }
    function getPortSubTypeName(subType) {
        const loc = localizations[localizationID];
        return subType === 'input' ? loc.interface.portSubTypeInput : loc.interface.portSubTypeOutput;
    }
    function getDirectionName(direction) {
        const loc = localizations[localizationID];
        const names = {
            up: loc.interface.directionUp,
            down: loc.interface.directionDown,
            left: loc.interface.directionLeft,
            right: loc.interface.directionRight,
        };
        return names[direction.toLowerCase()] || direction;
    }
    const ctx = useMemo(() => ({
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
    }), [localizationID]);
    return _jsxDEV(localizationContext.Provider, { value: ctx, children: children }, void 0, false, { fileName: _jsxFileName, lineNumber: 114, columnNumber: 11 }, this);
}
export function useLocalization() {
    const ctx = useContext(localizationContext);
    if (!ctx) {
        throw new Error("useLocalization must be used within a LocalizationProvider");
    }
    return ctx;
}
