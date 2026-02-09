import type { FieldState, FieldFacility } from "../types/field.ts"
import { facilities } from "../data/facilities.ts"
import { recipes } from "../data/recipes.ts"
import type { Immutable } from "../utils/types.ts"

/**
 * Calculate the power area for a power-generating facility.
 * @param facility Facility to calculate power area for
 * @returns Power area bounds or null if facility doesn't generate power
 */
export function calculatePowerArea(
    facility: Immutable<FieldFacility>
): { minX: number, maxX: number, minY: number, maxY: number } | null {
    const facilityDef = facilities[facility.type]
    
    if (!facilityDef.powerArea) {
        return null
    }
    
    // Power area is centered on the facility
    const centerX = facility.x + facility.width / 2
    const centerY = facility.y + facility.height / 2
    
    const minX = centerX - facilityDef.powerArea.width / 2
    const maxX = centerX + facilityDef.powerArea.width / 2
    const minY = centerY - facilityDef.powerArea.height / 2
    const maxY = centerY + facilityDef.powerArea.height / 2
    
    return { minX, maxX, minY, maxY }
}

/**
 * Check if a facility is within a power area (has area overlap, not just edge touching).
 * @param facility Facility to check
 * @param powerArea Power area bounds
 * @returns True if facility overlaps with power area
 */
export function isFacilityInPowerArea(
    facility: Immutable<FieldFacility>,
    powerArea: { minX: number, maxX: number, minY: number, maxY: number }
): boolean {
    const facilityMinX = facility.x
    const facilityMaxX = facility.x + facility.width - 1
    const facilityMinY = facility.y
    const facilityMaxY = facility.y + facility.height - 1
    
    // Check if there's area overlap (not just edge touching)
    // Overlap exists if ranges intersect
    const xOverlap = facilityMinX < powerArea.maxX && facilityMaxX > powerArea.minX
    const yOverlap = facilityMinY < powerArea.maxY && facilityMaxY > powerArea.minY
    
    return xOverlap && yOverlap
}

/**
 * Update powered state for a single facility.
 * @param facility Facility to update
 * @param fieldState Current field state
 * @returns Updated facility with powered state
 */
export function updateFacilityPoweredState(
    facility: Immutable<FieldFacility>,
    fieldState: Immutable<FieldState>
): Immutable<FieldFacility> {
    const facilityDef = facilities[facility.type]
    
    // If facility doesn't require power, it's always powered
    if (!facilityDef.power) {
        return {
            ...facility,
            isPowered: true
        }
    }
    
    // Check if facility is in any power area
    for (const powerFacility of fieldState.facilities) {
        const powerArea = calculatePowerArea(powerFacility)
        
        if (powerArea && isFacilityInPowerArea(facility, powerArea)) {
            return {
                ...facility,
                isPowered: true
            }
        }
    }
    
    // No power area found
    return {
        ...facility,
        isPowered: false
    }
}

/**
 * Update powered state for all facilities in the field.
 * @param fieldState Current field state
 * @returns Updated field state with all powered states recalculated
 */
export function updateAllFacilityPowerStates(fieldState: Immutable<FieldState>): Immutable<FieldState> {
    const updatedFacilities = fieldState.facilities.map(facility => 
        updateFacilityPoweredState(facility, fieldState)
    )
    
    return {
        ...fieldState,
        facilities: updatedFacilities
    }
}

/**
 * Calculate total power generation and consumption for the field.
 * @param fieldState Current field state
 * @returns Power generated and consumed in kW/h
 */
export function calculatePowerStats(fieldState: Immutable<FieldState>): { generated: number, consumed: number } {
    let generated = 0
    let consumed = 0
    
    for (const facility of fieldState.facilities) {
        if (!facility.isPowered) {
            continue
        }
        
        const facilityDef = facilities[facility.type]
        
        // Check if facility generates power (active recipe with powerOutput)
        if (facility.actualRecipe) {
            const recipe = recipes[facility.actualRecipe]
            if (recipe && recipe.powerOutput) {
                // Power generation scales with input flow rate
                // If inputs are throttled, power generation is proportionally reduced
                // throttleFactor represents the fraction of recipe inputs being met (0.0 to 1.0)
                const powerGenerated = recipe.powerOutput * (facility.throttleFactor ?? 1.0)
                generated += powerGenerated
            }
        }
        
        // Check if facility consumes power
        if (facilityDef.power) {
            consumed += facilityDef.power
        }
    }
    
    return { generated, consumed }
}
