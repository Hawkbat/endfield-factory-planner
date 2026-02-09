import { objectValues, type Immutable } from "../../utils/types.ts"
import type { FieldFacility } from "../../types/field.ts"
import { facilities } from "../../data/facilities.ts"
import { useEdit } from "../../contexts/edit.tsx"
import { useDragging } from "../../contexts/dragging.tsx"
import { useLocalization } from "../../contexts/localization.tsx"
import { cn } from "../../utils/react.ts"
import { hasFacilityFlowIssues } from "../../game/flows.ts"
import { rotateDirection } from "../../game/directions.ts"
import { XCircle, AlertTriangle } from "lucide-react"

interface FacilityViewProps {
    facility: Immutable<FieldFacility>
    cellSize: number
}

export function FacilityView({ facility, cellSize }: FacilityViewProps) {
    const loc = useLocalization()
    const { selectedIDs, selectEntity } = useEdit()
    const { handleDragStart, handleDragMove, handleDragEnd } = useDragging()
    const x = facility.x * cellSize
    const y = facility.y * cellSize
    const width = facility.width * cellSize
    const height = facility.height * cellSize
    const label = loc.getFacilityName(facility.type)
    const requiresPower = Boolean(facilities[facility.type]?.power)
    const selected = selectedIDs.has(facility.id)

    const hasError = objectValues(facility.errorFlags ?? {}).some(flag => flag)
    const hasFlowWarning = !hasError && hasFacilityFlowIssues(facility)
    const className = cn("facility", {
        powered: facility.isPowered && !hasError,
        error: hasError,
        selected: selected,
    })

    const powerStatus = requiresPower
        ? (facility.isPowered ? loc.ui.powered : loc.ui.noPower)
        : ""

    function handleClick(e: React.MouseEvent) {
        e.stopPropagation()
        selectEntity(facility.id, e.shiftKey || e.ctrlKey || e.metaKey)
    }

    function handlePointerDown(e: React.PointerEvent<SVGElement>) {
        if (e.button === 0) {
            handleDragStart(e, facility.id)
        }
    }

    function handlePointerMove(e: React.PointerEvent<SVGElement>) {
        handleDragMove(e)
    }

    function handlePointerUp(e: React.PointerEvent<SVGElement>) {
        handleDragEnd(e)
    }

    const facilityDef = facilities[facility.type]
    const powerAreaDef = facilityDef?.powerArea
    // Power area is centered on the facility
    const powerAreaX = selected && powerAreaDef
        ? x + (width - powerAreaDef.width * cellSize) / 2
        : 0
    const powerAreaY = selected && powerAreaDef
        ? y + (height - powerAreaDef.height * cellSize) / 2
        : 0
    const powerAreaWidth = powerAreaDef ? powerAreaDef.width * cellSize : 0
    const powerAreaHeight = powerAreaDef ? powerAreaDef.height * cellSize : 0

    const irrigationAreaDef = facilityDef?.irrigationArea
    const rotationSteps = facility.rotation / 90
    const rotatedIrrigationSide = irrigationAreaDef
        ? rotateDirection(irrigationAreaDef.side, rotationSteps)
        : null
    const irrigationSize = irrigationAreaDef
        ? (rotationSteps % 2 === 0
            ? { width: irrigationAreaDef.width, height: irrigationAreaDef.height }
            : { width: irrigationAreaDef.height, height: irrigationAreaDef.width })
        : null

    const irrigationAreaX = selected && irrigationAreaDef && irrigationSize && rotatedIrrigationSide
        ? (() => {
            if (rotatedIrrigationSide === 'up' || rotatedIrrigationSide === 'down') {
                return x + (width - irrigationSize.width * cellSize) / 2
            }
            if (rotatedIrrigationSide === 'left') {
                return x - irrigationSize.width * cellSize
            }
            return x + width
        })()
        : 0
    const irrigationAreaY = selected && irrigationAreaDef && irrigationSize && rotatedIrrigationSide
        ? (() => {
            if (rotatedIrrigationSide === 'up') {
                return y - irrigationSize.height * cellSize
            }
            if (rotatedIrrigationSide === 'down') {
                return y + height
            }
            return y + (height - irrigationSize.height * cellSize) / 2
        })()
        : 0
    const irrigationAreaWidth = irrigationAreaDef && irrigationSize ? irrigationSize.width * cellSize : 0
    const irrigationAreaHeight = irrigationAreaDef && irrigationSize ? irrigationSize.height * cellSize : 0

    return (
        <g 
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {selected && powerAreaDef && (
                <rect
                    x={powerAreaX}
                    y={powerAreaY}
                    width={powerAreaWidth}
                    height={powerAreaHeight}
                    className="facility-power-area"
                />
            )}
            {selected && irrigationAreaDef && (
                <rect
                    x={irrigationAreaX}
                    y={irrigationAreaY}
                    width={irrigationAreaWidth}
                    height={irrigationAreaHeight}
                    className="facility-irrigation-area"
                />
            )}
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                className={className}
            />
            <foreignObject
                x={x + 2}
                y={y + 2}
                width={width - 4}
                height={height - 4}
                className="facility-text-container"
            >
                <div className="facility-text-wrapper">
                    <div className="facility-label">
                        {label}
                        {hasError && <span className="facility-error-indicator" title="Placement error"><XCircle size={12} /></span>}
                        {hasFlowWarning && <span className="facility-warning-indicator" title="Flow issues detected"><AlertTriangle size={12} /></span>}
                    </div>
                    {powerStatus && <div className="facility-sublabel">{powerStatus}</div>}
                </div>
            </foreignObject>
        </g>
    )
}
