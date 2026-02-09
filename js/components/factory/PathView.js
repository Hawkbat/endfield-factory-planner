import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/PathView.tsx";
import { objectValues } from "../../utils/types.js";
import { cn } from "../../utils/react.js";
import { useEdit } from "../../contexts/edit.js";
import { useDragging } from "../../contexts/dragging.js";
import { usePathEditing } from "../../contexts/pathEditing.js";
import { EditMode } from "../../types/editMode.js";
import { PathTypeID } from "../../types/data.js";
function toPixel(point, cellSize) {
    return [point[0] * cellSize + cellSize / 2, point[1] * cellSize + cellSize / 2];
}
export function PathView({ path, cellSize }) {
    const { editMode, selectedIDs, selectEntity } = useEdit();
    const { handleDragStart, handleDragMove, handleDragEnd } = useDragging();
    const { resumePathFromEnd } = usePathEditing();
    const selected = selectedIDs.has(path.id);
    const isEditingPath = editMode === EditMode.PATH_EDITING;
    const pointerEventsEnabled = editMode === EditMode.MANIPULATE;
    const points = path.points.map(point => toPixel(point, cellSize));
    const pointsAttr = points.map(([x, y]) => `${x},${y}`).join(" ");
    const error = path.errorFlags && objectValues(path.errorFlags).find(v => !!v);
    const blocked = path.flowDirection === "blocked" && !error;
    const disconnected = path.errorFlags?.nothingConnected;
    const totalSinkRate = path.flows.reduce((sum, flow) => sum + flow.sinkRate, 0);
    const flowActive = !blocked && !path.errorFlags?.nothingConnected && totalSinkRate > 0;
    const maxRate = path.type === PathTypeID.BELT ? 0.5 : 2;
    const pathSize = path.type === PathTypeID.BELT ? cellSize * 0.75 : cellSize * 0.4;
    const dashSize = path.type === PathTypeID.BELT ? cellSize * 0.5 : cellSize * 0.3;
    const clampedRate = Math.min(Math.max(totalSinkRate, 0.0001), maxRate);
    const baseGap = cellSize;
    const gapLength = baseGap * (maxRate / clampedRate);
    const dashShift = cellSize * gapLength;
    const dashDuration = cellSize / clampedRate;
    const baseClassName = cn("path-base", {
        blocked,
        error,
        disconnected,
        selected,
        flowing: flowActive,
        belt: path.type === PathTypeID.BELT,
        pipe: path.type === PathTypeID.PIPE,
    });
    const className = cn("path", {
        blocked,
        error,
        disconnected,
        selected,
        flowing: flowActive,
        belt: path.type === PathTypeID.BELT,
        pipe: path.type === PathTypeID.PIPE,
    });
    function handleClick(e) {
        e.stopPropagation();
        selectEntity(path.id, e.shiftKey || e.ctrlKey || e.metaKey);
    }
    function handlePointerDown(e) {
        if (e.button === 0) {
            handleDragStart(e, path.id);
        }
    }
    function handlePointerMove(e) {
        handleDragMove(e);
    }
    function handlePointerUp(e) {
        handleDragEnd(e);
    }
    function handleEndpointDoubleClick(e, fromStart) {
        e.stopPropagation();
        if (editMode === EditMode.MANIPULATE) {
            resumePathFromEnd(path.id, fromStart);
        }
    }
    return (_jsxDEV("g", { children: [_jsxDEV("g", { onClick: handleClick, onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onPointerUp: handlePointerUp, style: { pointerEvents: pointerEventsEnabled ? 'auto' : 'none' }, children: [_jsxDEV("polyline", { points: pointsAttr, className: baseClassName, style: {
                            strokeWidth: pathSize,
                        } }, void 0, false, { fileName: _jsxFileName, lineNumber: 98, columnNumber: 17 }, this), flowActive ? _jsxDEV("polyline", { points: pointsAttr, className: className, style: {
                            strokeDasharray: `0px ${gapLength}`,
                            strokeWidth: dashSize,
                            animationDirection: path.flowDirection === "end-to-start" ? "reverse" : "normal",
                            ["--dash-duration"]: `${dashDuration}s`,
                            ["--dash-shift"]: `${dashShift}px`,
                        } }, void 0, false, { fileName: _jsxFileName, lineNumber: 105, columnNumber: 30 }, this) : null] }, void 0, true, { fileName: _jsxFileName, lineNumber: 91, columnNumber: 13 }, this), (selected || isEditingPath) && (_jsxDEV(_Fragment, { children: [_jsxDEV("circle", { cx: points[0]?.[0], cy: points[0]?.[1], r: 4, className: cn("path-endpoint", { selected }), style: {
                            cursor: editMode === EditMode.MANIPULATE ? 'pointer' : 'default',
                            pointerEvents: editMode === EditMode.MANIPULATE ? 'auto' : 'none'
                        }, onClick: (e) => e.stopPropagation(), onDoubleClick: (e) => handleEndpointDoubleClick(e, true) }, void 0, false, { fileName: _jsxFileName, lineNumber: 119, columnNumber: 21 }, this), _jsxDEV("circle", { cx: points[points.length - 1]?.[0], cy: points[points.length - 1]?.[1], r: 4, className: cn("path-endpoint", { selected }), style: {
                            cursor: editMode === EditMode.MANIPULATE ? 'pointer' : 'default',
                            pointerEvents: editMode === EditMode.MANIPULATE ? 'auto' : 'none'
                        }, onClick: (e) => e.stopPropagation(), onDoubleClick: (e) => handleEndpointDoubleClick(e, false) }, void 0, false, { fileName: _jsxFileName, lineNumber: 131, columnNumber: 21 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 117, columnNumber: 46 }, this))] }, void 0, true, { fileName: _jsxFileName, lineNumber: 89, columnNumber: 13 }, this));
}
