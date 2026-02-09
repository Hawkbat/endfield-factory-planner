import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type ErrorInfo } from "react"
import { BugReportContextProvider } from "../../contexts/bugReport.tsx"
import { useLocalization } from "../../contexts/localization.tsx"
import type { EditContextSnapshot, CapturedErrorDetails } from "../../utils/bugReport.ts"
import { buildBugReport, buildIssueUrl, captureErrorDetails, captureUnhandledRejection, captureWindowError, createManualReportDetails } from "../../utils/bugReport.ts"

interface BugReportState {
    details: CapturedErrorDetails
    snapshot: EditContextSnapshot | null
}

interface BugReportBoundaryProps {
    children: ReactNode
    onError: (state: BugReportState) => void
    getSnapshot: () => EditContextSnapshot | null
}

interface BugReportBoundaryState {
    hasError: boolean
}

class BugReportBoundary extends Component<BugReportBoundaryProps, BugReportBoundaryState> {
    constructor(props: BugReportBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(): BugReportBoundaryState {
        return { hasError: true }
    }

    componentDidCatch(error: unknown, info: ErrorInfo) {
        const snapshot = this.props.getSnapshot()
        const details = captureErrorDetails(error, "error-boundary", info.componentStack ?? undefined)
        this.props.onError({ details, snapshot })
    }

    render() {
        if (this.state.hasError) {
            return null
        }
        return this.props.children
    }
}

function BugReportOverlay({
    state,
}: {
    state: BugReportState
}) {
    const { ui } = useLocalization()
    const reportText = useMemo(() => buildBugReport(state.details, state.snapshot), [state])
    const issueUrl = buildIssueUrl()
    const [copyStatus, setCopyStatus] = useState<string | null>(null)

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(reportText)
            setCopyStatus(ui.bugReportCopySuccess)
        } catch {
            setCopyStatus(ui.bugReportCopyFailure)
        }
    }

    function handleReload() {
        window.location.reload()
    }

    return (
        <div className="bug-report-overlay">
            <div className="bug-report-card">
                <div className="bug-report-header">
                    <div className="bug-report-title">{ui.bugReportTitle}</div>
                    <div className="bug-report-description">{ui.bugReportDescription}</div>
                </div>
                <label className="bug-report-label" htmlFor="bug-report-details">
                    {ui.bugReportDetailsLabel}
                </label>
                <textarea
                    id="bug-report-details"
                    className="bug-report-message"
                    readOnly
                    value={reportText}
                />
                {copyStatus && <div className="bug-report-status">{copyStatus}</div>}
                <div className="bug-report-actions">
                    <button className="bug-report-button" onClick={handleCopy}>
                        {ui.bugReportCopyButton}
                    </button>
                    <a
                        className="bug-report-button bug-report-link"
                        href={issueUrl}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {ui.bugReportOpenIssueButton}
                    </a>
                    <button className="bug-report-button bug-report-secondary" onClick={handleReload}>
                        {ui.bugReportReloadButton}
                    </button>
                </div>
            </div>
        </div>
    )
}

function BugReportQuickAction({
    onOpen,
}: {
    onOpen: () => void
}) {
    const { ui } = useLocalization()

    return (
        <button
            className="bug-report-quick-button"
            onClick={onOpen}
            title={ui.reportIssueTooltip}
        >
            {ui.reportIssue}
        </button>
    )
}

export function BugReportProvider({ children }: { children: ReactNode }) {
    const { ui } = useLocalization()
    const [errorState, setErrorState] = useState<BugReportState | null>(null)
    const snapshotRef = useRef<EditContextSnapshot | null>(null)

    const setSnapshot = useCallback((snapshot: EditContextSnapshot) => {
        snapshotRef.current = snapshot
    }, [])

    const getSnapshot = useCallback(() => snapshotRef.current, [])

    useEffect(() => {
        function handleWindowError(event: ErrorEvent) {
            const details = captureWindowError(event)
            setErrorState({ details, snapshot: getSnapshot() })
        }

        function handleUnhandledRejection(event: PromiseRejectionEvent) {
            const details = captureUnhandledRejection(event)
            setErrorState({ details, snapshot: getSnapshot() })
        }

        window.addEventListener("error", handleWindowError)
        window.addEventListener("unhandledrejection", handleUnhandledRejection)

        return () => {
            window.removeEventListener("error", handleWindowError)
            window.removeEventListener("unhandledrejection", handleUnhandledRejection)
        }
    }, [getSnapshot])

    const openManualReport = useCallback(() => {
        const details = createManualReportDetails()
        setErrorState({ details, snapshot: getSnapshot() })
    }, [getSnapshot])

    return (
        <BugReportContextProvider value={{ setSnapshot, getSnapshot }}>
            <BugReportBoundary
                getSnapshot={getSnapshot}
                onError={(state) => setErrorState(state)}
            >
                {children}
            </BugReportBoundary>
            {errorState && <BugReportOverlay state={errorState} />}
            <BugReportQuickAction onOpen={openManualReport} />
        </BugReportContextProvider>
    )
}