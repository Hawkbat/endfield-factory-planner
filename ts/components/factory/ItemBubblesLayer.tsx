import { objectKeys, objectValues, type Immutable } from "../../utils/types.ts"
import type { FieldState } from "../../types/field.ts"
import { recipes } from "../../data/recipes.ts"
import { ItemBubble } from "./ItemBubble.tsx"
import type { ItemID, RecipeID } from "../../types/data.ts"
import { FacilityID } from "../../types/data.ts"
import { FixtureBehaviorType, pathFixtures } from "../../data/pathFixtures.ts"
import { useItemSelectors } from "../../contexts/itemSelectors.tsx"

interface ItemBubblesLayerProps {
    fieldState: Immutable<FieldState>
    cellSize: number
}

export function ItemBubblesLayer({ fieldState, cellSize }: ItemBubblesLayerProps) {
    const { handleFacilityRecipeClick, handleControlPortClick, handlePortClick } = useItemSelectors()
    
    return (
        <g>
            {fieldState.facilities.filter(facility => objectValues(recipes).some(r => r.facilityID === facility.type)).map((facility) => {
                let outputItemID: ItemID | null = null
                if (facility.actualRecipe) {
                    const recipe = recipes[facility.actualRecipe]
                    if (recipe) {
                        const outputItems = objectKeys(recipe.outputs)
                        outputItemID = outputItems[0]
                    }
                }

                return (
                    <ItemBubble
                        key={`${facility.id}-item-bubble`}
                        itemID={outputItemID}
                        x={(facility.x + facility.width / 2) * cellSize}
                        y={(facility.y - 0.25) * cellSize}
                        size={16}
                        onClick={() => handleFacilityRecipeClick(facility.id, facility.actualRecipe ?? undefined)}
                    />
                )
            })}
            {fieldState.facilities.flatMap((facility) => facility.ports.map((port, portIndex) => {
                const isExternalSelectable = port.external !== undefined && port.subType === 'output'
                const isSelectableFacility = facility.type === FacilityID.REACTOR_CRUCIBLE
                if ((isExternalSelectable || isSelectableFacility) && port.subType === 'output') {
                    return (
                        <ItemBubble
                            key={`${facility.id}-port-${portIndex}-item-bubble`}
                            itemID={port.setItem ?? null}
                            x={(facility.x + port.x + 0.5) * cellSize}
                            y={(facility.y + port.y - 0.25) * cellSize}
                            size={16}
                            onClick={() => handlePortClick(facility.id, portIndex, port.setItem ?? undefined)}
                        />
                    )
                }

                return null
            }).filter(Boolean))}
            {fieldState.pathFixtures.map((fixture) =>
                pathFixtures[fixture.type]?.behaviorType === FixtureBehaviorType.CONTROL_PORT ? (
                    <ItemBubble
                        key={`${fixture.id}-item-bubble`}
                        itemID={fixture.setItem ?? null}
                        x={(fixture.x + 0.5) * cellSize}
                        y={(fixture.y - 0.25) * cellSize}
                        size={16}
                        onClick={() => handleControlPortClick(fixture.id, fixture.setItem ?? undefined)}
                    />
                ) : null
            )}
        </g>
    )
}
