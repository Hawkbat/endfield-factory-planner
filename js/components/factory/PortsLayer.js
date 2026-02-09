import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/PortsLayer.tsx";
import { PortView } from "./PortView.js";
export function PortsLayer({ fieldState, cellSize }) {
    return (_jsxDEV("g", { children: fieldState.facilities.flatMap(facility => facility.ports.map((port, index) => (_jsxDEV(PortView, { portID: `${facility.id}:${index}`, port: port, facility: facility, cellSize: cellSize }, `${facility.id}-port-${index}`, false, { fileName: _jsxFileName, lineNumber: 14, columnNumber: 93 }, this)))) }, void 0, false, { fileName: _jsxFileName, lineNumber: 12, columnNumber: 13 }, this));
}
