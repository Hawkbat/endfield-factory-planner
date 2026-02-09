import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/contexts/keyboardShortcuts.tsx";
import { createContext, useContext, useEffect, useRef } from "react";
import { EditMode } from "../types/editMode.js";
import { useEdit } from "./edit.js";
import { useCopyPaste } from "./copyPaste.js";
import { usePathEditing } from "./pathEditing.js";
import { useFixturePlacement } from "./fixturePlacement.js";
import { useDragging } from "./dragging.js";
import { useItemSelectors } from "./itemSelectors.js";
import { PathTypeID } from "../types/data.js";
const KeyboardShortcutsContext = createContext(null);
export function useKeyboardShortcuts() {
    const context = useContext(KeyboardShortcutsContext);
    if (!context) {
        throw new Error("useKeyboardShortcuts must be used within KeyboardShortcutsProvider");
    }
    return context;
}
export function KeyboardShortcutsProvider({ children, currentMouseGridPointRef, }) {
    const { editMode, toggleSelectAll, handleUndo, handleRedo, handleDelete, handleRotate, handleNudge, isOnboardingOpen, } = useEdit();
    const { openFacilityItemSelectorAtGrid } = useItemSelectors();
    const { handleCopy, handlePaste, handleDuplicate } = useCopyPaste();
    const dragging = useDragging();
    const pathEditing = usePathEditing();
    const fixturePlacement = useFixturePlacement();
    useEffect(() => {
        function isEditableTarget(target) {
            if (!(target instanceof HTMLElement)) {
                return false;
            }
            const tagName = target.tagName;
            return target.isContentEditable || tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
        }
        function handleKeyDown(event) {
            if (isEditableTarget(event.target)) {
                return;
            }
            if (isOnboardingOpen) {
                return;
            }
            const key = event.key.toLowerCase();
            // Escape cancels current edit mode
            if (key === "escape") {
                event.preventDefault();
                if (editMode === EditMode.DRAGGING) {
                    dragging.cancelDrag();
                }
                else if (editMode === EditMode.PATH_EDITING) {
                    pathEditing.cancelPathEdit();
                }
                else if (editMode === EditMode.FIXTURE_PLACING) {
                    fixturePlacement.cancelFixturePlacement();
                }
                return;
            }
            if (editMode === EditMode.FIXTURE_PLACING) {
                if (key === "r") {
                    event.preventDefault();
                    fixturePlacement.rotateFixturePreview(true);
                }
                else if (key === "t") {
                    event.preventDefault();
                    fixturePlacement.rotateFixturePreview(false);
                }
                else if (key === "enter") {
                    event.preventDefault();
                    // Enter confirms placement if valid
                    if (currentMouseGridPointRef.current) {
                        fixturePlacement.handleFixturePlacementClick(currentMouseGridPointRef.current);
                    }
                }
                return;
            }
            if (editMode === EditMode.PATH_EDITING) {
                if (key === "delete" || key === "backspace") {
                    event.preventDefault();
                    pathEditing.handlePathSegmentDelete();
                }
                else if (key === " ") {
                    event.preventDefault();
                    // Space commits the current point
                    pathEditing.handlePathEditClick(currentMouseGridPointRef.current);
                }
                else if (key === "enter") {
                    event.preventDefault();
                    // Enter finishes the path
                    pathEditing.handlePathEditDoubleClick(currentMouseGridPointRef.current);
                }
                return;
            }
            if (editMode === EditMode.MANIPULATE) {
                if (key === "z") {
                    event.preventDefault();
                    handleUndo();
                }
                else if (key === "y") {
                    event.preventDefault();
                    handleRedo();
                }
                else if (key === "s") {
                    // Users may reflexively press 'S' to try to save; prevent default to avoid browser save dialog
                    event.preventDefault();
                }
                else if (key === "delete" || key === "backspace") {
                    event.preventDefault();
                    handleDelete();
                }
                else if (key === "r") {
                    event.preventDefault();
                    handleRotate(true);
                }
                else if (key === "t") {
                    event.preventDefault();
                    handleRotate(false);
                }
                else if (key === "arrowup") {
                    event.preventDefault();
                    handleNudge(0, -1);
                }
                else if (key === "arrowdown") {
                    event.preventDefault();
                    handleNudge(0, 1);
                }
                else if (key === "arrowleft") {
                    event.preventDefault();
                    handleNudge(-1, 0);
                }
                else if (key === "arrowright") {
                    event.preventDefault();
                    handleNudge(1, 0);
                }
                else if (key === "c") {
                    event.preventDefault();
                    handleCopy();
                }
                else if (key === "v") {
                    event.preventDefault();
                    handlePaste();
                }
                else if (key === "d") {
                    event.preventDefault();
                    handleDuplicate();
                }
                else if (key === "a") {
                    event.preventDefault();
                    toggleSelectAll();
                }
                else if (key === " ") {
                    event.preventDefault();
                    const gridPoint = currentMouseGridPointRef.current;
                    if (gridPoint) {
                        openFacilityItemSelectorAtGrid(gridPoint);
                    }
                }
                else if (key === "e") {
                    event.preventDefault();
                    const gridPoint = currentMouseGridPointRef.current;
                    if (gridPoint) {
                        pathEditing.startPathFromPoint(gridPoint, PathTypeID.BELT);
                    }
                }
                else if (key === "q") {
                    event.preventDefault();
                    const gridPoint = currentMouseGridPointRef.current;
                    if (gridPoint) {
                        pathEditing.startPathFromPoint(gridPoint, PathTypeID.PIPE);
                    }
                }
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        editMode,
        toggleSelectAll,
        handleUndo,
        handleRedo,
        handleDelete,
        handleRotate,
        handleNudge,
        handleCopy,
        handlePaste,
        handleDuplicate,
        pathEditing,
        currentMouseGridPointRef
    ]);
    const value = {};
    return (_jsxDEV(KeyboardShortcutsContext.Provider, { value: value, children: children }, void 0, false, { fileName: _jsxFileName, lineNumber: 201, columnNumber: 13 }, this));
}
