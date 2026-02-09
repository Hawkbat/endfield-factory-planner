import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/contexts/fixturePlacement.tsx";
import { createContext, useContext, useRef, useState, useEffect } from "react";
import { PathFixtureID } from "../types/data.js";
import { EditMode } from "../types/editMode.js";
import { useEdit } from "./edit.js";
import { validateFixturePlacementOnPath, splitPathAtFixture } from "../game/fixtures.js";
import { FixtureBehaviorType, getFixtureTypeForPath } from "../data/pathFixtures.js";
import { createStateFromChanges } from "../game/sampleField.js";
const FixturePlacementContext = createContext(null);
export function useFixturePlacement() {
    const context = useContext(FixturePlacementContext);
    if (!context) {
        throw new Error("useFixturePlacement must be used within FixturePlacementProvider");
    }
    return context;
}
export function FixturePlacementProvider({ children }) {
    const { editMode, setEditMode, fieldState, setFieldState, handleChange } = useEdit();
    const [placementState, setPlacementState] = useState({
        behaviorType: null,
        rotation: 0,
        previewPosition: null,
        targetPath: null,
        isValidPlacement: false,
        actualFixtureType: null
    });
    const initialStateRef = useRef(fieldState);
    // Clean up when leaving fixture placement mode
    useEffect(() => {
        if (editMode !== EditMode.FIXTURE_PLACING) {
            setPlacementState({
                behaviorType: null,
                rotation: 0,
                previewPosition: null,
                targetPath: null,
                isValidPlacement: false,
                actualFixtureType: null
            });
        }
    }, [editMode]);
    function startFixturePlacing(behaviorType) {
        initialStateRef.current = fieldState;
        setEditMode(EditMode.FIXTURE_PLACING);
        setPlacementState({
            behaviorType,
            rotation: 0,
            previewPosition: null,
            targetPath: null,
            isValidPlacement: false,
            actualFixtureType: null
        });
    }
    function handleFixturePlacementMove(gridPoint) {
        if (editMode !== EditMode.FIXTURE_PLACING || !placementState.behaviorType) {
            return;
        }
        // Find if this point is on any path and get the appropriate fixture type
        let bestValidation = null;
        let bestFixtureType = null;
        for (const path of fieldState.paths) {
            const fixtureType = getFixtureTypeForPath(placementState.behaviorType, path.type);
            const validation = validateFixturePlacementOnPath(fixtureType, gridPoint, placementState.rotation, path);
            if (validation.isValid) {
                bestValidation = validation;
                bestFixtureType = fixtureType;
                break;
            }
        }
        if (bestValidation?.isValid && bestValidation.targetPath && bestFixtureType) {
            // Show preview with valid placement
            setPlacementState(prev => ({
                ...prev,
                previewPosition: gridPoint,
                targetPath: bestValidation.targetPath,
                isValidPlacement: true,
                actualFixtureType: bestFixtureType
            }));
        }
        else {
            // Show invalid preview
            setPlacementState(prev => ({
                ...prev,
                previewPosition: gridPoint,
                targetPath: null,
                isValidPlacement: false,
                actualFixtureType: null
            }));
        }
    }
    function handleFixturePlacementClick(gridPoint) {
        if (editMode !== EditMode.FIXTURE_PLACING || !placementState.behaviorType) {
            return;
        }
        // Validate placement
        let bestValidation = null;
        let bestFixtureType = null;
        for (const path of initialStateRef.current.paths) {
            const fixtureType = getFixtureTypeForPath(placementState.behaviorType, path.type);
            const validation = validateFixturePlacementOnPath(fixtureType, gridPoint, placementState.rotation, path);
            if (validation.isValid) {
                bestValidation = validation;
                bestFixtureType = fixtureType;
                break;
            }
        }
        if (!bestValidation?.isValid || bestValidation.segmentIndex === undefined || !bestFixtureType) {
            // Invalid placement, don't do anything
            return;
        }
        // Generate and apply changes
        const changes = splitPathAtFixture(bestValidation.targetPath, bestFixtureType, gridPoint, placementState.rotation, bestValidation.segmentIndex);
        // Apply changes as a multi-change for undo/redo
        const multiChange = {
            type: 'multi',
            changes
        };
        handleChange(multiChange);
        // Exit fixture placing mode
        setEditMode(EditMode.MANIPULATE);
        setPlacementState({
            behaviorType: null,
            rotation: 0,
            previewPosition: null,
            targetPath: null,
            isValidPlacement: false,
            actualFixtureType: null
        });
    }
    function rotateFixturePreview(clockwise) {
        if (editMode !== EditMode.FIXTURE_PLACING) {
            return;
        }
        setPlacementState(prev => {
            const delta = clockwise ? 90 : -90;
            let newRotation = (prev.rotation + delta) % 360;
            if (newRotation < 0)
                newRotation += 360;
            return {
                ...prev,
                rotation: newRotation
            };
        });
        // Re-validate with new rotation
        if (placementState.previewPosition) {
            handleFixturePlacementMove(placementState.previewPosition);
        }
    }
    function cancelFixturePlacement() {
        if (editMode !== EditMode.FIXTURE_PLACING) {
            return;
        }
        setEditMode(EditMode.MANIPULATE);
        setPlacementState({
            behaviorType: null,
            rotation: 0,
            previewPosition: null,
            targetPath: null,
            isValidPlacement: false,
            actualFixtureType: null
        });
    }
    return (_jsxDEV(FixturePlacementContext.Provider, { value: {
            placingBehaviorType: placementState.behaviorType,
            actualFixtureType: placementState.actualFixtureType,
            fixtureRotation: placementState.rotation,
            previewPosition: placementState.previewPosition,
            isValidPlacement: placementState.isValidPlacement,
            startFixturePlacing,
            handleFixturePlacementMove,
            handleFixturePlacementClick,
            rotateFixturePreview,
            cancelFixturePlacement
        }, children: children }, void 0, false, { fileName: _jsxFileName, lineNumber: 237, columnNumber: 13 }, this));
}
