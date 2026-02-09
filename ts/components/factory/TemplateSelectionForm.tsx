import { useEffect, useMemo, useState } from "react"
import { resolveFieldTemplate } from "../../data/templates.ts"
import { FieldTemplateID, RegionID, type FieldTemplate } from "../../types/data.ts"
import { useLocalization } from "../../contexts/localization.tsx"
import { regionList } from "../../data/regions.ts"
import { cn } from "../../utils/react.ts"

interface TemplateSelectionFormProps {
    currentTemplate: FieldTemplateID | FieldTemplate
    onSubmit: (template: FieldTemplateID | FieldTemplate, projectName: string) => void
    submitLabel: string
    cancelLabel?: string
    radioName: string
    onCancel?: () => void
    showCancel?: boolean
    projectName?: string
    showProjectNameInput?: boolean
}

function clampPositiveInt(value: number, fallback: number): number {
    if (!Number.isFinite(value)) return fallback
    return Math.max(1, Math.round(value))
}

function clampNonNegativeInt(value: number, fallback: number): number {
    if (!Number.isFinite(value)) return fallback
    return Math.max(0, Math.round(value))
}

export function TemplateSelectionForm({
    currentTemplate,
    onSubmit,
    submitLabel,
    cancelLabel,
    radioName,
    onCancel,
    showCancel = true,
    projectName,
    showProjectNameInput = true,
}: TemplateSelectionFormProps) {
    const { ui, getRegionName } = useLocalization()
    const resolvedCurrent = useMemo(() => resolveFieldTemplate(currentTemplate), [currentTemplate])

    const [selectionMode, setSelectionMode] = useState<'preset' | 'custom'>('preset')
    const [selectedPreset, setSelectedPreset] = useState<FieldTemplateID>(FieldTemplateID.WULING_MAIN)
    const [customWidth, setCustomWidth] = useState<number>(resolvedCurrent.width)
    const [customHeight, setCustomHeight] = useState<number>(resolvedCurrent.height)
    const [customRegion, setCustomRegion] = useState<RegionID>(resolvedCurrent.region)
    const [customDepotBusPorts, setCustomDepotBusPorts] = useState<number>(resolvedCurrent.depotBusPortLimit)
    const [customDepotBusSections, setCustomDepotBusSections] = useState<number>(resolvedCurrent.depotBusSectionLimit)
    const [localProjectName, setLocalProjectName] = useState<string>(projectName ?? "")

    useEffect(() => {
        if (typeof currentTemplate === 'string') {
            setSelectionMode('preset')
            setSelectedPreset(currentTemplate)
        } else {
            setSelectionMode('custom')
        }

        setCustomWidth(resolvedCurrent.width)
        setCustomHeight(resolvedCurrent.height)
        setCustomRegion(resolvedCurrent.region)
        setCustomDepotBusPorts(resolvedCurrent.depotBusPortLimit)
        setCustomDepotBusSections(resolvedCurrent.depotBusSectionLimit)
    }, [currentTemplate, resolvedCurrent])

    useEffect(() => {
        if (projectName !== undefined) {
            setLocalProjectName(projectName)
        }
    }, [projectName])

    const presetOptions: Array<{ id: FieldTemplateID, label: string }> = [
        { id: FieldTemplateID.VALLEY_IV_MAIN, label: ui.templatePresetValleyIVMain },
        { id: FieldTemplateID.VALLEY_IV_OUTPOST, label: ui.templatePresetValleyIVOutpost },
        { id: FieldTemplateID.WULING_MAIN, label: ui.templatePresetWulingMain },
        { id: FieldTemplateID.WULING_OUTPOST, label: ui.templatePresetWulingOutpost },
    ]

    const isCustomSelected = selectionMode === 'custom'
    const isWulingRegion = customRegion === RegionID.WULING

    function handleSubmit() {
        const trimmedName = localProjectName.trim()
        if (isCustomSelected) {
            const width = clampPositiveInt(customWidth, resolvedCurrent.width)
            const height = clampPositiveInt(customHeight, resolvedCurrent.height)
            const depotBusPortLimit = isWulingRegion
                ? clampNonNegativeInt(customDepotBusPorts, 0)
                : 0
            const depotBusSectionLimit = isWulingRegion
                ? clampNonNegativeInt(customDepotBusSections, 0)
                : 0

            const template: FieldTemplate = {
                width,
                height,
                region: customRegion,
                depotBusPortLimit,
                depotBusSectionLimit,
            }

            onSubmit(template, trimmedName)
            return
        }

        onSubmit(selectedPreset, trimmedName)
    }

    return (
        <>
            {showProjectNameInput && (
                <label className="form-field">
                    <span>{ui.projectNameLabel}</span>
                    <input
                        type="text"
                        className="form-control"
                        value={localProjectName}
                        onChange={event => setLocalProjectName(event.target.value)}
                        placeholder={ui.projectNamePlaceholder}
                    />
                </label>
            )}
            <div className="template-selector-options">
                {presetOptions.map(option => (
                    <label key={option.id} className="template-selector-option">
                        <input
                            type="radio"
                            name={radioName}
                            checked={selectionMode === 'preset' && selectedPreset === option.id}
                            onChange={() => {
                                setSelectionMode('preset')
                                setSelectedPreset(option.id)
                            }}
                        />
                        <span>{option.label}</span>
                        <div className="template-selector-meta">
                            {resolveFieldTemplate(option.id).width} × {resolveFieldTemplate(option.id).height}
                        </div>
                    </label>
                ))}

                <label className="template-selector-option">
                    <input
                        type="radio"
                        name={radioName}
                        checked={selectionMode === 'custom'}
                        onChange={() => setSelectionMode('custom')}
                    />
                    <span>{ui.templatePresetCustom}</span>
                </label>
            </div>

            {isCustomSelected && (
                <div className="template-selector-custom">
                    <div className="template-selector-custom-title">{ui.templateCustomSettings}</div>
                    <div className="template-selector-custom-grid">
                        <label className="form-field">
                            <span>{ui.templateWidth}</span>
                            <input
                                type="number"
                                min={1}
                                className="form-control"
                                value={customWidth}
                                onChange={event => setCustomWidth(Number(event.target.value))}
                            />
                        </label>
                        <label className="form-field">
                            <span>{ui.templateHeight}</span>
                            <input
                                type="number"
                                min={1}
                                className="form-control"
                                value={customHeight}
                                onChange={event => setCustomHeight(Number(event.target.value))}
                            />
                        </label>
                        <label className="form-field">
                            <span>{ui.templateRegion}</span>
                            <select
                                className="form-control"
                                value={customRegion}
                                onChange={event => setCustomRegion(event.target.value as RegionID)}
                            >
                                {regionList.map(regionId => (
                                    <option key={regionId} value={regionId}>{getRegionName(regionId)}</option>
                                ))}
                            </select>
                        </label>
                        <label className={cn("form-field", !isWulingRegion && "template-selector-disabled")}>
                            <span>{ui.templateDepotBusPortLimit}</span>
                            <input
                                type="number"
                                min={0}
                                className="form-control"
                                value={isWulingRegion ? customDepotBusPorts : 0}
                                onChange={event => setCustomDepotBusPorts(Number(event.target.value))}
                                disabled={!isWulingRegion}
                            />
                        </label>
                        <label className={cn("form-field", !isWulingRegion && "template-selector-disabled")}>
                            <span>{ui.templateDepotBusSectionLimit}</span>
                            <input
                                type="number"
                                min={0}
                                className="form-control"
                                value={isWulingRegion ? customDepotBusSections : 0}
                                onChange={event => setCustomDepotBusSections(Number(event.target.value))}
                                disabled={!isWulingRegion}
                            />
                        </label>
                    </div>
                </div>
            )}

            <div className="template-selector-actions">
                {showCancel && onCancel && cancelLabel && (
                    <button className="action-button" onClick={onCancel}>{cancelLabel}</button>
                )}
                <button className="action-button" onClick={handleSubmit}>{submitLabel}</button>
            </div>
        </>
    )
}
