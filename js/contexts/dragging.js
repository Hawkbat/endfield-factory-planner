import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/contexts/dragging.tsx";
import { createContext, useContext, useRef } from "react";
import { EditMode } from "../types/editMode.js";
import { useEdit } from "./edit.js";
import { tuple } from "../utils/types.js";
import { createStateFromChanges } from "../game/sampleField.js";
import { generateFixtureRelocationChanges, validateFixturePlacementOnPath } from "../game/fixtures.js";
import { updateFixtureConnections } from "../game/connections.js";
const DraggingContext = createContext(null);
export function useDragging() {
    const context = useContext(DraggingContext);
    if (!context) {
        throw new Error("useDragging must be used within DraggingProvider");
    }
    return context;
}
export function DraggingProvider({ children, svgRef, pan, zoom, cellSize }) {
    const { editMode, setEditMode, selectedIDs, setSelectedIDs, fieldState, setFieldState, applyChangeOrMulti, undoStack } = useEdit();
    // Drag state
    const dragStartGridPointRef = useRef([0, 0]);
    const dragCurrentOffsetRef = useRef([0, 0]);
    const dragInitialStateRef = useRef([]);
    const dragActiveIDsRef = useRef(new Set());
    function getGridPoint(event) {
        if (!svgRef.current) {
            return [0, 0];
        }
        const rect = svgRef.current.getBoundingClientRect();
        const cursorX = event.clientX - rect.left;
        const cursorY = event.clientY - rect.top;
        const worldX = (cursorX - pan.x) / zoom;
        const worldY = (cursorY - pan.y) / zoom;
        const gridX = worldX / cellSize;
        const gridY = worldY / cellSize;
        return [Math.round(gridX), Math.round(gridY)];
    }
    function isDragging() {
        return editMode === EditMode.DRAGGING;
    }
    function handleDragStart(event, id) {
        // Only allow left-click drag
        if (event.button !== 0) {
            return;
        }
        // Only allow dragging from manipulate mode
        if (editMode !== EditMode.MANIPULATE) {
            return;
        }
        // If clicking on an unselected entity, select it first
        let activeIDs;
        if (!selectedIDs.has(id)) {
            activeIDs = new Set([id]);
            setSelectedIDs(activeIDs);
        }
        else {
            activeIDs = new Set(selectedIDs);
        }
        // Start dragging - switch to DRAGGING mode
        setEditMode(EditMode.DRAGGING);
        dragStartGridPointRef.current = getGridPoint(event);
        dragCurrentOffsetRef.current = [0, 0];
        dragInitialStateRef.current = undoStack;
        dragActiveIDsRef.current = activeIDs;
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
    }
    function handleDragMove(event) {
        if (editMode !== EditMode.DRAGGING) {
            return;
        }
        const currentGridPoint = getGridPoint(event);
        const dx = Math.round(currentGridPoint[0] - dragStartGridPointRef.current[0]);
        const dy = Math.round(currentGridPoint[1] - dragStartGridPointRef.current[1]);
        dragCurrentOffsetRef.current = [dx, dy];
        // Create move changes for all selected entities
        const moveChanges = [];
        const activeSelectedIDs = dragActiveIDsRef.current;
        // Use initial state to avoid cumulative movement
        const initialState = createStateFromChanges(dragInitialStateRef.current, fieldState.template);
        for (const id of activeSelectedIDs) {
            const facility = initialState.facilities.find(f => f.id === id);
            if (facility) {
                moveChanges.push({
                    type: 'move-facility',
                    facilityID: id,
                    newPosition: tuple(facility.x + dx, facility.y + dy),
                });
                continue;
            }
            const fixture = initialState.pathFixtures.find(f => f.id === id);
            if (fixture) {
                moveChanges.push({
                    type: 'move-path-fixture',
                    fixtureID: id,
                    newPosition: tuple(fixture.x + dx, fixture.y + dy),
                });
                continue;
            }
            const path = initialState.paths.find(p => p.id === id);
            if (path) {
                const newPoints = path.points.map(([x, y]) => tuple(x + dx, y + dy));
                moveChanges.push({
                    type: 'update-path-points',
                    pathID: id,
                    points: newPoints,
                });
            }
        }
        // Update field state in real-time without touching undo stack
        if (moveChanges.length > 0) {
            const tempChanges = [...dragInitialStateRef.current, ...moveChanges];
            setFieldState(createStateFromChanges(tempChanges, fieldState.template));
        }
    }
    function handleDragEnd(event) {
        if (editMode !== EditMode.DRAGGING) {
            return;
        }
        event.currentTarget.releasePointerCapture(event.pointerId);
        const [dx, dy] = dragCurrentOffsetRef.current;
        // Switch back to manipulate mode
        setEditMode(EditMode.MANIPULATE);
        // If no movement occurred, don't create changes
        if (dx === 0 && dy === 0) {
            return;
        }
        // Create final move changes
        const moveChanges = [];
        const activeSelectedIDs = dragActiveIDsRef.current;
        for (const id of activeSelectedIDs) {
            // Look up original positions from the initial state
            const initialState = createStateFromChanges(dragInitialStateRef.current, fieldState.template);
            const facility = initialState.facilities.find(f => f.id === id);
            if (facility) {
                moveChanges.push({
                    type: 'move-facility',
                    facilityID: id,
                    newPosition: tuple(facility.x + dx, facility.y + dy),
                });
                continue;
            }
            const fixture = initialState.pathFixtures.find(f => f.id === id);
            if (fixture) {
                const newPosition = tuple(fixture.x + dx, fixture.y + dy);
                // Strategy: Check if new position is on a path that's NOT currently connected
                // - If moving to an unconnected path: do full reconnect + split
                // - If moving along connected paths or to empty space: simple move with endpoint updates
                const fixtureWithConnections = updateFixtureConnections(fixture, initialState);
                const connectedPathIDs = new Set(fixtureWithConnections.sides
                    .filter(s => s.connectedPathID)
                    .map(s => s.connectedPathID));
                // Find which path (if any) the new position would be on
                let targetPath = null;
                let targetValidation = null;
                for (const path of initialState.paths) {
                    const validation = validateFixturePlacementOnPath(fixture.type, newPosition, fixture.rotation, path);
                    if (validation.isValid && validation.segmentIndex !== undefined) {
                        targetPath = path;
                        targetValidation = validation;
                        break;
                    }
                }
                const isMovingToUnconnectedPath = targetPath && !connectedPathIDs.has(targetPath.id);
                // Check if moving to a different segment of a connected path
                let isMovingToDifferentSegment = false;
                if (targetPath && connectedPathIDs.has(targetPath.id) && targetValidation) {
                    // This is a connected path - check if we're on a different segment
                    const currentValidation = validateFixturePlacementOnPath(fixture.type, [fixture.x, fixture.y], fixture.rotation, targetPath);
                    if (currentValidation.isValid &&
                        currentValidation.segmentIndex !== undefined &&
                        currentValidation.segmentIndex !== targetValidation.segmentIndex) {
                        isMovingToDifferentSegment = true;
                    }
                }
                // Also check if we can safely update path endpoints (movement must maintain cardinal alignment)
                let canUpdateEndpointsSafely = !isMovingToUnconnectedPath && !isMovingToDifferentSegment;
                if (canUpdateEndpointsSafely) {
                    // Check each connected path to see if updating its endpoint would keep it valid
                    for (const pathID of connectedPathIDs) {
                        const path = initialState.paths.find(p => p.id === pathID);
                        if (!path)
                            continue;
                        const firstPoint = path.points[0];
                        const lastPoint = path.points[path.points.length - 1];
                        const oldPos = [fixture.x, fixture.y];
                        const firstConnects = firstPoint[0] === oldPos[0] && firstPoint[1] === oldPos[1];
                        const lastConnects = lastPoint[0] === oldPos[0] && lastPoint[1] === oldPos[1];
                        if (firstConnects && path.points.length >= 2) {
                            // Check if moving the first point would maintain cardinal alignment with second point
                            const secondPoint = path.points[1];
                            const isCardinal = (newPosition[0] === secondPoint[0]) || (newPosition[1] === secondPoint[1]);
                            if (!isCardinal) {
                                canUpdateEndpointsSafely = false;
                                break;
                            }
                        }
                        else if (lastConnects && path.points.length >= 2) {
                            // Check if moving the last point would maintain cardinal alignment with second-to-last point
                            const secondLastPoint = path.points[path.points.length - 2];
                            const isCardinal = (newPosition[0] === secondLastPoint[0]) || (newPosition[1] === secondLastPoint[1]);
                            if (!isCardinal) {
                                canUpdateEndpointsSafely = false;
                                break;
                            }
                        }
                    }
                }
                if (isMovingToUnconnectedPath && targetPath && !isMovingToDifferentSegment) {
                    // Moving to a completely different path - use full reconnect + split
                    const reconnectionChanges = generateFixtureRelocationChanges(fixture, newPosition, initialState, initialState, true).filter(c => c.type === 'remove-path' || c.type === 'add-path');
                    const intermediateChanges = [...dragInitialStateRef.current, ...reconnectionChanges];
                    const intermediateState = createStateFromChanges(intermediateChanges, fieldState.template);
                    const splitAndMoveChanges = generateFixtureRelocationChanges(fixture, newPosition, initialState, intermediateState, false);
                    moveChanges.push(...reconnectionChanges, ...splitAndMoveChanges);
                }
                else if (canUpdateEndpointsSafely) {
                    // Moving along connected paths with valid cardinal alignment - simple move with endpoint updates
                    // Update endpoints of connected paths to follow the fixture
                    for (const pathID of connectedPathIDs) {
                        const path = initialState.paths.find(p => p.id === pathID);
                        if (!path)
                            continue;
                        const firstPoint = path.points[0];
                        const lastPoint = path.points[path.points.length - 1];
                        const oldPos = [fixture.x, fixture.y];
                        const firstConnects = firstPoint[0] === oldPos[0] && firstPoint[1] === oldPos[1];
                        const lastConnects = lastPoint[0] === oldPos[0] && lastPoint[1] === oldPos[1];
                        if (firstConnects || lastConnects) {
                            const newPoints = path.points.map((point, index) => {
                                if (firstConnects && index === 0) {
                                    return tuple(newPosition[0], newPosition[1]);
                                }
                                else if (lastConnects && index === path.points.length - 1) {
                                    return tuple(newPosition[0], newPosition[1]);
                                }
                                return tuple(point[0], point[1]);
                            });
                            moveChanges.push({
                                type: 'update-path-points',
                                pathID: pathID,
                                points: newPoints
                            });
                        }
                    }
                    moveChanges.push({
                        type: 'move-path-fixture',
                        fixtureID: id,
                        newPosition: newPosition,
                    });
                }
                else {
                    // Can't do simple move, need to reconnect and potentially split
                    const reconnectionChanges = generateFixtureRelocationChanges(fixture, newPosition, initialState, initialState, true).filter(c => c.type === 'remove-path' || c.type === 'add-path');
                    const intermediateChanges = [...dragInitialStateRef.current, ...reconnectionChanges];
                    const intermediateState = createStateFromChanges(intermediateChanges, fieldState.template);
                    const splitAndMoveChanges = generateFixtureRelocationChanges(fixture, newPosition, initialState, intermediateState, false);
                    moveChanges.push(...reconnectionChanges, ...splitAndMoveChanges);
                }
                continue;
            }
            const path = initialState.paths.find(p => p.id === id);
            if (path) {
                const newPoints = path.points.map(([x, y]) => tuple(x + dx, y + dy));
                moveChanges.push({
                    type: 'update-path-points',
                    pathID: id,
                    points: newPoints,
                });
            }
        }
        // Commit to undo stack
        applyChangeOrMulti(moveChanges);
    }
    function cancelDrag() {
        if (editMode !== EditMode.DRAGGING) {
            return;
        }
        // Switch back to manipulate mode
        setEditMode(EditMode.MANIPULATE);
        // Restore field state from initial undo stack
        setFieldState(createStateFromChanges(dragInitialStateRef.current, fieldState.template));
    }
    const value = {
        handleDragStart,
        handleDragMove,
        handleDragEnd,
        cancelDrag,
        isDragging,
    };
    return (_jsxDEV(DraggingContext.Provider, { value: value, children: children }, void 0, false, { fileName: _jsxFileName, lineNumber: 439, columnNumber: 13 }, this));
}
