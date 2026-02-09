import { useEdit } from "../../contexts/edit.tsx"
import { useLocalization } from "../../contexts/localization.tsx"
import { EditMode } from "../../types/editMode.ts"

export function EditModeGuidance() {
    const { editMode } = useEdit()
    const { ui } = useLocalization()

    if (editMode === EditMode.MANIPULATE) {
        return null
    }

    return (
        <div className="edit-mode-guidance">
            {editMode === EditMode.PATH_EDITING && (
                <div className="guidance-panel path-editing">
                    <div className="guidance-title">{ui.pathEditingInstructions}</div>
                    <ul className="guidance-list">
                        <li>{ui.pathEditingDoubleClickToFinish}</li>
                        <li>{ui.pathEditingDoubleClickPortToConnect}</li>
                        <li>{ui.pathEditingBackspaceToUndo}</li>
                        <li>{ui.pathEditingEscapeToCancel}</li>
                        <li className="guidance-hint">{ui.pathEditingResumeFromEnd}</li>
                    </ul>
                </div>
            )}
            {editMode === EditMode.FIXTURE_PLACING && (
                <div className="guidance-panel fixture-placing">
                    <div className="guidance-title">{ui.fixtureEditingInstructions}</div>
                    <ul className="guidance-list">
                        <li>{ui.fixtureEditingClickToPlace}</li>
                        <li>{ui.fixtureEditingEscapeToCancel}</li>
                    </ul>
                </div>
            )}
        </div>
    )
}
