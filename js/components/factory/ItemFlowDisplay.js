import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/ItemFlowDisplay.tsx";
import { useLocalization } from "../../contexts/localization.js";
import { AlertTriangle, ArrowRight, Ban } from "lucide-react";
export function ItemFlowDisplay({ flows, rateKey, direction, rateMultiplier = 1, unitLabel, insufficientFlows, bottleneckItem, overSuppliedFlows }) {
    const loc = useLocalization();
    const resolvedUnitLabel = unitLabel ?? loc.ui.itemFlowUnits;
    if (!flows.length) {
        return _jsxDEV("div", { className: "field-hud-value none", children: loc.ui.none }, void 0, false, { fileName: _jsxFileName, lineNumber: 22, columnNumber: 15 }, this);
    }
    return (_jsxDEV(_Fragment, { children: flows.map((flow, index) => {
            const isObstructed = flow.sourceRate > flow.sinkRate;
            const isOverSupplied = overSuppliedFlows?.has(flow.item);
            const isInsufficient = insufficientFlows?.has(flow.item);
            const isBottleneck = bottleneckItem === flow.item;
            const warningClass = isBottleneck ? "bottleneck" : isInsufficient ? "insufficient" : (isObstructed || isOverSupplied) ? "obstructed" : "";
            return (_jsxDEV("div", { className: `field-hud-flow ${warningClass}`, children: [direction === 'input' ? _jsxDEV(ArrowRight, { size: 12, className: "flow-direction-icon" }, void 0, false, { fileName: _jsxFileName, lineNumber: 36, columnNumber: 49 }, this) : null, _jsxDEV("img", { src: `images/${flow.item}.webp`, alt: loc.getItemName(flow.item), className: "field-hud-item-icon" }, void 0, false, { fileName: _jsxFileName, lineNumber: 37, columnNumber: 25 }, this), _jsxDEV("span", { children: [loc.getItemName(flow.item), " \u2022 ", (flow[rateKey] * rateMultiplier).toFixed(2), " ", resolvedUnitLabel, isObstructed && (_jsxDEV("span", { className: "flow-warning", title: loc.ui.flowPartiallyObstructed, children: [" ", _jsxDEV(AlertTriangle, { size: 12 }, void 0, false, { fileName: _jsxFileName, lineNumber: 46, columnNumber: 42 }, this), " (", (flow.sinkRate * rateMultiplier).toFixed(2), "/", (flow.sourceRate * rateMultiplier).toFixed(2), ")"] }, void 0, true, { fileName: _jsxFileName, lineNumber: 44, columnNumber: 47 }, this)), isBottleneck && (_jsxDEV("span", { className: "flow-warning bottleneck-indicator", title: loc.ui.primaryBottleneck, children: [" ", _jsxDEV(Ban, { size: 12 }, void 0, false, { fileName: _jsxFileName, lineNumber: 51, columnNumber: 42 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 49, columnNumber: 47 }, this)), isInsufficient && !isBottleneck && (_jsxDEV("span", { className: "flow-warning insufficient-indicator", title: loc.ui.insufficientFlowRate, children: [" ", _jsxDEV(AlertTriangle, { size: 12 }, void 0, false, { fileName: _jsxFileName, lineNumber: 56, columnNumber: 42 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 54, columnNumber: 66 }, this))] }, void 0, true, { fileName: _jsxFileName, lineNumber: 42, columnNumber: 25 }, this), direction === 'output' ? _jsxDEV(ArrowRight, { size: 12, className: "flow-direction-icon" }, void 0, false, { fileName: _jsxFileName, lineNumber: 60, columnNumber: 50 }, this) : null] }, `${flow.item}-${index}`, true, { fileName: _jsxFileName, lineNumber: 34, columnNumber: 25 }, this));
        }) }, void 0, false, { fileName: _jsxFileName, lineNumber: 25, columnNumber: 13 }, this));
}
