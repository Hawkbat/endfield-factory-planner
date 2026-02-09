import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/RegionSelector.tsx";
import { useLocalization } from "../../contexts/localization.js";
import { regionList } from "../../data/regions.js";
export function RegionSelector({ value, onChange, label, className }) {
    const { getRegionName } = useLocalization();
    return (_jsxDEV("label", { className: className, children: [_jsxDEV("span", { children: label }, void 0, false, { fileName: _jsxFileName, lineNumber: 17, columnNumber: 13 }, this), _jsxDEV("select", { className: "form-control", value: value, onChange: (event) => {
                    const nextRegion = regionList.find((regionId) => regionId === event.target.value) ?? value;
                    onChange(nextRegion);
                }, children: regionList.map((regionId) => (_jsxDEV("option", { value: regionId, children: getRegionName(regionId) }, regionId, false, { fileName: _jsxFileName, lineNumber: 26, columnNumber: 48 }, this))) }, void 0, false, { fileName: _jsxFileName, lineNumber: 18, columnNumber: 13 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 15, columnNumber: 13 }, this));
}
