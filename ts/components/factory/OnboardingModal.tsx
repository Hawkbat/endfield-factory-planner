import { useRef, useState, type ChangeEvent, type DragEvent } from "react"
import { FieldTemplateID, RegionFieldID, type FieldTemplate } from "../../types/data.ts"
import { useLocalization } from "../../contexts/localization.tsx"
import { useRegionPlan } from "../../contexts/regionPlan.tsx"
import { TemplateSelectionForm } from "./TemplateSelectionForm.tsx"
import { ModalShell } from "../common/ModalShell.tsx"
import type { ProjectJsonMetaV1 } from "../../types/external.ts"
import { cn } from "../../utils/react.ts"
import { buildRegionAssignments } from "../../utils/regionAssignments.ts"
import { RegionSelector } from "./RegionSelector.tsx"
import { SectionHeader } from "../common/SectionHeader.tsx"

interface OnboardingModalProps {
    isOpen: boolean
    currentTemplate: FieldTemplateID | FieldTemplate
    onCreateNew: (template: FieldTemplateID | FieldTemplate, projectName?: string) => void
    onCreateAndAssign: (fieldId: RegionFieldID, template: FieldTemplateID | FieldTemplate, projectName?: string) => void
    projects: ProjectJsonMetaV1[]
    onLoadProject: (guid: string) => void
    onToggleProjectHidden: (guid: string, hidden: boolean) => void
    onImportProjectJson: (jsonText: string) => void
}

export function OnboardingModal({
    isOpen,
    currentTemplate,
    onCreateNew,
    onCreateAndAssign,
    projects,
    onLoadProject,
    onToggleProjectHidden,
    onImportProjectJson,
}: OnboardingModalProps) {
    const { ui, getRegionFieldName } = useLocalization()
    const { region, assignments, setRegion } = useRegionPlan()
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [isDragActive, setIsDragActive] = useState(false)
    const [showDeletedProjects, setShowDeletedProjects] = useState(false)

    const sortedProjects = [...projects]
        .filter(project => showDeletedProjects || !project.hidden)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

    const { assignedFields } = buildRegionAssignments(region, assignments, projects)

    function handleImportFile(file: File) {
        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === "string") {
                onImportProjectJson(reader.result)
            }
        }
        reader.readAsText(file)
    }

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (file) {
            handleImportFile(file)
        }
        event.target.value = ""
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault()
        setIsDragActive(false)
        const file = event.dataTransfer.files?.[0]
        if (file) {
            handleImportFile(file)
        }
    }

    if (!isOpen) {
        return null
    }

    return (
        <ModalShell
            isOpen={isOpen}
            closeOnBackdrop={false}
            showCloseButton={false}
            className="onboarding-modal modal-panel"
        >
            <SectionHeader
                className="section-header"
                titleClassName="onboarding-title section-title"
                descriptionClassName="onboarding-description section-description"
                title={ui.onboardingTitle}
                description={ui.onboardingDescription}
            />

            <div className="panel-columns">
                <div className="onboarding-panel panel-card">
                    <div className="onboarding-panel-title">{ui.onboardingCreateNew}</div>
                    <TemplateSelectionForm
                        currentTemplate={currentTemplate}
                        onSubmit={(template, projectName) => onCreateNew(template, projectName || ui.projectDefaultName)}
                        submitLabel={ui.templateContinue}
                        radioName="onboardingTemplatePreset"
                        showCancel={false}
                        projectName={ui.projectDefaultName}
                        showProjectNameInput={true}
                    />
                </div>

                <div className="onboarding-panel panel-card">
                    <div className="onboarding-panel-title">{ui.onboardingLoadExisting}</div>
                    <div
                        className={cn("onboarding-import", { active: isDragActive })}
                        onDragOver={(event) => {
                            event.preventDefault()
                            setIsDragActive(true)
                        }}
                        onDragLeave={() => setIsDragActive(false)}
                        onDrop={handleDrop}
                    >
                        <div className="onboarding-import-title">{ui.projectImportTitle}</div>
                        <div className="onboarding-import-description">{ui.projectImportDescription}</div>
                        <button
                            className="action-button"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {ui.projectImportButton}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/json"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                        <div className="onboarding-import-drop">{ui.projectImportDrop}</div>
                    </div>
                    <div className="project-list">
                        {sortedProjects.length === 0 ? (
                            <div className="project-list-empty">
                                {showDeletedProjects ? ui.projectListEmptyDeleted : ui.projectListEmpty}
                            </div>
                        ) : (
                            sortedProjects.map((project) => (
                                <div key={project.guid} className={cn("project-list-item", { hidden: project.hidden })}>
                                    <div className="project-list-actions">
                                        {project.hidden ? (
                                            <button
                                                className="action-button"
                                                onClick={() => onToggleProjectHidden(project.guid, false)}
                                            >
                                                {ui.projectRestore}
                                            </button>
                                        ) : (
                                            <button
                                                className="action-button"
                                                onClick={() => onLoadProject(project.guid)}
                                            >
                                                {ui.projectLoad}
                                            </button>
                                        )}
                                    </div>
                                    <div className="project-list-details">
                                        <div className="project-list-name">{project.name}</div>
                                        <div className="project-list-meta">
                                            {ui.projectLastUpdated} {new Date(project.updatedAt).toLocaleString()}
                                        </div>
                                        {project.hidden && (
                                            <div className="project-list-hidden">{ui.projectHiddenLabel}</div>
                                        )}
                                    </div>
                                    <button
                                        className="project-list-delete"
                                        onClick={() => onToggleProjectHidden(project.guid, true)}
                                        title={ui.projectDelete}
                                        aria-label={ui.projectDelete}
                                        disabled={project.hidden}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    <button
                        className="action-button project-list-recover"
                        onClick={() => setShowDeletedProjects(!showDeletedProjects)}
                    >
                        {showDeletedProjects ? ui.projectHideDeleted : ui.projectRecoverDeleted}
                    </button>
                </div>

                <div className="onboarding-panel panel-card">
                    <div className="onboarding-panel-title">{ui.regionPlanOnboardingTitle}</div>
                    <RegionSelector
                        className="onboarding-region-selector form-field"
                        value={region}
                        onChange={setRegion}
                        label={ui.regionPlanRegionLabel}
                    />
                    <div className="onboarding-region-plan">
                        {assignedFields.map(({ field, assignment, assignedProject }) => (
                            <div key={field.id} className="onboarding-region-field row-card">
                                <div className="onboarding-region-field-info field-info">
                                    <div className="onboarding-region-field-name field-name">{getRegionFieldName(field.id)}</div>
                                    <div className="onboarding-region-field-meta field-meta">
                                        {assignedProject ? ui.regionPlanAssignedLabel : ui.regionPlanUnassignedLabel}
                                        {assignedProject?.hidden ? ` • ${ui.projectHiddenLabel}` : ""}
                                    </div>
                                </div>
                                {assignedProject ? (
                                    <button
                                        className="action-button"
                                        onClick={() => onLoadProject(assignedProject.guid)}
                                    >
                                        {ui.regionPlanLoadAssigned}
                                    </button>
                                ) : (
                                    <button
                                        className="action-button"
                                        onClick={() => onCreateAndAssign(field.id, field.template, getRegionFieldName(field.id))}
                                    >
                                        {ui.regionPlanCreateAndAssign}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ModalShell>
    )
}
