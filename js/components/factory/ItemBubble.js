import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/ItemBubble.tsx";
import { useLocalization } from "../../contexts/localization.js";
import { items } from "../../data/items.js";
import { cn } from "../../utils/react.js";
export function ItemBubble({ itemID, x, y, size = 16, onClick }) {
    const { getItemName } = useLocalization();
    const itemData = itemID ? items[itemID] : undefined;
    function handleClick(e) {
        e.stopPropagation();
        onClick?.();
    }
    return (_jsxDEV("g", { onClick: handleClick, style: onClick ? { cursor: 'pointer' } : undefined, children: [_jsxDEV("circle", { cx: x, cy: y, r: size / 2, className: cn("item-bubble", `tier-${itemData?.tier ?? 1}`) }, void 0, false, { fileName: _jsxFileName, lineNumber: 28, columnNumber: 13 }, this), itemID ? _jsxDEV("image", { x: x - size / 2, y: y - size / 2, width: size, height: size, href: `images/${itemID}.webp`, className: "item-bubble-icon" }, void 0, false, { fileName: _jsxFileName, lineNumber: 34, columnNumber: 22 }, this) : null] }, void 0, true, { fileName: _jsxFileName, lineNumber: 23, columnNumber: 13 }, this));
}
