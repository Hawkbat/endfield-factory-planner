import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/TemplateSelectorModal.tsx";
import { FieldTemplateID } from "../../types/data.js";
import { useLocalization } from "../../contexts/localization.js";
import { TemplateSelectionForm } from "./TemplateSelectionForm.js";
import { ModalShell } from "../common/ModalShell.js";
import { SectionHeader } from "../common/SectionHeader.js";
export function TemplateSelectorModal({ isOpen, currentTemplate, projectName, onClose, onApply }) {
    const { ui } = useLocalization();
    if (!isOpen) {
        return null;
    }
    return (_jsxDEV(ModalShell, { isOpen: isOpen, onClose: onClose, className: "template-selector modal-panel", children: [_jsxDEV(SectionHeader, { className: "section-header", titleClassName: "section-title", descriptionClassName: "section-description", title: ui.projectSettingsTitle, description: ui.projectSettingsDescription }, void 0, false, { fileName: _jsxFileName, lineNumber: 24, columnNumber: 13 }, this), _jsxDEV(TemplateSelectionForm, { currentTemplate: currentTemplate, onSubmit: onApply, onCancel: onClose, submitLabel: ui.templateApply, cancelLabel: ui.templateCancel, radioName: "templatePreset", projectName: projectName, showProjectNameInput: true }, void 0, false, { fileName: _jsxFileName, lineNumber: 32, columnNumber: 13 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 22, columnNumber: 13 }, this));
}
