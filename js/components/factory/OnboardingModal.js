import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/OnboardingModal.tsx";
import { useRef, useState } from "react";
import { FieldTemplateID, RegionFieldID } from "../../types/data.js";
import { useLocalization } from "../../contexts/localization.js";
import { useRegionPlan } from "../../contexts/regionPlan.js";
import { TemplateSelectionForm } from "./TemplateSelectionForm.js";
import { ModalShell } from "../common/ModalShell.js";
import { cn } from "../../utils/react.js";
import { buildRegionAssignments } from "../../utils/regionAssignments.js";
import { RegionSelector } from "./RegionSelector.js";
import { SectionHeader } from "../common/SectionHeader.js";
export function OnboardingModal({ isOpen, currentTemplate, onCreateNew, onCreateAndAssign, projects, onLoadProject, onToggleProjectHidden, onImportProjectJson, }) {
    const { ui, getRegionFieldName } = useLocalization();
    const { region, assignments, setRegion } = useRegionPlan();
    const fileInputRef = useRef(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [showDeletedProjects, setShowDeletedProjects] = useState(false);
    const sortedProjects = [...projects]
        .filter(project => showDeletedProjects || !project.hidden)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const { assignedFields } = buildRegionAssignments(region, assignments, projects);
    function handleImportFile(file) {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                onImportProjectJson(reader.result);
            }
        };
        reader.readAsText(file);
    }
    function handleFileChange(event) {
        const file = event.target.files?.[0];
        if (file) {
            handleImportFile(file);
        }
        event.target.value = "";
    }
    function handleDrop(event) {
        event.preventDefault();
        setIsDragActive(false);
        const file = event.dataTransfer.files?.[0];
        if (file) {
            handleImportFile(file);
        }
    }
    if (!isOpen) {
        return null;
    }
    return (_jsxDEV(ModalShell, { isOpen: isOpen, closeOnBackdrop: false, showCloseButton: false, className: "onboarding-modal modal-panel", children: [_jsxDEV(SectionHeader, { className: "section-header", titleClassName: "onboarding-title section-title", descriptionClassName: "onboarding-description section-description", title: ui.onboardingTitle, description: ui.onboardingDescription }, void 0, false, { fileName: _jsxFileName, lineNumber: 84, columnNumber: 13 }, this), _jsxDEV("div", { className: "panel-columns", children: [_jsxDEV("div", { className: "onboarding-panel panel-card", children: [_jsxDEV("div", { className: "onboarding-panel-title", children: ui.onboardingCreateNew }, void 0, false, { fileName: _jsxFileName, lineNumber: 94, columnNumber: 21 }, this), _jsxDEV(TemplateSelectionForm, { currentTemplate: currentTemplate, onSubmit: (template, projectName) => onCreateNew(template, projectName || ui.projectDefaultName), submitLabel: ui.templateContinue, radioName: "onboardingTemplatePreset", showCancel: false, projectName: ui.projectDefaultName, showProjectNameInput: true }, void 0, false, { fileName: _jsxFileName, lineNumber: 95, columnNumber: 21 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 93, columnNumber: 17 }, this), _jsxDEV("div", { className: "onboarding-panel panel-card", children: [_jsxDEV("div", { className: "onboarding-panel-title", children: ui.onboardingLoadExisting }, void 0, false, { fileName: _jsxFileName, lineNumber: 107, columnNumber: 21 }, this), _jsxDEV("div", { className: cn("onboarding-import", { active: isDragActive }), onDragOver: (event) => {
                                    event.preventDefault();
                                    setIsDragActive(true);
                                }, onDragLeave: () => setIsDragActive(false), onDrop: handleDrop, children: [_jsxDEV("div", { className: "onboarding-import-title", children: ui.projectImportTitle }, void 0, false, { fileName: _jsxFileName, lineNumber: 117, columnNumber: 25 }, this), _jsxDEV("div", { className: "onboarding-import-description", children: ui.projectImportDescription }, void 0, false, { fileName: _jsxFileName, lineNumber: 118, columnNumber: 25 }, this), _jsxDEV("button", { className: "action-button", onClick: () => fileInputRef.current?.click(), children: ui.projectImportButton }, void 0, false, { fileName: _jsxFileName, lineNumber: 119, columnNumber: 25 }, this), _jsxDEV("input", { ref: fileInputRef, type: "file", accept: "application/json", style: { display: "none" }, onChange: handleFileChange }, void 0, false, { fileName: _jsxFileName, lineNumber: 125, columnNumber: 25 }, this), _jsxDEV("div", { className: "onboarding-import-drop", children: ui.projectImportDrop }, void 0, false, { fileName: _jsxFileName, lineNumber: 132, columnNumber: 25 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 108, columnNumber: 21 }, this), _jsxDEV("div", { className: "project-list", children: sortedProjects.length === 0 ? (_jsxDEV("div", { className: "project-list-empty", children: showDeletedProjects ? ui.projectListEmptyDeleted : ui.projectListEmpty }, void 0, false, { fileName: _jsxFileName, lineNumber: 135, columnNumber: 57 }, this)) : (sortedProjects.map((project) => (_jsxDEV("div", { className: cn("project-list-item", { hidden: project.hidden }), children: [_jsxDEV("div", { className: "project-list-actions", children: project.hidden ? (_jsxDEV("button", { className: "action-button", onClick: () => onToggleProjectHidden(project.guid, false), children: ui.projectRestore }, void 0, false, { fileName: _jsxFileName, lineNumber: 143, columnNumber: 60 }, this)) : (_jsxDEV("button", { className: "action-button", onClick: () => onLoadProject(project.guid), children: ui.projectLoad }, void 0, false, { fileName: _jsxFileName, lineNumber: 150, columnNumber: 46 }, this)) }, void 0, false, { fileName: _jsxFileName, lineNumber: 142, columnNumber: 37 }, this), _jsxDEV("div", { className: "project-list-details", children: [_jsxDEV("div", { className: "project-list-name", children: project.name }, void 0, false, { fileName: _jsxFileName, lineNumber: 160, columnNumber: 41 }, this), _jsxDEV("div", { className: "project-list-meta", children: [ui.projectLastUpdated, " ", new Date(project.updatedAt).toLocaleString()] }, void 0, true, { fileName: _jsxFileName, lineNumber: 161, columnNumber: 41 }, this), project.hidden && (_jsxDEV("div", { className: "project-list-hidden", children: ui.projectHiddenLabel }, void 0, false, { fileName: _jsxFileName, lineNumber: 164, columnNumber: 61 }, this))] }, void 0, true, { fileName: _jsxFileName, lineNumber: 159, columnNumber: 37 }, this), _jsxDEV("button", { className: "project-list-delete", onClick: () => onToggleProjectHidden(project.guid, true), title: ui.projectDelete, "aria-label": ui.projectDelete, disabled: project.hidden, children: "\u00D7" }, void 0, false, { fileName: _jsxFileName, lineNumber: 168, columnNumber: 37 }, this)] }, project.guid, true, { fileName: _jsxFileName, lineNumber: 140, columnNumber: 62 }, this)))) }, void 0, false, { fileName: _jsxFileName, lineNumber: 134, columnNumber: 21 }, this), _jsxDEV("button", { className: "action-button project-list-recover", onClick: () => setShowDeletedProjects(!showDeletedProjects), children: showDeletedProjects ? ui.projectHideDeleted : ui.projectRecoverDeleted }, void 0, false, { fileName: _jsxFileName, lineNumber: 181, columnNumber: 21 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 106, columnNumber: 17 }, this), _jsxDEV("div", { className: "onboarding-panel panel-card", children: [_jsxDEV("div", { className: "onboarding-panel-title", children: ui.regionPlanOnboardingTitle }, void 0, false, { fileName: _jsxFileName, lineNumber: 190, columnNumber: 21 }, this), _jsxDEV(RegionSelector, { className: "onboarding-region-selector form-field", value: region, onChange: setRegion, label: ui.regionPlanRegionLabel }, void 0, false, { fileName: _jsxFileName, lineNumber: 191, columnNumber: 21 }, this), _jsxDEV("div", { className: "onboarding-region-plan", children: assignedFields.map(({ field, assignment, assignedProject }) => (_jsxDEV("div", { className: "onboarding-region-field row-card", children: [_jsxDEV("div", { className: "onboarding-region-field-info field-info", children: [_jsxDEV("div", { className: "onboarding-region-field-name field-name", children: getRegionFieldName(field.id) }, void 0, false, { fileName: _jsxFileName, lineNumber: 201, columnNumber: 37 }, this), _jsxDEV("div", { className: "onboarding-region-field-meta field-meta", children: [assignedProject ? ui.regionPlanAssignedLabel : ui.regionPlanUnassignedLabel, assignedProject?.hidden ? ` • ${ui.projectHiddenLabel}` : ""] }, void 0, true, { fileName: _jsxFileName, lineNumber: 202, columnNumber: 37 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 200, columnNumber: 33 }, this), assignedProject ? (_jsxDEV("button", { className: "action-button", onClick: () => onLoadProject(assignedProject.guid), children: ui.regionPlanLoadAssigned }, void 0, false, { fileName: _jsxFileName, lineNumber: 207, columnNumber: 53 }, this)) : (_jsxDEV("button", { className: "action-button", onClick: () => onCreateAndAssign(field.id, field.template, getRegionFieldName(field.id)), children: ui.regionPlanCreateAndAssign }, void 0, false, { fileName: _jsxFileName, lineNumber: 214, columnNumber: 38 }, this))] }, field.id, true, { fileName: _jsxFileName, lineNumber: 198, columnNumber: 90 }, this))) }, void 0, false, { fileName: _jsxFileName, lineNumber: 197, columnNumber: 21 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 189, columnNumber: 17 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 92, columnNumber: 13 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 77, columnNumber: 13 }, this));
}
