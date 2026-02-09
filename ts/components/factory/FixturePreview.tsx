import { PathFixtureID, type Direction } from "../../types/data.ts"
import { FixtureBehaviorType, pathFixtures } from "../../data/pathFixtures.ts"
import { cn } from "../../utils/react.ts"
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

interface FixturePreviewProps {
    fixtureType: PathFixtureID
    position: [number, number]
    rotation: number
    cellSize: number
    isValid: boolean
}

export function FixturePreview({ fixtureType, position, rotation, cellSize, isValid }: FixturePreviewProps) {
    const fixtureDef = pathFixtures[fixtureType]
    if (!fixtureDef) {
        return null
    }

    const x = position[0] * cellSize
    const y = position[1] * cellSize
    const centerX = x + cellSize / 2
    const centerY = y + cellSize / 2

    const className = cn("fixture-preview", {
        "fixture-preview-valid": isValid,
        "fixture-preview-invalid": !isValid
    })

    return (
        <g className={className}>
            {/* Background square */}
            <rect
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                className="fixture-preview-background"
                opacity={0.5}
            />
            <foreignObject
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                transform={`rotate(${rotation} ${centerX} ${centerY})`}
                className="fixture-icon"
            >
                {fixtureDef.behaviorType === FixtureBehaviorType.BRIDGE ? <Shuffle size={12} /> :
                fixtureDef.behaviorType === FixtureBehaviorType.SPLITTER ? <Split size={12} /> :
                fixtureDef.behaviorType === FixtureBehaviorType.CONVERGER ? <Merge size={12} /> :
                fixtureDef.behaviorType === FixtureBehaviorType.CONTROL_PORT ? <Wrench size={12} /> : null}
            </foreignObject>
            
            {/* Render arrows for each side */}
            {fixtureDef.sides.map((side, index) => {
                // Apply fixture rotation to the side direction
                const rotatedDirection = rotateDirection(side.direction, rotation)
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
                        opacity={0.7}
                    />
                )
            })}
        </g>
    )
}

