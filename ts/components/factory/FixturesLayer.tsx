import type { Immutable } from "../../utils/types.ts"
import type { FieldState } from "../../types/field.ts"
import { FixtureView } from "./FixtureView.tsx"

interface FixturesLayerProps {
    fieldState: Immutable<FieldState>
    cellSize: number
}

export function FixturesLayer({ fieldState, cellSize }: FixturesLayerProps) {
    return (
        <g>
            {fieldState.pathFixtures.map(fixture => (
                <FixtureView
                    key={fixture.id}
                    fixture={fixture}
                    cellSize={cellSize}
                />
            ))}
        </g>
    )
}
