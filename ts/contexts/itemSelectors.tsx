import { createContext, useContext, useState, type ReactNode } from "react"
import { FacilityCategory, FacilityID, type ItemID, type RecipeID, PathTypeID } from "../types/data.ts"
import type { UserChange } from "../types/field.ts"
import { useEdit } from "./edit.tsx"
import { EditMode } from "../types/editMode.ts"
import { useLocalization } from "./localization.tsx"
import { facilities } from "../data/facilities.ts"
import { recipes } from "../data/recipes.ts"
import { items } from "../data/items.ts"
import { pathFixtures } from "../data/pathFixtures.ts"

interface ItemSelectorsContextValue {
    // Control port item selector
    controlPortItemSelectorOpen: boolean
    controlPortSelection: { fixtureID: string; currentItemID: ItemID | null | undefined } | null
    openControlPortItemSelector: (fixtureID: string, currentItemID: ItemID | null | undefined) => void
    closeControlPortItemSelector: () => void
    handleControlPortItemSelect: (itemID: ItemID | null) => void
    filterControlPortItems: (itemID: ItemID) => boolean

    // Facility port item selector
    portItemSelectorOpen: boolean
    portSelection: { facilityID: string; portIndex: number; currentItemID: ItemID | null | undefined } | null
    openPortItemSelector: (facilityID: string, portIndex: number, currentItemID: ItemID | null | undefined) => void
    closePortItemSelector: () => void
    handlePortItemSelect: (itemID: ItemID | null) => void
    filterPortItems: (itemID: ItemID) => boolean
    
    // Facility placement selector
    facilityItemSelectorOpen: boolean
    openFacilityItemSelector: () => void
    openFacilityItemSelectorAtGrid: (gridPoint: [number, number]) => void
    closeFacilityItemSelector: () => void
    handleFacilityItemSelect: (itemID: ItemID | null, svgRef: React.RefObject<SVGSVGElement>, pan: { x: number, y: number }, zoom: number, cellSize: number) => void
    filterFacilityItems: (itemID: ItemID) => boolean
    groupFacilityItems: (itemID: ItemID) => string
    
    // Recipe selector
    recipeSelectorOpen: boolean
    facilityRecipeSelection: { facilityID: string; currentRecipeID: RecipeID | null | undefined; currentJumpStart: boolean } | null
    openRecipeSelector: (facilityID: string, currentRecipeID: RecipeID | null | undefined, currentJumpStart: boolean) => void
    closeRecipeSelector: () => void
    handleRecipeSelect: (recipeID: RecipeID | null, jumpStart: boolean | undefined) => void
    filterRecipesForFacility: (recipeID: RecipeID) => boolean
    
    // Event handlers for port/recipe clicks
    handleControlPortClick: (fixtureID: string, currentItemID: ItemID | null | undefined) => void
    handlePortClick: (facilityID: string, portIndex: number, currentItemID: ItemID | null | undefined) => void
    handleFacilityRecipeClick: (facilityID: string, currentRecipeID: RecipeID | undefined) => void
    handlePlace: () => void
}

const ItemSelectorsContext = createContext<ItemSelectorsContextValue | null>(null)

export function useItemSelectors() {
    const context = useContext(ItemSelectorsContext)
    if (!context) {
        throw new Error("useItemSelectors must be used within ItemSelectorsProvider")
    }
    return context
}

interface ItemSelectorsProviderProps {
    children: ReactNode
}

