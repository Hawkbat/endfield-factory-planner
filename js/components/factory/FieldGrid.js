import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/FieldGrid.tsx";
export function FieldGrid({ fieldState, cellSize, onBackgroundClick, onBackgroundDoubleClick, onBackgroundPointerDown, onBackgroundPointerMove, onBackgroundPointerUp, }) {
    const widthPx = fieldState.width * cellSize;
    const heightPx = fieldState.height * cellSize;
    const verticalLines = [];
    const horizontalLines = [];
    for (let x = 0; x <= fieldState.width; x++) {
        const xPos = x * cellSize;
        verticalLines.push(_jsxDEV("line", { x1: xPos, y1: 0, x2: xPos, y2: heightPx, className: "field-grid-line" }, `v-${x}`, false, { fileName: _jsxFileName, lineNumber: 30, columnNumber: 28 }, this));
    }
    for (let y = 0; y <= fieldState.height; y++) {
        const yPos = y * cellSize;
        horizontalLines.push(_jsxDEV("line", { x1: 0, y1: yPos, x2: widthPx, y2: yPos, className: "field-grid-line" }, `h-${y}`, false, { fileName: _jsxFileName, lineNumber: 44, columnNumber: 30 }, this));
    }
    return (_jsxDEV("g", { children: [_jsxDEV("rect", { x: 0, y: 0, width: widthPx, height: heightPx, className: "field-grid-background", onClick: onBackgroundClick, onDoubleClick: onBackgroundDoubleClick, onPointerDown: onBackgroundPointerDown, onPointerMove: onBackgroundPointerMove, onPointerUp: onBackgroundPointerUp }, void 0, false, { fileName: _jsxFileName, lineNumber: 58, columnNumber: 13 }, this), verticalLines, horizontalLines] }, void 0, true, { fileName: _jsxFileName, lineNumber: 56, columnNumber: 13 }, this));
}
