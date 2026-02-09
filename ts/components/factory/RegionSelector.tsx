import type { RegionID } from "../../types/data.ts"
import { useLocalization } from "../../contexts/localization.tsx"
import { regionList } from "../../data/regions.ts"

interface RegionSelectorProps {
    value: RegionID
    onChange: (region: RegionID) => void
    label: string
    className?: string
}

export function RegionSelector({ value, onChange, label, className }: RegionSelectorProps) {
    const { getRegionName } = useLocalization()

    return (
        <label className={className}>
            <span>{label}</span>
            <select
                className="form-control"
                value={value}
                onChange={(event) => {
                    const nextRegion = regionList.find((regionId) => regionId === event.target.value) ?? value
                    onChange(nextRegion)
                }}
            >
                {regionList.map((regionId) => (
                    <option key={regionId} value={regionId}>{getRegionName(regionId)}</option>
                ))}
            </select>
        </label>
    )
}
