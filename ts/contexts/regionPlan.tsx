import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { RegionID, type RegionFieldID } from "../types/data.ts"
import type { RegionPlanAssignmentV1, RegionPlanJsonV1 } from "../types/external.ts"
import { buildRegionPlanAssignments, loadRegionPlan, saveRegionPlan } from "../utils/regionPlanStorage.ts"

interface RegionPlanContextValue {
    region: RegionID
    setRegion: (region: RegionID) => void
    plan: RegionPlanJsonV1
    assignments: RegionPlanAssignmentV1[]
    setAssignment: (fieldId: RegionFieldID, projectGuid: string | null) => void
    isRegionPlanOpen: boolean
    openRegionPlan: () => void
    closeRegionPlan: () => void
}

const RegionPlanContext = createContext<RegionPlanContextValue | null>(null)

function normalizeRegionPlan(plan: RegionPlanJsonV1): RegionPlanJsonV1 {
    const defaults = buildRegionPlanAssignments(plan.region)
    const assignmentLookup = new Map(plan.assignments.map((assignment) => [assignment.fieldId, assignment]))
    const normalizedAssignments = defaults.map((assignment) => ({
        fieldId: assignment.fieldId,
        projectGuid: assignmentLookup.get(assignment.fieldId)?.projectGuid ?? null,
    }))
    return {
        ...plan,
        assignments: normalizedAssignments,
    }
}

export function RegionPlanProvider({ children }: { children: ReactNode }) {
    const [region, setRegion] = useState<RegionID>(RegionID.VALLEY_IV)
    const [plan, setPlan] = useState<RegionPlanJsonV1>(() => normalizeRegionPlan(loadRegionPlan(region)))
    const [isRegionPlanOpen, setIsRegionPlanOpen] = useState(false)

    useEffect(() => {
        const loaded = normalizeRegionPlan(loadRegionPlan(region))
        setPlan(loaded)
    }, [region])

    function setAssignment(fieldId: RegionFieldID, projectGuid: string | null) {
        if (plan.region !== region) {
            return
        }
        const nextAssignments = plan.assignments.map((assignment) =>
            assignment.fieldId === fieldId
                ? { ...assignment, projectGuid }
                : assignment
        )
        const nextPlan: RegionPlanJsonV1 = {
            ...plan,
            assignments: nextAssignments,
        }
        setPlan(nextPlan)
        saveRegionPlan(nextPlan)
    }

    function openRegionPlan() {
        setIsRegionPlanOpen(true)
    }

    function closeRegionPlan() {
        setIsRegionPlanOpen(false)
    }

    const value = useMemo<RegionPlanContextValue>(() => ({
        region,
        setRegion,
        plan,
        assignments: plan.assignments,
        setAssignment,
        isRegionPlanOpen,
        openRegionPlan,
        closeRegionPlan,
    }), [region, plan, isRegionPlanOpen])

    return (
        <RegionPlanContext.Provider value={value}>
            {children}
        </RegionPlanContext.Provider>
    )
}

export function useRegionPlan() {
    const ctx = useContext(RegionPlanContext)
    if (!ctx) {
        throw new Error("useRegionPlan must be used within RegionPlanProvider")
    }
    return ctx
}
