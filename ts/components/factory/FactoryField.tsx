import { useMemo, useRef, useState } from "react"
import type { PointerEvent, WheelEvent } from "react"
import { getBoxBounds } from "../../game/selection.ts"
import { clampZoom, clientToGrid, calculateZoomToPoint } from "../../game/viewport.ts"
import { FieldGrid } from "./FieldGrid.tsx"
import { TemplateDepotBusLayer } from "./TemplateDepotBusLayer.tsx"
import { PathsLayer } from "./PathsLayer.tsx"
import { FacilitiesLayer } from "./FacilitiesLayer.tsx"
import { FixturesLayer } from "./FixturesLayer.tsx"
import { FixturePreview } from "./FixturePreview.tsx"
import { ItemBubblesLayer } from "./ItemBubblesLayer.tsx"
import { FieldHud } from "./FieldHud.tsx"
import { FieldControls } from "./FieldControls.tsx"
import { PathEditingProvider, usePathEditing } from "../../contexts/pathEditing.tsx"
import { FixturePlacementProvider, useFixturePlacement } from "../../contexts/fixturePlacement.tsx"
import { DraggingProvider, useDragging } from "../../contexts/dragging.tsx"
import { BoxSelectionProvider, useBoxSelection } from "../../contexts/boxSelection.tsx"
import { EditProvider, useEdit } from "../../contexts/edit.tsx"
import { CopyPasteProvider } from "../../contexts/copyPaste.tsx"
import { KeyboardShortcutsProvider } from "../../contexts/keyboardShortcuts.tsx"
import { ItemSelectorsProvider, useItemSelectors } from "../../contexts/itemSelectors.tsx"
import { PortsLayer } from "./PortsLayer.tsx"
import { ItemSelector } from "../inventory/ItemSelector.tsx"
import { RecipeSelector } from "../inventory/RecipeSelector.tsx"
import { EditMode } from "../../types/editMode.ts"
import { PathTypeID } from "../../types/data.ts"
import { TemplateSelectorModal } from "./TemplateSelectorModal.tsx"
import { OnboardingModal } from "./OnboardingModal.tsx"
import { EditModeGuidance } from "./EditModeGuidance.tsx"
import { RegionPlanModal } from "./RegionPlanModal.tsx"
import { RegionPlanProvider, useRegionPlan } from "../../contexts/regionPlan.tsx"
import { resolveFieldTemplate } from "../../data/templates.ts"
import { loadProject } from "../../utils/projectStorage.ts"

const CELL_SIZE = 20

