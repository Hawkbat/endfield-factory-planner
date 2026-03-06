import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import type { ItemID, RecipeID } from "../types/data.ts"
import { buildCraftingChain, getAvailableRecipesForItem, type CraftingChainNode } from "../game/craftingChain.ts"
import { recipes } from "../data/recipes.ts"

interface CraftingChainContextValue {
    /** Whether the crafting chain modal is open */
    isOpen: boolean
    /** The target item for the crafting chain */
    targetItem: ItemID | null
    /** The computed crafting chain tree */
    chainRoot: CraftingChainNode | null
    /** User's recipe selections per item */
    recipeSelections: Map<ItemID, RecipeID | null>
    /** Open the crafting chain modal for a given item */
    openCraftingChain: (itemID: ItemID) => void
    /** Close the crafting chain modal */
    closeCraftingChain: () => void
    /** Change the recipe selection for an item in the chain */
    setRecipeSelection: (itemID: ItemID, recipeID: RecipeID | null) => void
    /** Open a new item selector to pick an item for crafting chain */
    openCraftingChainSelector: () => void
    /** Whether the item selector for crafting chain is open */
    isSelectorOpen: boolean
    /** Close the item selector */
    closeCraftingChainSelector: () => void
}

const CraftingChainContext = createContext<CraftingChainContextValue | null>(null)

export function useCraftingChain() {
    const context = useContext(CraftingChainContext)
    if (!context) {
        throw new Error("useCraftingChain must be used within CraftingChainProvider")
    }
    return context
}

export function CraftingChainProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSelectorOpen, setIsSelectorOpen] = useState(false)
    const [targetItem, setTargetItem] = useState<ItemID | null>(null)
    const [recipeSelections, setRecipeSelections] = useState<Map<ItemID, RecipeID | null>>(new Map())
    const [chainRoot, setChainRoot] = useState<CraftingChainNode | null>(null)

    /**
     * Compute the root output rate for a target item based on its selected recipe.
     * This is the production rate of a single facility running that recipe.
     */
    function getRootRate(itemID: ItemID, selections: Map<ItemID, RecipeID | null>): number {
        let selectedRecipeID: RecipeID | null = null
        if (selections.has(itemID)) {
            selectedRecipeID = selections.get(itemID) ?? null
        } else {
            const available = getAvailableRecipesForItem(itemID)
            if (available.length > 0) {
                selectedRecipeID = available[0]
            }
        }
        if (selectedRecipeID === null) {
            // Raw material — use throughput limit as the rate
            return 1
        }
        const recipe = recipes[selectedRecipeID]
        const outputAmount = recipe.outputs[itemID] ?? 1
        return outputAmount / recipe.time
    }

    const rebuildChain = useCallback((itemID: ItemID, selections: Map<ItemID, RecipeID | null>) => {
        const rate = getRootRate(itemID, selections)
        const root = buildCraftingChain(itemID, rate, selections)
        setChainRoot(root)
    }, [])

    const openCraftingChain = useCallback((itemID: ItemID) => {
        setTargetItem(itemID)
        setIsSelectorOpen(false)
        const selections = new Map<ItemID, RecipeID | null>()
        const rate = getRootRate(itemID, selections)
        const root = buildCraftingChain(itemID, rate, selections)
        setRecipeSelections(selections)
        setChainRoot(root)
        setIsOpen(true)
    }, [])

    const closeCraftingChain = useCallback(() => {
        setIsOpen(false)
        setTargetItem(null)
        setChainRoot(null)
        setRecipeSelections(new Map())
    }, [])

    const setRecipeSelection = useCallback((itemID: ItemID, recipeID: RecipeID | null) => {
        setRecipeSelections(prev => {
            const next = new Map(prev)
            next.set(itemID, recipeID)
            return next
        })
        // Rebuild the chain with updated selections
        if (targetItem) {
            setRecipeSelections(prev => {
                const next = new Map(prev)
                next.set(itemID, recipeID)
                rebuildChain(targetItem, next)
                return next
            })
        }
    }, [targetItem, rebuildChain])

    const openCraftingChainSelector = useCallback(() => {
        setIsSelectorOpen(true)
    }, [])

    const closeCraftingChainSelector = useCallback(() => {
        setIsSelectorOpen(false)
    }, [])

    return (
        <CraftingChainContext.Provider value={{
            isOpen,
            targetItem,
            chainRoot,
            recipeSelections,
            openCraftingChain,
            closeCraftingChain,
            setRecipeSelection,
            openCraftingChainSelector,
            isSelectorOpen,
            closeCraftingChainSelector,
        }}>
            {children}
        </CraftingChainContext.Provider>
    )
}
