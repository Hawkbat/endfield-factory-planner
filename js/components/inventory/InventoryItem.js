import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/inventory/InventoryItem.tsx";
import { useLocalization } from "../../contexts/localization.js";
import { items } from "../../data/items.js";
import { cn } from "../../utils/react.js";
export function InventoryItem({ itemID, selected, onSelect }) {
    const { getItemName } = useLocalization();
    const itemData = items[itemID];
    const onClick = (e) => {
        e.stopPropagation();
        onSelect?.(itemID);
    };
    return _jsxDEV("div", { className: cn("inventory-item", `tier-${itemData.tier}`, { selected }), onClick: onClick, children: [_jsxDEV("img", { className: "inventory-item-icon", src: `images/${itemID}.webp` }, void 0, false, { fileName: _jsxFileName, lineNumber: 17, columnNumber: 9 }, this), _jsxDEV("div", { className: "inventory-item-name", children: getItemName(itemID) }, void 0, false, { fileName: _jsxFileName, lineNumber: 18, columnNumber: 9 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 16, columnNumber: 11 }, this);
}
