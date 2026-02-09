import { createContext, useContext, useState, type ReactNode } from "react"
import type { Immutable } from "../utils/types.ts"
import type { FieldState, UserChange } from "../types/field.ts"
import { createCopyChanges, serializeCopyData, deserializeCopyData } from "../game/entityOperations.ts"
import { createStateFromChanges } from "../game/sampleField.ts"
import { useEdit } from "./edit.tsx"
import { EditMode } from "../types/editMode.ts"

interface CopyPasteContextValue {
    handleCopy: () => Promise<void>
    handlePaste: () => Promise<void>
    handleDuplicate: () => void
}

const CopyPasteContext = createContext<CopyPasteContextValue | null>(null)

export function useCopyPaste() {
    const context = useContext(CopyPasteContext)
    if (!context) {
        throw new Error("useCopyPaste must be used within CopyPasteProvider")
    }
    return context
}

interface CopyPasteProviderProps {
    children: ReactNode
}

export function CopyPasteProvider({ children }: CopyPasteProviderProps) {
    const [copiedData, setCopiedData] = useState<UserChange[] | null>(null)
    const { 
        editMode, 
        selectedIDs, 
        setSelectedIDs, 
        fieldState, 
        undoStack, 
        applyChangeOrMulti 
    } = useEdit()
    
    async function handleCopy() {
        // Only allow copy in manipulate mode
        if (editMode !== EditMode.MANIPULATE || selectedIDs.size === 0) {
            return
        }

        const changes = createCopyChanges(selectedIDs, fieldState)
        const jsonData = serializeCopyData(changes)

        // Try to copy to clipboard
        try {
            await navigator.clipboard.writeText(jsonData)
            console.log('Copied to clipboard')
        } catch (err) {
            // Fallback to state/localStorage
            console.log('Clipboard access failed, using fallback')
            setCopiedData(changes)
            try {
                localStorage.setItem('endfield-factory-clipboard', jsonData)
            } catch (e) {
                // localStorage might fail in some environments
                console.error('Failed to store copy data in localStorage', e)
            }
        }
    }

    async function handlePaste() {
        // Only allow paste in manipulate mode
        if (editMode !== EditMode.MANIPULATE) {
            return
        }

        let changes: UserChange[] | null = null

        // Try to read from clipboard first
        try {
            const clipboardText = await navigator.clipboard.readText()
            changes = deserializeCopyData(clipboardText)
        } catch (err) {
            console.log('Clipboard read failed, trying fallback')
        }

        // Fallback to localStorage or state
        if (!changes) {
            try {
                const stored = localStorage.getItem('endfield-factory-clipboard')
                if (stored) {
                    changes = deserializeCopyData(stored)
                }
            } catch (e) {
                // localStorage might fail
                console.error('Failed to read copy data from localStorage', e)
            }
        }

        // Final fallback to state
        if (!changes && copiedData) {
            changes = copiedData
        }

        if (!changes || changes.length === 0) {
            console.log('No valid data to paste')
            return
        }

        // Calculate what the new state will be after applying changes
        const changesToApply: UserChange[] = changes.length === 1 ? changes : [{ type: 'multi' as const, changes }]
        const afterState = createStateFromChanges([...undoStack, ...changesToApply], fieldState.template)
        
        // Identify newly created entity IDs
        const oldFacilityIDs = new Set(fieldState.facilities.map(f => f.id))
        const oldPathIDs = new Set(fieldState.paths.map(p => p.id))
        const oldFixtureIDs = new Set(fieldState.pathFixtures.map(f => f.id))
        
        const newEntityIDs: string[] = [
            ...afterState.facilities.filter(f => !oldFacilityIDs.has(f.id)).map(f => f.id),
            ...afterState.paths.filter(p => !oldPathIDs.has(p.id)).map(p => p.id),
            ...afterState.pathFixtures.filter(f => !oldFixtureIDs.has(f.id)).map(f => f.id)
        ]

        // Apply the changes
        applyChangeOrMulti(changes)
        ,
        handleDuplicate
        // Select the newly created entities
        if (newEntityIDs.length > 0) {
            setSelectedIDs(new Set(newEntityIDs))
        }
    }
    
    function handleDuplicate() {
        // Only allow duplicate in manipulate mode
        if (editMode !== EditMode.MANIPULATE || selectedIDs.size === 0) {
            return
        }

        // Create copies with a reasonable offset (2 cells right and down)
        const changes = createCopyChanges(selectedIDs, fieldState, { dx: 2, dy: 2 })
        
        if (changes.length === 0) {
            return
        }

        // Calculate what the new state will be after applying changes
        const changesToApply: UserChange[] = changes.length === 1 ? changes : [{ type: 'multi' as const, changes }]
        const afterState = createStateFromChanges([...undoStack, ...changesToApply], fieldState.template)
        
        // Identify newly created entity IDs
        const oldFacilityIDs = new Set(fieldState.facilities.map(f => f.id))
        const oldPathIDs = new Set(fieldState.paths.map(p => p.id))
        const oldFixtureIDs = new Set(fieldState.pathFixtures.map(f => f.id))
        
        const newEntityIDs: string[] = [
            ...afterState.facilities.filter(f => !oldFacilityIDs.has(f.id)).map(f => f.id),
            ...afterState.paths.filter(p => !oldPathIDs.has(p.id)).map(p => p.id),
            ...afterState.pathFixtures.filter(f => !oldFixtureIDs.has(f.id)).map(f => f.id)
        ]

        // Apply the changes
        applyChangeOrMulti(changes)
        
        // Select the newly created entities
        if (newEntityIDs.length > 0) {
            setSelectedIDs(new Set(newEntityIDs))
        }
    }
    
    const value: CopyPasteContextValue = {
        handleCopy,
        handlePaste,
        handleDuplicate
    }
    
    return (
        <CopyPasteContext.Provider value={value}>
            {children}
        </CopyPasteContext.Provider>
    )
}
