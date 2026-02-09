import type { ItemFlow } from "../../types/field.ts"
import { useLocalization } from "../../contexts/localization.tsx"
import type { ItemID } from "../../types/data.ts"
import { AlertTriangle, ArrowRight, Ban } from "lucide-react"

interface ItemFlowDisplayProps {
    flows: ReadonlyArray<ItemFlow>
    rateKey: "sourceRate" | "sinkRate"
    direction: 'input' | 'output'
    rateMultiplier?: number
    unitLabel?: string
    insufficientFlows?: Set<ItemID> // Items with insufficient flow rates
    bottleneckItem?: ItemID // The primary bottleneck item
    overSuppliedFlows?: Set<ItemID> // Items being supplied faster than facility can consume
}

export function ItemFlowDisplay({ flows, rateKey, direction, rateMultiplier = 1, unitLabel, insufficientFlows, bottleneckItem, overSuppliedFlows }: ItemFlowDisplayProps) {
    const loc = useLocalization()
    const resolvedUnitLabel = unitLabel ?? loc.ui.itemFlowUnits

    if (!flows.length) {
        return <div className="field-hud-value none">{loc.ui.none}</div>
    }

    return (
        <>
            {flows.map((flow, index) => {
                const isObstructed = flow.sourceRate > flow.sinkRate
                const isOverSupplied = overSuppliedFlows?.has(flow.item)
                const isInsufficient = insufficientFlows?.has(flow.item)
                const isBottleneck = bottleneckItem === flow.item
                const warningClass = isBottleneck ? "bottleneck" : isInsufficient ? "insufficient" : (isObstructed || isOverSupplied) ? "obstructed" : ""

                return (
                    <div key={`${flow.item}-${index}`} className={`field-hud-flow ${warningClass}`}>
                        {direction === 'input' ? <ArrowRight size={12} className="flow-direction-icon" /> : null}
                        <img
                            src={`images/${flow.item}.webp`}
                            alt={loc.getItemName(flow.item)}
                            className="field-hud-item-icon"
                        />
                        <span>
                            {loc.getItemName(flow.item)} • {(flow[rateKey] * rateMultiplier).toFixed(2)} {resolvedUnitLabel}
                            {isObstructed && (
                                <span className="flow-warning" title={loc.ui.flowPartiallyObstructed}>
                                    {" "}<AlertTriangle size={12} /> ({(flow.sinkRate * rateMultiplier).toFixed(2)}/{(flow.sourceRate * rateMultiplier).toFixed(2)})
                                </span>
                            )}
                            {isBottleneck && (
                                <span className="flow-warning bottleneck-indicator" title={loc.ui.primaryBottleneck}>
                                    {" "}<Ban size={12} />
                                </span>
                            )}
                            {isInsufficient && !isBottleneck && (
                                <span className="flow-warning insufficient-indicator" title={loc.ui.insufficientFlowRate}>
                                    {" "}<AlertTriangle size={12} />
                                </span>
                            )}
                        </span>
                        {direction === 'output' ? <ArrowRight size={12} className="flow-direction-icon" /> : null}
                    </div>
                )
            })}
        </>
    )
}
