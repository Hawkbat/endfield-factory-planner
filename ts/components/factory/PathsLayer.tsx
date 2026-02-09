import type { Immutable } from '../../utils/types.ts'
import type { FieldState } from "../../types/field.ts"
import { PathView } from './PathView.tsx'

interface PathsLayerProps {
    fieldState: Immutable<FieldState>
    cellSize: number
}

export function PathsLayer({ fieldState, cellSize }: PathsLayerProps) {
    return (
        <g>
            {fieldState.paths.map(path => (
                <PathView
                    key={path.id}
                    path={path}
                    cellSize={cellSize}
                />
            ))}
        </g>
    )
}
