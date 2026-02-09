import type { Immutable } from "../../utils/types.ts"
import type { FieldState } from "../../types/field.ts"
import { FacilityView } from "./FacilityView.tsx"

interface FacilitiesLayerProps {
    fieldState: Immutable<FieldState>
    cellSize: number
}

export function FacilitiesLayer({ fieldState, cellSize }: FacilitiesLayerProps) {
    return (
        <g>
            {fieldState.facilities.map(facility => (
                <FacilityView
                    key={facility.id}
                    facility={facility}
                    cellSize={cellSize}
                />
            ))}
        </g>
    )
}
