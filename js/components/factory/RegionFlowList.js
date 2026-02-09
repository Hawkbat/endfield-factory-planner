import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/RegionFlowList.tsx";
import { useLocalization } from "../../contexts/localization.js";
import { ItemFlowDisplay } from "./ItemFlowDisplay.js";
export function RegionFlowList({ title, flows, rateKey, direction }) {
    const { ui } = useLocalization();
    return (_jsxDEV("div", { className: "region-flow-list", children: [title ? _jsxDEV("div", { className: "region-flow-title", children: title }, void 0, false, { fileName: _jsxFileName, lineNumber: 17, columnNumber: 21 }, this) : null, _jsxDEV(ItemFlowDisplay, { flows: flows, rateKey: rateKey, direction: direction, rateMultiplier: 60, unitLabel: ui.itemFlowUnitsPerMinute }, void 0, false, { fileName: _jsxFileName, lineNumber: 18, columnNumber: 13 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 15, columnNumber: 13 }, this));
}
