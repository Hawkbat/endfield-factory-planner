import { objectEntries, objectValues, type Immutable } from "../../utils/types.ts"
import type { ReactNode } from "react"
import type { FieldState } from "../../types/field.ts"
import { useLocalization } from "../../contexts/localization.tsx"
import { useRegionPlan } from "../../contexts/regionPlan.tsx"
import { useEdit } from "../../contexts/edit.tsx"
import { facilities } from "../../data/facilities.ts"
import { recipes } from "../../data/recipes.ts"
import { regionResourceSupplies } from "../../data/regions.ts"
import { resolveFieldTemplate } from "../../data/templates.ts"
import { ItemFlowDisplay } from "./ItemFlowDisplay.tsx"
import { RecipeDisplay } from "./RecipeDisplay.tsx"
import { createStateFromChanges } from "../../game/sampleField.ts"
import { ItemID, RegionID } from "../../types/data.ts"
import { getConnectedEntity } from "../../game/connections.ts"
import { analyzeFacilityFlows } from "../../game/flows.ts"
import { AlertTriangle } from "lucide-react"
import { loadProject } from "../../utils/projectStorage.ts"
import type { ItemFlow } from "../../types/field.ts"
import { RegionFlowList } from "./RegionFlowList.tsx"

interface FieldHudProps {
    fieldState: Immutable<FieldState>
    selectedID: string | null
    selectedIDs: ReadonlySet<string>
}

