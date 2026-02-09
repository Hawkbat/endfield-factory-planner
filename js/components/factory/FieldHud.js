import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/FieldHud.tsx";
import { objectEntries, objectValues } from "../../utils/types.js";
import { useLocalization } from "../../contexts/localization.js";
import { useRegionPlan } from "../../contexts/regionPlan.js";
import { useEdit } from "../../contexts/edit.js";
import { facilities } from "../../data/facilities.js";
import { recipes } from "../../data/recipes.js";
import { regionResourceSupplies } from "../../data/regions.js";
import { resolveFieldTemplate } from "../../data/templates.js";
import { ItemFlowDisplay } from "./ItemFlowDisplay.js";
import { RecipeDisplay } from "./RecipeDisplay.js";
import { createStateFromChanges } from "../../game/sampleField.js";
import { ItemID, RegionID } from "../../types/data.js";
import { getConnectedEntity } from "../../game/connections.js";
import { analyzeFacilityFlows } from "../../game/flows.js";
import { AlertTriangle } from "lucide-react";
import { loadProject } from "../../utils/projectStorage.js";
import { RegionFlowList } from "./RegionFlowList.js";
export function FieldHud({ fieldState, selectedID, selectedIDs }) {
    const { depot, world } = fieldState;
    const loc = useLocalization();
    const { region, assignments } = useRegionPlan();
    const { projectListing } = useEdit();
    const hasMultipleSelection = selectedIDs.size > 1;
    const regionFlowSummary = (() => {
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
            .sort((a, b) => loc.getItemName(a.item).localeCompare(loc.getItemName(b.item)));
        const factoryOutputs = Array.from(outputTotals.entries())
            .map(([item, sourceRate]) => ({ item, sinkRate: sourceRate, sourceRate }))
            .sort((a, b) => loc.getItemName(a.item).localeCompare(loc.getItemName(b.item)));
        const worldInputs = regionResourceSupplies[region]
            .map((supply) => ({
            item: supply.item,
            sinkRate: supply.ratePerMinute / 60,
            sourceRate: supply.ratePerMinute / 60,
        }));
        return { factoryInputs, factoryOutputs, worldInputs };
    })();
    const regionName = loc.getRegionName(region);
    const selectionSummary = (() => {
        if (!hasMultipleSelection) {
            return null;
        }
        const facilityIDs = new Set(fieldState.facilities.map(entry => entry.id));
        const pathIDs = new Set(fieldState.paths.map(entry => entry.id));
        const fixtureIDs = new Set(fieldState.pathFixtures.map(entry => entry.id));
        let facilityCount = 0;
        let pathCount = 0;
        let fixtureCount = 0;
        let portCount = 0;
        let unknownCount = 0;
        for (const id of selectedIDs) {
            if (facilityIDs.has(id)) {
                facilityCount += 1;
                continue;
            }
            if (pathIDs.has(id)) {
                pathCount += 1;
                continue;
            }
            if (fixtureIDs.has(id)) {
                fixtureCount += 1;
                continue;
            }
            const [facilityID, portIndex] = id.split(":");
            if (facilityID && portIndex && facilityIDs.has(facilityID)) {
                portCount += 1;
                continue;
            }
            unknownCount += 1;
        }
        return { facilityCount, pathCount, fixtureCount, portCount, unknownCount };
    })();
    const selected = (() => {
        if (!selectedID) {
            return null;
        }
        const facility = fieldState.facilities.find(entry => entry.id === selectedID);
        if (facility) {
            return { kind: "facility", facility };
        }
        const path = fieldState.paths.find(entry => entry.id === selectedID);
        if (path) {
            return { kind: "path", path };
        }
        const fixture = fieldState.pathFixtures.find(entry => entry.id === selectedID);
        if (fixture) {
            return { kind: "fixture", fixture };
        }
        for (const entry of fieldState.facilities) {
            for (let index = 0; index < entry.ports.length; index += 1) {
                const portID = `${entry.id}:${index}`;
                if (portID === selectedID) {
                    return { kind: "port", facility: entry, port: entry.ports[index], portIndex: index };
                }
            }
        }
        return null;
    })();
    function renderFlows(flows, rateKey, direction, insufficientFlows, bottleneckItem, overSuppliedFlows) {
        return (_jsxDEV(ItemFlowDisplay, { flows: flows, rateKey: rateKey, direction: direction, insufficientFlows: insufficientFlows, bottleneckItem: bottleneckItem, overSuppliedFlows: overSuppliedFlows }, void 0, false, { fileName: _jsxFileName, lineNumber: 164, columnNumber: 17 }, this));
    }
    const SectionTitle = ({ children }) => (_jsxDEV("div", { className: "field-hud-section-title", children: children }, void 0, false, { fileName: _jsxFileName, lineNumber: 176, columnNumber: 70 }, this));
    const HudSection = ({ title, children }) => (_jsxDEV("div", { className: "field-hud-section", children: [_jsxDEV(SectionTitle, { children: title }, void 0, false, { fileName: _jsxFileName, lineNumber: 182, columnNumber: 13 }, this), children] }, void 0, true, { fileName: _jsxFileName, lineNumber: 180, columnNumber: 93 }, this));
    const LabeledValue = ({ label, value, className }) => (_jsxDEV("div", { className: className, children: [_jsxDEV("strong", { children: [label, ":"] }, void 0, true, { fileName: _jsxFileName, lineNumber: 189, columnNumber: 13 }, this), " ", value] }, void 0, true, { fileName: _jsxFileName, lineNumber: 187, columnNumber: 120 }, this));
    const FlowBlock = ({ label, children }) => (_jsxDEV(_Fragment, { children: [_jsxDEV("strong", { children: [label, ":"] }, void 0, true, { fileName: _jsxFileName, lineNumber: 195, columnNumber: 13 }, this), children] }, void 0, true, { fileName: _jsxFileName, lineNumber: 193, columnNumber: 92 }, this));
    const errorFlagNames = {
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
    };
    function renderErrorFlags(errorFlags) {
        if (!errorFlags) {
            return _jsxDEV("div", { className: "field-hud-value none", children: loc.ui.none }, void 0, false, { fileName: _jsxFileName, lineNumber: 220, columnNumber: 19 }, this);
        }
        const activeFlags = objectEntries(errorFlags).filter(([, value]) => value);
        if (activeFlags.length === 0) {
            return _jsxDEV("div", { className: "field-hud-value none", children: loc.ui.none }, void 0, false, { fileName: _jsxFileName, lineNumber: 224, columnNumber: 19 }, this);
        }
        return (_jsxDEV("ul", { className: "field-hud-list", children: activeFlags.map(([key]) => (_jsxDEV("li", { children: errorFlagNames[key] || key }, key, false, { fileName: _jsxFileName, lineNumber: 228, columnNumber: 46 }, this))) }, void 0, false, { fileName: _jsxFileName, lineNumber: 226, columnNumber: 17 }, this));
    }
    function getPathConnection(pathID, end) {
        const path = fieldState.paths.find(p => p.id === pathID);
        if (!path) {
            return null;
        }
        const otherConnection = getConnectedEntity(path, end, fieldState);
        if (otherConnection && 'facility' in otherConnection) {
            return { id: otherConnection.facility.id, type: 'facility', name: loc.getFacilityName(otherConnection.facility.type) };
        }
        else if (otherConnection && 'fixture' in otherConnection) {
            return { id: otherConnection.fixture.id, type: 'fixture', name: loc.getPathFixtureName(otherConnection.fixture.type) };
        }
        return null;
    }
    return (_jsxDEV("div", { className: "field-hud", children: [_jsxDEV("div", { className: "field-hud-title", children: loc.ui.factorySummary }, void 0, false, { fileName: _jsxFileName, lineNumber: 252, columnNumber: 13 }, this), selectedIDs.size === 0 ? (_jsxDEV(_Fragment, { children: [_jsxDEV(HudSection, { title: loc.ui.regionPlanSummaryTitle, children: _jsxDEV(LabeledValue, { label: loc.ui.regionPlanRegionLabel, value: regionName }, void 0, false, { fileName: _jsxFileName, lineNumber: 256, columnNumber: 25 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 255, columnNumber: 21 }, this), _jsxDEV(HudSection, { title: loc.ui.world, children: _jsxDEV(FlowBlock, { label: loc.ui.inputFlows, children: _jsxDEV(RegionFlowList, { flows: regionFlowSummary.worldInputs, rateKey: "sinkRate", direction: "input" }, void 0, false, { fileName: _jsxFileName, lineNumber: 260, columnNumber: 29 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 259, columnNumber: 25 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 258, columnNumber: 21 }, this), _jsxDEV(HudSection, { title: loc.ui.regionPlanFactoriesLabel, children: [_jsxDEV(FlowBlock, { label: loc.ui.inputFlows, children: _jsxDEV(RegionFlowList, { flows: regionFlowSummary.factoryInputs, rateKey: "sinkRate", direction: "input" }, void 0, false, { fileName: _jsxFileName, lineNumber: 269, columnNumber: 29 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 268, columnNumber: 25 }, this), _jsxDEV(FlowBlock, { label: loc.ui.outputFlows, children: _jsxDEV(RegionFlowList, { flows: regionFlowSummary.factoryOutputs, rateKey: "sourceRate", direction: "output" }, void 0, false, { fileName: _jsxFileName, lineNumber: 276, columnNumber: 29 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 275, columnNumber: 25 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 267, columnNumber: 21 }, this), _jsxDEV(HudSection, { title: loc.ui.factoryLabel, children: [_jsxDEV(LabeledValue, { label: loc.ui.facilities, value: fieldState.facilities.length }, void 0, false, { fileName: _jsxFileName, lineNumber: 284, columnNumber: 25 }, this), _jsxDEV(LabeledValue, { label: loc.ui.paths, value: fieldState.paths.length }, void 0, false, { fileName: _jsxFileName, lineNumber: 285, columnNumber: 25 }, this), _jsxDEV(LabeledValue, { label: loc.ui.fixtures, value: fieldState.pathFixtures.length }, void 0, false, { fileName: _jsxFileName, lineNumber: 286, columnNumber: 25 }, this), _jsxDEV(LabeledValue, { label: loc.ui.powerGenerated, value: `${depot.powerGenerated.toFixed(1)} ${loc.ui.powerFlowUnits}` }, void 0, false, { fileName: _jsxFileName, lineNumber: 287, columnNumber: 25 }, this), _jsxDEV(LabeledValue, { label: loc.ui.powerConsumed, value: `${depot.powerConsumed.toFixed(1)} ${loc.ui.powerFlowUnits}` }, void 0, false, { fileName: _jsxFileName, lineNumber: 288, columnNumber: 25 }, this), _jsxDEV(FlowBlock, { label: loc.ui.inputFlows, children: _jsxDEV(ItemFlowDisplay, { flows: depot.inputFlows, rateKey: "sinkRate", direction: "input" }, void 0, false, { fileName: _jsxFileName, lineNumber: 290, columnNumber: 29 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 289, columnNumber: 25 }, this), _jsxDEV(FlowBlock, { label: loc.ui.outputFlows, children: _jsxDEV(ItemFlowDisplay, { flows: depot.outputFlows, rateKey: "sourceRate", direction: "output" }, void 0, false, { fileName: _jsxFileName, lineNumber: 297, columnNumber: 29 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 296, columnNumber: 25 }, this), _jsxDEV(SectionTitle, { children: loc.ui.world }, void 0, false, { fileName: _jsxFileName, lineNumber: 303, columnNumber: 25 }, this), _jsxDEV(FlowBlock, { label: loc.ui.inputFlows, children: _jsxDEV(ItemFlowDisplay, { flows: world.inputFlows, rateKey: "sinkRate", direction: "input" }, void 0, false, { fileName: _jsxFileName, lineNumber: 305, columnNumber: 29 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 304, columnNumber: 25 }, this), _jsxDEV(FlowBlock, { label: loc.ui.outputFlows, children: _jsxDEV(ItemFlowDisplay, { flows: world.outputFlows, rateKey: "sourceRate", direction: "output" }, void 0, false, { fileName: _jsxFileName, lineNumber: 312, columnNumber: 29 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 311, columnNumber: 25 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 283, columnNumber: 21 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 253, columnNumber: 40 }, this)) : (_jsxDEV(HudSection, { title: loc.ui.selection, children: [hasMultipleSelection && selectionSummary && (_jsxDEV(_Fragment, { children: [_jsxDEV(LabeledValue, { label: "Selected", value: selectedIDs.size }, void 0, false, { fileName: _jsxFileName, lineNumber: 324, columnNumber: 29 }, this), selectionSummary.facilityCount > 0 && (_jsxDEV(LabeledValue, { label: "Facilities", value: selectionSummary.facilityCount }, void 0, false, { fileName: _jsxFileName, lineNumber: 325, columnNumber: 69 }, this)), selectionSummary.pathCount > 0 && (_jsxDEV(LabeledValue, { label: "Paths", value: selectionSummary.pathCount }, void 0, false, { fileName: _jsxFileName, lineNumber: 328, columnNumber: 65 }, this)), selectionSummary.fixtureCount > 0 && (_jsxDEV(LabeledValue, { label: "Fixtures", value: selectionSummary.fixtureCount }, void 0, false, { fileName: _jsxFileName, lineNumber: 331, columnNumber: 68 }, this)), selectionSummary.portCount > 0 && (_jsxDEV(LabeledValue, { label: "Ports", value: selectionSummary.portCount }, void 0, false, { fileName: _jsxFileName, lineNumber: 334, columnNumber: 65 }, this)), selectionSummary.unknownCount > 0 && (_jsxDEV(LabeledValue, { label: "Other", value: selectionSummary.unknownCount }, void 0, false, { fileName: _jsxFileName, lineNumber: 337, columnNumber: 68 }, this))] }, void 0, true, { fileName: _jsxFileName, lineNumber: 322, columnNumber: 67 }, this)), !selected && !hasMultipleSelection && _jsxDEV("div", { className: "field-hud-value none", children: loc.ui.none }, void 0, false, { fileName: _jsxFileName, lineNumber: 342, columnNumber: 59 }, this), selected?.kind === "facility" && (() => {
                        const { facility } = selected;
                        const facilityDef = facilities[facility.type];
                        const powerRequired = facilityDef?.power;
                        const setRecipe = facility.setRecipe ? recipes[facility.setRecipe] : undefined;
                        const actualRecipe = facility.actualRecipe ? recipes[facility.actualRecipe] : undefined;
                        const hasRecipes = objectValues(recipes).some(r => r.facilityID === facility.type);
                        const hasPorts = facility.ports.length > 0;
                        // Analyze bottlenecks for this facility
                        const { insufficientFlows, bottleneckItem, overSuppliedFlows } = analyzeFacilityFlows(facility);
                        // Calculate actual production rate vs theoretical maximum
                        let productionPercentage;
                        if (actualRecipe && facility.outputFlows.length > 0) {
                            const theoreticalTotal = Object.values(actualRecipe.outputs).reduce((sum, count) => sum + ((count ?? 0) / actualRecipe.time), 0);
                            const actualTotal = facility.outputFlows.reduce((sum, flow) => sum + flow.sourceRate, 0);
                            productionPercentage = theoreticalTotal > 0 ? (actualTotal / theoreticalTotal) * 100 : 0;
                        }
                        const isReducedProduction = productionPercentage !== undefined && productionPercentage < 99.9;
                        return (_jsxDEV(_Fragment, { children: [_jsxDEV(LabeledValue, { label: loc.ui.type, value: loc.getFacilityName(facility.type) }, void 0, false, { fileName: _jsxFileName, lineNumber: 368, columnNumber: 33 }, this), powerRequired !== undefined && (_jsxDEV(LabeledValue, { label: loc.ui.powerConsumed, value: `${powerRequired.toFixed(1)} ${loc.ui.powerFlowUnits} • ${facility.isPowered ? loc.ui.powered : loc.ui.noPower}` }, void 0, false, { fileName: _jsxFileName, lineNumber: 369, columnNumber: 66 }, this)), hasRecipes && (_jsxDEV(_Fragment, { children: [_jsxDEV("div", { children: _jsxDEV("strong", { children: [loc.ui.setRecipe, ":"] }, void 0, true, { fileName: _jsxFileName, lineNumber: 378, columnNumber: 46 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 378, columnNumber: 41 }, this), setRecipe ? _jsxDEV(RecipeDisplay, { recipe: setRecipe }, void 0, false, { fileName: _jsxFileName, lineNumber: 379, columnNumber: 53 }, this) : _jsxDEV("div", { className: "field-hud-value none", children: loc.ui.none }, void 0, false, { fileName: _jsxFileName, lineNumber: 379, columnNumber: 92 }, this), _jsxDEV("div", { children: _jsxDEV("strong", { children: [loc.ui.actualRecipe, ":"] }, void 0, true, { fileName: _jsxFileName, lineNumber: 381, columnNumber: 46 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 381, columnNumber: 41 }, this), actualRecipe ? _jsxDEV(RecipeDisplay, { recipe: actualRecipe }, void 0, false, { fileName: _jsxFileName, lineNumber: 382, columnNumber: 56 }, this) : _jsxDEV("div", { className: "field-hud-value none", children: loc.ui.none }, void 0, false, { fileName: _jsxFileName, lineNumber: 382, columnNumber: 98 }, this), isReducedProduction && productionPercentage !== undefined && (_jsxDEV("div", { className: "field-hud-production-warning", children: [_jsxDEV(AlertTriangle, { size: 12 }, void 0, false, { fileName: _jsxFileName, lineNumber: 386, columnNumber: 49 }, this), " ", loc.ui.productionAt, " ", productionPercentage.toFixed(1), "% ", loc.ui.ofTheoreticalMaximum] }, void 0, true, { fileName: _jsxFileName, lineNumber: 384, columnNumber: 104 }, this))] }, void 0, true, { fileName: _jsxFileName, lineNumber: 376, columnNumber: 49 }, this)), hasPorts && (_jsxDEV(_Fragment, { children: [_jsxDEV(FlowBlock, { label: loc.ui.inputFlows, children: renderFlows(facility.inputFlows, "sinkRate", "input", insufficientFlows, bottleneckItem, overSuppliedFlows) }, void 0, false, { fileName: _jsxFileName, lineNumber: 394, columnNumber: 41 }, this), _jsxDEV(FlowBlock, { label: loc.ui.outputFlows, children: renderFlows(facility.outputFlows, "sourceRate", "output") }, void 0, false, { fileName: _jsxFileName, lineNumber: 397, columnNumber: 41 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 392, columnNumber: 47 }, this)), _jsxDEV(FlowBlock, { label: loc.ui.errors, children: renderErrorFlags(facility.errorFlags) }, void 0, false, { fileName: _jsxFileName, lineNumber: 403, columnNumber: 33 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 366, columnNumber: 33 }, this));
                    })(), selected?.kind === "path" && (() => (_jsxDEV(_Fragment, { children: [_jsxDEV(LabeledValue, { label: loc.ui.type, value: loc.getPathTypeName(selected.path.type) }, void 0, false, { fileName: _jsxFileName, lineNumber: 412, columnNumber: 29 }, this), selected.path.startConnectedTo && (_jsxDEV(LabeledValue, { label: loc.ui.connection, value: getPathConnection(selected.path.id, 'start')?.name ?? loc.ui.none }, void 0, false, { fileName: _jsxFileName, lineNumber: 413, columnNumber: 65 }, this)), selected.path.endConnectedTo && (_jsxDEV(LabeledValue, { label: loc.ui.connection, value: getPathConnection(selected.path.id, 'end')?.name ?? loc.ui.none }, void 0, false, { fileName: _jsxFileName, lineNumber: 416, columnNumber: 63 }, this)), _jsxDEV(FlowBlock, { label: loc.ui.outputFlows, children: renderFlows(selected.path.flows, "sourceRate", "output") }, void 0, false, { fileName: _jsxFileName, lineNumber: 419, columnNumber: 29 }, this), _jsxDEV(FlowBlock, { label: loc.ui.errors, children: renderErrorFlags(selected.path.errorFlags) }, void 0, false, { fileName: _jsxFileName, lineNumber: 422, columnNumber: 29 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 410, columnNumber: 59 }, this)))(), selected?.kind === "fixture" && (() => (_jsxDEV(_Fragment, { children: [_jsxDEV(LabeledValue, { label: loc.ui.type, value: loc.getPathFixtureName(selected.fixture.type) }, void 0, false, { fileName: _jsxFileName, lineNumber: 430, columnNumber: 29 }, this), selected.fixture.sides.map((side, index) => {
                                const startConnection = side.connectedPathID ? getPathConnection(side.connectedPathID, 'start') : null;
                                const endConnection = side.connectedPathID ? getPathConnection(side.connectedPathID, 'end') : null;
                                const connection = startConnection?.id === selected.fixture.id ? endConnection : startConnection;
                                return (_jsxDEV("div", { children: [_jsxDEV("strong", { children: [loc.getDirectionName(side.direction), ":"] }, void 0, true, { fileName: _jsxFileName, lineNumber: 437, columnNumber: 41 }, this), " ", connection ? connection.name : "", renderFlows(side.flows, side.subType === "input" ? "sinkRate" : "sourceRate", side.subType === "input" ? "input" : "output")] }, index, true, { fileName: _jsxFileName, lineNumber: 435, columnNumber: 41 }, this));
                            }), selected.fixture.setItem !== undefined && (_jsxDEV(LabeledValue, { label: loc.ui.item, value: selected.fixture.setItem ? loc.getItemName(selected.fixture.setItem) : loc.ui.none }, void 0, false, { fileName: _jsxFileName, lineNumber: 443, columnNumber: 73 }, this)), _jsxDEV(FlowBlock, { label: loc.ui.errors, children: renderErrorFlags(selected.fixture.errorFlags) }, void 0, false, { fileName: _jsxFileName, lineNumber: 446, columnNumber: 29 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 428, columnNumber: 62 }, this)))(), selected?.kind === "port" && (() => {
                        const { facility, port } = selected;
                        const pathStart = port.connectedPathID ? getPathConnection(port.connectedPathID, 'start') : null;
                        const pathEnd = port.connectedPathID ? getPathConnection(port.connectedPathID, 'end') : null;
                        const otherEnd = pathStart?.id === facility.id ? pathEnd : pathStart;
                        return (_jsxDEV(_Fragment, { children: [_jsxDEV(LabeledValue, { label: loc.ui.facility, value: loc.getFacilityName(facility.type) }, void 0, false, { fileName: _jsxFileName, lineNumber: 461, columnNumber: 33 }, this), _jsxDEV(LabeledValue, { label: loc.ui.type, value: `${loc.getPortTypeName(port.type)} / ${loc.getPortSubTypeName(port.subType)}` }, void 0, false, { fileName: _jsxFileName, lineNumber: 462, columnNumber: 33 }, this), _jsxDEV(LabeledValue, { label: loc.ui.direction, value: loc.getDirectionName(port.direction) }, void 0, false, { fileName: _jsxFileName, lineNumber: 463, columnNumber: 33 }, this), port.connectedPathID && (_jsxDEV(LabeledValue, { label: loc.ui.connection, value: otherEnd?.name ?? loc.ui.none }, void 0, false, { fileName: _jsxFileName, lineNumber: 464, columnNumber: 59 }, this)), port.setItem !== undefined && (_jsxDEV(LabeledValue, { label: loc.ui.item, value: port.setItem ? loc.getItemName(port.setItem) : loc.ui.none }, void 0, false, { fileName: _jsxFileName, lineNumber: 467, columnNumber: 65 }, this)), port.flows.length > 0 && (_jsxDEV(_Fragment, { children: _jsxDEV(FlowBlock, { label: port.subType === "input" ? loc.ui.inputFlows : loc.ui.outputFlows, children: renderFlows(port.flows, port.subType === "input" ? "sinkRate" : "sourceRate", port.subType === "input" ? "input" : "output") }, void 0, false, { fileName: _jsxFileName, lineNumber: 472, columnNumber: 41 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 470, columnNumber: 60 }, this)), _jsxDEV(FlowBlock, { label: loc.ui.errors, children: renderErrorFlags(port.errorFlags) }, void 0, false, { fileName: _jsxFileName, lineNumber: 477, columnNumber: 33 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 459, columnNumber: 33 }, this));
                    })()] }, void 0, true, { fileName: _jsxFileName, lineNumber: 320, columnNumber: 18 }, this))] }, void 0, true, { fileName: _jsxFileName, lineNumber: 250, columnNumber: 13 }, this));
}
