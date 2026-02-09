import { FieldTemplateID, type FieldTemplate } from "../../types/data.ts"
import { useLocalization } from "../../contexts/localization.tsx"
import { TemplateSelectionForm } from "./TemplateSelectionForm.tsx"
import { ModalShell } from "../common/ModalShell.tsx"
import { SectionHeader } from "../common/SectionHeader.tsx"

interface TemplateSelectorModalProps {
    isOpen: boolean
    currentTemplate: FieldTemplateID | FieldTemplate
    projectName: string
    onClose: () => void
    onApply: (template: FieldTemplateID | FieldTemplate, projectName: string) => void
}

export function TemplateSelectorModal({ isOpen, currentTemplate, projectName, onClose, onApply }: TemplateSelectorModalProps) {
    const { ui } = useLocalization()

    if (!isOpen) {
        return null
    }

    return (
        <ModalShell isOpen={isOpen} onClose={onClose} className="template-selector modal-panel">
            <SectionHeader
                className="section-header"
                titleClassName="section-title"
                descriptionClassName="section-description"
                title={ui.projectSettingsTitle}
                description={ui.projectSettingsDescription}
            />

            <TemplateSelectionForm
                currentTemplate={currentTemplate}
                onSubmit={onApply}
                onCancel={onClose}
                submitLabel={ui.templateApply}
                cancelLabel={ui.templateCancel}
                radioName="templatePreset"
                projectName={projectName}
                showProjectNameInput={true}
            />
        </ModalShell>
    )
}