function FieldCanvas({ 
    svgRef,
    pan,
    setPan,
    zoom,
    setZoom
}: {
    svgRef: React.RefObject<SVGSVGElement>
    pan: { x: number, y: number }
    setPan: (pan: { x: number, y: number }) => void
    zoom: number
    setZoom: (zoom: number) => void
}) {
    const pathEditing = usePathEditing()
    const fixturePlacement = useFixturePlacement()
    const boxSelection = useBoxSelection()
    const { setRegion, setAssignment } = useRegionPlan()
    const { 
        editMode, 
        selectedIDs, 
        clearSelection,
        fieldState,
        isTemplateModalOpen,
        closeTemplateModal,
        applyProjectSettings,
        isOnboardingOpen,
        startNewProject,
        projectListing,
        currentProject,
        loadProjectByGuid,
        toggleProjectHidden,
        importProjectJson,
    } = useEdit()
    const itemSelectors = useItemSelectors()
    const isPanningRef = useRef(false)
    const lastPointRef = useRef({ x: 0, y: 0 })
    const currentMouseGridPointRef = useRef<[number, number]>([0, 0])

    // Derive single selected ID for HUD display
    const selectedID = selectedIDs.size === 1 ? Array.from(selectedIDs)[0] : null

    const fieldSize = useMemo(() => ({
        width: fieldState.width * CELL_SIZE,
        height: fieldState.height * CELL_SIZE,
    }), [fieldState])

    function syncRegionFromTemplate(template: typeof fieldState.template) {
        const resolved = resolveFieldTemplate(template)
        setRegion(resolved.region)
    }

    function syncRegionFromProjectGuid(guid: string) {
        const project = loadProject(guid)
        if (!project) {
            return
        }
        syncRegionFromTemplate(project.template)
    }

    function getGridPoint(event: { clientX: number, clientY: number }, snapToGrid: boolean = true): [number, number] {
        if (!svgRef.current) {
            return [0, 0]
        }
        const rect = svgRef.current.getBoundingClientRect()
        return clientToGrid(event.clientX, event.clientY, rect, pan, zoom, CELL_SIZE, snapToGrid)
    }

    function onPointerDown(event: PointerEvent<SVGSVGElement>) {
        if (event.button !== 1 && event.button !== 2) {
            return
        }
        isPanningRef.current = true
        lastPointRef.current = { x: event.clientX, y: event.clientY }
        event.currentTarget.setPointerCapture(event.pointerId)
    }

    function onContextMenu(event: React.MouseEvent<SVGSVGElement>) {
        event.preventDefault()
    }

    function onPointerMove(event: PointerEvent<SVGSVGElement>) {
        if (!isPanningRef.current) {
            return
        }
        const dx = event.clientX - lastPointRef.current.x
        const dy = event.clientY - lastPointRef.current.y
        lastPointRef.current = { x: event.clientX, y: event.clientY }
        setPan({ x: pan.x + dx, y: pan.y + dy })
    }

    function onPointerUp(event: PointerEvent<SVGSVGElement>) {
        if (!isPanningRef.current) {
            return
        }
        isPanningRef.current = false
        event.currentTarget.releasePointerCapture(event.pointerId)
    }

    function onWheel(event: WheelEvent<SVGSVGElement>) {
        const scaleFactor = Math.exp(-event.deltaY * 0.001)
        const nextZoom = clampZoom(zoom * scaleFactor)

        if (!svgRef.current) {
            setZoom(nextZoom)
            return
        }

        const rect = svgRef.current.getBoundingClientRect()
        const cursorX = event.clientX - rect.left
        const cursorY = event.clientY - rect.top
        
        const newPan = calculateZoomToPoint(cursorX, cursorY, pan, zoom, nextZoom)
        setZoom(nextZoom)
        setPan(newPan)
    }

    function onBackgroundDoubleClick(event: React.MouseEvent<SVGRectElement>) {
        if (editMode === EditMode.PATH_EDITING) {
            // Double-click during path editing finishes the path
            const gridPoint = getGridPoint(event)
            pathEditing.handlePathEditDoubleClick(gridPoint)
            return
        }
        
        if (editMode !== EditMode.MANIPULATE) {
            // Only allow starting a new path in manipulate mode
            event.stopPropagation()
            return
        }
        
        if (!svgRef.current) {
            return
        }
        const rect = svgRef.current.getBoundingClientRect()
        const cursorX = event.clientX - rect.left
        const cursorY = event.clientY - rect.top
        const worldX = (cursorX - pan.x) / zoom
        const worldY = (cursorY - pan.y) / zoom
        const gridX = worldX / CELL_SIZE
        const gridY = worldY / CELL_SIZE
        const roundedPoint: [number, number] = [Math.round(gridX), Math.round(gridY)]
        
        // Start a new path with the first point committed
        pathEditing.startPathFromPoint(roundedPoint, PathTypeID.BELT)
        
        event.stopPropagation()
    }

    function onBackgroundPointerDown(event: React.PointerEvent<SVGRectElement>) {
        if (event.button !== 0) {
            return
        }
        
        // If we're editing a path, handle path editing move
        if (editMode === EditMode.PATH_EDITING) {
            return
        }
        
        // If we're placing a fixture, don't start box selection
        if (editMode === EditMode.FIXTURE_PLACING) {
            return
        }
        
        const gridPoint = getGridPoint(event)
        boxSelection.handleBoxSelectionStart(gridPoint, event)
    }

    function onBackgroundPointerMove(event: React.PointerEvent<SVGRectElement>) {
        const gridPoint = getGridPoint(event)
        currentMouseGridPointRef.current = gridPoint
        
        // Handle path editing
        if (editMode === EditMode.PATH_EDITING) {
            pathEditing.handlePathEditMove(gridPoint)
            return
        }
        
        // Handle fixture placement
        if (editMode === EditMode.FIXTURE_PLACING) {
            fixturePlacement.handleFixturePlacementMove(gridPoint)
            return
        }
        
        // Handle box selection
        boxSelection.handleBoxSelectionMove(gridPoint)
    }

    function onBackgroundPointerUp(event: React.PointerEvent<SVGRectElement>) {
        // Handle path editing
        if (editMode === EditMode.PATH_EDITING) {
            // Single-click during path editing commits the point
            const gridPoint = getGridPoint(event)
            pathEditing.handlePathEditClick(gridPoint)
            return
        }
        
        // Handle fixture placement
        if (editMode === EditMode.FIXTURE_PLACING) {
            const gridPoint = getGridPoint(event)
            fixturePlacement.handleFixturePlacementClick(gridPoint)
            return
        }
        
        if (event.button === 0 && editMode === EditMode.MANIPULATE) {
            console.log('Clearing selection from background click')
            clearSelection()
        }        

        // Handle box selection
        boxSelection.handleBoxSelectionEnd(event)
    }

    return (
        <KeyboardShortcutsProvider
            currentMouseGridPointRef={currentMouseGridPointRef}
        >
            <div className="factory-field">
                {!isOnboardingOpen ? <FieldControls /> : null}
                <EditModeGuidance />

                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                    onWheel={onWheel}
                    onContextMenu={onContextMenu}
                    className={isPanningRef.current ? "panning" : "idle"}
                >
                    <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
                        <FieldGrid
                            fieldState={fieldState}
                            cellSize={CELL_SIZE}
                            onBackgroundDoubleClick={onBackgroundDoubleClick}
                            onBackgroundPointerDown={onBackgroundPointerDown}
                            onBackgroundPointerMove={onBackgroundPointerMove}
                            onBackgroundPointerUp={onBackgroundPointerUp}
                        />
                        <TemplateDepotBusLayer
                            fieldState={fieldState}
                            cellSize={CELL_SIZE}
                        />
                        {boxSelection.selectionBox && (() => {
                            const bounds = getBoxBounds(boxSelection.selectionBox)
                            return (
                                <rect
                                    x={bounds.minX * CELL_SIZE}
                                    y={bounds.minY * CELL_SIZE}
                                    width={(bounds.maxX - bounds.minX) * CELL_SIZE}
                                    height={(bounds.maxY - bounds.minY) * CELL_SIZE}
                                    className="selection-box"
                                />
                            )
                        })()}
                        <FacilitiesLayer 
                            fieldState={fieldState} 
                            cellSize={CELL_SIZE} 
                        />
                        <PathsLayer 
                            fieldState={fieldState} 
                            cellSize={CELL_SIZE} 
                        />
                        <FixturesLayer 
                            fieldState={fieldState} 
                            cellSize={CELL_SIZE} 
                        />
                        <PortsLayer
                            fieldState={fieldState}
                            cellSize={CELL_SIZE}
                        />
                        <ItemBubblesLayer 
                            fieldState={fieldState} 
                            cellSize={CELL_SIZE}
                        />
                        
                        {/* Fixture placement preview */}
                        {editMode === EditMode.FIXTURE_PLACING && 
                         fixturePlacement.previewPosition && 
                         fixturePlacement.actualFixtureType && (
                            <FixturePreview
                                fixtureType={fixturePlacement.actualFixtureType}
                                position={fixturePlacement.previewPosition}
                                rotation={fixturePlacement.fixtureRotation}
                                cellSize={CELL_SIZE}
                                isValid={fixturePlacement.isValidPlacement}
                            />
                        )}

                        <rect
                            x={0}
                            y={0}
                            width={fieldSize.width}
                            height={fieldSize.height}
                            className="field-boundary"
                        />
                    </g>
                </svg>

                {!isOnboardingOpen && <FieldHud fieldState={fieldState} selectedID={selectedID} selectedIDs={selectedIDs} />}
                {itemSelectors.portItemSelectorOpen && itemSelectors.portSelection && (
                    <ItemSelector 
                        currentItemID={itemSelectors.portSelection.currentItemID || null} 
                        onSelectItem={itemSelectors.handlePortItemSelect} 
                        itemFilter={itemSelectors.filterPortItems} 
                    />
                )}
                {itemSelectors.controlPortItemSelectorOpen && itemSelectors.controlPortSelection && (
                    <ItemSelector 
                        currentItemID={itemSelectors.controlPortSelection.currentItemID || null} 
                        onSelectItem={itemSelectors.handleControlPortItemSelect} 
                        itemFilter={itemSelectors.filterControlPortItems} 
                    />
                )}
                {itemSelectors.facilityItemSelectorOpen && (
                    <ItemSelector 
                        currentItemID={null} 
                        onSelectItem={(itemID) => itemSelectors.handleFacilityItemSelect(itemID, svgRef, pan, zoom, CELL_SIZE)} 
                        itemFilter={itemSelectors.filterFacilityItems} 
                        groupBy={itemSelectors.groupFacilityItems} 
                        allowClear={false}
                    />
                )}
                {itemSelectors.recipeSelectorOpen && itemSelectors.facilityRecipeSelection && (
                    <RecipeSelector
                        currentRecipeID={itemSelectors.facilityRecipeSelection.currentRecipeID}
                        currentJumpStart={itemSelectors.facilityRecipeSelection.currentJumpStart}
                        onSelectRecipe={itemSelectors.handleRecipeSelect}
                        recipeFilter={itemSelectors.filterRecipesForFacility}
                    />
                )}
                <TemplateSelectorModal
                    isOpen={isTemplateModalOpen && !isOnboardingOpen}
                    currentTemplate={fieldState.template}
                    onClose={closeTemplateModal}
                    onApply={applyProjectSettings}
                    projectName={currentProject?.name ?? ""}
                />
                <OnboardingModal
                    isOpen={isOnboardingOpen}
                    currentTemplate={fieldState.template}
                    onCreateNew={(template, projectName) => {
                        syncRegionFromTemplate(template)
                        startNewProject(template, projectName)
                    }}
                    onCreateAndAssign={(fieldId, template, projectName) => {
                        syncRegionFromTemplate(template)
                        const meta = startNewProject(template, projectName)
                        setAssignment(fieldId, meta.guid)
                    }}
                    projects={projectListing}
                    onLoadProject={(guid) => {
                        syncRegionFromProjectGuid(guid)
                        loadProjectByGuid(guid)
                    }}
                    onToggleProjectHidden={toggleProjectHidden}
                    onImportProjectJson={importProjectJson}
                />
                <RegionPlanModal />
            </div>
        </KeyboardShortcutsProvider>
    )
}

function FieldViewport() {
    const [pan, setPan] = useState({ x: 80, y: 80 })
    const [zoom, setZoom] = useState(1)
    const svgRef = useRef<SVGSVGElement | null>(null)

    return (
        <CopyPasteProvider>
            <ItemSelectorsProvider>
                <DraggingProvider
                    svgRef={svgRef as React.RefObject<SVGSVGElement>}
                    pan={pan}
                    zoom={zoom}
                    cellSize={CELL_SIZE}
                >
                    <FieldCanvas 
                        svgRef={svgRef as React.RefObject<SVGSVGElement>}
                        pan={pan}
                        setPan={setPan}
                        zoom={zoom}
                        setZoom={setZoom}
                    />
                </DraggingProvider>
            </ItemSelectorsProvider>
        </CopyPasteProvider>
    )
}

export function FactoryField() {
    return (
        <EditProvider>
            <RegionPlanProvider>
                <BoxSelectionProvider>
                    <PathEditingProvider>
                        <FixturePlacementProvider>
                            <FieldViewport />
                        </FixturePlacementProvider>
                    </PathEditingProvider>
                </BoxSelectionProvider>
            </RegionPlanProvider>
        </EditProvider>
    )
}
