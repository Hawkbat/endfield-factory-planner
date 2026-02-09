import { createContext, useContext, type ReactNode } from "react"
import type { EditContextSnapshot } from "../utils/bugReport.ts"

interface BugReportContextValue {
    setSnapshot: (snapshot: EditContextSnapshot) => void
    getSnapshot: () => EditContextSnapshot | null
}

const BugReportContext = createContext<BugReportContextValue | null>(null)

export function BugReportContextProvider({
    children,
    value,
}: {
    children: ReactNode
    value: BugReportContextValue
}) {
    return (
        <BugReportContext.Provider value={value}>
            {children}
        </BugReportContext.Provider>
    )
}

export function useBugReportSnapshotSetter(): (snapshot: EditContextSnapshot) => void {
    const ctx = useContext(BugReportContext)
    if (!ctx) {
        return () => {}
    }
    return ctx.setSnapshot
}
