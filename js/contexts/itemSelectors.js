import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/contexts/itemSelectors.tsx";
import { createContext, useContext, useState } from "react";
import { FacilityCategory, FacilityID, PathTypeID } from "../types/data.js";
import { useEdit } from "./edit.js";
import { EditMode } from "../types/editMode.js";
import { useLocalization } from "./localization.js";
import { facilities } from "../data/facilities.js";
import { recipes } from "../data/recipes.js";
import { items } from "../data/items.js";
import { pathFixtures } from "../data/pathFixtures.js";
const ItemSelectorsContext = createContext(null);
export function useItemSelectors() {
    const context = useContext(ItemSelectorsContext);
    if (!context) {
        throw new Error("useItemSelectors must be used within ItemSelectorsProvider");
    }
    return context;
}
export function ItemSelectorsProvider({ children }) {
    const [controlPortItemSelectorOpen, setControlPortItemSelectorOpen] = useState(false);
    const [portItemSelectorOpen, setPortItemSelectorOpen] = useState(false);
    const [facilityItemSelectorOpen, setFacilityItemSelectorOpen] = useState(false);
    const [recipeSelectorOpen, setRecipeSelectorOpen] = useState(false);
    const [controlPortSelection, setControlPortSelection] = useState(null);
    const [portSelection, setPortSelection] = useState(null);
    const [facilityRecipeSelection, setFacilityRecipeSelection] = useState(null);
    // Store grid position for facility placement if set by shortcut
    const [facilityPlacementGrid, setFacilityPlacementGrid] = useState(null);
    const { editMode, fieldState, handleChange } = useEdit();
    const { getFacilityCategoryName } = useLocalization();
    // Control port item selector functions
    function openControlPortItemSelector(fixtureID, currentItemID) {
        setControlPortSelection({ fixtureID, currentItemID });
        setControlPortItemSelectorOpen(true);
    }
    function closeControlPortItemSelector() {
        setControlPortItemSelectorOpen(false);
        setControlPortSelection(null);
    }
    function handleControlPortItemSelect(itemID) {
        if (controlPortSelection) {
            const change = {
                type: 'set-fixture-item',
                fixtureID: controlPortSelection.fixtureID,
                itemID: itemID
            };
            handleChange(change);
        }
        closeControlPortItemSelector();
    }
    function filterControlPortItems(itemID) {
        if (!controlPortSelection) {
            return true;
        }
        const fixture = fieldState.pathFixtures.find(f => f.id === controlPortSelection.fixtureID);
        if (!fixture) {
            return true;
        }
        const fixtureDef = pathFixtures[fixture.type];
        const isFluidItem = items[itemID]?.fluid === true;
        if (fixtureDef?.pathType === PathTypeID.PIPE) {
            return isFluidItem;
        }
        return !isFluidItem;
    }
    function handleControlPortClick(fixtureID, currentItemID) {
        if (editMode !== EditMode.MANIPULATE) {
            return;
        }
        openControlPortItemSelector(fixtureID, currentItemID);
    }
    // Facility port item selector functions
    function openPortItemSelector(facilityID, portIndex, currentItemID) {
        setPortSelection({ facilityID, portIndex, currentItemID });
        setPortItemSelectorOpen(true);
    }
    function closePortItemSelector() {
        setPortItemSelectorOpen(false);
        setPortSelection(null);
    }
    function handlePortItemSelect(itemID) {
        if (portSelection) {
            const change = {
                type: 'set-port-item',
                facilityID: portSelection.facilityID,
                portIndex: portSelection.portIndex,
                itemID: itemID
            };
            handleChange(change);
        }
        closePortItemSelector();
    }
    function filterPortItems(itemID) {
        if (!portSelection) {
            return true;
        }
        const facility = fieldState.facilities.find(f => f.id === portSelection.facilityID);
        if (!facility) {
            return true;
        }
        const port = facility.ports[portSelection.portIndex];
        if (!port || port.subType !== 'output') {
            return false;
        }
        const isFluidItem = items[itemID]?.fluid === true;
        if (port.type === 'pipe') {
            return isFluidItem;
        }
        if (port.type === 'belt') {
            return !isFluidItem;
        }
        return true;
    }
    function handlePortClick(facilityID, portIndex, currentItemID) {
        if (editMode !== EditMode.MANIPULATE) {
            return;
        }
        openPortItemSelector(facilityID, portIndex, currentItemID);
    }
    // Facility placement selector functions
    function openFacilityItemSelector(gridPoint) {
        setFacilityPlacementGrid(gridPoint ?? null);
        setFacilityItemSelectorOpen(true);
    }
    function openFacilityItemSelectorAtGrid(gridPoint) {
        openFacilityItemSelector(gridPoint);
    }
    function closeFacilityItemSelector() {
        setFacilityItemSelectorOpen(false);
        setFacilityPlacementGrid(null);
    }
    function handleFacilityItemSelect(itemID, svgRef, pan, zoom, cellSize) {
        closeFacilityItemSelector();
        if (itemID) {
            const facilityID = itemID;
            const facilityDef = facilities[facilityID];
            if (facilityDef) {
                let position;
                if (facilityPlacementGrid) {
                    // Use grid position from shortcut
                    position = [facilityPlacementGrid[0], facilityPlacementGrid[1]];
                }
                else {
                    // Place facility at center of current view
                    if (!svgRef.current) {
                        return;
                    }
                    const rect = svgRef.current.getBoundingClientRect();
                    const clientX = (rect.left + rect.right) / 2;
                    const clientY = (rect.top + rect.bottom) / 2;
                    // Convert to grid coordinates
                    const worldX = (clientX - rect.left - pan.x) / zoom;
                    const worldY = (clientY - rect.top - pan.y) / zoom;
                    const gridX = worldX / cellSize;
                    const gridY = worldY / cellSize;
                    position = [Math.round(gridX), Math.round(gridY)];
                }
                const placeChange = {
                    type: 'add-facility',
                    facilityType: facilityID,
                    position,
                    rotation: 0,
                };
                handleChange(placeChange);
            }
        }
    }
    function filterFacilityItems(itemID) {
        const facilityID = itemID;
        const facilityDef = facilities[facilityID];
        return facilityDef && !facilityDef.notImplementedYet;
    }
    function groupFacilityItems(itemID) {
        const facilityID = itemID;
        const facilityDef = facilities[facilityID];
        if (!facilityDef)
            return getFacilityCategoryName(FacilityCategory.MISC);
        return getFacilityCategoryName(facilityDef.category);
    }
    // Recipe selector functions
    function openRecipeSelector(facilityID, currentRecipeID, currentJumpStart) {
        setFacilityRecipeSelection({ facilityID, currentRecipeID, currentJumpStart });
        setRecipeSelectorOpen(true);
    }
    function closeRecipeSelector() {
        setRecipeSelectorOpen(false);
        setFacilityRecipeSelection(null);
    }
    function handleRecipeSelect(recipeID, jumpStart) {
        if (facilityRecipeSelection) {
            const change = {
                type: 'set-facility-recipe',
                facilityID: facilityRecipeSelection.facilityID,
                recipeID: recipeID,
                jumpStart: jumpStart ?? facilityRecipeSelection.currentJumpStart
            };
            handleChange(change);
        }
        closeRecipeSelector();
    }
    function filterRecipesForFacility(recipeID) {
        if (!facilityRecipeSelection)
            return false;
        const facility = fieldState.facilities.find(f => f.id === facilityRecipeSelection.facilityID);
        if (!facility)
            return false;
        const recipe = recipes[recipeID];
        return recipe.facilityID === facility.type;
    }
    function handleFacilityRecipeClick(facilityID, currentRecipeID) {
        if (editMode !== EditMode.MANIPULATE) {
            return;
        }
        const facility = fieldState.facilities.find(f => f.id === facilityID);
        if (!facility)
            return;
        openRecipeSelector(facilityID, currentRecipeID || facility.setRecipe, facility.jumpStartRecipe ?? false);
    }
    function handlePlace() {
        // Only allow placement in manipulate mode
        if (editMode !== EditMode.MANIPULATE) {
            return;
        }
        openFacilityItemSelector();
    }
    const value = {
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
    };
    return (_jsxDEV(ItemSelectorsContext.Provider, { value: value, children: children }, void 0, false, { fileName: _jsxFileName, lineNumber: 341, columnNumber: 13 }, this));
}
