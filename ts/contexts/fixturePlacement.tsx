import { createContext, useContext, useRef, useState, useEffect, type ReactNode } from "react"
import type { Immutable } from "../utils/types.ts"
import type { FieldState, UserChange, FieldPath } from "../types/field.ts"
import { PathFixtureID } from "../types/data.ts"
import { EditMode } from "../types/editMode.ts"
import { useEdit } from "./edit.tsx"
import {
    validateFixturePlacementOnPath,
    splitPathAtFixture
} from "../game/fixtures.ts"
import { FixtureBehaviorType, getFixtureTypeForPath } from "../data/pathFixtures.ts"
import { createStateFromChanges } from "../game/sampleField.ts"

interface FixturePlacementState {
    behaviorType: FixtureBehaviorType | null
    rotation: number
    previewPosition: [number, number] | null
    targetPath: Immutable<FieldPath> | null
    isValidPlacement: boolean
    actualFixtureType: PathFixtureID | null
}

interface FixturePlacementContextValue {
    // State
    placingBehaviorType: FixtureBehaviorType | null
    actualFixtureType: PathFixtureID | null
    fixtureRotation: number
    previewPosition: [number, number] | null
    isValidPlacement: boolean
    
    // Actions
    startFixturePlacing: (behaviorType: FixtureBehaviorType) => void
    handleFixturePlacementMove: (gridPoint: [number, number]) => void
    handleFixturePlacementClick: (gridPoint: [number, number]) => void
    rotateFixturePreview: (clockwise: boolean) => void
    cancelFixturePlacement: () => void
}

const FixturePlacementContext = createContext<FixturePlacementContextValue | null>(null)

export function useFixturePlacement() {
    const context = useContext(FixturePlacementContext)
    if (!context) {
        throw new Error("useFixturePlacement must be used within FixturePlacementProvider")
    }
    return context
}

interface FixturePlacementProviderProps {
    children: ReactNode
}

export function FixturePlacementProvider({ children }: FixturePlacementProviderProps) {
    const { editMode, setEditMode, fieldState, setFieldState, handleChange } = useEdit()
    
    const [placementState, setPlacementState] = useState<FixturePlacementState>({
        behaviorType: null,
        rotation: 0,
        previewPosition: null,
        targetPath: null,
        isValidPlacement: false,
        actualFixtureType: null
    })
    
    const initialStateRef = useRef<Immutable<FieldState>>(fieldState)

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
            })
        }
    }, [editMode])

    function startFixturePlacing(behaviorType: FixtureBehaviorType) {
        initialStateRef.current = fieldState
        setEditMode(EditMode.FIXTURE_PLACING)
        setPlacementState({
            behaviorType,
            rotation: 0,
            previewPosition: null,
            targetPath: null,
            isValidPlacement: false,
            actualFixtureType: null
        })
    }

    function handleFixturePlacementMove(gridPoint: [number, number]) {
        if (editMode !== EditMode.FIXTURE_PLACING || !placementState.behaviorType) {
            return
        }

        // Find if this point is on any path and get the appropriate fixture type
        let bestValidation: ReturnType<typeof validateFixturePlacementOnPath> | null = null
        let bestFixtureType: PathFixtureID | null = null
        
        for (const path of fieldState.paths) {
            const fixtureType = getFixtureTypeForPath(placementState.behaviorType, path.type)
            const validation = validateFixturePlacementOnPath(
                fixtureType,
                gridPoint,
                placementState.rotation,
                path
            )
            
            if (validation.isValid) {
                bestValidation = validation
                bestFixtureType = fixtureType
                break
            }
        }

        if (bestValidation?.isValid && bestValidation.targetPath && bestFixtureType) {
            // Show preview with valid placement
            setPlacementState(prev => ({
                ...prev,
                previewPosition: gridPoint,
                targetPath: bestValidation.targetPath!,
                isValidPlacement: true,
                actualFixtureType: bestFixtureType
            }))
        } else {
            // Show invalid preview
            setPlacementState(prev => ({
                ...prev,
                previewPosition: gridPoint,
                targetPath: null,
                isValidPlacement: false,
                actualFixtureType: null
            }))
        }
    }

    function handleFixturePlacementClick(gridPoint: [number, number]) {
        if (editMode !== EditMode.FIXTURE_PLACING || !placementState.behaviorType) {
            return
        }

        // Validate placement
        let bestValidation: ReturnType<typeof validateFixturePlacementOnPath> | null = null
        let bestFixtureType: PathFixtureID | null = null
        
        for (const path of initialStateRef.current.paths) {
            const fixtureType = getFixtureTypeForPath(placementState.behaviorType, path.type)
            const validation = validateFixturePlacementOnPath(
                fixtureType,
                gridPoint,
                placementState.rotation,
                path
            )
            
            if (validation.isValid) {
                bestValidation = validation
                bestFixtureType = fixtureType
                break
            }
        }

        if (!bestValidation?.isValid || bestValidation.segmentIndex === undefined || !bestFixtureType) {
            // Invalid placement, don't do anything
            return
        }

        // Generate and apply changes
        const changes = splitPathAtFixture(
            bestValidation.targetPath!,
            bestFixtureType,
            gridPoint,
            placementState.rotation,
            bestValidation.segmentIndex
        )

        // Apply changes as a multi-change for undo/redo
        const multiChange: UserChange = {
            type: 'multi',
            changes
        }
        
        handleChange(multiChange)
        
        // Exit fixture placing mode
        setEditMode(EditMode.MANIPULATE)
        setPlacementState({
            behaviorType: null,
            rotation: 0,
            previewPosition: null,
            targetPath: null,
            isValidPlacement: false,
            actualFixtureType: null
        })
    }

    function rotateFixturePreview(clockwise: boolean) {
        if (editMode !== EditMode.FIXTURE_PLACING) {
            return
        }

        setPlacementState(prev => {
            const delta = clockwise ? 90 : -90
            let newRotation = (prev.rotation + delta) % 360
            if (newRotation < 0) newRotation += 360
            
            return {
                ...prev,
                rotation: newRotation
            }
        })
        
        // Re-validate with new rotation
        if (placementState.previewPosition) {
            handleFixturePlacementMove(placementState.previewPosition)
        }
    }

    function cancelFixturePlacement() {
        if (editMode !== EditMode.FIXTURE_PLACING) {
            return
        }

        setEditMode(EditMode.MANIPULATE)
        setPlacementState({
            behaviorType: null,
            rotation: 0,
            previewPosition: null,
            targetPath: null,
            isValidPlacement: false,
            actualFixtureType: null
        })
    }

    return (
        <FixturePlacementContext.Provider
            value={{
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
            }}
        >
            {children}
        </FixturePlacementContext.Provider>
    )
}
