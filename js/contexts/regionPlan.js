import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/contexts/regionPlan.tsx";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { RegionID } from "../types/data.js";
import { buildRegionPlanAssignments, loadRegionPlan, saveRegionPlan } from "../utils/regionPlanStorage.js";
const RegionPlanContext = createContext(null);
function normalizeRegionPlan(plan) {
    const defaults = buildRegionPlanAssignments(plan.region);
    const assignmentLookup = new Map(plan.assignments.map((assignment) => [assignment.fieldId, assignment]));
    const normalizedAssignments = defaults.map((assignment) => ({
        fieldId: assignment.fieldId,
        projectGuid: assignmentLookup.get(assignment.fieldId)?.projectGuid ?? null,
    }));
    return {
        ...plan,
        assignments: normalizedAssignments,
    };
}
export function RegionPlanProvider({ children }) {
    const [region, setRegion] = useState(RegionID.VALLEY_IV);
    const [plan, setPlan] = useState(() => normalizeRegionPlan(loadRegionPlan(region)));
    const [isRegionPlanOpen, setIsRegionPlanOpen] = useState(false);
    useEffect(() => {
        const loaded = normalizeRegionPlan(loadRegionPlan(region));
        setPlan(loaded);
    }, [region]);
    function setAssignment(fieldId, projectGuid) {
        if (plan.region !== region) {
            return;
        }
        const nextAssignments = plan.assignments.map((assignment) => assignment.fieldId === fieldId
            ? { ...assignment, projectGuid }
            : assignment);
        const nextPlan = {
            ...plan,
            assignments: nextAssignments,
        };
        setPlan(nextPlan);
        saveRegionPlan(nextPlan);
    }
    function openRegionPlan() {
        setIsRegionPlanOpen(true);
    }
    function closeRegionPlan() {
        setIsRegionPlanOpen(false);
    }
    const value = useMemo(() => ({
        region,
        setRegion,
        plan,
        assignments: plan.assignments,
        setAssignment,
        isRegionPlanOpen,
        openRegionPlan,
        closeRegionPlan,
    }), [region, plan, isRegionPlanOpen]);
    return (_jsxDEV(RegionPlanContext.Provider, { value: value, children: children }, void 0, false, { fileName: _jsxFileName, lineNumber: 78, columnNumber: 13 }, this));
}
export function useRegionPlan() {
    const ctx = useContext(RegionPlanContext);
    if (!ctx) {
        throw new Error("useRegionPlan must be used within RegionPlanProvider");
    }
    return ctx;
}
