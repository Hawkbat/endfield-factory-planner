import type { Recipe } from "../../types/data.ts"
import { useLocalization } from "../../contexts/localization.tsx"
import { ItemFlowDisplay } from "./ItemFlowDisplay.tsx"
import type { ItemFlow } from "../../types/field.ts"
import { objectEntries } from "../../utils/types.ts"
import { ArrowDown } from "lucide-react"

interface RecipeDisplayProps {
    recipe: Recipe
}

export function RecipeDisplay({ recipe }: RecipeDisplayProps) {
    const loc = useLocalization()

    const inputs = objectEntries(recipe.inputs).map<ItemFlow>(([item, count]) => ({
        item,
        sourceRate: count / recipe.time,
        sinkRate: count / recipe.time,
    }))

    const outputs = objectEntries(recipe.outputs).map<ItemFlow>(([item, count]) => ({
        item,
        sourceRate: count / recipe.time,
        sinkRate: count / recipe.time,
    }))

    return (
        <div className="field-hud-recipe">
            <div className="field-hud-recipe-section">
                <div><strong>{loc.ui.inputs}:</strong></div>
                <ItemFlowDisplay flows={inputs} rateKey="sourceRate" direction="input" />
            </div>
            <div className="field-hud-recipe-arrow"><ArrowDown size={20} /></div>
            <div className="field-hud-recipe-section">
                <div><strong>{loc.ui.outputs}:</strong></div>
                {outputs.length > 0 || !recipe.powerOutput ? <ItemFlowDisplay flows={outputs} rateKey="sourceRate" direction="output" /> : null}
                {recipe.powerOutput ? (
                    <div><strong>{loc.ui.powerGenerated}:</strong> {recipe.powerOutput} {loc.ui.powerFlowUnits}</div>
                ) : null}
            </div>
        </div>
    )
}
