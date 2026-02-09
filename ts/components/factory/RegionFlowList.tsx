import type { ItemFlow } from "../../types/field.ts"
import { useLocalization } from "../../contexts/localization.tsx"
import { ItemFlowDisplay } from "./ItemFlowDisplay.tsx"

interface RegionFlowListProps {
    title?: string
    flows: ReadonlyArray<ItemFlow>
    rateKey: "sourceRate" | "sinkRate"
    direction: 'input' | 'output'
}

export function RegionFlowList({ title, flows, rateKey, direction }: RegionFlowListProps) {
    const { ui } = useLocalization()

    return (
        <div className="region-flow-list">
            {title ? <div className="region-flow-title">{title}</div> : null}
            <ItemFlowDisplay
                flows={flows}
                rateKey={rateKey}
                direction={direction}
                rateMultiplier={60}
                unitLabel={ui.itemFlowUnitsPerMinute}
            />
        </div>
    )
}
