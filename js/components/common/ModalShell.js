import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/common/ModalShell.tsx";
import { cn } from "../../utils/react.js";
export function ModalShell({ isOpen, onClose, closeOnBackdrop = true, showCloseButton = false, className, children, }) {
    if (!isOpen) {
        return null;
    }
    function handleBackdropClick(event) {
        if (!closeOnBackdrop || !onClose) {
            return;
        }
        onClose(event);
    }
    function handleCloseClick(event) {
        if (!onClose) {
            return;
        }
        onClose(event);
    }
    return (_jsxDEV("div", { className: "modal-backdrop", onClick: handleBackdropClick, children: _jsxDEV("div", { className: cn("modal", className), onClick: event => event.stopPropagation(), children: [showCloseButton && (_jsxDEV("div", { className: "modal-closer", onClick: handleCloseClick, children: "X" }, void 0, false, { fileName: _jsxFileName, lineNumber: 42, columnNumber: 38 }, this)), children] }, void 0, true, { fileName: _jsxFileName, lineNumber: 41, columnNumber: 13 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 39, columnNumber: 13 }, this));
}
