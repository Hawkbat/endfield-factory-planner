import type { FieldState } from "../../types/field.ts"
import type { Immutable } from "../../utils/types.ts"
import { PortView } from "./PortView.tsx"

interface PortsLayerProps {
    fieldState: Immutable<FieldState>
    cellSize: number
}

export function PortsLayer({ fieldState, cellSize }: PortsLayerProps) {

    return (
        <g>
            {fieldState.facilities.flatMap(facility => facility.ports.map((port, index) => (
                <PortView
                    key={`${facility.id}-port-${index}`}
                    portID={`${facility.id}:${index}`}
                    port={port}
                    facility={facility}
                    cellSize={cellSize}
                />
            )))}
        </g>
    )
}
