import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/contexts/pathEditing.tsx";
import { createContext, useContext, useRef, useEffect } from "react";
import { PathTypeID } from "../types/data.js";
import { EditMode } from "../types/editMode.js";
import { useEdit } from "./edit.js";
import { createStateFromChanges } from "../game/sampleField.js";
const PathEditingContext = createContext(null);
export function usePathEditing() {
    const context = useContext(PathEditingContext);
    if (!context) {
        throw new Error("usePathEditing must be used within PathEditingProvider");
    }
    return context;
}
export function PathEditingProvider({ children }) {
    const { editMode, setEditMode, fieldState, setFieldState, handleChange, undoStack } = useEdit();
    const pathEditStateRef = useRef({
        pathID: null,
        isNewPath: false,
        pathType: PathTypeID.BELT,
        committedPoints: [],
        originalPathPoints: []
    });
    const dragInitialStateRef = useRef([]);
    // Validate that the path being edited still exists and clean up if not
    // Track if path editing mode was previously active with points, to avoid immediate cleanup on entry
    const prevEditModeRef = useRef(null);
    useEffect(() => {
        if (editMode !== EditMode.PATH_EDITING) {
            prevEditModeRef.current = editMode;
            return;
        }
        const editState = pathEditStateRef.current;
        // For new paths, check if we still have at least one committed point
        if (editState.isNewPath) {
            // Only clean up if we transitioned from editing with points to zero points
            if (editState.committedPoints.length === 0 &&
                prevEditModeRef.current === EditMode.PATH_EDITING) {
                cleanupPathEditingState();
            }
            prevEditModeRef.current = editMode;
            return;
        }
        // For existing paths being edited, don't clean up just because the path
        // no longer exists - we might be intentionally editing it down to 1 point
        // Only clean up if we have 0 committed points
        if (editState.pathID) {
            const pathExists = fieldState.paths.some(p => p.id === editState.pathID);
            if (!pathExists && editState.committedPoints.length === 1) {
                // Path was removed but we still have a point to continue editing from
                // Mark as new path and update dragInitialStateRef to include the deletion
                // so the original path doesn't reappear
                const deleteChange = {
                    type: 'remove-path',
                    pathID: editState.pathID
                };
                dragInitialStateRef.current = [...dragInitialStateRef.current, deleteChange];
                pathEditStateRef.current = {
                    ...editState,
                    pathID: null,
                    isNewPath: true,
                    originalPathPoints: []
                };
            }
        }
        prevEditModeRef.current = editMode;
    }, [editMode, fieldState.paths]);
    function cleanupPathEditingState() {
        if (editMode !== EditMode.PATH_EDITING) {
            return;
        }
        setEditMode(EditMode.MANIPULATE);
        pathEditStateRef.current = {
            pathID: null,
            isNewPath: false,
            pathType: PathTypeID.BELT,
            committedPoints: [],
            originalPathPoints: []
        };
        // Restore to initial state
        const newState = createStateFromChanges(dragInitialStateRef.current, fieldState.template);
        setFieldState(newState);
        // Notify that editing is complete
        setEditMode(EditMode.MANIPULATE);
    }
    function calculateCardinalPoint(fixedPoint, currentPoint) {
        const [fixedX, fixedY] = fixedPoint;
        const [currentX, currentY] = currentPoint;
        const dx = Math.abs(currentX - fixedX);
        const dy = Math.abs(currentY - fixedY);
        // Snap to the dominant axis
        if (dx > dy) {
            return [Math.round(currentX), fixedY];
        }
        else {
            return [fixedX, Math.round(currentY)];
        }
    }
    function normalizePathPoints(points) {
        if (points.length < 2) {
            return points;
        }
        const normalized = [points[0]];
        for (let i = 1; i < points.length; i++) {
            const prev = normalized[normalized.length - 1];
            const curr = points[i];
            // Skip zero-length segments
            if (prev[0] === curr[0] && prev[1] === curr[1]) {
                continue;
            }
            // Check if we can merge with the previous segment (colinear)
            if (normalized.length >= 2) {
                const prevPrev = normalized[normalized.length - 2];
                const isHorizontal = prev[1] === prevPrev[1] && curr[1] === prev[1];
                const isVertical = prev[0] === prevPrev[0] && curr[0] === prev[0];
                if (isHorizontal || isVertical) {
                    normalized[normalized.length - 1] = curr;
                    continue;
                }
            }
            normalized.push(curr);
        }
        return normalized;
    }
    /**
     * Start path editing mode for a new path of the given type, but do not set any points yet.
     * The first click on the field will set the initial point.
     */
    function startPathPlacement(pathType = PathTypeID.BELT) {
        setEditMode(EditMode.PATH_EDITING);
        pathEditStateRef.current = {
            pathID: null,
            isNewPath: true,
            pathType,
            committedPoints: [],
            originalPathPoints: []
        };
    }
    /**
     * Start path editing with an initial point. Used for click-to-edit from a specific location.
     */
    function startPathFromPoint(point, pathType = PathTypeID.BELT) {
        setEditMode(EditMode.PATH_EDITING);
        pathEditStateRef.current = {
            pathID: null,
            isNewPath: true,
            pathType,
            committedPoints: [point],
            originalPathPoints: []
        };
    }
    function startPathFromPortOrFixture(entityID, position, pathType) {
        setEditMode(EditMode.PATH_EDITING);
        pathEditStateRef.current = {
            pathID: null,
            isNewPath: true,
            pathType,
            committedPoints: [position],
            originalPathPoints: []
        };
    }
    /**
     * Resume editing an existing path from one of its endpoints.
     * @param pathID ID of the path to resume editing
     * @param fromStart If true, resume from the start; if false, resume from the end
     */
    function resumePathFromEnd(pathID, fromStart) {
        const path = fieldState.paths.find(p => p.id === pathID);
        if (!path) {
            return;
        }
        // Store the initial state for undo
        dragInitialStateRef.current = undoStack;
        // Set edit mode
        setEditMode(EditMode.PATH_EDITING);
        // Keep all existing points as committed points
        let committedPoints;
        if (fromStart) {
            // Editing from start - reverse the entire path so we can add points going backward
            committedPoints = [...path.points].reverse().map(p => [p[0], p[1]]);
        }
        else {
            // Editing from end - keep points in order and add new points at the end
            committedPoints = path.points.map(p => [p[0], p[1]]);
        }
        pathEditStateRef.current = {
            pathID: path.id,
            isNewPath: false,
            pathType: path.type,
            committedPoints,
            originalPathPoints: path.points.map(p => [...p])
        };
    }
    function handlePathEditMove(gridPoint) {
        if (editMode !== EditMode.PATH_EDITING) {
            return;
        }
        const editState = pathEditStateRef.current;
        if (editState.committedPoints.length === 0) {
            return;
        }
        const lastCommitted = editState.committedPoints[editState.committedPoints.length - 1];
        const currentPoint = calculateCardinalPoint(lastCommitted, gridPoint);
        const allPoints = [...editState.committedPoints, currentPoint];
        if (allPoints.length < 2) {
            return;
        }
        let pathChange;
        if (editState.isNewPath) {
            pathChange = {
                type: 'add-path',
                pathType: editState.pathType,
                points: allPoints
            };
        }
        else if (editState.pathID) {
            pathChange = {
                type: 'update-path-points',
                pathID: editState.pathID,
                points: allPoints
            };
        }
        else {
            return;
        }
        const tempChanges = [...dragInitialStateRef.current, pathChange];
        const newState = createStateFromChanges(tempChanges, fieldState.template);
        setFieldState(newState);
    }
    function handlePathEditClick(gridPoint) {
        if (editMode !== EditMode.PATH_EDITING) {
            return;
        }
        const editState = pathEditStateRef.current;
        // If no points have been set yet, treat this as the initial point
        if (editState.committedPoints.length === 0) {
            pathEditStateRef.current = {
                ...editState,
                committedPoints: [gridPoint]
            };
            // After setting the first point, update the field state to preview the new path (single point, so no visible path yet)
            handlePathEditMove(gridPoint);
            return;
        }
        const lastCommitted = editState.committedPoints[editState.committedPoints.length - 1];
        const currentPoint = calculateCardinalPoint(lastCommitted, gridPoint);
        if (currentPoint[0] === lastCommitted[0] && currentPoint[1] === lastCommitted[1]) {
            return;
        }
        pathEditStateRef.current = {
            ...editState,
            committedPoints: [...editState.committedPoints, currentPoint]
        };
        handlePathEditMove(gridPoint);
    }
    function handlePathEditDoubleClick(gridPoint) {
        if (editMode !== EditMode.PATH_EDITING) {
            return;
        }
        const editState = pathEditStateRef.current;
        if (editState.committedPoints.length === 0) {
            cleanupPathEditingState();
            return;
        }
        const lastCommitted = editState.committedPoints[editState.committedPoints.length - 1];
        const currentPoint = calculateCardinalPoint(lastCommitted, gridPoint);
        let finalPoints = [...editState.committedPoints];
        if (currentPoint[0] !== lastCommitted[0] || currentPoint[1] !== lastCommitted[1]) {
            finalPoints.push(currentPoint);
        }
        finalPoints = normalizePathPoints(finalPoints);
        if (finalPoints.length < 2) {
            cleanupPathEditingState();
            return;
        }
        let pathChange;
        if (editState.isNewPath) {
            pathChange = {
                type: 'add-path',
                pathType: editState.pathType,
                points: finalPoints
            };
        }
        else if (editState.pathID) {
            pathChange = {
                type: 'update-path-points',
                pathID: editState.pathID,
                points: finalPoints
            };
        }
        else {
            cleanupPathEditingState();
            return;
        }
        cleanupPathEditingState();
        handleChange(pathChange);
    }
    function finishPathAtPortOrFixture(entityID, position) {
        if (editMode !== EditMode.PATH_EDITING) {
            return;
        }
        const editState = pathEditStateRef.current;
        if (editState.committedPoints.length === 0) {
            cleanupPathEditingState();
            return;
        }
        let finalPoints = [...editState.committedPoints];
        const lastCommitted = finalPoints[finalPoints.length - 1];
        // Add the port/fixture position if it's different from last committed
        if (position[0] !== lastCommitted[0] || position[1] !== lastCommitted[1]) {
            // Calculate path to the port/fixture with cardinal constraint
            const cardinalPoint = calculateCardinalPoint(lastCommitted, position);
            // If cardinal point is same as last, just add the final position
            if (cardinalPoint[0] === lastCommitted[0] && cardinalPoint[1] === lastCommitted[1]) {
                finalPoints.push(position);
            }
            else if (cardinalPoint[0] === position[0] && cardinalPoint[1] === position[1]) {
                // Cardinal point is already at the target
                finalPoints.push(position);
            }
            else {
                // Need intermediate point
                finalPoints.push(cardinalPoint, position);
            }
        }
        finalPoints = normalizePathPoints(finalPoints);
        if (finalPoints.length < 2) {
            cleanupPathEditingState();
            return;
        }
        let pathChange;
        if (editState.isNewPath) {
            pathChange = {
                type: 'add-path',
                pathType: editState.pathType,
                points: finalPoints
            };
        }
        else if (editState.pathID) {
            pathChange = {
                type: 'update-path-points',
                pathID: editState.pathID,
                points: finalPoints
            };
        }
        else {
            cleanupPathEditingState();
            return;
        }
        cleanupPathEditingState();
        handleChange(pathChange);
    }
    function handlePathSegmentDelete() {
        if (editMode !== EditMode.PATH_EDITING) {
            return;
        }
        const editState = pathEditStateRef.current;
        // Don't exit editing mode when deleting down to 1 point - just stay in editing mode
        if (editState.committedPoints.length <= 1) {
            return;
        }
        const newCommittedPoints = editState.committedPoints.slice(0, -1);
        pathEditStateRef.current = {
            ...editState,
            committedPoints: newCommittedPoints
        };
        // Update the visual state
        const allPoints = [...newCommittedPoints];
        if (editState.isNewPath) {
            if (allPoints.length >= 2) {
                const pathChange = {
                    type: 'add-path',
                    pathType: editState.pathType,
                    points: allPoints
                };
                const tempChanges = [...dragInitialStateRef.current, pathChange];
                const newState = createStateFromChanges(tempChanges, fieldState.template);
                setFieldState(newState);
            }
            else {
                // Only 1 point left - remove the path visually but stay in editing mode
                const newState = createStateFromChanges(dragInitialStateRef.current, fieldState.template);
                setFieldState(newState);
            }
        }
        else if (editState.pathID) {
            if (allPoints.length >= 2) {
                const pathChange = {
                    type: 'update-path-points',
                    pathID: editState.pathID,
                    points: allPoints
                };
                const tempChanges = [...dragInitialStateRef.current, pathChange];
                const newState = createStateFromChanges(tempChanges, fieldState.template);
                setFieldState(newState);
            }
            else {
                // Only 1 point left - remove the path visually but stay in editing mode
                const deleteChange = {
                    type: 'remove-path',
                    pathID: editState.pathID
                };
                const tempChanges = [...dragInitialStateRef.current, deleteChange];
                const newState = createStateFromChanges(tempChanges, fieldState.template);
                setFieldState(newState);
            }
        }
    }
    function cancelPathEdit() {
        if (editMode !== EditMode.PATH_EDITING) {
            return;
        }
        cleanupPathEditingState();
    }
    // Keep dragInitialStateRef in sync with undo stack
    useEffect(() => {
        if (editMode !== EditMode.PATH_EDITING) {
            dragInitialStateRef.current = undoStack;
        }
    }, [undoStack, editMode]);
    const value = {
        calculateCardinalPoint,
        normalizePathPoints,
        startPathFromPoint,
        startPathFromPortOrFixture,
        resumePathFromEnd,
        handlePathEditMove,
        handlePathEditClick,
        handlePathEditDoubleClick,
        finishPathAtPortOrFixture,
        handlePathSegmentDelete,
        cancelPathEdit,
        startPathPlacement,
    };
    return (_jsxDEV(PathEditingContext.Provider, { value: value, children: children }, void 0, false, { fileName: _jsxFileName, lineNumber: 527, columnNumber: 13 }, this));
}
