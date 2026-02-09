import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/FactoryField.tsx";
import { useMemo, useRef, useState } from "react";
import { getBoxBounds } from "../../game/selection.js";
import { clampZoom, clientToGrid, calculateZoomToPoint } from "../../game/viewport.js";
import { FieldGrid } from "./FieldGrid.js";
import { TemplateDepotBusLayer } from "./TemplateDepotBusLayer.js";
import { PathsLayer } from "./PathsLayer.js";
import { FacilitiesLayer } from "./FacilitiesLayer.js";
import { FixturesLayer } from "./FixturesLayer.js";
import { FixturePreview } from "./FixturePreview.js";
import { ItemBubblesLayer } from "./ItemBubblesLayer.js";
import { FieldHud } from "./FieldHud.js";
import { FieldControls } from "./FieldControls.js";
import { PathEditingProvider, usePathEditing } from "../../contexts/pathEditing.js";
import { FixturePlacementProvider, useFixturePlacement } from "../../contexts/fixturePlacement.js";
import { DraggingProvider, useDragging } from "../../contexts/dragging.js";
import { BoxSelectionProvider, useBoxSelection } from "../../contexts/boxSelection.js";
import { EditProvider, useEdit } from "../../contexts/edit.js";
import { CopyPasteProvider } from "../../contexts/copyPaste.js";
import { KeyboardShortcutsProvider } from "../../contexts/keyboardShortcuts.js";
import { ItemSelectorsProvider, useItemSelectors } from "../../contexts/itemSelectors.js";
import { PortsLayer } from "./PortsLayer.js";
import { ItemSelector } from "../inventory/ItemSelector.js";
import { RecipeSelector } from "../inventory/RecipeSelector.js";
import { EditMode } from "../../types/editMode.js";
import { PathTypeID } from "../../types/data.js";
import { TemplateSelectorModal } from "./TemplateSelectorModal.js";
import { OnboardingModal } from "./OnboardingModal.js";
import { EditModeGuidance } from "./EditModeGuidance.js";
import { RegionPlanModal } from "./RegionPlanModal.js";
import { RegionPlanProvider, useRegionPlan } from "../../contexts/regionPlan.js";
import { resolveFieldTemplate } from "../../data/templates.js";
import { loadProject } from "../../utils/projectStorage.js";
const CELL_SIZE = 20;
function FieldCanvas({ svgRef, pan, setPan, zoom, setZoom }) {
    const pathEditing = usePathEditing();
    const fixturePlacement = useFixturePlacement();
    const boxSelection = useBoxSelection();
    const { setRegion, setAssignment } = useRegionPlan();
    const { editMode, selectedIDs, clearSelection, fieldState, isTemplateModalOpen, closeTemplateModal, applyProjectSettings, isOnboardingOpen, startNewProject, projectListing, currentProject, loadProjectByGuid, toggleProjectHidden, importProjectJson, } = useEdit();
    const itemSelectors = useItemSelectors();
    const isPanningRef = useRef(false);
    const lastPointRef = useRef({ x: 0, y: 0 });
    const currentMouseGridPointRef = useRef([0, 0]);
    // Derive single selected ID for HUD display
    const selectedID = selectedIDs.size === 1 ? Array.from(selectedIDs)[0] : null;
    const fieldSize = useMemo(() => ({
        width: fieldState.width * CELL_SIZE,
        height: fieldState.height * CELL_SIZE,
    }), [fieldState]);
    function syncRegionFromTemplate(template) {
        const resolved = resolveFieldTemplate(template);
        setRegion(resolved.region);
    }
    function syncRegionFromProjectGuid(guid) {
        const project = loadProject(guid);
        if (!project) {
            return;
        }
        syncRegionFromTemplate(project.template);
    }
    function getGridPoint(event, snapToGrid = true) {
        if (!svgRef.current) {
            return [0, 0];
        }
        const rect = svgRef.current.getBoundingClientRect();
        return clientToGrid(event.clientX, event.clientY, rect, pan, zoom, CELL_SIZE, snapToGrid);
    }
    function onPointerDown(event) {
        if (event.button !== 1 && event.button !== 2) {
            return;
        }
        isPanningRef.current = true;
        lastPointRef.current = { x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
    }
    function onContextMenu(event) {
        event.preventDefault();
    }
    function onPointerMove(event) {
        if (!isPanningRef.current) {
            return;
        }
        const dx = event.clientX - lastPointRef.current.x;
        const dy = event.clientY - lastPointRef.current.y;
        lastPointRef.current = { x: event.clientX, y: event.clientY };
        setPan({ x: pan.x + dx, y: pan.y + dy });
    }
    function onPointerUp(event) {
        if (!isPanningRef.current) {
            return;
        }
        isPanningRef.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
    }
    function onWheel(event) {
        const scaleFactor = Math.exp(-event.deltaY * 0.001);
        const nextZoom = clampZoom(zoom * scaleFactor);
        if (!svgRef.current) {
            setZoom(nextZoom);
            return;
        }
        const rect = svgRef.current.getBoundingClientRect();
        const cursorX = event.clientX - rect.left;
        const cursorY = event.clientY - rect.top;
        const newPan = calculateZoomToPoint(cursorX, cursorY, pan, zoom, nextZoom);
        setZoom(nextZoom);
        setPan(newPan);
    }
    function onBackgroundDoubleClick(event) {
        if (editMode === EditMode.PATH_EDITING) {
            // Double-click during path editing finishes the path
            const gridPoint = getGridPoint(event);
            pathEditing.handlePathEditDoubleClick(gridPoint);
            return;
        }
        if (editMode !== EditMode.MANIPULATE) {
            // Only allow starting a new path in manipulate mode
            event.stopPropagation();
            return;
        }
        if (!svgRef.current) {
            return;
        }
        const rect = svgRef.current.getBoundingClientRect();
        const cursorX = event.clientX - rect.left;
        const cursorY = event.clientY - rect.top;
        const worldX = (cursorX - pan.x) / zoom;
        const worldY = (cursorY - pan.y) / zoom;
        const gridX = worldX / CELL_SIZE;
        const gridY = worldY / CELL_SIZE;
        const roundedPoint = [Math.round(gridX), Math.round(gridY)];
        // Start a new path with the first point committed
        pathEditing.startPathFromPoint(roundedPoint, PathTypeID.BELT);
        event.stopPropagation();
    }
    function onBackgroundPointerDown(event) {
        if (event.button !== 0) {
            return;
        }
        // If we're editing a path, handle path editing move
        if (editMode === EditMode.PATH_EDITING) {
            return;
        }
        // If we're placing a fixture, don't start box selection
        if (editMode === EditMode.FIXTURE_PLACING) {
            return;
        }
        const gridPoint = getGridPoint(event);
        boxSelection.handleBoxSelectionStart(gridPoint, event);
    }
    function onBackgroundPointerMove(event) {
        const gridPoint = getGridPoint(event);
        currentMouseGridPointRef.current = gridPoint;
        // Handle path editing
        if (editMode === EditMode.PATH_EDITING) {
            pathEditing.handlePathEditMove(gridPoint);
            return;
        }
        // Handle fixture placement
        if (editMode === EditMode.FIXTURE_PLACING) {
            fixturePlacement.handleFixturePlacementMove(gridPoint);
            return;
        }
        // Handle box selection
        boxSelection.handleBoxSelectionMove(gridPoint);
    }
    function onBackgroundPointerUp(event) {
        // Handle path editing
        if (editMode === EditMode.PATH_EDITING) {
            // Single-click during path editing commits the point
            const gridPoint = getGridPoint(event);
            pathEditing.handlePathEditClick(gridPoint);
            return;
        }
        // Handle fixture placement
        if (editMode === EditMode.FIXTURE_PLACING) {
            const gridPoint = getGridPoint(event);
            fixturePlacement.handleFixturePlacementClick(gridPoint);
            return;
        }
        if (event.button === 0 && editMode === EditMode.MANIPULATE) {
            console.log('Clearing selection from background click');
            clearSelection();
        }
        // Handle box selection
        boxSelection.handleBoxSelectionEnd(event);
    }
    return (_jsxDEV(KeyboardShortcutsProvider, { currentMouseGridPointRef: currentMouseGridPointRef, children: _jsxDEV("div", { className: "factory-field", children: [!isOnboardingOpen ? _jsxDEV(FieldControls, {}, void 0, false, { fileName: _jsxFileName, lineNumber: 254, columnNumber: 37 }, this) : null, _jsxDEV(EditModeGuidance, {}, void 0, false, { fileName: _jsxFileName, lineNumber: 255, columnNumber: 17 }, this), _jsxDEV("svg", { ref: svgRef, width: "100%", height: "100%", onPointerDown: onPointerDown, onPointerMove: onPointerMove, onPointerUp: onPointerUp, onPointerLeave: onPointerUp, onWheel: onWheel, onContextMenu: onContextMenu, className: isPanningRef.current ? "panning" : "idle", children: _jsxDEV("g", { transform: `translate(${pan.x} ${pan.y}) scale(${zoom})`, children: [_jsxDEV(FieldGrid, { fieldState: fieldState, cellSize: CELL_SIZE, onBackgroundDoubleClick: onBackgroundDoubleClick, onBackgroundPointerDown: onBackgroundPointerDown, onBackgroundPointerMove: onBackgroundPointerMove, onBackgroundPointerUp: onBackgroundPointerUp }, void 0, false, { fileName: _jsxFileName, lineNumber: 270, columnNumber: 25 }, this), _jsxDEV(TemplateDepotBusLayer, { fieldState: fieldState, cellSize: CELL_SIZE }, void 0, false, { fileName: _jsxFileName, lineNumber: 278, columnNumber: 25 }, this), boxSelection.selectionBox && (() => {
                                const bounds = getBoxBounds(boxSelection.selectionBox);
                                return (_jsxDEV("rect", { x: bounds.minX * CELL_SIZE, y: bounds.minY * CELL_SIZE, width: (bounds.maxX - bounds.minX) * CELL_SIZE, height: (bounds.maxY - bounds.minY) * CELL_SIZE, className: "selection-box" }, void 0, false, { fileName: _jsxFileName, lineNumber: 284, columnNumber: 37 }, this));
                            })(), _jsxDEV(FacilitiesLayer, { fieldState: fieldState, cellSize: CELL_SIZE }, void 0, false, { fileName: _jsxFileName, lineNumber: 294, columnNumber: 25 }, this), _jsxDEV(PathsLayer, { fieldState: fieldState, cellSize: CELL_SIZE }, void 0, false, { fileName: _jsxFileName, lineNumber: 298, columnNumber: 25 }, this), _jsxDEV(FixturesLayer, { fieldState: fieldState, cellSize: CELL_SIZE }, void 0, false, { fileName: _jsxFileName, lineNumber: 302, columnNumber: 25 }, this), _jsxDEV(PortsLayer, { fieldState: fieldState, cellSize: CELL_SIZE }, void 0, false, { fileName: _jsxFileName, lineNumber: 306, columnNumber: 25 }, this), _jsxDEV(ItemBubblesLayer, { fieldState: fieldState, cellSize: CELL_SIZE }, void 0, false, { fileName: _jsxFileName, lineNumber: 310, columnNumber: 25 }, this), editMode === EditMode.FIXTURE_PLACING &&
                                fixturePlacement.previewPosition &&
                                fixturePlacement.actualFixtureType && (_jsxDEV(FixturePreview, { fixtureType: fixturePlacement.actualFixtureType, position: fixturePlacement.previewPosition, rotation: fixturePlacement.fixtureRotation, cellSize: CELL_SIZE, isValid: fixturePlacement.isValidPlacement }, void 0, false, { fileName: _jsxFileName, lineNumber: 318, columnNumber: 65 }, this)), _jsxDEV("rect", { x: 0, y: 0, width: fieldSize.width, height: fieldSize.height, className: "field-boundary" }, void 0, false, { fileName: _jsxFileName, lineNumber: 328, columnNumber: 25 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 269, columnNumber: 21 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 257, columnNumber: 17 }, this), !isOnboardingOpen && _jsxDEV(FieldHud, { fieldState: fieldState, selectedID: selectedID, selectedIDs: selectedIDs }, void 0, false, { fileName: _jsxFileName, lineNumber: 338, columnNumber: 38 }, this), itemSelectors.portItemSelectorOpen && itemSelectors.portSelection && (_jsxDEV(ItemSelector, { currentItemID: itemSelectors.portSelection.currentItemID || null, onSelectItem: itemSelectors.handlePortItemSelect, itemFilter: itemSelectors.filterPortItems }, void 0, false, { fileName: _jsxFileName, lineNumber: 339, columnNumber: 88 }, this)), itemSelectors.controlPortItemSelectorOpen && itemSelectors.controlPortSelection && (_jsxDEV(ItemSelector, { currentItemID: itemSelectors.controlPortSelection.currentItemID || null, onSelectItem: itemSelectors.handleControlPortItemSelect, itemFilter: itemSelectors.filterControlPortItems }, void 0, false, { fileName: _jsxFileName, lineNumber: 346, columnNumber: 102 }, this)), itemSelectors.facilityItemSelectorOpen && (_jsxDEV(ItemSelector, { currentItemID: null, onSelectItem: (itemID) => itemSelectors.handleFacilityItemSelect(itemID, svgRef, pan, zoom, CELL_SIZE), itemFilter: itemSelectors.filterFacilityItems, groupBy: itemSelectors.groupFacilityItems, allowClear: false }, void 0, false, { fileName: _jsxFileName, lineNumber: 353, columnNumber: 61 }, this)), itemSelectors.recipeSelectorOpen && itemSelectors.facilityRecipeSelection && (_jsxDEV(RecipeSelector, { currentRecipeID: itemSelectors.facilityRecipeSelection.currentRecipeID, currentJumpStart: itemSelectors.facilityRecipeSelection.currentJumpStart, onSelectRecipe: itemSelectors.handleRecipeSelect, recipeFilter: itemSelectors.filterRecipesForFacility }, void 0, false, { fileName: _jsxFileName, lineNumber: 362, columnNumber: 96 }, this)), _jsxDEV(TemplateSelectorModal, { isOpen: isTemplateModalOpen && !isOnboardingOpen, currentTemplate: fieldState.template, onClose: closeTemplateModal, onApply: applyProjectSettings, projectName: currentProject?.name ?? "" }, void 0, false, { fileName: _jsxFileName, lineNumber: 370, columnNumber: 17 }, this), _jsxDEV(OnboardingModal, { isOpen: isOnboardingOpen, currentTemplate: fieldState.template, onCreateNew: (template, projectName) => {
                        syncRegionFromTemplate(template);
                        startNewProject(template, projectName);
                    }, onCreateAndAssign: (fieldId, template, projectName) => {
                        syncRegionFromTemplate(template);
                        const meta = startNewProject(template, projectName);
                        setAssignment(fieldId, meta.guid);
                    }, projects: projectListing, onLoadProject: (guid) => {
                        syncRegionFromProjectGuid(guid);
                        loadProjectByGuid(guid);
                    }, onToggleProjectHidden: toggleProjectHidden, onImportProjectJson: importProjectJson }, void 0, false, { fileName: _jsxFileName, lineNumber: 377, columnNumber: 17 }, this), _jsxDEV(RegionPlanModal, {}, void 0, false, { fileName: _jsxFileName, lineNumber: 397, columnNumber: 17 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 253, columnNumber: 13 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 249, columnNumber: 13 }, this));
}
function FieldViewport() {
    const [pan, setPan] = useState({ x: 80, y: 80 });
    const [zoom, setZoom] = useState(1);
    const svgRef = useRef(null);
    return (_jsxDEV(CopyPasteProvider, { children: _jsxDEV(ItemSelectorsProvider, { children: _jsxDEV(DraggingProvider, { svgRef: svgRef, pan: pan, zoom: zoom, cellSize: CELL_SIZE, children: _jsxDEV(FieldCanvas, { svgRef: svgRef, pan: pan, setPan: setPan, zoom: zoom, setZoom: setZoom }, void 0, false, { fileName: _jsxFileName, lineNumber: 417, columnNumber: 21 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 411, columnNumber: 17 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 410, columnNumber: 13 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 408, columnNumber: 13 }, this));
}
export function FactoryField() {
    return (_jsxDEV(EditProvider, { children: _jsxDEV(RegionPlanProvider, { children: _jsxDEV(BoxSelectionProvider, { children: _jsxDEV(PathEditingProvider, { children: _jsxDEV(FixturePlacementProvider, { children: _jsxDEV(FieldViewport, {}, void 0, false, { fileName: _jsxFileName, lineNumber: 437, columnNumber: 29 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 436, columnNumber: 25 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 435, columnNumber: 21 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 434, columnNumber: 17 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 433, columnNumber: 13 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 431, columnNumber: 13 }, this));
}
