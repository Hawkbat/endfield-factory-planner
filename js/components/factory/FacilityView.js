import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/FacilityView.tsx";
import { objectValues } from "../../utils/types.js";
import { facilities } from "../../data/facilities.js";
import { useEdit } from "../../contexts/edit.js";
import { useDragging } from "../../contexts/dragging.js";
import { useLocalization } from "../../contexts/localization.js";
import { cn } from "../../utils/react.js";
import { hasFacilityFlowIssues } from "../../game/flows.js";
import { rotateDirection } from "../../game/directions.js";
import { XCircle, AlertTriangle } from "lucide-react";
export function FacilityView({ facility, cellSize }) {
    const loc = useLocalization();
    const { selectedIDs, selectEntity } = useEdit();
    const { handleDragStart, handleDragMove, handleDragEnd } = useDragging();
    const x = facility.x * cellSize;
    const y = facility.y * cellSize;
    const width = facility.width * cellSize;
    const height = facility.height * cellSize;
    const label = loc.getFacilityName(facility.type);
    const requiresPower = Boolean(facilities[facility.type]?.power);
    const selected = selectedIDs.has(facility.id);
    const hasError = objectValues(facility.errorFlags ?? {}).some(flag => flag);
    const hasFlowWarning = !hasError && hasFacilityFlowIssues(facility);
    const className = cn("facility", {
        powered: facility.isPowered && !hasError,
        error: hasError,
        selected: selected,
    });
    const powerStatus = requiresPower
        ? (facility.isPowered ? loc.ui.powered : loc.ui.noPower)
        : "";
    function handleClick(e) {
        e.stopPropagation();
        selectEntity(facility.id, e.shiftKey || e.ctrlKey || e.metaKey);
    }
    function handlePointerDown(e) {
        if (e.button === 0) {
            handleDragStart(e, facility.id);
        }
    }
    function handlePointerMove(e) {
        handleDragMove(e);
    }
    function handlePointerUp(e) {
        handleDragEnd(e);
    }
    const facilityDef = facilities[facility.type];
    const powerAreaDef = facilityDef?.powerArea;
    // Power area is centered on the facility
    const powerAreaX = selected && powerAreaDef
        ? x + (width - powerAreaDef.width * cellSize) / 2
        : 0;
    const powerAreaY = selected && powerAreaDef
        ? y + (height - powerAreaDef.height * cellSize) / 2
        : 0;
    const powerAreaWidth = powerAreaDef ? powerAreaDef.width * cellSize : 0;
    const powerAreaHeight = powerAreaDef ? powerAreaDef.height * cellSize : 0;
    const irrigationAreaDef = facilityDef?.irrigationArea;
    const rotationSteps = facility.rotation / 90;
    const rotatedIrrigationSide = irrigationAreaDef
        ? rotateDirection(irrigationAreaDef.side, rotationSteps)
        : null;
    const irrigationSize = irrigationAreaDef
        ? (rotationSteps % 2 === 0
            ? { width: irrigationAreaDef.width, height: irrigationAreaDef.height }
            : { width: irrigationAreaDef.height, height: irrigationAreaDef.width })
        : null;
    const irrigationAreaX = selected && irrigationAreaDef && irrigationSize && rotatedIrrigationSide
        ? (() => {
            if (rotatedIrrigationSide === 'up' || rotatedIrrigationSide === 'down') {
                return x + (width - irrigationSize.width * cellSize) / 2;
            }
            if (rotatedIrrigationSide === 'left') {
                return x - irrigationSize.width * cellSize;
            }
            return x + width;
        })()
        : 0;
    const irrigationAreaY = selected && irrigationAreaDef && irrigationSize && rotatedIrrigationSide
        ? (() => {
            if (rotatedIrrigationSide === 'up') {
                return y - irrigationSize.height * cellSize;
            }
            if (rotatedIrrigationSide === 'down') {
                return y + height;
            }
            return y + (height - irrigationSize.height * cellSize) / 2;
        })()
        : 0;
    const irrigationAreaWidth = irrigationAreaDef && irrigationSize ? irrigationSize.width * cellSize : 0;
    const irrigationAreaHeight = irrigationAreaDef && irrigationSize ? irrigationSize.height * cellSize : 0;
    return (_jsxDEV("g", { onClick: handleClick, onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onPointerUp: handlePointerUp, children: [selected && powerAreaDef && (_jsxDEV("rect", { x: powerAreaX, y: powerAreaY, width: powerAreaWidth, height: powerAreaHeight, className: "facility-power-area" }, void 0, false, { fileName: _jsxFileName, lineNumber: 115, columnNumber: 43 }, this)), selected && irrigationAreaDef && (_jsxDEV("rect", { x: irrigationAreaX, y: irrigationAreaY, width: irrigationAreaWidth, height: irrigationAreaHeight, className: "facility-irrigation-area" }, void 0, false, { fileName: _jsxFileName, lineNumber: 124, columnNumber: 48 }, this)), _jsxDEV("rect", { x: x, y: y, width: width, height: height, className: className }, void 0, false, { fileName: _jsxFileName, lineNumber: 133, columnNumber: 13 }, this), _jsxDEV("foreignObject", { x: x + 2, y: y + 2, width: width - 4, height: height - 4, className: "facility-text-container", children: _jsxDEV("div", { className: "facility-text-wrapper", children: [_jsxDEV("div", { className: "facility-label", children: [label, hasError && _jsxDEV("span", { className: "facility-error-indicator", title: "Placement error", children: _jsxDEV(XCircle, { size: 12 }, void 0, false, { fileName: _jsxFileName, lineNumber: 150, columnNumber: 105 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 150, columnNumber: 37 }, this), hasFlowWarning && _jsxDEV("span", { className: "facility-warning-indicator", title: "Flow issues detected", children: _jsxDEV(AlertTriangle, { size: 12 }, void 0, false, { fileName: _jsxFileName, lineNumber: 151, columnNumber: 118 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 151, columnNumber: 43 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 148, columnNumber: 21 }, this), powerStatus && _jsxDEV("div", { className: "facility-sublabel", children: powerStatus }, void 0, false, { fileName: _jsxFileName, lineNumber: 153, columnNumber: 36 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 147, columnNumber: 17 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 140, columnNumber: 13 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 108, columnNumber: 13 }, this));
}
