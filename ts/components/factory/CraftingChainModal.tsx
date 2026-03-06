import { useMemo } from "react"
import { ModalShell } from "../common/ModalShell.tsx"
import { useLocalization } from "../../contexts/localization.tsx"
import { useCraftingChain } from "../../contexts/craftingChain.tsx"
import { computeCraftingChainSummary, type CraftingChainNode } from "../../game/craftingChain.ts"
import { recipes } from "../../data/recipes.ts"
import { objectEntries } from "../../utils/types.ts"
import type { ItemID, RecipeID } from "../../types/data.ts"
import { Package, Factory, ChevronDown } from "lucide-react"

function CraftingChainNodeView({ node, depth }: { node: CraftingChainNode; depth: number }) {
    const loc = useLocalization()
    const { setRecipeSelection, openCraftingChain } = useCraftingChain()

    const recipe = node.selectedRecipeID ? recipes[node.selectedRecipeID] : null

    function handleRecipeChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const value = e.target.value
        setRecipeSelection(node.itemID, value === "__raw__" ? null : value as RecipeID)
    }

    function handleItemClick(e: React.MouseEvent, itemID: ItemID) {
        e.stopPropagation()
        openCraftingChain(itemID)
    }

    const hasMultipleOptions = node.availableRecipes.length > 0 // always has "raw" + recipes

    return (
        <div className="crafting-chain-node" style={{ marginLeft: depth * 16 }}>
            <div className="crafting-chain-node-header">
                <img
                    src={`images/${node.itemID}.webp`}
                    alt={loc.getItemName(node.itemID)}
                    className="crafting-chain-node-icon"
                    onClick={(e) => handleItemClick(e, node.itemID)}
                    title={loc.ui.craftingChainViewChain}
                />
                <span className="crafting-chain-node-name">{loc.getItemName(node.itemID)}</span>
                <span className="crafting-chain-node-amount">{node.ratePerSecond.toFixed(3)} {loc.ui.itemFlowUnits}</span>
                <span className="crafting-chain-node-sources">
                    {node.selectedRecipeID !== null
                        ? `${Math.ceil(node.sourceCount)}× ${loc.ui.craftingChainFacility}`
                        : `${node.sourceCount}× ${loc.ui.craftingChainSourcePaths}`}
                </span>
                {hasMultipleOptions && (
                    <div className="crafting-chain-recipe-select-wrapper">
                        <select
                            className="crafting-chain-recipe-select"
                            value={node.selectedRecipeID ?? "__raw__"}
                            onChange={handleRecipeChange}
                        >
                            <option value="__raw__">📦 {loc.ui.craftingChainRawMaterial}</option>
                            {node.availableRecipes.map(recipeID => {
                                const r = recipes[recipeID]
                                const outputNames = objectEntries(r.outputs)
                                    .map(([id]) => loc.getItemName(id))
                                    .join(", ")
                                const inputNames = objectEntries(r.inputs)
                                    .map(([id, count]) => `${count}× ${loc.getItemName(id)}`)
                                    .join(" + ")
                                return (
                                    <option key={recipeID} value={recipeID}>
                                        🏭 {loc.getFacilityName(r.facilityID)}: {inputNames} → {outputNames}
                                    </option>
                                )
                            })}
                        </select>
                        <ChevronDown size={12} className="crafting-chain-select-chevron" />
                    </div>
                )}
                {!hasMultipleOptions && (
                    <span className="crafting-chain-node-raw-badge">
                        <Package size={12} /> {loc.ui.craftingChainRawMaterial}
                    </span>
                )}
            </div>
            {recipe && (
                <div className="crafting-chain-node-details">
                    <span className="crafting-chain-detail">
                        <Factory size={12} />
                        {loc.getFacilityName(recipe.facilityID)}
                    </span>
                    <span className="crafting-chain-detail">
                        {loc.ui.craftingChainRecipeTime}: {recipe.time}s
                    </span>
                </div>
            )}
            {node.children.length > 0 && (
                <div className="crafting-chain-children">
                    {node.children.map(child => (
                        <CraftingChainNodeView
                            key={child.itemID}
                            node={child}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export function CraftingChainModal() {
    const loc = useLocalization()
    const { isOpen, targetItem, chainRoot, closeCraftingChain } = useCraftingChain()

    const summary = useMemo(() => {
        if (!chainRoot) return null
        return computeCraftingChainSummary(chainRoot)
    }, [chainRoot])

    if (!isOpen || !targetItem || !chainRoot) {
        return null
    }

    return (
        <ModalShell isOpen={isOpen} onClose={closeCraftingChain} className="crafting-chain-modal" showCloseButton>
            <div className="crafting-chain-header">
                <h2 className="crafting-chain-title">
                    <img
                        src={`images/${targetItem}.webp`}
                        alt={loc.getItemName(targetItem)}
                        className="crafting-chain-title-icon"
                    />
                    {loc.ui.craftingChainTitle}: {loc.getItemName(targetItem)}
                </h2>
            </div>
            <div className="crafting-chain-content">
                <div className="crafting-chain-tree">
                    <CraftingChainNodeView node={chainRoot} depth={0} />
                </div>
                {summary && (
                    <div className="crafting-chain-summary">
                        <h3 className="crafting-chain-summary-title">{loc.ui.craftingChainSummary}</h3>
                        <div className="crafting-chain-summary-section">
                            <h4>{loc.ui.craftingChainRawMaterials}</h4>
                            {summary.rawMaterials.length === 0 ? (
                                <div className="crafting-chain-summary-none">{loc.ui.none}</div>
                            ) : (
                                <div className="crafting-chain-summary-list">
                                    {summary.rawMaterials.map(({ itemID, ratePerSecond, sourceCount }) => (
                                        <div key={itemID} className="crafting-chain-summary-item">
                                            <img
                                                src={`images/${itemID}.webp`}
                                                alt={loc.getItemName(itemID)}
                                                className="crafting-chain-summary-icon"
                                            />
                                            <span>{loc.getItemName(itemID)}</span>
                                            <span className="crafting-chain-summary-amount">
                                                {ratePerSecond.toFixed(3)} {loc.ui.itemFlowUnits} ({sourceCount}× {loc.ui.craftingChainSourcePaths})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="crafting-chain-summary-ports">
                                {loc.ui.craftingChainTotalSourcePaths}: {summary.totalSourcePaths}
                            </div>
                        </div>
                        <div className="crafting-chain-summary-section">
                            <h4>{loc.ui.craftingChainFacilities}</h4>
                            {summary.facilities.length === 0 ? (
                                <div className="crafting-chain-summary-none">{loc.ui.none}</div>
                            ) : (
                                <div className="crafting-chain-summary-list">
                                    {summary.facilities.map(({ facilityID, count }) => (
                                        <div key={facilityID} className="crafting-chain-summary-item">
                                            <img
                                                src={`images/${facilityID}.webp`}
                                                alt={loc.getFacilityName(facilityID)}
                                                className="crafting-chain-summary-icon"
                                            />
                                            <span>{loc.getFacilityName(facilityID)}</span>
                                            <span className="crafting-chain-summary-amount">×{Math.ceil(count)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </ModalShell>
    )
}