export function ItemSelectorsProvider({ children }: ItemSelectorsProviderProps) {
    const [controlPortItemSelectorOpen, setControlPortItemSelectorOpen] = useState(false)
    const [portItemSelectorOpen, setPortItemSelectorOpen] = useState(false)
    const [facilityItemSelectorOpen, setFacilityItemSelectorOpen] = useState(false)
    const [recipeSelectorOpen, setRecipeSelectorOpen] = useState(false)
    const [controlPortSelection, setControlPortSelection] = useState<{ fixtureID: string; currentItemID: ItemID | null | undefined } | null>(null)
    const [portSelection, setPortSelection] = useState<{ facilityID: string; portIndex: number; currentItemID: ItemID | null | undefined } | null>(null)
    const [facilityRecipeSelection, setFacilityRecipeSelection] = useState<{ facilityID: string; currentRecipeID: RecipeID | null | undefined; currentJumpStart: boolean } | null>(null)
    // Store grid position for facility placement if set by shortcut
    const [facilityPlacementGrid, setFacilityPlacementGrid] = useState<[number, number] | null>(null)

    const { editMode, fieldState, handleChange } = useEdit()
    const { getFacilityCategoryName } = useLocalization()
    
    // Control port item selector functions
    function openControlPortItemSelector(fixtureID: string, currentItemID: ItemID | null | undefined) {
        setControlPortSelection({ fixtureID, currentItemID })
        setControlPortItemSelectorOpen(true)
    }
    
    function closeControlPortItemSelector() {
        setControlPortItemSelectorOpen(false)
        setControlPortSelection(null)
    }
    
    function handleControlPortItemSelect(itemID: ItemID | null) {
        if (controlPortSelection) {
            const change: UserChange = {
                type: 'set-fixture-item',
                fixtureID: controlPortSelection.fixtureID,
                itemID: itemID
            }
            handleChange(change)
        }
        closeControlPortItemSelector()
    }
    
    function filterControlPortItems(itemID: ItemID): boolean {
        if (!controlPortSelection) {
            return true
        }

        const fixture = fieldState.pathFixtures.find(f => f.id === controlPortSelection.fixtureID)
        if (!fixture) {
            return true
        }

        const fixtureDef = pathFixtures[fixture.type]
        const isFluidItem = items[itemID]?.fluid === true

        if (fixtureDef?.pathType === PathTypeID.PIPE) {
            return isFluidItem
        }

        return !isFluidItem
    }
    
    function handleControlPortClick(fixtureID: string, currentItemID: ItemID | null | undefined) {
        if (editMode !== EditMode.MANIPULATE) {
            return
        }
        openControlPortItemSelector(fixtureID, currentItemID)
    }

    // Facility port item selector functions
    function openPortItemSelector(facilityID: string, portIndex: number, currentItemID: ItemID | null | undefined) {
        setPortSelection({ facilityID, portIndex, currentItemID })
        setPortItemSelectorOpen(true)
    }

    function closePortItemSelector() {
        setPortItemSelectorOpen(false)
        setPortSelection(null)
    }

    function handlePortItemSelect(itemID: ItemID | null) {
        if (portSelection) {
            const change: UserChange = {
                type: 'set-port-item',
                facilityID: portSelection.facilityID,
                portIndex: portSelection.portIndex,
                itemID: itemID
            }
            handleChange(change)
        }
        closePortItemSelector()
    }

    function filterPortItems(itemID: ItemID): boolean {
        if (!portSelection) {
            return true
        }

        const facility = fieldState.facilities.find(f => f.id === portSelection.facilityID)
        if (!facility) {
            return true
        }

        const port = facility.ports[portSelection.portIndex]
        if (!port || port.subType !== 'output') {
            return false
        }

        const isFluidItem = items[itemID]?.fluid === true
        if (port.type === 'pipe') {
            return isFluidItem
        }
        if (port.type === 'belt') {
            return !isFluidItem
        }

        return true
    }

    function handlePortClick(facilityID: string, portIndex: number, currentItemID: ItemID | null | undefined) {
        if (editMode !== EditMode.MANIPULATE) {
            return
        }
        openPortItemSelector(facilityID, portIndex, currentItemID)
    }
    
    // Facility placement selector functions

    function openFacilityItemSelector(gridPoint?: [number, number]) {
        setFacilityPlacementGrid(gridPoint ?? null)
        setFacilityItemSelectorOpen(true)
    }

    function openFacilityItemSelectorAtGrid(gridPoint: [number, number]) {
        openFacilityItemSelector(gridPoint)
    }

    function closeFacilityItemSelector() {
        setFacilityItemSelectorOpen(false)
        setFacilityPlacementGrid(null)
    }
    
    function handleFacilityItemSelect(
        itemID: ItemID | null,
        svgRef: React.RefObject<SVGSVGElement>,
        pan: { x: number, y: number },
        zoom: number,
        cellSize: number
    ) {
        closeFacilityItemSelector()
        if (itemID) {
            const facilityID = itemID as string as FacilityID
            const facilityDef = facilities[facilityID]
            if (facilityDef) {
                let position: [number, number]
                if (facilityPlacementGrid) {
                    // Use grid position from shortcut
                    position = [facilityPlacementGrid[0], facilityPlacementGrid[1]]
                } else {
                    // Place facility at center of current view
                    if (!svgRef.current) {
                        return
                    }
                    const rect = svgRef.current.getBoundingClientRect()
                    const clientX = (rect.left + rect.right) / 2
                    const clientY = (rect.top + rect.bottom) / 2
                    // Convert to grid coordinates
                    const worldX = (clientX - rect.left - pan.x) / zoom
                    const worldY = (clientY - rect.top - pan.y) / zoom
                    const gridX = worldX / cellSize
                    const gridY = worldY / cellSize
                    position = [Math.round(gridX), Math.round(gridY)]
                }
                const placeChange: UserChange = {
                    type: 'add-facility',
                    facilityType: facilityID,
                    position,
                    rotation: 0,
                }
                handleChange(placeChange)
            }
        }
    }
    
    function filterFacilityItems(itemID: ItemID): boolean {
        const facilityID = itemID as string as FacilityID
        const facilityDef = facilities[facilityID]
        return facilityDef && !facilityDef.notImplementedYet
    }
    
    function groupFacilityItems(itemID: ItemID): string {
        const facilityID = itemID as string as FacilityID
        const facilityDef = facilities[facilityID]
        if (!facilityDef) return getFacilityCategoryName(FacilityCategory.MISC)
        return getFacilityCategoryName(facilityDef.category)
    }
    
    // Recipe selector functions
    function openRecipeSelector(facilityID: string, currentRecipeID: RecipeID | null | undefined, currentJumpStart: boolean) {
        setFacilityRecipeSelection({ facilityID, currentRecipeID, currentJumpStart })
        setRecipeSelectorOpen(true)
    }
    
    function closeRecipeSelector() {
        setRecipeSelectorOpen(false)
        setFacilityRecipeSelection(null)
    }
    
    function handleRecipeSelect(recipeID: RecipeID | null, jumpStart: boolean | undefined) {
        if (facilityRecipeSelection) {
            const change: UserChange = {
                type: 'set-facility-recipe',
                facilityID: facilityRecipeSelection.facilityID,
                recipeID: recipeID,
                jumpStart: jumpStart ?? facilityRecipeSelection.currentJumpStart
            }
            handleChange(change)
        }
        closeRecipeSelector()
    }
    
    function filterRecipesForFacility(recipeID: RecipeID): boolean {
        if (!facilityRecipeSelection) return false
        const facility = fieldState.facilities.find(f => f.id === facilityRecipeSelection.facilityID)
        if (!facility) return false
        const recipe = recipes[recipeID]
        return recipe.facilityID === facility.type
    }
    
    function handleFacilityRecipeClick(facilityID: string, currentRecipeID: RecipeID | undefined) {
        if (editMode !== EditMode.MANIPULATE) {
            return
        }
        const facility = fieldState.facilities.find(f => f.id === facilityID)
        if (!facility) return
        
        openRecipeSelector(facilityID, currentRecipeID || facility.setRecipe, facility.jumpStartRecipe ?? false)
    }
    
    function handlePlace() {
        // Only allow placement in manipulate mode
        if (editMode !== EditMode.MANIPULATE) {
            return
        }
        openFacilityItemSelector()
    }
    
    const value: ItemSelectorsContextValue = {
        controlPortItemSelectorOpen,
        controlPortSelection,
        openControlPortItemSelector,
        closeControlPortItemSelector,
        handleControlPortItemSelect,
        filterControlPortItems,
        portItemSelectorOpen,
        portSelection,
        openPortItemSelector,
        closePortItemSelector,
        handlePortItemSelect,
        filterPortItems,
        facilityItemSelectorOpen,
        openFacilityItemSelector,
        openFacilityItemSelectorAtGrid,
        closeFacilityItemSelector,
        handleFacilityItemSelect,
        filterFacilityItems,
        groupFacilityItems,
        recipeSelectorOpen,
        facilityRecipeSelection,
        openRecipeSelector,
        closeRecipeSelector,
        handleRecipeSelect,
        filterRecipesForFacility,
        handleControlPortClick,
        handlePortClick,
        handleFacilityRecipeClick,
        handlePlace
    }

    return (
        <ItemSelectorsContext.Provider value={value}>
            {children}
        </ItemSelectorsContext.Provider>
    )
}
