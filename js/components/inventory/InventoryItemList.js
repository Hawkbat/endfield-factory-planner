import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/inventory/InventoryItemList.tsx";
import { InventoryItem } from "./InventoryItem.js";
export function InventoryItemList({ itemIDs, currentItemID, onSelectItem }) {
    return _jsxDEV("div", { className: "inventory-item-list", children: itemIDs.map(itemID => _jsxDEV(InventoryItem, { itemID: itemID, selected: itemID === currentItemID, onSelect: onSelectItem }, itemID, false, { fileName: _jsxFileName, lineNumber: 7, columnNumber: 31 }, this)) }, void 0, false, { fileName: _jsxFileName, lineNumber: 6, columnNumber: 11 }, this);
}
