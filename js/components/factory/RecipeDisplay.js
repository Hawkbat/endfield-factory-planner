import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/RecipeDisplay.tsx";
import { useLocalization } from "../../contexts/localization.js";
import { ItemFlowDisplay } from "./ItemFlowDisplay.js";
import { objectEntries } from "../../utils/types.js";
import { ArrowDown } from "lucide-react";
export function RecipeDisplay({ recipe }) {
    const loc = useLocalization();
    const inputs = objectEntries(recipe.inputs).map(([item, count]) => ({
        item,
        sourceRate: count / recipe.time,
        sinkRate: count / recipe.time,
    }));
    const outputs = objectEntries(recipe.outputs).map(([item, count]) => ({
        item,
        sourceRate: count / recipe.time,
        sinkRate: count / recipe.time,
    }));
    return (_jsxDEV("div", { className: "field-hud-recipe", children: [_jsxDEV("div", { className: "field-hud-recipe-section", children: [_jsxDEV("div", { children: _jsxDEV("strong", { children: [loc.ui.inputs, ":"] }, void 0, true, { fileName: _jsxFileName, lineNumber: 30, columnNumber: 22 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 30, columnNumber: 17 }, this), _jsxDEV(ItemFlowDisplay, { flows: inputs, rateKey: "sourceRate", direction: "input" }, void 0, false, { fileName: _jsxFileName, lineNumber: 31, columnNumber: 17 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 29, columnNumber: 13 }, this), _jsxDEV("div", { className: "field-hud-recipe-arrow", children: _jsxDEV(ArrowDown, { size: 20 }, void 0, false, { fileName: _jsxFileName, lineNumber: 33, columnNumber: 53 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 33, columnNumber: 13 }, this), _jsxDEV("div", { className: "field-hud-recipe-section", children: [_jsxDEV("div", { children: _jsxDEV("strong", { children: [loc.ui.outputs, ":"] }, void 0, true, { fileName: _jsxFileName, lineNumber: 35, columnNumber: 22 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 35, columnNumber: 17 }, this), outputs.length > 0 || !recipe.powerOutput ? _jsxDEV(ItemFlowDisplay, { flows: outputs, rateKey: "sourceRate", direction: "output" }, void 0, false, { fileName: _jsxFileName, lineNumber: 36, columnNumber: 61 }, this) : null, recipe.powerOutput ? (_jsxDEV("div", { children: [_jsxDEV("strong", { children: [loc.ui.powerGenerated, ":"] }, void 0, true, { fileName: _jsxFileName, lineNumber: 38, columnNumber: 26 }, this), " ", recipe.powerOutput, " ", loc.ui.powerFlowUnits] }, void 0, true, { fileName: _jsxFileName, lineNumber: 37, columnNumber: 40 }, this)) : null] }, void 0, true, { fileName: _jsxFileName, lineNumber: 34, columnNumber: 13 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 27, columnNumber: 13 }, this));
}
