import { createContext, useContext, useRef, useState, type ReactNode, type PointerEvent } from "react"
import { tuple, type Immutable } from "../utils/types.ts"
import type { FieldState } from "../types/field.ts"
import { EditMode } from "../types/editMode.ts"
import { useEdit } from "./edit.tsx"
import { getSelectionFromBox } from "../game/selection.ts"

interface BoxSelectionContextValue {
    // Current selection box (for rendering)
    selectionBox: { start: [number, number], end: [number, number] } | null
    
    // Handlers to be used by the field background
    handleBoxSelectionStart: (gridPoint: [number, number], event: PointerEvent<SVGElement>) => void
    handleBoxSelectionMove: (gridPoint: [number, number]) => void
    handleBoxSelectionEnd: (event: PointerEvent<SVGElement>) => void
    
    // Check if currently box selecting
    isBoxSelecting: () => boolean
}

const BoxSelectionContext = createContext<BoxSelectionContextValue | null>(null)

export function useBoxSelection() {
    const context = useContext(BoxSelectionContext)
    if (!context) {
        throw new Error("useBoxSelection must be used within BoxSelectionProvider")
    }
    return context
}

interface BoxSelectionProviderProps {
    children: ReactNode
}

export function BoxSelectionProvider({ 
    children
}: BoxSelectionProviderProps) {
    const { editMode, setEditMode, selectedIDs, setSelectedIDs, fieldState } = useEdit()
    
    const [selectionBox, setSelectionBox] = useState<{ start: [number, number]; end: [number, number] } | null>(null)
    
    function isBoxSelecting(): boolean {
        return editMode === EditMode.BOX_SELECTING
    }
    
    function handleBoxSelectionStart(gridPoint: [number, number], event: PointerEvent<SVGElement>) {
        // Only start from manipulate mode
        if (editMode !== EditMode.MANIPULATE) {
            return
        }
        
        // Switch to box selecting mode
        setEditMode(EditMode.BOX_SELECTING)
        const nextBox = { start: gridPoint, end: gridPoint }
        setSelectionBox(nextBox)
        event.currentTarget.setPointerCapture(event.pointerId)
    }
    
    function handleBoxSelectionMove(gridPoint: [number, number]) {
        if (editMode !== EditMode.BOX_SELECTING) {
            return
        }

        const start = selectionBox ? selectionBox.start : gridPoint
        let end = tuple(gridPoint[0], gridPoint[1])

        // Box selection should include the cell under the pointer
        if (end[0] >= start[0]) {
            end = tuple(end[0] + 1, end[1])
        }
        if (end[1] >= start[1]) {
            end = tuple(end[0], end[1] + 1)
        }
        
        const nextBox = selectionBox
            ? { ...selectionBox, end }
            : { start: gridPoint, end }
        setSelectionBox(nextBox)
    }
    
    function handleBoxSelectionEnd(event: PointerEvent<SVGElement>) {
        if (editMode !== EditMode.BOX_SELECTING) {
            return
        }
        
        event.currentTarget.releasePointerCapture(event.pointerId)
        
        if (!selectionBox) {
            // No box, just switch back to manipulate
            setEditMode(EditMode.MANIPULATE)
            return
        }
        
        const boxSelection = getSelectionFromBox(selectionBox, fieldState)
        const isAdd = event.shiftKey
        const isSubtract = event.ctrlKey || event.metaKey
        
        if (isSubtract) {
            const nextSelection = new Set(selectedIDs)
            for (const id of boxSelection) {
                nextSelection.delete(id)
            }
            setSelectedIDs(nextSelection)
        } else if (isAdd) {
            const nextSelection = new Set(selectedIDs)
            for (const id of boxSelection) {
                nextSelection.add(id)
            }
            setSelectedIDs(nextSelection)
        } else {
            setSelectedIDs(boxSelection)
        }
        
        // Clear box and switch back to manipulate mode
        setSelectionBox(null)
        setEditMode(EditMode.MANIPULATE)
    }
    
    const value: BoxSelectionContextValue = {
        selectionBox,
        handleBoxSelectionStart,
        handleBoxSelectionMove,
        handleBoxSelectionEnd,
        isBoxSelecting,
    }
    
    return (
        <BoxSelectionContext.Provider value={value}>
            {children}
        </BoxSelectionContext.Provider>
    )
}
