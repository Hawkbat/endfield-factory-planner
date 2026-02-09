import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/contexts/boxSelection.tsx";
import { createContext, useContext, useRef, useState } from "react";
import { tuple } from "../utils/types.js";
import { EditMode } from "../types/editMode.js";
import { useEdit } from "./edit.js";
import { getSelectionFromBox } from "../game/selection.js";
const BoxSelectionContext = createContext(null);
export function useBoxSelection() {
    const context = useContext(BoxSelectionContext);
    if (!context) {
        throw new Error("useBoxSelection must be used within BoxSelectionProvider");
    }
    return context;
}
export function BoxSelectionProvider({ children }) {
    const { editMode, setEditMode, selectedIDs, setSelectedIDs, fieldState } = useEdit();
    const [selectionBox, setSelectionBox] = useState(null);
    function isBoxSelecting() {
        return editMode === EditMode.BOX_SELECTING;
    }
    function handleBoxSelectionStart(gridPoint, event) {
        // Only start from manipulate mode
        if (editMode !== EditMode.MANIPULATE) {
            return;
        }
        // Switch to box selecting mode
        setEditMode(EditMode.BOX_SELECTING);
        const nextBox = { start: gridPoint, end: gridPoint };
        setSelectionBox(nextBox);
        event.currentTarget.setPointerCapture(event.pointerId);
    }
    function handleBoxSelectionMove(gridPoint) {
        if (editMode !== EditMode.BOX_SELECTING) {
            return;
        }
        const start = selectionBox ? selectionBox.start : gridPoint;
        let end = tuple(gridPoint[0], gridPoint[1]);
        // Box selection should include the cell under the pointer
        if (end[0] >= start[0]) {
            end = tuple(end[0] + 1, end[1]);
        }
        if (end[1] >= start[1]) {
            end = tuple(end[0], end[1] + 1);
        }
        const nextBox = selectionBox
            ? { ...selectionBox, end }
            : { start: gridPoint, end };
        setSelectionBox(nextBox);
    }
    function handleBoxSelectionEnd(event) {
        if (editMode !== EditMode.BOX_SELECTING) {
            return;
        }
        event.currentTarget.releasePointerCapture(event.pointerId);
        if (!selectionBox) {
            // No box, just switch back to manipulate
            setEditMode(EditMode.MANIPULATE);
            return;
        }
        const boxSelection = getSelectionFromBox(selectionBox, fieldState);
        const isAdd = event.shiftKey;
        const isSubtract = event.ctrlKey || event.metaKey;
        if (isSubtract) {
            const nextSelection = new Set(selectedIDs);
            for (const id of boxSelection) {
                nextSelection.delete(id);
            }
            setSelectedIDs(nextSelection);
        }
        else if (isAdd) {
            const nextSelection = new Set(selectedIDs);
            for (const id of boxSelection) {
                nextSelection.add(id);
            }
            setSelectedIDs(nextSelection);
        }
        else {
            setSelectedIDs(boxSelection);
        }
        // Clear box and switch back to manipulate mode
        setSelectionBox(null);
        setEditMode(EditMode.MANIPULATE);
    }
    const value = {
        selectionBox,
        handleBoxSelectionStart,
        handleBoxSelectionMove,
        handleBoxSelectionEnd,
        isBoxSelecting,
    };
    return (_jsxDEV(BoxSelectionContext.Provider, { value: value, children: children }, void 0, false, { fileName: _jsxFileName, lineNumber: 127, columnNumber: 13 }, this));
}
