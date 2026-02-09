import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/inventory/RecipeSelector.tsx";
import { useLayoutEffect, useRef, useState } from "react";
import { useLocalization } from "../../contexts/localization.js";
import { recipes } from "../../data/recipes.js";
import { cn } from "../../utils/react.js";
import { objectEntries, objectKeys } from "../../utils/types.js";
import { ArrowRight } from "lucide-react";
import { ModalShell } from "../common/ModalShell.js";
export function RecipeSelector({ currentRecipeID, currentJumpStart, onSelectRecipe, recipeFilter, allowClear = true, allowJumpStart = true }) {
    const { ui, getItemName } = useLocalization();
    const [filterText, setFilterText] = useState('');
    const [jumpStart, setJumpStart] = useState(currentJumpStart ?? false);
    const filterInputRef = useRef(null);
    const allRecipeIDs = objectKeys(recipes);
    const filteredRecipeIDs = allRecipeIDs.filter(recipeFilter);
    const searchFilteredRecipeIDs = filterText ? filteredRecipeIDs.filter(recipeID => {
        const recipe = recipes[recipeID];
        const inputItems = objectKeys(recipe.inputs);
        const outputItems = objectKeys(recipe.outputs);
        const allItems = [...inputItems, ...outputItems];
        // Search by item names in inputs/outputs
        return allItems.some(itemID => {
            const itemName = getItemName(itemID).toLowerCase();
            return itemName.includes(filterText.toLowerCase());
        });
    }) : filteredRecipeIDs;
    const onCloseClick = (e) => {
        e?.stopPropagation();
        onSelectRecipe(null, jumpStart);
    };
    const onClearClick = (e) => {
        e.stopPropagation();
        onSelectRecipe(null, jumpStart);
    };
    const onRecipeClick = (recipeID, e) => {
        e.stopPropagation();
        onSelectRecipe(recipeID, jumpStart);
    };
    useLayoutEffect(() => {
        filterInputRef.current?.focus();
    }, []);
    return (_jsxDEV(ModalShell, { isOpen: true, onClose: onCloseClick, className: "item-selector", showCloseButton: true, children: [_jsxDEV("div", { className: "recipe-selector-header", children: [_jsxDEV("h3", { children: ui.selectRecipe }, void 0, false, { fileName: _jsxFileName, lineNumber: 70, columnNumber: 17 }, this), _jsxDEV("input", { ref: filterInputRef, className: "item-selector-filter", type: "text", placeholder: ui.search, value: filterText, onChange: e => setFilterText(e.target.value) }, void 0, false, { fileName: _jsxFileName, lineNumber: 71, columnNumber: 17 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 69, columnNumber: 13 }, this), _jsxDEV("div", { className: "recipe-selector-options", children: [allowJumpStart && (_jsxDEV("label", { children: [_jsxDEV("input", { type: "checkbox", checked: jumpStart, onChange: e => setJumpStart(e.target.checked) }, void 0, false, { fileName: _jsxFileName, lineNumber: 83, columnNumber: 25 }, this), _jsxDEV("span", { children: ui.jumpStartRecipe }, void 0, false, { fileName: _jsxFileName, lineNumber: 88, columnNumber: 25 }, this), _jsxDEV("span", { style: { fontSize: '10px', color: '#8b949e' }, children: ["(", ui.jumpStartDescription, ")"] }, void 0, true, { fileName: _jsxFileName, lineNumber: 89, columnNumber: 25 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 81, columnNumber: 37 }, this)), allowClear && (_jsxDEV("button", { className: "recipe-clear-button clear-button", onClick: onClearClick, children: [ui.clearRecipe, " \u2014 ", ui.clearRecipeDescription] }, void 0, true, { fileName: _jsxFileName, lineNumber: 92, columnNumber: 33 }, this))] }, void 0, true, { fileName: _jsxFileName, lineNumber: 80, columnNumber: 13 }, this), _jsxDEV("div", { className: "recipe-list", children: searchFilteredRecipeIDs.map(recipeID => {
                    const recipe = recipes[recipeID];
                    const isSelected = recipeID === currentRecipeID;
                    // Calculate production rate (items/s)
                    const outputEntries = objectEntries(recipe.outputs);
                    const productionRate = outputEntries.length > 0
                        ? (outputEntries[0][1] / recipe.time).toFixed(2)
                        : '0';
                    return (_jsxDEV("div", { className: cn("recipe-item", isSelected && "selected"), onClick: (e) => onRecipeClick(recipeID, e), children: [_jsxDEV("div", { className: "recipe-io-section", children: [_jsxDEV("div", { className: "recipe-io-group", children: [_jsxDEV("div", { className: "recipe-io-label", children: ui.inputs }, void 0, false, { fileName: _jsxFileName, lineNumber: 120, columnNumber: 37 }, this), _jsxDEV("div", { className: "recipe-io-items", children: objectEntries(recipe.inputs).map(([itemID, count]) => (_jsxDEV("div", { className: "recipe-item-display", children: [_jsxDEV("img", { src: `images/${itemID}.webp`, alt: getItemName(itemID), className: "recipe-item-icon" }, void 0, false, { fileName: _jsxFileName, lineNumber: 124, columnNumber: 49 }, this), _jsxDEV("span", { className: "recipe-item-name", children: getItemName(itemID) }, void 0, false, { fileName: _jsxFileName, lineNumber: 129, columnNumber: 49 }, this), _jsxDEV("span", { className: "recipe-item-count", children: ["\u00D7", count] }, void 0, true, { fileName: _jsxFileName, lineNumber: 130, columnNumber: 49 }, this)] }, itemID, true, { fileName: _jsxFileName, lineNumber: 122, columnNumber: 97 }, this))) }, void 0, false, { fileName: _jsxFileName, lineNumber: 121, columnNumber: 37 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 119, columnNumber: 33 }, this), _jsxDEV("div", { className: "recipe-arrow", children: _jsxDEV(ArrowRight, { size: 20 }, void 0, false, { fileName: _jsxFileName, lineNumber: 135, columnNumber: 63 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 135, columnNumber: 33 }, this), _jsxDEV("div", { className: "recipe-io-group", children: [_jsxDEV("div", { className: "recipe-io-label", children: ui.outputs }, void 0, false, { fileName: _jsxFileName, lineNumber: 137, columnNumber: 37 }, this), _jsxDEV("div", { className: "recipe-io-items", children: objectEntries(recipe.outputs).map(([itemID, count]) => (_jsxDEV("div", { className: "recipe-item-display", children: [_jsxDEV("img", { src: `images/${itemID}.webp`, alt: getItemName(itemID), className: "recipe-item-icon" }, void 0, false, { fileName: _jsxFileName, lineNumber: 141, columnNumber: 49 }, this), _jsxDEV("span", { className: "recipe-item-name", children: getItemName(itemID) }, void 0, false, { fileName: _jsxFileName, lineNumber: 146, columnNumber: 49 }, this), _jsxDEV("span", { className: "recipe-item-count", children: ["\u00D7", count] }, void 0, true, { fileName: _jsxFileName, lineNumber: 147, columnNumber: 49 }, this)] }, itemID, true, { fileName: _jsxFileName, lineNumber: 139, columnNumber: 98 }, this))) }, void 0, false, { fileName: _jsxFileName, lineNumber: 138, columnNumber: 37 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 136, columnNumber: 33 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 118, columnNumber: 29 }, this), _jsxDEV("div", { className: "recipe-stats", children: [_jsxDEV("div", { className: "recipe-stat", children: [_jsxDEV("span", { className: "recipe-stat-label", children: [ui.time, ":"] }, void 0, true, { fileName: _jsxFileName, lineNumber: 155, columnNumber: 37 }, this), _jsxDEV("span", { className: "recipe-stat-value", children: [recipe.time, "s"] }, void 0, true, { fileName: _jsxFileName, lineNumber: 156, columnNumber: 37 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 154, columnNumber: 33 }, this), _jsxDEV("div", { className: "recipe-stat", children: [_jsxDEV("span", { className: "recipe-stat-label", children: [ui.productionRate, ":"] }, void 0, true, { fileName: _jsxFileName, lineNumber: 159, columnNumber: 37 }, this), _jsxDEV("span", { className: "recipe-stat-value", children: [productionRate, " ", ui.itemFlowUnits] }, void 0, true, { fileName: _jsxFileName, lineNumber: 160, columnNumber: 37 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 158, columnNumber: 33 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 153, columnNumber: 29 }, this)] }, recipeID, true, { fileName: _jsxFileName, lineNumber: 112, columnNumber: 29 }, this));
                }) }, void 0, false, { fileName: _jsxFileName, lineNumber: 101, columnNumber: 13 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 67, columnNumber: 13 }, this));
}