export function FieldHud({ fieldState, selectedID, selectedIDs }: FieldHudProps) {
    const { depot, world } = fieldState
    const loc = useLocalization()
    const { region, assignments } = useRegionPlan()
    const { projectListing } = useEdit()
    const hasMultipleSelection = selectedIDs.size > 1

    const regionFlowSummary = (() => {
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
            .sort((a, b) => loc.getItemName(a.item).localeCompare(loc.getItemName(b.item)))
        const factoryOutputs: ItemFlow[] = Array.from(outputTotals.entries())
            .map(([item, sourceRate]) => ({ item, sinkRate: sourceRate, sourceRate }))
            .sort((a, b) => loc.getItemName(a.item).localeCompare(loc.getItemName(b.item)))
        const worldInputs: ItemFlow[] = regionResourceSupplies[region]
            .map((supply) => ({
                item: supply.item,
                sinkRate: supply.ratePerMinute / 60,
                sourceRate: supply.ratePerMinute / 60,
            }))

        return { factoryInputs, factoryOutputs, worldInputs }
    })()

    const regionName = loc.getRegionName(region)

    const selectionSummary = (() => {
        if (!hasMultipleSelection) {
            return null
        }

        const facilityIDs = new Set(fieldState.facilities.map(entry => entry.id))
        const pathIDs = new Set(fieldState.paths.map(entry => entry.id))
        const fixtureIDs = new Set(fieldState.pathFixtures.map(entry => entry.id))

        let facilityCount = 0
        let pathCount = 0
        let fixtureCount = 0
        let portCount = 0
        let unknownCount = 0

        for (const id of selectedIDs) {
            if (facilityIDs.has(id)) {
                facilityCount += 1
                continue
            }
            if (pathIDs.has(id)) {
                pathCount += 1
                continue
            }
            if (fixtureIDs.has(id)) {
                fixtureCount += 1
                continue
            }

            const [facilityID, portIndex] = id.split(":")
            if (facilityID && portIndex && facilityIDs.has(facilityID)) {
                portCount += 1
                continue
            }

            unknownCount += 1
        }

        return { facilityCount, pathCount, fixtureCount, portCount, unknownCount }
    })()

    const selected = (() => {
        if (!selectedID) {
            return null
        }

        const facility = fieldState.facilities.find(entry => entry.id === selectedID)
        if (facility) {
            return { kind: "facility" as const, facility }
        }

        const path = fieldState.paths.find(entry => entry.id === selectedID)
        if (path) {
            return { kind: "path" as const, path }
        }

        const fixture = fieldState.pathFixtures.find(entry => entry.id === selectedID)
        if (fixture) {
            return { kind: "fixture" as const, fixture }
        }

        for (const entry of fieldState.facilities) {
            for (let index = 0; index < entry.ports.length; index += 1) {
                const portID = `${entry.id}:${index}`
                if (portID === selectedID) {
                    return { kind: "port" as const, facility: entry, port: entry.ports[index], portIndex: index }
                }
            }
        }

        return null
    })()

    function renderFlows(
        flows: ReadonlyArray<{ item: ItemID; sourceRate: number; sinkRate: number }>,
        rateKey: "sourceRate" | "sinkRate",
        direction: "input" | "output",
        insufficientFlows?: Set<ItemID>,
        bottleneckItem?: ItemID,
        overSuppliedFlows?: Set<ItemID>
    ) {
        return (
            <ItemFlowDisplay
                flows={flows}
                rateKey={rateKey}
                direction={direction}
                insufficientFlows={insufficientFlows}
                bottleneckItem={bottleneckItem}
                overSuppliedFlows={overSuppliedFlows}
            />
        )
    }

    const SectionTitle = ({ children }: { children: ReactNode }) => (
        <div className="field-hud-section-title">{children}</div>
    )

    const HudSection = ({ title, children }: { title: ReactNode; children: ReactNode }) => (
        <div className="field-hud-section">
            <SectionTitle>{title}</SectionTitle>
            {children}
        </div>
    )

    const LabeledValue = ({ label, value, className }: { label: ReactNode; value: ReactNode; className?: string }) => (
        <div className={className}>
            <strong>{label}:</strong> {value}
        </div>
    )

    const FlowBlock = ({ label, children }: { label: ReactNode; children: ReactNode }) => (
        <>
            <strong>{label}:</strong>
            {children}
        </>
    )

    const errorFlagNames: Record<string, string> = {
        invalidPlacement: loc.ui.errorInvalidPlacement,
        outOfBounds: loc.ui.errorOutOfBounds,
        noValidRecipe: loc.ui.errorNoValidRecipe,
        unpowered: loc.ui.errorUnpowered,
        invalidLayout: loc.ui.errorInvalidLayout,
        invalidConnection: loc.ui.errorInvalidConnection,
        invalidTemplate: loc.ui.errorInvalidTemplate,
        invalidDepotBusConnection: loc.ui.errorInvalidDepotBusConnection,
        noItemAssigned: loc.ui.errorNoItemAssigned,
        nothingConnected: loc.ui.errorNothingConnected,
        bothInputs: loc.ui.errorBothInputs,
        bothOutputs: loc.ui.errorBothOutputs,
        congested: loc.ui.errorCongested,
        disconnected: loc.ui.errorDisconnected,
        blocked: loc.ui.errorBlocked,
    }

    function renderErrorFlags(errorFlags?: Record<string, boolean>) {
        if (!errorFlags) {
            return <div className="field-hud-value none">{loc.ui.none}</div>
        }
        const activeFlags = objectEntries(errorFlags).filter(([, value]) => value)
        if (activeFlags.length === 0) {
            return <div className="field-hud-value none">{loc.ui.none}</div>
        }
        return (
            <ul className="field-hud-list">
                {activeFlags.map(([key]) => (
                    <li key={key}>{errorFlagNames[key] || key}</li>
                ))}
            </ul>
        )
    }

    function getPathConnection(pathID: string, end: 'start' | 'end'): { id: string, type: 'facility' | 'fixture', name: string } | null {
        const path = fieldState.paths.find(p => p.id === pathID)
        if (!path) {
            return null
        }
        const otherConnection = getConnectedEntity(path, end, fieldState)

        if (otherConnection && 'facility' in otherConnection) {
            return { id: otherConnection.facility.id, type: 'facility', name: loc.getFacilityName(otherConnection.facility.type) }
        } else if (otherConnection && 'fixture' in otherConnection) {
            return { id: otherConnection.fixture.id, type: 'fixture', name: loc.getPathFixtureName(otherConnection.fixture.type) }
        }
        return null
    }

    return (
        <div className="field-hud">
            <div className="field-hud-title">{loc.ui.factorySummary}</div>
            {selectedIDs.size === 0 ? (
                <>
                    <HudSection title={loc.ui.regionPlanSummaryTitle}>
                        <LabeledValue label={loc.ui.regionPlanRegionLabel} value={regionName} />
                    </HudSection>
                    <HudSection title={loc.ui.world}>
                        <FlowBlock label={loc.ui.inputFlows}>
                            <RegionFlowList
                                flows={regionFlowSummary.worldInputs}
                                rateKey="sinkRate"
                                direction="input"
                            />
                        </FlowBlock>
                    </HudSection>
                    <HudSection title={loc.ui.regionPlanFactoriesLabel}>
                        <FlowBlock label={loc.ui.inputFlows}>
                            <RegionFlowList
                                flows={regionFlowSummary.factoryInputs}
                                rateKey="sinkRate"
                                direction="input"
                            />
                        </FlowBlock>
                        <FlowBlock label={loc.ui.outputFlows}>
                            <RegionFlowList
                                flows={regionFlowSummary.factoryOutputs}
                                rateKey="sourceRate"
                                direction="output"
                            />
                        </FlowBlock>
                    </HudSection>
                    <HudSection title={loc.ui.factoryLabel}>
                        <LabeledValue label={loc.ui.facilities} value={fieldState.facilities.length} />
                        <LabeledValue label={loc.ui.paths} value={fieldState.paths.length} />
                        <LabeledValue label={loc.ui.fixtures} value={fieldState.pathFixtures.length} />
                        <LabeledValue label={loc.ui.powerGenerated} value={`${depot.powerGenerated.toFixed(1)} ${loc.ui.powerFlowUnits}`} />
                        <LabeledValue label={loc.ui.powerConsumed} value={`${depot.powerConsumed.toFixed(1)} ${loc.ui.powerFlowUnits}`} />
                        <FlowBlock label={loc.ui.inputFlows}>
                            <ItemFlowDisplay
                                flows={depot.inputFlows}
                                rateKey="sinkRate"
                                direction="input"
                            />
                        </FlowBlock>
                        <FlowBlock label={loc.ui.outputFlows}>
                            <ItemFlowDisplay
                                flows={depot.outputFlows}
                                rateKey="sourceRate"
                                direction="output"
                            />
                        </FlowBlock>
                        <SectionTitle>{loc.ui.world}</SectionTitle>
                        <FlowBlock label={loc.ui.inputFlows}>
                            <ItemFlowDisplay
                                flows={world.inputFlows}
                                rateKey="sinkRate"
                                direction="input"
                            />
                        </FlowBlock>
                        <FlowBlock label={loc.ui.outputFlows}>
                            <ItemFlowDisplay
                                flows={world.outputFlows}
                                rateKey="sourceRate"
                                direction="output"
                            />
                        </FlowBlock>
                    </HudSection>
                </>
            ) : (
                <HudSection title={loc.ui.selection}>
                    {hasMultipleSelection && selectionSummary && (
                        <>
                            <LabeledValue label="Selected" value={selectedIDs.size} />
                            {selectionSummary.facilityCount > 0 && (
                                <LabeledValue label="Facilities" value={selectionSummary.facilityCount} />
                            )}
                            {selectionSummary.pathCount > 0 && (
                                <LabeledValue label="Paths" value={selectionSummary.pathCount} />
                            )}
                            {selectionSummary.fixtureCount > 0 && (
                                <LabeledValue label="Fixtures" value={selectionSummary.fixtureCount} />
                            )}
                            {selectionSummary.portCount > 0 && (
                                <LabeledValue label="Ports" value={selectionSummary.portCount} />
                            )}
                            {selectionSummary.unknownCount > 0 && (
                                <LabeledValue label="Other" value={selectionSummary.unknownCount} />
                            )}
                        </>
                    )}
                    {!selected && !hasMultipleSelection && <div className="field-hud-value none">{loc.ui.none}</div>}
                    {selected?.kind === "facility" && (() => {
                        const { facility } = selected
                        const facilityDef = facilities[facility.type]
                        const powerRequired = facilityDef?.power
                        const setRecipe = facility.setRecipe ? recipes[facility.setRecipe] : undefined
                        const actualRecipe = facility.actualRecipe ? recipes[facility.actualRecipe] : undefined

                        const hasRecipes = objectValues(recipes).some(r => r.facilityID === facility.type)

                        const hasPorts = facility.ports.length > 0

                        // Analyze bottlenecks for this facility
                        const { insufficientFlows, bottleneckItem, overSuppliedFlows } = analyzeFacilityFlows(facility)

                        // Calculate actual production rate vs theoretical maximum
                        let productionPercentage: number | undefined
                        if (actualRecipe && facility.outputFlows.length > 0) {
                            const theoreticalTotal = Object.values(actualRecipe.outputs).reduce((sum, count) => sum + ((count ?? 0) / actualRecipe.time), 0)
                            const actualTotal = facility.outputFlows.reduce((sum, flow) => sum + flow.sourceRate, 0)
                            productionPercentage = theoreticalTotal > 0 ? (actualTotal / theoreticalTotal) * 100 : 0
                        }
                        const isReducedProduction = productionPercentage !== undefined && productionPercentage < 99.9

                        return (
                            <>
                                <LabeledValue label={loc.ui.type} value={loc.getFacilityName(facility.type)} />
                                {powerRequired !== undefined && (
                                    <LabeledValue
                                        label={loc.ui.powerConsumed}
                                        value={`${powerRequired.toFixed(1)} ${loc.ui.powerFlowUnits} • ${facility.isPowered ? loc.ui.powered : loc.ui.noPower}`}
                                    />
                                )}

                                {hasRecipes && (
                                    <>
                                        <div><strong>{loc.ui.setRecipe}:</strong></div>
                                        {setRecipe ? <RecipeDisplay recipe={setRecipe} /> : <div className="field-hud-value none">{loc.ui.none}</div>}

                                        <div><strong>{loc.ui.actualRecipe}:</strong></div>
                                        {actualRecipe ? <RecipeDisplay recipe={actualRecipe} /> : <div className="field-hud-value none">{loc.ui.none}</div>}

                                        {isReducedProduction && productionPercentage !== undefined && (
                                            <div className="field-hud-production-warning">
                                                <AlertTriangle size={12} /> {loc.ui.productionAt} {productionPercentage.toFixed(1)}% {loc.ui.ofTheoreticalMaximum}
                                            </div>
                                        )}
                                    </>
                                )}

                                {hasPorts && (
                                    <>
                                        <FlowBlock label={loc.ui.inputFlows}>
                                            {renderFlows(facility.inputFlows, "sinkRate", "input", insufficientFlows, bottleneckItem, overSuppliedFlows)}
                                        </FlowBlock>
                                        <FlowBlock label={loc.ui.outputFlows}>
                                            {renderFlows(facility.outputFlows, "sourceRate", "output")}
                                        </FlowBlock>
                                    </>
                                )}

                                <FlowBlock label={loc.ui.errors}>
                                    {renderErrorFlags(facility.errorFlags)}
                                </FlowBlock>
                            </>
                        )
                    })()}

                    {selected?.kind === "path" && (() => (
                        <>
                            <LabeledValue label={loc.ui.type} value={loc.getPathTypeName(selected.path.type)} />
                            {selected.path.startConnectedTo && (
                                <LabeledValue label={loc.ui.connection} value={getPathConnection(selected.path.id, 'start')?.name ?? loc.ui.none} />
                            )}
                            {selected.path.endConnectedTo && (
                                <LabeledValue label={loc.ui.connection} value={getPathConnection(selected.path.id, 'end')?.name ?? loc.ui.none} />
                            )}
                            <FlowBlock label={loc.ui.outputFlows}>
                                {renderFlows(selected.path.flows, "sourceRate", "output")}
                            </FlowBlock>
                            <FlowBlock label={loc.ui.errors}>
                                {renderErrorFlags(selected.path.errorFlags)}
                            </FlowBlock>
                        </>
                    ))()}

                    {selected?.kind === "fixture" && (() => (
                        <>
                            <LabeledValue label={loc.ui.type} value={loc.getPathFixtureName(selected.fixture.type)} />
                            {selected.fixture.sides.map((side, index) => {
                                const startConnection = side.connectedPathID ? getPathConnection(side.connectedPathID, 'start') : null
                                const endConnection = side.connectedPathID ? getPathConnection(side.connectedPathID, 'end') : null
                                const connection = startConnection?.id === selected.fixture.id ? endConnection : startConnection
                                return (
                                    <div key={index}>
                                        <strong>{loc.getDirectionName(side.direction)}:</strong>
                                        {" "}{connection ? connection.name : ""}
                                        {renderFlows(side.flows, side.subType === "input" ? "sinkRate" : "sourceRate", side.subType === "input" ? "input" : "output")}
                                    </div>
                                )
                            })}
                            {selected.fixture.setItem !== undefined && (
                                <LabeledValue label={loc.ui.item} value={selected.fixture.setItem ? loc.getItemName(selected.fixture.setItem) : loc.ui.none} />
                            )}
                            <FlowBlock label={loc.ui.errors}>
                                {renderErrorFlags(selected.fixture.errorFlags)}
                            </FlowBlock>
                        </>
                    ))()}

                    {selected?.kind === "port" && (() => {
                        const { facility, port } = selected

                        const pathStart = port.connectedPathID ? getPathConnection(port.connectedPathID, 'start') : null
                        const pathEnd = port.connectedPathID ? getPathConnection(port.connectedPathID, 'end') : null
                        const otherEnd = pathStart?.id === facility.id ? pathEnd : pathStart

                        return (
                            <>
                                <LabeledValue label={loc.ui.facility} value={loc.getFacilityName(facility.type)} />
                                <LabeledValue label={loc.ui.type} value={`${loc.getPortTypeName(port.type)} / ${loc.getPortSubTypeName(port.subType)}`} />
                                <LabeledValue label={loc.ui.direction} value={loc.getDirectionName(port.direction)} />
                                {port.connectedPathID && (
                                    <LabeledValue label={loc.ui.connection} value={otherEnd?.name ?? loc.ui.none} />
                                )}
                                {port.setItem !== undefined && (
                                    <LabeledValue label={loc.ui.item} value={port.setItem ? loc.getItemName(port.setItem) : loc.ui.none} />
                                )}
                                {port.flows.length > 0 && (
                                    <>
                                        <FlowBlock label={port.subType === "input" ? loc.ui.inputFlows : loc.ui.outputFlows}>
                                            {renderFlows(port.flows, port.subType === "input" ? "sinkRate" : "sourceRate", port.subType === "input" ? "input" : "output")}
                                        </FlowBlock>
                                    </>
                                )}
                                <FlowBlock label={loc.ui.errors}>
                                    {renderErrorFlags(port.errorFlags)}
                                </FlowBlock>
                            </>
                        )
                    })()}
                </HudSection>
            )}
        </div>
    )
}
