import type { Immutable } from "../../utils/types.ts"
import type { FieldFacility, FieldFacilityPort } from "../../types/field.ts"
import { PathTypeID } from "../../types/data.ts"
import { EditMode } from "../../types/editMode.ts"
import { useEdit } from "../../contexts/edit.tsx"
import { usePathEditing } from "../../contexts/pathEditing.tsx"
import { cn } from "../../utils/react.ts"

function getDirectionOffset(direction: string, offset: number): [number, number] {
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

function getArrowRotation(direction: string, isInput: boolean): number {
    const rotations: Record<string, number> = {
        up: 0,
        down: 180,
        left: 270,
        right: 90,
    }
    const baseRotation = rotations[direction] ?? 0
    return isInput ? baseRotation + 180 : baseRotation
}

interface PortViewProps {
    portID: string
    port: Immutable<FieldFacilityPort>
    facility: Immutable<FieldFacility>
    cellSize: number
}

export function PortView({ portID, port, facility, cellSize }: PortViewProps) {
    const { editMode, selectedIDs, selectEntity } = useEdit()
    const { startPathFromPortOrFixture, finishPathAtPortOrFixture } = usePathEditing()
    const x = (facility.x + port.x) * cellSize
    const y = (facility.y + port.y) * cellSize
    const centerX = x + cellSize / 2
    const centerY = y + cellSize / 2
    const hasConnection = Boolean(port.connectedPathID)
    const selected = selectedIDs.has(portID)

    const className = cn("port", {
        input: port.subType === "input",
        pipe: port.type === "pipe",
        depot: port.external === "depot",
        world: port.external === "world",
        connected: hasConnection,
        selected: selected,
    })

    const radius = 0.25 * cellSize
    const [offsetX, offsetY] = getDirectionOffset(port.direction, cellSize * 0.5)
    const arrowRotation = getArrowRotation(port.direction, port.subType === "input")
    // equilateral triangle
    const arrowSize = 0.3 * cellSize
    const arrowPoints = `${centerX + offsetX},${centerY + offsetY - arrowSize / Math.sqrt(3)} ${centerX + offsetX - arrowSize / 2},${centerY + offsetY + arrowSize / (2 * Math.sqrt(3))} ${centerX + offsetX + arrowSize / 2},${centerY + offsetY + arrowSize / (2 * Math.sqrt(3))}`

    function handleClick(e: React.MouseEvent) {
        e.stopPropagation()
        // Only allow selection in manipulate mode
        if (editMode === EditMode.MANIPULATE) {
            selectEntity(portID, e.shiftKey || e.ctrlKey || e.metaKey)
        }
    }

    function handleDoubleClick(e: React.MouseEvent) {
        e.stopPropagation()
        
        // Determine path type based on port type
        const pathType = port.type === 'pipe' ? PathTypeID.PIPE : PathTypeID.BELT
        
        // Get the port position in grid coordinates
        const gridX = facility.x + port.x
        const gridY = facility.y + port.y
        const position: [number, number] = [gridX, gridY]
        
        if (editMode === EditMode.PATH_EDITING) {
            // Finish the path at this port
            finishPathAtPortOrFixture(portID, position)
        } else {
            // Start a new path from this port
            startPathFromPortOrFixture(portID, position, pathType)
        }
    }

    return (
        <g onClick={handleClick} onDoubleClick={handleDoubleClick}>
            <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                className={className}
            />
            <polygon
                points={arrowPoints}
                fill={port.external === "depot" ? "#ff9800" : port.external === "world" ? "#6bd38a" : port.type === "pipe" ? "#42a5f5" : "#ffffff"}
                transform={`rotate(${arrowRotation} ${centerX + offsetX} ${centerY + offsetY})`}
            />
        </g>
    )
}
