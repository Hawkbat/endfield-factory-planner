import { useLayoutEffect, useRef, useState } from "react"
import { useLocalization } from "../../contexts/localization.tsx"
import { recipes } from "../../data/recipes.ts"
import type { RecipeID } from "../../types/data.ts"
import { cn } from "../../utils/react.ts"
import { objectEntries, objectKeys } from "../../utils/types.ts"
import { ArrowRight } from "lucide-react"
import { ModalShell } from "../common/ModalShell.tsx"

interface RecipeSelectorProps {
    currentRecipeID: RecipeID | null | undefined
    currentJumpStart?: boolean
    onSelectRecipe: (recipeID: RecipeID | null, jumpStart?: boolean) => void
    recipeFilter: (recipeID: RecipeID) => boolean
    allowClear?: boolean
    allowJumpStart?: boolean
}

export function RecipeSelector({ 
    currentRecipeID,
    currentJumpStart,
    onSelectRecipe, 
    recipeFilter, 
    allowClear = true,
    allowJumpStart = true 
}: RecipeSelectorProps) {
    const { ui, getItemName } = useLocalization()
    const [filterText, setFilterText] = useState('')
    const [jumpStart, setJumpStart] = useState(currentJumpStart ?? false)
    const filterInputRef = useRef<HTMLInputElement>(null)
    
    const allRecipeIDs = objectKeys(recipes)
    const filteredRecipeIDs = allRecipeIDs.filter(recipeFilter)
    
    const searchFilteredRecipeIDs = filterText ? filteredRecipeIDs.filter(recipeID => {
        const recipe = recipes[recipeID]
        const inputItems = objectKeys(recipe.inputs)
        const outputItems = objectKeys(recipe.outputs)
        const allItems = [...inputItems, ...outputItems]
        
        // Search by item names in inputs/outputs
        return allItems.some(itemID => {
            const itemName = getItemName(itemID).toLowerCase()
            return itemName.includes(filterText.toLowerCase())
        })
    }) : filteredRecipeIDs

    const onCloseClick = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        onSelectRecipe(null, jumpStart)
    }

    const onClearClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onSelectRecipe(null, jumpStart)
    }

    const onRecipeClick = (recipeID: RecipeID, e: React.MouseEvent) => {
        e.stopPropagation()
        onSelectRecipe(recipeID, jumpStart)
    }

    useLayoutEffect(() => {
        filterInputRef.current?.focus()
    }, [])

    return (
        <ModalShell isOpen={true} onClose={onCloseClick} className="item-selector" showCloseButton>
            <div className="recipe-selector-header">
                <h3>{ui.selectRecipe}</h3>
                <input 
                    ref={filterInputRef} 
                    className="item-selector-filter" 
                    type="text" 
                    placeholder={ui.search} 
                    value={filterText} 
                    onChange={e => setFilterText(e.target.value)} 
                />
            </div>
            <div className="recipe-selector-options">
                {allowJumpStart && (
                    <label>
                        <input 
                            type="checkbox" 
                            checked={jumpStart} 
                            onChange={e => setJumpStart(e.target.checked)} 
                        />
                        <span>{ui.jumpStartRecipe}</span>
                        <span style={{ fontSize: '10px', color: '#8b949e' }}>({ui.jumpStartDescription})</span>
                    </label>
                )}
                {allowClear && (
                    <button 
                        className="recipe-clear-button clear-button" 
                        onClick={onClearClick}
                    >
                        {ui.clearRecipe} — {ui.clearRecipeDescription}
                    </button>
                )}
            </div>
            <div className="recipe-list">
                {searchFilteredRecipeIDs.map(recipeID => {
                    const recipe = recipes[recipeID]
                    const isSelected = recipeID === currentRecipeID
                    
                    // Calculate production rate (items/s)
                    const outputEntries = objectEntries(recipe.outputs)
                    const productionRate = outputEntries.length > 0 
                        ? (outputEntries[0][1] / recipe.time).toFixed(2)
                        : '0'
                    
                    return (
                        <div 
                            key={recipeID}
                            className={cn("recipe-item", isSelected && "selected")}
                            onClick={(e) => onRecipeClick(recipeID, e)}
                        >
                            <div className="recipe-io-section">
                                <div className="recipe-io-group">
                                    <div className="recipe-io-label">{ui.inputs}</div>
                                    <div className="recipe-io-items">
                                        {objectEntries(recipe.inputs).map(([itemID, count]) => (
                                            <div key={itemID} className="recipe-item-display">
                                                <img 
                                                    src={`images/${itemID}.webp`} 
                                                    alt={getItemName(itemID)}
                                                    className="recipe-item-icon"
                                                />
                                                <span className="recipe-item-name">{getItemName(itemID)}</span>
                                                <span className="recipe-item-count">×{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="recipe-arrow"><ArrowRight size={20} /></div>
                                <div className="recipe-io-group">
                                    <div className="recipe-io-label">{ui.outputs}</div>
                                    <div className="recipe-io-items">
                                        {objectEntries(recipe.outputs).map(([itemID, count]) => (
                                            <div key={itemID} className="recipe-item-display">
                                                <img 
                                                    src={`images/${itemID}.webp`} 
                                                    alt={getItemName(itemID)}
                                                    className="recipe-item-icon"
                                                />
                                                <span className="recipe-item-name">{getItemName(itemID)}</span>
                                                <span className="recipe-item-count">×{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="recipe-stats">
                                <div className="recipe-stat">
                                    <span className="recipe-stat-label">{ui.time}:</span>
                                    <span className="recipe-stat-value">{recipe.time}s</span>
                                </div>
                                <div className="recipe-stat">
                                    <span className="recipe-stat-label">{ui.productionRate}:</span>
                                    <span className="recipe-stat-value">{productionRate} {ui.itemFlowUnits}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </ModalShell>
    )
}
