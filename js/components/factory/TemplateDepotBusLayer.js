import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/TemplateDepotBusLayer.tsx";
import { resolveFieldTemplate } from "../../data/templates.js";
import { getTemplateDepotBusCells } from "../../game/templateRules.js";
export function TemplateDepotBusLayer({ fieldState, cellSize }) {
    const template = resolveFieldTemplate(fieldState.template);
    const { ports, sections } = getTemplateDepotBusCells(template, fieldState.width, fieldState.height);
    if (ports.length === 0 && sections.length === 0) {
        return null;
    }
    return (_jsxDEV("g", { className: "template-depot-bus", children: [sections.map((section, index) => (_jsxDEV("rect", { x: section.x * cellSize, y: section.y * cellSize, width: section.width * cellSize, height: section.height * cellSize, className: "template-depot-bus-section" }, `section-${index}`, false, { fileName: _jsxFileName, lineNumber: 21, columnNumber: 48 }, this))), ports.map((port, index) => (_jsxDEV("rect", { x: port.x * cellSize, y: port.y * cellSize, width: port.width * cellSize, height: port.height * cellSize, className: "template-depot-bus-port" }, `port-${index}`, false, { fileName: _jsxFileName, lineNumber: 31, columnNumber: 42 }, this)))] }, void 0, true, { fileName: _jsxFileName, lineNumber: 19, columnNumber: 13 }, this));
}
