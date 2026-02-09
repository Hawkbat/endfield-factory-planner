import { ActionButton } from "../common/ActionButton.tsx"
import { useLocalization } from "../../contexts/localization.tsx"
import { useEdit } from "../../contexts/edit.tsx"
import { EndfieldLogo } from "./EndfieldLogo.tsx"
import { useCopyPaste } from "../../contexts/copyPaste.tsx"
import { useItemSelectors } from "../../contexts/itemSelectors.tsx"
import { useFixturePlacement } from "../../contexts/fixturePlacement.tsx"
import { usePathEditing } from "../../contexts/pathEditing.tsx"
import { useRegionPlan } from "../../contexts/regionPlan.tsx"
import { EditMode } from "../../types/editMode.ts"
import { FixtureBehaviorType } from "../../data/pathFixtures.ts"
import { Undo2, Redo2, Copy, Clipboard, CopyPlus, Trash2, RotateCw, RotateCcw, Plus, Shuffle, Wrench, X, Split, Merge, Droplets, BriefcaseConveyorBelt, Map, Download, Globe } from "lucide-react"
import { PathTypeID } from "../../types/data.ts"

export function FieldControls() {
    const { ui } = useLocalization()
    const { 
        editMode, 
        selectedIDs, 
        canUndo, 
        canRedo, 
        handleUndo, 
        handleRedo, 
        handleDelete, 
        handleRotate,
        openTemplateModal,
        openOnboarding,
        exportCurrentProject,
        canExportProject
    } = useEdit()
    const { handleCopy, handlePaste, handleDuplicate } = useCopyPaste()
    const { handlePlace } = useItemSelectors()
    const { startFixturePlacing, placingBehaviorType, cancelFixturePlacement } = useFixturePlacement()
    const pathEditing = usePathEditing()
    const { openRegionPlan } = useRegionPlan()
    
    const canDelete = editMode === EditMode.MANIPULATE && selectedIDs.size > 0
    const canPlace = editMode === EditMode.MANIPULATE
    const canPlaceFixture = editMode === EditMode.MANIPULATE || editMode === EditMode.FIXTURE_PLACING
    const canRotate = editMode === EditMode.MANIPULATE && selectedIDs.size > 0
    const canCopy = editMode === EditMode.MANIPULATE && selectedIDs.size > 0
    const canPaste = editMode === EditMode.MANIPULATE
    const canDuplicate = editMode === EditMode.MANIPULATE && selectedIDs.size > 0
    
    const isPlacingBridge = placingBehaviorType === FixtureBehaviorType.BRIDGE
    const isPlacingSplitter = placingBehaviorType === FixtureBehaviorType.SPLITTER
    const isPlacingConverger = placingBehaviorType === FixtureBehaviorType.CONVERGER
    const isPlacingControlPort = placingBehaviorType === FixtureBehaviorType.CONTROL_PORT

    const iconSize = 14
    
    return (
        <div className="factory-controls">
            <EndfieldLogo onClick={openOnboarding} title={ui.returnToOnboardingTooltip} fit='width' />
            <div className="field-controls-group">
                <div className="field-controls-label">{ui.fieldControlsGroupProject}</div>
                <ActionButton onClick={openTemplateModal} title={ui.projectSettings}>
                    <Map size={iconSize} /> {ui.projectSettings}
                </ActionButton>
                <ActionButton onClick={openRegionPlan} title={ui.regionPlanTitle}>
                    <Globe size={iconSize} /> {ui.regionPlanOpen}
                </ActionButton>
                <ActionButton onClick={exportCurrentProject} disabled={!canExportProject} title={ui.projectExportTooltip}>
                    <Download size={iconSize} /> {ui.projectExport}
                </ActionButton>
            </div>
            <div className="field-controls-group">
                <div className="field-controls-label">{ui.fieldControlsGroupEdit}</div>
                <ActionButton onClick={handleUndo} disabled={!canUndo} title={ui.undoTooltip}>
                    <Undo2 size={iconSize} /> {ui.undo}
                </ActionButton>
                <ActionButton onClick={handleRedo} disabled={!canRedo} title={ui.redoTooltip}>
                    <Redo2 size={iconSize} /> {ui.redo}
                </ActionButton>
                <ActionButton onClick={handleCopy} disabled={!canCopy} title={ui.copyTooltip}>
                    <Copy size={iconSize} /> {ui.copy}
                </ActionButton>
                <ActionButton onClick={handlePaste} disabled={!canPaste} title={ui.pasteTooltip}>
                    <Clipboard size={iconSize} /> {ui.paste}
                </ActionButton>
                <ActionButton onClick={handleDuplicate} disabled={!canDuplicate} title={ui.duplicateTooltip}>
                    <CopyPlus size={iconSize} /> {ui.duplicate}
                </ActionButton>
                <ActionButton onClick={handleDelete} disabled={!canDelete} title={ui.deleteTooltip}>
                    <Trash2 size={iconSize} /> {ui.delete}
                </ActionButton>
            </div>
            <div className="field-controls-group">
                <div className="field-controls-label">{ui.fieldControlsGroupTransform}</div>
                <ActionButton onClick={() => handleRotate(true)} disabled={!canRotate} title={ui.rotateClockwiseTooltip}>
                    <RotateCw size={iconSize} /> {ui.rotateClockwise}
                </ActionButton>
                <ActionButton onClick={() => handleRotate(false)} disabled={!canRotate} title={ui.rotateCounterClockwiseTooltip}>
                    <RotateCcw size={iconSize} /> {ui.rotateCounterClockwise}
                </ActionButton>
            </div>
            <div className="field-controls-group">
                <div className="field-controls-label">{ui.fieldControlsGroupBuild}</div>
                <ActionButton onClick={handlePlace} disabled={!canPlace} title={ui.placeFacilityTooltip}>
                    <Plus size={iconSize} /> {ui.placeFacility}
                </ActionButton>
                <ActionButton
                    onClick={() => pathEditing.startPathPlacement(PathTypeID.BELT)}
                    disabled={editMode !== EditMode.MANIPULATE}
                    title={ui.placeBeltPathTooltip}
                >
                    <BriefcaseConveyorBelt size={iconSize} /> {ui.placeBeltPath}
                </ActionButton>
                <ActionButton
                    onClick={() => pathEditing.startPathPlacement(PathTypeID.PIPE)}
                    disabled={editMode !== EditMode.MANIPULATE}
                    title={ui.placePipePathTooltip}
                >
                    <Droplets size={iconSize} /> {ui.placePipePath}
                </ActionButton>
            </div>
            <div className="field-controls-group">
                <div className="field-controls-label">{ui.fieldControlsGroupFixtures}</div>
                <ActionButton 
                    onClick={() => isPlacingBridge ? cancelFixturePlacement() : startFixturePlacing(FixtureBehaviorType.BRIDGE)} 
                    disabled={!canPlaceFixture}
                    title={ui.placeBridgeTooltip}
                >
                    {isPlacingBridge ? <X size={iconSize} /> : <Shuffle size={iconSize} />} {ui.placeBridge}
                </ActionButton>
                <ActionButton 
                    onClick={() => isPlacingSplitter ? cancelFixturePlacement() : startFixturePlacing(FixtureBehaviorType.SPLITTER)} 
                    disabled={!canPlaceFixture}
                    title={ui.placeSplitterTooltip}
                >
                    {isPlacingSplitter ? <X size={iconSize} /> : <Split size={iconSize} />} {ui.placeSplitter}
                </ActionButton>
                <ActionButton 
                    onClick={() => isPlacingConverger ? cancelFixturePlacement() : startFixturePlacing(FixtureBehaviorType.CONVERGER)} 
                    disabled={!canPlaceFixture}
                    title={ui.placeConvergerTooltip}
                >
                    {isPlacingConverger ? <X size={iconSize} /> : <Merge size={iconSize} />} {ui.placeConverger}
                </ActionButton>
                <ActionButton 
                    onClick={() => isPlacingControlPort ? cancelFixturePlacement() : startFixturePlacing(FixtureBehaviorType.CONTROL_PORT)} 
                    disabled={!canPlaceFixture}
                    title={ui.placeControlPortTooltip}
                >
                    {isPlacingControlPort ? <X size={iconSize} /> : <Wrench size={iconSize} />} {ui.placeControlPort}
                </ActionButton>
            </div>
        </div>
    )
}
