import { type ItemID, type RecipeID, type FacilityID } from "../types/data.ts"
import { recipes } from "../data/recipes.ts"
import { items } from "../data/items.ts"
import { objectEntries, objectKeys } from "../utils/types.ts"

/** Throughput limit per belt path (non-fluid items) in items/sec */
const BELT_THROUGHPUT = 0.5
/** Throughput limit per pipe path (fluid items) in items/sec */
const PIPE_THROUGHPUT = 2.0

/** Get the throughput limit for a given item based on whether it's fluid */
export function getItemThroughput(itemID: ItemID): number {
    const item = items[itemID]
    return item?.fluid ? PIPE_THROUGHPUT : BELT_THROUGHPUT
}

/** A node in the crafting chain representing one item and its selected recipe */
export interface CraftingChainNode {
    /** The item this node produces */
    itemID: ItemID
    /** The selected recipe (null means "raw material" — no crafting) */
    selectedRecipeID: RecipeID | null
    /** All available recipes that produce this item */
    availableRecipes: RecipeID[]
    /** Rate of this item needed in items/sec */
    ratePerSecond: number
    /** The facility used (if a recipe is selected) */
    facilityID: FacilityID | null
    /** 
     * Number of facilities needed to sustain the required rate (for recipes),
     * or number of source paths needed based on throughput limits (for raw materials)
     */
    sourceCount: number
    /** Recipe time in seconds (if a recipe is selected) */
    recipeTime: number | null
    /** Input items needed and their rates in items/sec */
    inputs: { itemID: ItemID; ratePerSecond: number }[]
    /** Children nodes — the items needed to produce this one */
    children: CraftingChainNode[]
}

/** Precomputed index: for each item, which recipes produce it */
let recipesForItemCache: Map<ItemID, RecipeID[]> | null = null

function getRecipesForItem(): Map<ItemID, RecipeID[]> {
    if (recipesForItemCache) return recipesForItemCache
    const index = new Map<ItemID, RecipeID[]>()
    for (const [recipeID, recipe] of objectEntries(recipes)) {
        for (const outputItemID of objectKeys(recipe.outputs)) {
            if (!index.has(outputItemID)) {
                index.set(outputItemID, [])
            }
            index.get(outputItemID)!.push(recipeID)
        }
    }
    recipesForItemCache = index
    return index
}

/**
 * Build the crafting chain DAG for a given item.
 * All rates are expressed in items/sec.
 * @param targetItem The item to produce
 * @param ratePerSecond Required output rate in items/sec
 * @param recipeSelections User's recipe selections (itemID -> recipeID or null for "raw")
 * @param visitedItems Set of items already in the current chain path (to avoid infinite recursion)
 */
export function buildCraftingChain(
    targetItem: ItemID,
    ratePerSecond: number,
    recipeSelections: Map<ItemID, RecipeID | null>,
    visitedItems: Set<ItemID> = new Set()
): CraftingChainNode {
    const recipesIndex = getRecipesForItem()
    const availableRecipes = recipesIndex.get(targetItem) ?? []

    // Determine which recipe to use
    let selectedRecipeID: RecipeID | null = null
    if (recipeSelections.has(targetItem)) {
        selectedRecipeID = recipeSelections.get(targetItem) ?? null
    } else if (availableRecipes.length > 0) {
        // Default to the first available recipe
        selectedRecipeID = availableRecipes[0]
    }

    // If this item is already in the chain (cycle detection), treat as raw
    if (visitedItems.has(targetItem)) {
        selectedRecipeID = null
    }

    if (selectedRecipeID === null) {
        // Raw material node — item supplied externally
        // sourceCount = number of paths needed based on throughput limit
        const throughput = getItemThroughput(targetItem)
        const sourceCount = Math.ceil(ratePerSecond / throughput)
        return {
            itemID: targetItem,
            selectedRecipeID: null,
            availableRecipes,
            ratePerSecond,
            facilityID: null,
            sourceCount,
            recipeTime: null,
            inputs: [],
            children: [],
        }
    }

    const recipe = recipes[selectedRecipeID]
    const outputAmount = recipe.outputs[targetItem] ?? 1
    // Production rate of one facility: outputAmount / recipeTime items/sec
    const singleFacilityRate = outputAmount / recipe.time
    // Number of facilities needed to sustain the required rate
    const facilitiesNeeded = ratePerSecond / singleFacilityRate

    const newVisited = new Set(visitedItems)
    newVisited.add(targetItem)

    const inputs: { itemID: ItemID; ratePerSecond: number }[] = []
    const children: CraftingChainNode[] = []

    for (const [inputItemID, inputCount] of objectEntries(recipe.inputs)) {
        // Input rate = (inputCount / recipeTime) * facilitiesNeeded
        // Equivalently: ratePerSecond * (inputCount / outputAmount)
        const inputRate = (inputCount / recipe.time) * facilitiesNeeded
        inputs.push({ itemID: inputItemID, ratePerSecond: inputRate })
        const childNode = buildCraftingChain(inputItemID, inputRate, recipeSelections, newVisited)
        children.push(childNode)
    }

    return {
        itemID: targetItem,
        selectedRecipeID,
        availableRecipes,
        ratePerSecond,
        facilityID: recipe.facilityID,
        sourceCount: facilitiesNeeded,
        recipeTime: recipe.time,
        inputs,
        children,
    }
}

/** Summary of base materials needed for the entire chain */
export interface CraftingChainSummary {
    /** Raw materials (leaf nodes with no recipe) and their total rates in items/sec */
    rawMaterials: { itemID: ItemID; ratePerSecond: number; sourceCount: number }[]
    /** All facilities needed and their counts */
    facilities: { facilityID: FacilityID; count: number }[]
    /** Total source paths needed for all raw materials */
    totalSourcePaths: number
}

/**
 * Compute the summary of base materials and facilities from a crafting chain tree.
 */
export function computeCraftingChainSummary(root: CraftingChainNode): CraftingChainSummary {
    const rawMaterials = new Map<ItemID, number>()
    const facilityCounts = new Map<FacilityID, number>()

    function traverse(node: CraftingChainNode) {
        if (node.selectedRecipeID === null) {
            // Raw material
            rawMaterials.set(node.itemID, (rawMaterials.get(node.itemID) ?? 0) + node.ratePerSecond)
        } else {
            // Has a recipe, accumulate facility count
            if (node.facilityID) {
                facilityCounts.set(node.facilityID, (facilityCounts.get(node.facilityID) ?? 0) + node.sourceCount)
            }
            for (const child of node.children) {
                traverse(child)
            }
        }
    }

    traverse(root)

    const rawMaterialsList = Array.from(rawMaterials.entries())
        .map(([itemID, ratePerSecond]) => {
            const throughput = getItemThroughput(itemID)
            const sourceCount = Math.ceil(ratePerSecond / throughput)
            return { itemID, ratePerSecond, sourceCount }
        })
        .sort((a, b) => b.ratePerSecond - a.ratePerSecond)

    return {
        rawMaterials: rawMaterialsList,
        facilities: Array.from(facilityCounts.entries())
            .map(([facilityID, count]) => ({ facilityID, count }))
            .sort((a, b) => b.count - a.count),
        totalSourcePaths: rawMaterialsList.reduce((sum, r) => sum + r.sourceCount, 0),
    }
}

/**
 * Get all available recipes that produce a given item.
 */
export function getAvailableRecipesForItem(itemID: ItemID): RecipeID[] {
    const recipesIndex = getRecipesForItem()
    return recipesIndex.get(itemID) ?? []
}
