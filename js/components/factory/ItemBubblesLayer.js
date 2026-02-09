import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/ItemBubblesLayer.tsx";
import { objectKeys, objectValues } from "../../utils/types.js";
import { recipes } from "../../data/recipes.js";
import { ItemBubble } from "./ItemBubble.js";
import { FacilityID } from "../../types/data.js";
import { FixtureBehaviorType, pathFixtures } from "../../data/pathFixtures.js";
import { useItemSelectors } from "../../contexts/itemSelectors.js";
export function ItemBubblesLayer({ fieldState, cellSize }) {
    const { handleFacilityRecipeClick, handleControlPortClick, handlePortClick } = useItemSelectors();
    return (_jsxDEV("g", { children: [fieldState.facilities.filter(facility => objectValues(recipes).some(r => r.facilityID === facility.type)).map((facility) => {
                let outputItemID = null;
                if (facility.actualRecipe) {
                    const recipe = recipes[facility.actualRecipe];
                    if (recipe) {
                        const outputItems = objectKeys(recipe.outputs);
                        outputItemID = outputItems[0];
                    }
                }
                return (_jsxDEV(ItemBubble, { itemID: outputItemID, x: (facility.x + facility.width / 2) * cellSize, y: (facility.y - 0.25) * cellSize, size: 16, onClick: () => handleFacilityRecipeClick(facility.id, facility.actualRecipe ?? undefined) }, `${facility.id}-item-bubble`, false, { fileName: _jsxFileName, lineNumber: 30, columnNumber: 25 }, this));
            }), fieldState.facilities.flatMap((facility) => facility.ports.map((port, portIndex) => {
                const isExternalSelectable = port.external !== undefined && port.subType === 'output';
                const isSelectableFacility = facility.type === FacilityID.REACTOR_CRUCIBLE;
                if ((isExternalSelectable || isSelectableFacility) && port.subType === 'output') {
                    return (_jsxDEV(ItemBubble, { itemID: port.setItem ?? null, x: (facility.x + port.x + 0.5) * cellSize, y: (facility.y + port.y - 0.25) * cellSize, size: 16, onClick: () => handlePortClick(facility.id, portIndex, port.setItem ?? undefined) }, `${facility.id}-port-${portIndex}-item-bubble`, false, { fileName: _jsxFileName, lineNumber: 45, columnNumber: 29 }, this));
                }
                return null;
            }).filter(Boolean)), fieldState.pathFixtures.map((fixture) => pathFixtures[fixture.type]?.behaviorType === FixtureBehaviorType.CONTROL_PORT ? (_jsxDEV(ItemBubble, { itemID: fixture.setItem ?? null, x: (fixture.x + 0.5) * cellSize, y: (fixture.y - 0.25) * cellSize, size: 16, onClick: () => handleControlPortClick(fixture.id, fixture.setItem ?? undefined) }, `${fixture.id}-item-bubble`, false, { fileName: _jsxFileName, lineNumber: 60, columnNumber: 98 }, this)) : null)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 18, columnNumber: 13 }, this));
}
