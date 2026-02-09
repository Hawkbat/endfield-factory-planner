import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/common/BugReportProvider.tsx";
import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BugReportContextProvider } from "../../contexts/bugReport.js";
import { useLocalization } from "../../contexts/localization.js";
import { buildBugReport, buildIssueUrl, captureErrorDetails, captureUnhandledRejection, captureWindowError, createManualReportDetails } from "../../utils/bugReport.js";
class BugReportBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        const snapshot = this.props.getSnapshot();
        const details = captureErrorDetails(error, "error-boundary", info.componentStack ?? undefined);
        this.props.onError({ details, snapshot });
    }
    render() {
        if (this.state.hasError) {
            return null;
        }
        return this.props.children;
    }
}
function BugReportOverlay({ state, }) {
    const { ui } = useLocalization();
    const reportText = useMemo(() => buildBugReport(state.details, state.snapshot), [state]);
    const issueUrl = buildIssueUrl();
    const [copyStatus, setCopyStatus] = useState(null);
    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(reportText);
            setCopyStatus(ui.bugReportCopySuccess);
        }
        catch {
            setCopyStatus(ui.bugReportCopyFailure);
        }
    }
    function handleReload() {
        window.location.reload();
    }
    return (_jsxDEV("div", { className: "bug-report-overlay", children: _jsxDEV("div", { className: "bug-report-card", children: [_jsxDEV("div", { className: "bug-report-header", children: [_jsxDEV("div", { className: "bug-report-title", children: ui.bugReportTitle }, void 0, false, { fileName: _jsxFileName, lineNumber: 73, columnNumber: 21 }, this), _jsxDEV("div", { className: "bug-report-description", children: ui.bugReportDescription }, void 0, false, { fileName: _jsxFileName, lineNumber: 74, columnNumber: 21 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 72, columnNumber: 17 }, this), _jsxDEV("label", { className: "bug-report-label", htmlFor: "bug-report-details", children: ui.bugReportDetailsLabel }, void 0, false, { fileName: _jsxFileName, lineNumber: 76, columnNumber: 17 }, this), _jsxDEV("textarea", { id: "bug-report-details", className: "bug-report-message", readOnly: true, value: reportText }, void 0, false, { fileName: _jsxFileName, lineNumber: 79, columnNumber: 17 }, this), copyStatus && _jsxDEV("div", { className: "bug-report-status", children: copyStatus }, void 0, false, { fileName: _jsxFileName, lineNumber: 85, columnNumber: 31 }, this), _jsxDEV("div", { className: "bug-report-actions", children: [_jsxDEV("button", { className: "bug-report-button", onClick: handleCopy, children: ui.bugReportCopyButton }, void 0, false, { fileName: _jsxFileName, lineNumber: 87, columnNumber: 21 }, this), _jsxDEV("a", { className: "bug-report-button bug-report-link", href: issueUrl, target: "_blank", rel: "noreferrer", children: ui.bugReportOpenIssueButton }, void 0, false, { fileName: _jsxFileName, lineNumber: 90, columnNumber: 21 }, this), _jsxDEV("button", { className: "bug-report-button bug-report-secondary", onClick: handleReload, children: ui.bugReportReloadButton }, void 0, false, { fileName: _jsxFileName, lineNumber: 98, columnNumber: 21 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 86, columnNumber: 17 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 71, columnNumber: 13 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 69, columnNumber: 13 }, this));
}
function BugReportQuickAction({ onOpen, }) {
    const { ui } = useLocalization();
    return (_jsxDEV("button", { className: "bug-report-quick-button", onClick: onOpen, title: ui.reportIssueTooltip, children: ui.reportIssue }, void 0, false, { fileName: _jsxFileName, lineNumber: 114, columnNumber: 13 }, this));
}
export function BugReportProvider({ children }) {
    const { ui } = useLocalization();
    const [errorState, setErrorState] = useState(null);
    const snapshotRef = useRef(null);
    const setSnapshot = useCallback((snapshot) => {
        snapshotRef.current = snapshot;
    }, []);
    const getSnapshot = useCallback(() => snapshotRef.current, []);
    useEffect(() => {
        function handleWindowError(event) {
            const details = captureWindowError(event);
            setErrorState({ details, snapshot: getSnapshot() });
        }
        function handleUnhandledRejection(event) {
            const details = captureUnhandledRejection(event);
            setErrorState({ details, snapshot: getSnapshot() });
        }
        window.addEventListener("error", handleWindowError);
        window.addEventListener("unhandledrejection", handleUnhandledRejection);
        return () => {
            window.removeEventListener("error", handleWindowError);
            window.removeEventListener("unhandledrejection", handleUnhandledRejection);
        };
    }, [getSnapshot]);
    const openManualReport = useCallback(() => {
        const details = createManualReportDetails();
        setErrorState({ details, snapshot: getSnapshot() });
    }, [getSnapshot]);
    return (_jsxDEV(BugReportContextProvider, { value: { setSnapshot, getSnapshot }, children: [_jsxDEV(BugReportBoundary, { getSnapshot: getSnapshot, onError: (state) => setErrorState(state), children: children }, void 0, false, { fileName: _jsxFileName, lineNumber: 163, columnNumber: 13 }, this), errorState && _jsxDEV(BugReportOverlay, { state: errorState }, void 0, false, { fileName: _jsxFileName, lineNumber: 169, columnNumber: 27 }, this), _jsxDEV(BugReportQuickAction, { onOpen: openManualReport }, void 0, false, { fileName: _jsxFileName, lineNumber: 170, columnNumber: 13 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 161, columnNumber: 13 }, this));
}
