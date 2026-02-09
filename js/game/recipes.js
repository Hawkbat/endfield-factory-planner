import { recipes } from "../data/recipes.js";
import { facilities } from "../data/facilities.js";
import { objectEntries, objectKeys } from "../utils/types.js";
/**
 * Get all input item types being received by a facility (items with non-zero flow).
 * @param facility Facility to check
 * @returns Set of item IDs being input
 */
export function getInputItemsForFacility(facility) {
    const inputItems = new Set();
    for (const port of facility.ports) {
        if (port.subType === 'input') {
            for (const flow of port.flows) {
                if (flow.sourceRate > 0) {
                    inputItems.add(flow.item);
                }
            }
        }
    }
    return inputItems;
}
/**
 * Find a recipe that matches the facility type and input items.
 * @param facility Facility to find recipe for
 * @param inputItems Set of input item IDs
 * @param warnings Optional array to collect warnings
 * @returns Recipe ID if found, null otherwise
 */
export function findMatchingRecipe(facility, inputItems, warnings) {
    const facilityDef = facilities[facility.type];
    // Convert input items set to sorted array for comparison
    const inputItemsArray = Array.from(inputItems).sort();
    let matchedRecipe = null;
    let matchCount = 0;
    // Search through all recipes
    for (const [recipeID, recipe] of objectEntries(recipes)) {
        // Check if recipe matches facility type
        if (recipe.facilityID !== facility.type) {
            continue;
        }
        // Get recipe input items
        const recipeInputs = objectKeys(recipe.inputs).sort();
        // Check if input items match exactly
        if (recipeInputs.length !== inputItemsArray.length) {
            continue;
        }
        let allMatch = true;
        for (let i = 0; i < recipeInputs.length; i++) {
            if (recipeInputs[i] !== inputItemsArray[i]) {
                allMatch = false;
                break;
            }
        }
        if (allMatch) {
            matchCount++;
            const currentRecipe = recipeID;
            if (matchCount > 1 && warnings) {
                // Find existing warning for this facility or create new one
                let warning = warnings.find(w => w.facilityId === facility.id);
                if (!warning) {
                    warning = { facilityId: facility.id, matchingRecipes: [matchedRecipe] };
                    warnings.push(warning);
                }
                warning.matchingRecipes.push(currentRecipe);
            }
            matchedRecipe = currentRecipe;
        }
    }
    return matchedRecipe;
}
/**
 * Check if a recipe can be activated on a facility.
 * @param recipe Recipe to check
 * @param facility Facility to check
 * @returns True if recipe can activate
 */
export function canRecipeActivate(recipe, facility) {
    // Facility must be powered (or not require power)
    if (!facility.isPowered) {
        return false;
    }
    // All required input items must have non-zero incoming flow
    const inputItems = getInputItemsForFacility(facility);
    for (const requiredItem of objectKeys(recipe.inputs)) {
        if (!inputItems.has(requiredItem)) {
            return false;
        }
    }
    return true;
}
/**
 * Check if a facility should use its jump-start recipe.
 * @param facility Facility to check
 * @returns True if jump-start should be used
 */
export function shouldUseJumpStart(facility) {
    if (!facility.jumpStartRecipe || !facility.setRecipe) {
        return false;
    }
    // Jump-start is only used if there are no active input flows
    const inputItems = getInputItemsForFacility(facility);
    return inputItems.size === 0;
}
/**
 * Update recipe for a single facility based on its inputs.
 * @param facility Facility to update
 * @param fieldState Current field state (for context)
 * @param warnings Optional array to collect warnings
 * @returns Updated facility with recipe set
 */
export function updateFacilityRecipe(facility, warnings) {
    // If facility has a player-set recipe, activate it
    if (facility.setRecipe) {
        // Check if jump-start should be used
        if (shouldUseJumpStart(facility)) {
            // For jump-start recipes, only check if facility is powered (inputs will be bypassed)
            if (!facility.isPowered) {
                return {
                    ...facility,
                    actualRecipe: null
                };
            }
            return {
                ...facility,
                actualRecipe: facility.setRecipe
            };
        }
        // Not using jump-start, just use the set recipe directly
        return {
            ...facility,
            actualRecipe: facility.setRecipe
        };
    }
    // Find matching recipe based on inputs
    const inputItems = getInputItemsForFacility(facility);
    if (inputItems.size === 0) {
        // No inputs, no recipe
        return {
            ...facility,
            actualRecipe: null
        };
    }
    const matchedRecipeID = findMatchingRecipe(facility, inputItems, warnings);
    if (!matchedRecipeID) {
        // No matching recipe found
        return {
            ...facility,
            actualRecipe: null
        };
    }
    // Check if matched recipe can activate
    const recipe = recipes[matchedRecipeID];
    const canActivate = canRecipeActivate(recipe, facility);
    return {
        ...facility,
        actualRecipe: canActivate ? matchedRecipeID : null
    };
}
/**
 * Update recipes for all facilities in the field.
 * @param fieldState Current field state
 * @returns Updated field state with all recipes determined and array of warnings
 */
export function updateAllFacilityRecipes(fieldState) {
    const warnings = [];
    const updatedFacilities = fieldState.facilities.map(facility => updateFacilityRecipe(facility, warnings));
    return {
        state: {
            ...fieldState,
            facilities: updatedFacilities
        },
        warnings
    };
}
