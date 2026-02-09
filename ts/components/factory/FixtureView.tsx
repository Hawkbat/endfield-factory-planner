import { objectValues, tuple, type Immutable } from "../../utils/types.ts"
import type { FieldPathFixture } from "../../types/field.ts"
import { PathTypeID, PathFixtureID, type Direction } from "../../types/data.ts"
import { EditMode } from "../../types/editMode.ts"
import { useEdit } from "../../contexts/edit.tsx"
import { useDragging } from "../../contexts/dragging.tsx"
import { usePathEditing } from "../../contexts/pathEditing.tsx"
import { useLocalization } from "../../contexts/localization.tsx"
import { cn } from "../../utils/react.ts"
import { FixtureBehaviorType, pathFixtures } from "../../data/pathFixtures.ts"
import { Merge, Shuffle, Split, Wrench } from "lucide-react"

function getDirectionOffset(direction: Direction, offset: number): [number, number] {
    switch (direction) {
        case "up":
            return [0, -offset]
        case "down":
            return [0, offset]
        case "left":
            return [-offset, 0]
        case "right":
            return [offset, 0]
        default:
            return [0, 0]
    }
}

function getArrowRotation(direction: Direction, isInput: boolean): number {
    const rotations: Record<Direction, number> = {
        up: 0,
        down: 180,
        left: 270,
        right: 90,
    }
    const baseRotation = rotations[direction] ?? 0
    return isInput ? baseRotation + 180 : baseRotation
}

function rotateDirection(direction: Direction, degrees: number): Direction {
    const dirs: Direction[] = ['up', 'right', 'down', 'left']
    const currentIndex = dirs.indexOf(direction)
    const steps = (degrees / 90) % 4
    const newIndex = (currentIndex + steps + 4) % 4
    return dirs[newIndex]
}

interface FixtureViewProps {
    fixture: Immutable<FieldPathFixture>
    cellSize: number
}

export function FixtureView({ fixture, cellSize }: FixtureViewProps) {
    const loc = useLocalization()
    const { editMode, selectedIDs, selectEntity } = useEdit()
    const { handleDragStart, handleDragMove, handleDragEnd } = useDragging()
    const { startPathFromPortOrFixture, finishPathAtPortOrFixture } = usePathEditing()
    const x = fixture.x * cellSize
    const y = fixture.y * cellSize
    const centerX = x + cellSize / 2
    const centerY = y + cellSize / 2
    const selected = selectedIDs.has(fixture.id)
    
    const pointerEventsEnabled = editMode === EditMode.MANIPULATE
    
    // Get fixture definition to render side arrows
    const fixtureDef = pathFixtures[fixture.type]

    const hasError = objectValues(fixture.errorFlags ?? {}).some(flag => flag)
    const className = cn("fixture-box", {
        error: hasError,
        selected: selected,
        "pointer-events-none": !pointerEventsEnabled,
    })

    function handleClick(e: React.MouseEvent) {
        e.stopPropagation()
        // Only allow selection in manipulate mode
        if (editMode === EditMode.MANIPULATE) {
            selectEntity(fixture.id, e.shiftKey || e.ctrlKey || e.metaKey)
        }
    }

    function handleDoubleClick(e: React.MouseEvent) {
        e.stopPropagation()
        
        const position = tuple(fixture.x, fixture.y)
        
        if (editMode === EditMode.PATH_EDITING) {
            // Finish the path at this fixture
            finishPathAtPortOrFixture(fixture.id, position)
        } else {
            // Start a new path from this fixture
            startPathFromPortOrFixture(fixture.id, position, fixtureDef.pathType)
        }
    }

    function handlePointerDown(e: React.PointerEvent<SVGElement>) {
        if (e.button === 0) {
            handleDragStart(e, fixture.id)
        }
    }

    function handlePointerMove(e: React.PointerEvent<SVGElement>) {
        handleDragMove(e)
    }

    function handlePointerUp(e: React.PointerEvent<SVGElement>) {
        handleDragEnd(e)
    }

    return (
        <g
            className="fixture"
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            <rect
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                className={className}
            />
            
            <foreignObject
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                transform={`rotate(${fixture.rotation} ${centerX} ${centerY})`}
                className="fixture-icon"
            >
                {fixtureDef.behaviorType === FixtureBehaviorType.BRIDGE ? <Shuffle size={12} /> :
                fixtureDef.behaviorType === FixtureBehaviorType.SPLITTER ? <Split size={12} /> :
                fixtureDef.behaviorType === FixtureBehaviorType.CONVERGER ? <Merge size={12} /> :
                fixtureDef.behaviorType === FixtureBehaviorType.CONTROL_PORT ? <Wrench size={12} /> : null}
            </foreignObject>
            
            {/* Render arrows for each side */}
            {fixture.sides.map((side, index) => {
                // Apply fixture rotation to the side direction
                const rotatedDirection = side.direction
                const [offsetX, offsetY] = getDirectionOffset(rotatedDirection, cellSize * 0.45)
                const isInput = side.subType === 'input'
                const arrowRotation = getArrowRotation(rotatedDirection, isInput)
                const arrowSize = 0.25 * cellSize
                const arrowCenterX = centerX + offsetX
                const arrowCenterY = centerY + offsetY
                const arrowPoints = `${arrowCenterX},${arrowCenterY - arrowSize / Math.sqrt(3)} ${arrowCenterX - arrowSize / 2},${arrowCenterY + arrowSize / (2 * Math.sqrt(3))} ${arrowCenterX + arrowSize / 2},${arrowCenterY + arrowSize / (2 * Math.sqrt(3))}`
                const arrowColor = side.type === 'pipe' ? '#42a5f5' : '#ffffff'
                
                return (
                    <polygon
                        key={index}
                        points={arrowPoints}
                        fill={arrowColor}
                        transform={`rotate(${arrowRotation} ${arrowCenterX} ${arrowCenterY})`}
                    />
                )
            })}
        </g>
    )
}
