import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/common/ActionButton.tsx";
export function ActionButton({ onClick, disabled, children, title }) {
    function handleClick(e) {
        e.stopPropagation();
        onClick();
    }
    return (_jsxDEV("button", { className: "action-button", onClick: handleClick, disabled: disabled, title: title, children: children }, void 0, false, { fileName: _jsxFileName, lineNumber: 16, columnNumber: 13 }, this));
}
