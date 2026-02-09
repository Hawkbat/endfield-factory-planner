import { useMemo } from "react"
import { regionFields, regionResourceSupplies } from "../../data/regions.ts"
import { resolveFieldTemplate } from "../../data/templates.ts"
import { useLocalization } from "../../contexts/localization.tsx"
import { useRegionPlan } from "../../contexts/regionPlan.tsx"
import { useEdit } from "../../contexts/edit.tsx"
import { createStateFromChanges } from "../../game/sampleField.ts"
import { FieldTemplateID, ItemID, RegionID } from "../../types/data.ts"
import { loadProject } from "../../utils/projectStorage.ts"
import { ModalShell } from "../common/ModalShell.tsx"
import type { ItemFlow } from "../../types/field.ts"
import { RegionFlowList } from "./RegionFlowList.tsx"
import { RegionSelector } from "./RegionSelector.tsx"
import { buildRegionAssignments } from "../../utils/regionAssignments.ts"
import { SectionHeader } from "../common/SectionHeader.tsx"

export function RegionPlanModal() {
    const { ui, getItemName, getFactoryRoleName, getRegionFieldName } = useLocalization()
    const { region, setRegion, assignments, setAssignment, isRegionPlanOpen, closeRegionPlan } = useRegionPlan()
    const { projectListing } = useEdit()

    const { assignedGuids } = useMemo(
        () => buildRegionAssignments(region, assignments, projectListing),
        [region, assignments, projectListing]
    )

    const projectOptions = useMemo(() => {
        return projectListing
            .map((projectMeta) => {
                const project = loadProject(projectMeta.guid)
                if (!project) {
                    return null
                }
                const template = resolveFieldTemplate(project.template)
                const templateId = typeof project.template === "string" ? project.template : null
                return {
                    guid: projectMeta.guid,
                    name: projectMeta.name || ui.projectDefaultName,
                    region: template.region,
                    templateId,
                    hidden: projectMeta.hidden ?? false,
                }
            })
            .filter((entry): entry is { guid: string, name: string, region: RegionID, templateId: FieldTemplateID | null, hidden: boolean } => Boolean(entry))
            .filter((entry) => entry.region === region)
            .sort((a, b) => a.name.localeCompare(b.name))
    }, [projectListing, region, ui.projectDefaultName])

    const regionFlowSummary = useMemo(() => {
        const inputTotals = new Map<ItemID, number>()
        const outputTotals = new Map<ItemID, number>()

        const projectLookup = new Map(projectListing.map((project) => [project.guid, project]))

        for (const assignment of assignments) {
            if (!assignment.projectGuid) {
                continue
            }
            const meta = projectLookup.get(assignment.projectGuid)
            if (!meta) {
                continue
            }
            const project = loadProject(meta.guid)
            if (!project) {
                continue
            }
            const template = resolveFieldTemplate(project.template)
            if (template.region !== region) {
                continue
            }
            const state = createStateFromChanges(project.changes, project.template)
            for (const flow of state.depot.inputFlows) {
                inputTotals.set(flow.item, (inputTotals.get(flow.item) ?? 0) + flow.sinkRate)
            }
            for (const flow of state.depot.outputFlows) {
                outputTotals.set(flow.item, (outputTotals.get(flow.item) ?? 0) + flow.sourceRate)
            }
        }

        const factoryInputs: ItemFlow[] = Array.from(inputTotals.entries())
            .map(([item, sinkRate]) => ({ item, sinkRate, sourceRate: sinkRate }))
            .sort((a, b) => getItemName(a.item).localeCompare(getItemName(b.item)))
        const factoryOutputs: ItemFlow[] = Array.from(outputTotals.entries())
            .map(([item, sourceRate]) => ({ item, sinkRate: sourceRate, sourceRate }))
            .sort((a, b) => getItemName(a.item).localeCompare(getItemName(b.item)))
        const worldInputs: ItemFlow[] = regionResourceSupplies[region]
            .map((supply) => ({
                item: supply.item,
                sinkRate: supply.ratePerMinute / 60,
                sourceRate: supply.ratePerMinute / 60,
            }))

        return {
            factoryInputs,
            factoryOutputs,
            worldInputs,
        }
    }, [assignments, projectListing, region, getItemName])

    if (!isRegionPlanOpen) {
        return null
    }

    return (
        <ModalShell
            isOpen={isRegionPlanOpen}
            onClose={closeRegionPlan}
            className="region-plan-modal modal-panel"
        >
            <SectionHeader
                className="section-header"
                titleClassName="region-plan-title section-title"
                descriptionClassName="region-plan-description section-description"
                title={ui.regionPlanTitle}
                description={ui.regionPlanDescription}
            />

            <div className="region-plan-controls">
                <RegionSelector
                    className="region-plan-selector form-field"
                    value={region}
                    onChange={setRegion}
                    label={ui.regionPlanRegionLabel}
                />
            </div>

            <div className="panel-columns">
                <div className="region-plan-panel panel-card">
                    <div className="region-plan-panel-title">{ui.regionPlanAssignmentsTitle}</div>
                    <div className="region-plan-fields">
                        {regionFields[region].map((field) => {
                            const assignment = assignments.find((entry) => entry.fieldId === field.id)
                            const value = assignment?.projectGuid ?? ""
                            const compatibleOptions = projectOptions.filter((project) =>
                                project.templateId === field.template && (!project.hidden || assignedGuids.has(project.guid))
                            )
                            return (
                                <div key={field.id} className="region-plan-field row-card">
                                    <div className="region-plan-field-info field-info">
                                        <div className="region-plan-field-name field-name">{getRegionFieldName(field.id)}</div>
                                        <div className="region-plan-field-meta field-meta">{getFactoryRoleName(field.role)}</div>
                                    </div>
                                    <select
                                        className="form-control"
                                        value={value}
                                        onChange={(event) => {
                                            const nextValue = event.target.value
                                            setAssignment(field.id, nextValue === "" ? null : nextValue)
                                        }}
                                    >
                                        <option value="">{ui.regionPlanAssignPlaceholder}</option>
                                        {compatibleOptions.map((project) => (
                                            <option key={project.guid} value={project.guid}>{project.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )
                        })}
                        {projectOptions.length === 0 && (
                            <div className="region-plan-empty">{ui.regionPlanNoProjects}</div>
                        )}
                    </div>
                </div>
                <div className="region-plan-panel panel-card">
                    <div className="region-plan-panel-title">{ui.regionPlanSummaryTitle}</div>
                    <div className="region-plan-flows">
                        <RegionFlowList
                            title={ui.world}
                            flows={regionFlowSummary.worldInputs}
                            rateKey="sinkRate"
                            direction="input"
                        />
                        <RegionFlowList
                            title={`${ui.regionPlanFactoriesLabel} (${ui.inputFlows})`}
                            flows={regionFlowSummary.factoryInputs}
                            rateKey="sinkRate"
                            direction="input"
                        />
                        <RegionFlowList
                            title={`${ui.regionPlanFactoriesLabel} (${ui.outputFlows})`}
                            flows={regionFlowSummary.factoryOutputs}
                            rateKey="sourceRate"
                            direction="output"
                        />
                    </div>
                </div>
            </div>
        </ModalShell>
    )
}
