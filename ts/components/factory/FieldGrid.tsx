import type { Immutable } from "../../utils/types.ts"
import type { FieldState } from "../../types/field.ts"

interface FieldGridProps {
    fieldState: Immutable<FieldState>
    cellSize: number
    onBackgroundClick?: (event: React.MouseEvent<SVGRectElement>) => void
    onBackgroundDoubleClick?: (event: React.MouseEvent<SVGRectElement>) => void
    onBackgroundPointerDown?: (event: React.PointerEvent<SVGRectElement>) => void
    onBackgroundPointerMove?: (event: React.PointerEvent<SVGRectElement>) => void
    onBackgroundPointerUp?: (event: React.PointerEvent<SVGRectElement>) => void
}

export function FieldGrid({
    fieldState,
    cellSize,
    onBackgroundClick,
    onBackgroundDoubleClick,
    onBackgroundPointerDown,
    onBackgroundPointerMove,
    onBackgroundPointerUp,
}: FieldGridProps) {
    const widthPx = fieldState.width * cellSize
    const heightPx = fieldState.height * cellSize
    const verticalLines = []
    const horizontalLines = []

    for (let x = 0; x <= fieldState.width; x++) {
        const xPos = x * cellSize
        verticalLines.push(
            <line
                key={`v-${x}`}
                x1={xPos}
                y1={0}
                x2={xPos}
                y2={heightPx}
                className="field-grid-line"
            />
        )
    }

    for (let y = 0; y <= fieldState.height; y++) {
        const yPos = y * cellSize
        horizontalLines.push(
            <line
                key={`h-${y}`}
                x1={0}
                y1={yPos}
                x2={widthPx}
                y2={yPos}
                className="field-grid-line"
            />
        )
    }

    return (
        <g>
            <rect
                x={0}
                y={0}
                width={widthPx}
                height={heightPx}
                className="field-grid-background"
                onClick={onBackgroundClick}
                onDoubleClick={onBackgroundDoubleClick}
                onPointerDown={onBackgroundPointerDown}
                onPointerMove={onBackgroundPointerMove}
                onPointerUp={onBackgroundPointerUp}
            />
            {verticalLines}
            {horizontalLines}
        </g>
    )
}
