import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/contexts/bugReport.tsx";
import { createContext, useContext } from "react";
const BugReportContext = createContext(null);
export function BugReportContextProvider({ children, value, }) {
    return (_jsxDEV(BugReportContext.Provider, { value: value, children: children }, void 0, false, { fileName: _jsxFileName, lineNumber: 18, columnNumber: 13 }, this));
}
export function useBugReportSnapshotSetter() {
    const ctx = useContext(BugReportContext);
    if (!ctx) {
        return () => { };
    }
    return ctx.setSnapshot;
}
