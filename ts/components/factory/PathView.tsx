import { objectValues, type Immutable } from "../../utils/types.ts"
import type { FieldPath } from "../../types/field.ts"
import { cn } from "../../utils/react.ts"
import { useEdit } from "../../contexts/edit.tsx"
import { useDragging } from "../../contexts/dragging.tsx"
import { usePathEditing } from "../../contexts/pathEditing.tsx"
import { EditMode } from "../../types/editMode.ts"
import { PathTypeID } from "../../types/data.ts"

interface PathViewProps {
    path: Immutable<FieldPath>
    cellSize: number
}

function toPixel(point: Immutable<[number, number]>, cellSize: number): [number, number] {
    return [point[0] * cellSize + cellSize / 2, point[1] * cellSize + cellSize / 2]
}

export function PathView({ path, cellSize }: PathViewProps) {
    const { editMode, selectedIDs, selectEntity } = useEdit()
    const { handleDragStart, handleDragMove, handleDragEnd } = useDragging()
    const { resumePathFromEnd } = usePathEditing()
    const selected = selectedIDs.has(path.id)
    const isEditingPath = editMode === EditMode.PATH_EDITING
    const pointerEventsEnabled = editMode === EditMode.MANIPULATE

    const points = path.points.map(point => toPixel(point, cellSize))
    const pointsAttr = points.map(([x, y]) => `${x},${y}`).join(" ")

    const error = path.errorFlags && objectValues(path.errorFlags).find(v => !!v)
    const blocked = path.flowDirection === "blocked" && !error
    const disconnected = path.errorFlags?.nothingConnected
    const totalSinkRate = path.flows.reduce((sum, flow) => sum + flow.sinkRate, 0)
    const flowActive = !blocked && !path.errorFlags?.nothingConnected && totalSinkRate > 0
    const maxRate = path.type === PathTypeID.BELT ? 0.5 : 2
    const pathSize = path.type === PathTypeID.BELT ? cellSize * 0.75 : cellSize * 0.4
    const dashSize =  path.type === PathTypeID.BELT ? cellSize * 0.5 : cellSize * 0.3
    const clampedRate = Math.min(Math.max(totalSinkRate, 0.0001), maxRate)
    const baseGap = cellSize
    const gapLength = baseGap * (maxRate / clampedRate)
    const dashShift = cellSize * gapLength
    const dashDuration = cellSize / clampedRate

    const baseClassName = cn("path-base", {
        blocked,
        error,
        disconnected,
        selected,
        flowing: flowActive,
        belt: path.type === PathTypeID.BELT,
        pipe: path.type === PathTypeID.PIPE,
    })
    const className = cn("path", {
        blocked,
        error,
        disconnected,
        selected,
        flowing: flowActive,
        belt: path.type === PathTypeID.BELT,
        pipe: path.type === PathTypeID.PIPE,
    })

    function handleClick(e: React.MouseEvent) {
        e.stopPropagation()
        selectEntity(path.id, e.shiftKey || e.ctrlKey || e.metaKey)
    }

    function handlePointerDown(e: React.PointerEvent<SVGElement>) {
        if (e.button === 0) {
            handleDragStart(e, path.id)
        }
    }

    function handlePointerMove(e: React.PointerEvent<SVGElement>) {
        handleDragMove(e)
    }

    function handlePointerUp(e: React.PointerEvent<SVGElement>) {
        handleDragEnd(e)
    }

    function handleEndpointDoubleClick(e: React.MouseEvent, fromStart: boolean) {
        e.stopPropagation()
        if (editMode === EditMode.MANIPULATE) {
            resumePathFromEnd(path.id, fromStart)
        }
    }

    return (
        <g>
            <g 
                onClick={handleClick}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{ pointerEvents: pointerEventsEnabled ? 'auto' : 'none' }}
            >
                <polyline
                    points={pointsAttr}
                    className={baseClassName}
                    style={{
                        strokeWidth: pathSize,
                    } as React.CSSProperties}
                />
                {flowActive ? <polyline
                    points={pointsAttr}
                    className={className}
                    style={{
                        strokeDasharray: `0px ${gapLength}`,
                        strokeWidth: dashSize,
                        animationDirection: path.flowDirection === "end-to-start" ? "reverse" : "normal",
                        ["--dash-duration"]: `${dashDuration}s`,
                        ["--dash-shift"]: `${dashShift}px`,
                    } as React.CSSProperties}
                /> : null}
            </g>
            {(selected || isEditingPath) && (
                <>
                    <circle
                        cx={points[0]?.[0]}
                        cy={points[0]?.[1]}
                        r={4}
                        className={cn("path-endpoint", { selected })}
                        style={{ 
                            cursor: editMode === EditMode.MANIPULATE ? 'pointer' : 'default',
                            pointerEvents: editMode === EditMode.MANIPULATE ? 'auto' : 'none'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => handleEndpointDoubleClick(e, true)}
                    />
                    <circle
                        cx={points[points.length - 1]?.[0]}
                        cy={points[points.length - 1]?.[1]}
                        r={4}
                        className={cn("path-endpoint", { selected })}
                        style={{ 
                            cursor: editMode === EditMode.MANIPULATE ? 'pointer' : 'default',
                            pointerEvents: editMode === EditMode.MANIPULATE ? 'auto' : 'none'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => handleEndpointDoubleClick(e, false)}
                    />
                </>
            )}
        </g>
    )
}
