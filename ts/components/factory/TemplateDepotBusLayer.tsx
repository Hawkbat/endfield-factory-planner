import type { Immutable } from "../../utils/types.ts"
import type { FieldState } from "../../types/field.ts"
import { resolveFieldTemplate } from "../../data/templates.ts"
import { getTemplateDepotBusCells } from "../../game/templateRules.ts"

interface TemplateDepotBusLayerProps {
    fieldState: Immutable<FieldState>
    cellSize: number
}

export function TemplateDepotBusLayer({ fieldState, cellSize }: TemplateDepotBusLayerProps) {
    const template = resolveFieldTemplate(fieldState.template)
    const { ports, sections } = getTemplateDepotBusCells(template, fieldState.width, fieldState.height)

    if (ports.length === 0 && sections.length === 0) {
        return null
    }

    return (
        <g className="template-depot-bus">
            {sections.map((section, index) => (
                <rect
                    key={`section-${index}`}
                    x={section.x * cellSize}
                    y={section.y * cellSize}
                    width={section.width * cellSize}
                    height={section.height * cellSize}
                    className="template-depot-bus-section"
                />
            ))}
            {ports.map((port, index) => (
                <rect
                    key={`port-${index}`}
                    x={port.x * cellSize}
                    y={port.y * cellSize}
                    width={port.width * cellSize}
                    height={port.height * cellSize}
                    className="template-depot-bus-port"
                />
            ))}
        </g>
    )
}
