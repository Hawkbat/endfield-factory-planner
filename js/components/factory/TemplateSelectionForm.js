import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/TemplateSelectionForm.tsx";
import { useEffect, useMemo, useState } from "react";
import { resolveFieldTemplate } from "../../data/templates.js";
import { FieldTemplateID, RegionID } from "../../types/data.js";
import { useLocalization } from "../../contexts/localization.js";
import { regionList } from "../../data/regions.js";
import { cn } from "../../utils/react.js";
function clampPositiveInt(value, fallback) {
    if (!Number.isFinite(value))
        return fallback;
    return Math.max(1, Math.round(value));
}
function clampNonNegativeInt(value, fallback) {
    if (!Number.isFinite(value))
        return fallback;
    return Math.max(0, Math.round(value));
}
export function TemplateSelectionForm({ currentTemplate, onSubmit, submitLabel, cancelLabel, radioName, onCancel, showCancel = true, projectName, showProjectNameInput = true, }) {
    const { ui, getRegionName } = useLocalization();
    const resolvedCurrent = useMemo(() => resolveFieldTemplate(currentTemplate), [currentTemplate]);
    const [selectionMode, setSelectionMode] = useState('preset');
    const [selectedPreset, setSelectedPreset] = useState(FieldTemplateID.WULING_MAIN);
    const [customWidth, setCustomWidth] = useState(resolvedCurrent.width);
    const [customHeight, setCustomHeight] = useState(resolvedCurrent.height);
    const [customRegion, setCustomRegion] = useState(resolvedCurrent.region);
    const [customDepotBusPorts, setCustomDepotBusPorts] = useState(resolvedCurrent.depotBusPortLimit);
    const [customDepotBusSections, setCustomDepotBusSections] = useState(resolvedCurrent.depotBusSectionLimit);
    const [localProjectName, setLocalProjectName] = useState(projectName ?? "");
    useEffect(() => {
        if (typeof currentTemplate === 'string') {
            setSelectionMode('preset');
            setSelectedPreset(currentTemplate);
        }
        else {
            setSelectionMode('custom');
        }
        setCustomWidth(resolvedCurrent.width);
        setCustomHeight(resolvedCurrent.height);
        setCustomRegion(resolvedCurrent.region);
        setCustomDepotBusPorts(resolvedCurrent.depotBusPortLimit);
        setCustomDepotBusSections(resolvedCurrent.depotBusSectionLimit);
    }, [currentTemplate, resolvedCurrent]);
    useEffect(() => {
        if (projectName !== undefined) {
            setLocalProjectName(projectName);
        }
    }, [projectName]);
    const presetOptions = [
        { id: FieldTemplateID.VALLEY_IV_MAIN, label: ui.templatePresetValleyIVMain },
        { id: FieldTemplateID.VALLEY_IV_OUTPOST, label: ui.templatePresetValleyIVOutpost },
        { id: FieldTemplateID.WULING_MAIN, label: ui.templatePresetWulingMain },
        { id: FieldTemplateID.WULING_OUTPOST, label: ui.templatePresetWulingOutpost },
    ];
    const isCustomSelected = selectionMode === 'custom';
    const isWulingRegion = customRegion === RegionID.WULING;
    function handleSubmit() {
        const trimmedName = localProjectName.trim();
        if (isCustomSelected) {
            const width = clampPositiveInt(customWidth, resolvedCurrent.width);
            const height = clampPositiveInt(customHeight, resolvedCurrent.height);
            const depotBusPortLimit = isWulingRegion
                ? clampNonNegativeInt(customDepotBusPorts, 0)
                : 0;
            const depotBusSectionLimit = isWulingRegion
                ? clampNonNegativeInt(customDepotBusSections, 0)
                : 0;
            const template = {
                width,
                height,
                region: customRegion,
                depotBusPortLimit,
                depotBusSectionLimit,
            };
            onSubmit(template, trimmedName);
            return;
        }
        onSubmit(selectedPreset, trimmedName);
    }
    return (_jsxDEV(_Fragment, { children: [showProjectNameInput && (_jsxDEV("label", { className: "form-field", children: [_jsxDEV("span", { children: ui.projectNameLabel }, void 0, false, { fileName: _jsxFileName, lineNumber: 115, columnNumber: 21 }, this), _jsxDEV("input", { type: "text", className: "form-control", value: localProjectName, onChange: event => setLocalProjectName(event.target.value), placeholder: ui.projectNamePlaceholder }, void 0, false, { fileName: _jsxFileName, lineNumber: 116, columnNumber: 21 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 113, columnNumber: 39 }, this)), _jsxDEV("div", { className: "template-selector-options", children: [presetOptions.map(option => (_jsxDEV("label", { className: "template-selector-option", children: [_jsxDEV("input", { type: "radio", name: radioName, checked: selectionMode === 'preset' && selectedPreset === option.id, onChange: () => {
                                    setSelectionMode('preset');
                                    setSelectedPreset(option.id);
                                } }, void 0, false, { fileName: _jsxFileName, lineNumber: 128, columnNumber: 25 }, this), _jsxDEV("span", { children: option.label }, void 0, false, { fileName: _jsxFileName, lineNumber: 137, columnNumber: 25 }, this), _jsxDEV("div", { className: "template-selector-meta", children: [resolveFieldTemplate(option.id).width, " \u00D7 ", resolveFieldTemplate(option.id).height] }, void 0, true, { fileName: _jsxFileName, lineNumber: 138, columnNumber: 25 }, this)] }, option.id, true, { fileName: _jsxFileName, lineNumber: 126, columnNumber: 47 }, this))), _jsxDEV("label", { className: "template-selector-option", children: [_jsxDEV("input", { type: "radio", name: radioName, checked: selectionMode === 'custom', onChange: () => setSelectionMode('custom') }, void 0, false, { fileName: _jsxFileName, lineNumber: 145, columnNumber: 21 }, this), _jsxDEV("span", { children: ui.templatePresetCustom }, void 0, false, { fileName: _jsxFileName, lineNumber: 151, columnNumber: 21 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 144, columnNumber: 17 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 125, columnNumber: 13 }, this), isCustomSelected && (_jsxDEV("div", { className: "template-selector-custom", children: [_jsxDEV("div", { className: "template-selector-custom-title", children: ui.templateCustomSettings }, void 0, false, { fileName: _jsxFileName, lineNumber: 157, columnNumber: 21 }, this), _jsxDEV("div", { className: "template-selector-custom-grid", children: [_jsxDEV("label", { className: "form-field", children: [_jsxDEV("span", { children: ui.templateWidth }, void 0, false, { fileName: _jsxFileName, lineNumber: 160, columnNumber: 29 }, this), _jsxDEV("input", { type: "number", min: 1, className: "form-control", value: customWidth, onChange: event => setCustomWidth(Number(event.target.value)) }, void 0, false, { fileName: _jsxFileName, lineNumber: 161, columnNumber: 29 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 159, columnNumber: 25 }, this), _jsxDEV("label", { className: "form-field", children: [_jsxDEV("span", { children: ui.templateHeight }, void 0, false, { fileName: _jsxFileName, lineNumber: 170, columnNumber: 29 }, this), _jsxDEV("input", { type: "number", min: 1, className: "form-control", value: customHeight, onChange: event => setCustomHeight(Number(event.target.value)) }, void 0, false, { fileName: _jsxFileName, lineNumber: 171, columnNumber: 29 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 169, columnNumber: 25 }, this), _jsxDEV("label", { className: "form-field", children: [_jsxDEV("span", { children: ui.templateRegion }, void 0, false, { fileName: _jsxFileName, lineNumber: 180, columnNumber: 29 }, this), _jsxDEV("select", { className: "form-control", value: customRegion, onChange: event => setCustomRegion(event.target.value), children: regionList.map(regionId => (_jsxDEV("option", { value: regionId, children: getRegionName(regionId) }, regionId, false, { fileName: _jsxFileName, lineNumber: 186, columnNumber: 62 }, this))) }, void 0, false, { fileName: _jsxFileName, lineNumber: 181, columnNumber: 29 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 179, columnNumber: 25 }, this), _jsxDEV("label", { className: cn("form-field", !isWulingRegion && "template-selector-disabled"), children: [_jsxDEV("span", { children: ui.templateDepotBusPortLimit }, void 0, false, { fileName: _jsxFileName, lineNumber: 192, columnNumber: 29 }, this), _jsxDEV("input", { type: "number", min: 0, className: "form-control", value: isWulingRegion ? customDepotBusPorts : 0, onChange: event => setCustomDepotBusPorts(Number(event.target.value)), disabled: !isWulingRegion }, void 0, false, { fileName: _jsxFileName, lineNumber: 193, columnNumber: 29 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 191, columnNumber: 25 }, this), _jsxDEV("label", { className: cn("form-field", !isWulingRegion && "template-selector-disabled"), children: [_jsxDEV("span", { children: ui.templateDepotBusSectionLimit }, void 0, false, { fileName: _jsxFileName, lineNumber: 203, columnNumber: 29 }, this), _jsxDEV("input", { type: "number", min: 0, className: "form-control", value: isWulingRegion ? customDepotBusSections : 0, onChange: event => setCustomDepotBusSections(Number(event.target.value)), disabled: !isWulingRegion }, void 0, false, { fileName: _jsxFileName, lineNumber: 204, columnNumber: 29 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 202, columnNumber: 25 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 158, columnNumber: 21 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 155, columnNumber: 35 }, this)), _jsxDEV("div", { className: "template-selector-actions", children: [showCancel && onCancel && cancelLabel && (_jsxDEV("button", { className: "action-button", onClick: onCancel, children: cancelLabel }, void 0, false, { fileName: _jsxFileName, lineNumber: 218, columnNumber: 60 }, this)), _jsxDEV("button", { className: "action-button", onClick: handleSubmit, children: submitLabel }, void 0, false, { fileName: _jsxFileName, lineNumber: 221, columnNumber: 17 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 217, columnNumber: 13 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 111, columnNumber: 13 }, this));
}
