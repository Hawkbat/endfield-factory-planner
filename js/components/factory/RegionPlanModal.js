import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/RegionPlanModal.tsx";
import { useMemo } from "react";
import { regionFields, regionResourceSupplies } from "../../data/regions.js";
import { resolveFieldTemplate } from "../../data/templates.js";
import { useLocalization } from "../../contexts/localization.js";
import { useRegionPlan } from "../../contexts/regionPlan.js";
import { useEdit } from "../../contexts/edit.js";
import { createStateFromChanges } from "../../game/sampleField.js";
import { FieldTemplateID, ItemID, RegionID } from "../../types/data.js";
import { loadProject } from "../../utils/projectStorage.js";
import { ModalShell } from "../common/ModalShell.js";
import { RegionFlowList } from "./RegionFlowList.js";
import { RegionSelector } from "./RegionSelector.js";
import { buildRegionAssignments } from "../../utils/regionAssignments.js";
import { SectionHeader } from "../common/SectionHeader.js";
export function RegionPlanModal() {
    const { ui, getItemName, getFactoryRoleName, getRegionFieldName } = useLocalization();
    const { region, setRegion, assignments, setAssignment, isRegionPlanOpen, closeRegionPlan } = useRegionPlan();
    const { projectListing } = useEdit();
    const { assignedGuids } = useMemo(() => buildRegionAssignments(region, assignments, projectListing), [region, assignments, projectListing]);
    const projectOptions = useMemo(() => {
        return projectListing
            .map((projectMeta) => {
            const project = loadProject(projectMeta.guid);
            if (!project) {
                return null;
            }
            const template = resolveFieldTemplate(project.template);
            const templateId = typeof project.template === "string" ? project.template : null;
            return {
                guid: projectMeta.guid,
                name: projectMeta.name || ui.projectDefaultName,
                region: template.region,
                templateId,
                hidden: projectMeta.hidden ?? false,
            };
        })
            .filter((entry) => Boolean(entry))
            .filter((entry) => entry.region === region)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [projectListing, region, ui.projectDefaultName]);
    const regionFlowSummary = useMemo(() => {
        const inputTotals = new Map();
        const outputTotals = new Map();
        const projectLookup = new Map(projectListing.map((project) => [project.guid, project]));
        for (const assignment of assignments) {
            if (!assignment.projectGuid) {
                continue;
            }
            const meta = projectLookup.get(assignment.projectGuid);
            if (!meta) {
                continue;
            }
            const project = loadProject(meta.guid);
            if (!project) {
                continue;
            }
            const template = resolveFieldTemplate(project.template);
            if (template.region !== region) {
                continue;
            }
            const state = createStateFromChanges(project.changes, project.template);
            for (const flow of state.depot.inputFlows) {
                inputTotals.set(flow.item, (inputTotals.get(flow.item) ?? 0) + flow.sinkRate);
            }
            for (const flow of state.depot.outputFlows) {
                outputTotals.set(flow.item, (outputTotals.get(flow.item) ?? 0) + flow.sourceRate);
            }
        }
        const factoryInputs = Array.from(inputTotals.entries())
            .map(([item, sinkRate]) => ({ item, sinkRate, sourceRate: sinkRate }))
            .sort((a, b) => getItemName(a.item).localeCompare(getItemName(b.item)));
        const factoryOutputs = Array.from(outputTotals.entries())
            .map(([item, sourceRate]) => ({ item, sinkRate: sourceRate, sourceRate }))
            .sort((a, b) => getItemName(a.item).localeCompare(getItemName(b.item)));
        const worldInputs = regionResourceSupplies[region]
            .map((supply) => ({
            item: supply.item,
            sinkRate: supply.ratePerMinute / 60,
            sourceRate: supply.ratePerMinute / 60,
        }));
        return {
            factoryInputs,
            factoryOutputs,
            worldInputs,
        };
    }, [assignments, projectListing, region, getItemName]);
    if (!isRegionPlanOpen) {
        return null;
    }
    return (_jsxDEV(ModalShell, { isOpen: isRegionPlanOpen, onClose: closeRegionPlan, className: "region-plan-modal modal-panel", children: [_jsxDEV(SectionHeader, { className: "section-header", titleClassName: "region-plan-title section-title", descriptionClassName: "region-plan-description section-description", title: ui.regionPlanTitle, description: ui.regionPlanDescription }, void 0, false, { fileName: _jsxFileName, lineNumber: 110, columnNumber: 13 }, this), _jsxDEV("div", { className: "region-plan-controls", children: _jsxDEV(RegionSelector, { className: "region-plan-selector form-field", value: region, onChange: setRegion, label: ui.regionPlanRegionLabel }, void 0, false, { fileName: _jsxFileName, lineNumber: 119, columnNumber: 17 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 118, columnNumber: 13 }, this), _jsxDEV("div", { className: "panel-columns", children: [_jsxDEV("div", { className: "region-plan-panel panel-card", children: [_jsxDEV("div", { className: "region-plan-panel-title", children: ui.regionPlanAssignmentsTitle }, void 0, false, { fileName: _jsxFileName, lineNumber: 129, columnNumber: 21 }, this), _jsxDEV("div", { className: "region-plan-fields", children: [regionFields[region].map((field) => {
                                        const assignment = assignments.find((entry) => entry.fieldId === field.id);
                                        const value = assignment?.projectGuid ?? "";
                                        const compatibleOptions = projectOptions.filter((project) => project.templateId === field.template && (!project.hidden || assignedGuids.has(project.guid)));
                                        return (_jsxDEV("div", { className: "region-plan-field row-card", children: [_jsxDEV("div", { className: "region-plan-field-info field-info", children: [_jsxDEV("div", { className: "region-plan-field-name field-name", children: getRegionFieldName(field.id) }, void 0, false, { fileName: _jsxFileName, lineNumber: 140, columnNumber: 41 }, this), _jsxDEV("div", { className: "region-plan-field-meta field-meta", children: getFactoryRoleName(field.role) }, void 0, false, { fileName: _jsxFileName, lineNumber: 141, columnNumber: 41 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 139, columnNumber: 37 }, this), _jsxDEV("select", { className: "form-control", value: value, onChange: (event) => {
                                                        const nextValue = event.target.value;
                                                        setAssignment(field.id, nextValue === "" ? null : nextValue);
                                                    }, children: [_jsxDEV("option", { value: "", children: ui.regionPlanAssignPlaceholder }, void 0, false, { fileName: _jsxFileName, lineNumber: 151, columnNumber: 41 }, this), compatibleOptions.map((project) => (_jsxDEV("option", { value: project.guid, children: project.name }, project.guid, false, { fileName: _jsxFileName, lineNumber: 152, columnNumber: 78 }, this)))] }, void 0, true, { fileName: _jsxFileName, lineNumber: 143, columnNumber: 37 }, this)] }, field.id, true, { fileName: _jsxFileName, lineNumber: 137, columnNumber: 37 }, this));
                                    }), projectOptions.length === 0 && (_jsxDEV("div", { className: "region-plan-empty", children: ui.regionPlanNoProjects }, void 0, false, { fileName: _jsxFileName, lineNumber: 159, columnNumber: 58 }, this))] }, void 0, true, { fileName: _jsxFileName, lineNumber: 130, columnNumber: 21 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 128, columnNumber: 17 }, this), _jsxDEV("div", { className: "region-plan-panel panel-card", children: [_jsxDEV("div", { className: "region-plan-panel-title", children: ui.regionPlanSummaryTitle }, void 0, false, { fileName: _jsxFileName, lineNumber: 165, columnNumber: 21 }, this), _jsxDEV("div", { className: "region-plan-flows", children: [_jsxDEV(RegionFlowList, { title: ui.world, flows: regionFlowSummary.worldInputs, rateKey: "sinkRate", direction: "input" }, void 0, false, { fileName: _jsxFileName, lineNumber: 167, columnNumber: 25 }, this), _jsxDEV(RegionFlowList, { title: `${ui.regionPlanFactoriesLabel} (${ui.inputFlows})`, flows: regionFlowSummary.factoryInputs, rateKey: "sinkRate", direction: "input" }, void 0, false, { fileName: _jsxFileName, lineNumber: 173, columnNumber: 25 }, this), _jsxDEV(RegionFlowList, { title: `${ui.regionPlanFactoriesLabel} (${ui.outputFlows})`, flows: regionFlowSummary.factoryOutputs, rateKey: "sourceRate", direction: "output" }, void 0, false, { fileName: _jsxFileName, lineNumber: 179, columnNumber: 25 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 166, columnNumber: 21 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 164, columnNumber: 17 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 127, columnNumber: 13 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 104, columnNumber: 13 }, this));
}
