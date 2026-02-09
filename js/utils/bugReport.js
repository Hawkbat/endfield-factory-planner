const ISSUE_BASE_URL = "https://github.com/Hawkbat/endfield-factory-planner/issues/new";
const ISSUE_TEMPLATE_NAME = "bug-report.md";
function isError(value) {
    return value instanceof Error;
}
function toMessage(value) {
    if (typeof value === "string") {
        return value;
    }
    if (isError(value)) {
        return value.message || "Unknown error";
    }
    try {
        return JSON.stringify(value);
    }
    catch {
        return "Unknown error";
    }
}
function toStack(value) {
    if (isError(value) && value.stack) {
        return value.stack;
    }
    return undefined;
}
function safeStringify(value) {
    const seen = new WeakSet();
    try {
        return JSON.stringify(value, (_key, val) => {
            if (typeof val === "bigint") {
                return val.toString();
            }
            if (typeof val === "object" && val !== null) {
                if (seen.has(val)) {
                    return "[Circular]";
                }
                seen.add(val);
            }
            return val;
        }, 2);
    }
    catch {
        return "[Unserializable context]";
    }
}
function getEnvDetails() {
    return {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
    };
}
export function captureErrorDetails(error, source, componentStack) {
    const env = getEnvDetails();
    return {
        source,
        message: toMessage(error),
        stack: toStack(error),
        componentStack,
        ...env,
    };
}
export function captureWindowError(event) {
    const env = getEnvDetails();
    const stack = toStack(event.error);
    const locationInfo = event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : "Unknown source";
    return {
        source: "window-error",
        message: event.message || "Unknown error",
        stack: stack || locationInfo,
        ...env,
    };
}
export function captureUnhandledRejection(event) {
    const env = getEnvDetails();
    const reason = event.reason;
    return {
        source: "unhandled-rejection",
        message: toMessage(reason),
        stack: toStack(reason),
        ...env,
    };
}
function buildBugReportBody(details, snapshot) {
    const contextPayload = snapshot ? safeStringify(snapshot) : "[Context unavailable]";
    const stack = details.stack || "[No stack trace]";
    const componentStack = details.componentStack || "[No component stack]";
    const includeStacks = details.source !== "manual-report";
    const sections = [
        "# Endfield Factory Planner Bug Report",
        "",
        "## What happened",
        "[Describe what you observed]",
        "",
        "## What should have happened",
        "[Describe what you expected]",
        "",
        "## What were you doing",
        "[Steps leading up to the issue]",
        "",
        "## Technical details:",
        "<details>",
        "<summary>Click to expand</summary>",
        `Timestamp: ${details.timestamp}`,
        `Source: ${details.source}`,
        `URL: ${details.url}`,
        `User Agent: ${details.userAgent}`,
        "",
        "## Error Message",
        details.message,
        ...(includeStacks ? [
            "",
            "## Stack Trace",
            "```",
            stack,
            "```",
            "",
            "## Component Stack",
            "```",
            componentStack,
            "```"
        ] : []),
        "",
        "## Edit Context Snapshot",
        "```json",
        contextPayload,
        "```",
        "</details>",
    ];
    return sections.join("\n");
}
export function buildBugReport(details, snapshot) {
    return buildBugReportBody(details, snapshot);
}
export function createManualReportDetails() {
    const env = getEnvDetails();
    return {
        source: "manual-report",
        message: "User-reported issue",
        ...env,
    };
}
export function buildManualIssueUrl() {
    return buildIssueUrl();
}
export function buildIssueUrl() {
    return `${ISSUE_BASE_URL}?template=${ISSUE_TEMPLATE_NAME}`;
}
