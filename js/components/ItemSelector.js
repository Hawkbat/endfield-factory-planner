import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/ItemSelector.tsx";
import { useState } from "react";
import { useLocalization } from "../contexts/localization.js";
import { items } from "../data/items.js";
import { InventoryItemList } from "./InventoryItemList.js";
import { cn } from "../utils/react.js";
import { objectKeys } from "../utils/types.js";
export function ItemSelector({ currentItemID, onSelectItem }) {
    const { getItemName } = useLocalization();
    const [filterText, setFilterText] = useState('');
    const allItemIDs = objectKeys(items);
    const filteredItemIDs = allItemIDs.filter(itemID => {
        const itemName = getItemName(itemID).toLowerCase();
        return itemName.includes(filterText.toLowerCase());
    });
    const onCloseClick = (e) => {
        e.stopPropagation();
        onSelectItem?.(null);
    };
    return _jsxDEV("div", { className: "modal-backdrop", onClick: onCloseClick, children: _jsxDEV("div", { className: cn("item-selector", "modal"), children: [_jsxDEV("div", { className: "modal-closer", onClick: onCloseClick, children: "X" }, void 0, false, { fileName: _jsxFileName, lineNumber: 25, columnNumber: 13 }, this), _jsxDEV("input", { className: "item-selector-filter", type: "text", placeholder: "Filter items...", value: filterText, onChange: e => setFilterText(e.target.value) }, void 0, false, { fileName: _jsxFileName, lineNumber: 26, columnNumber: 13 }, this), _jsxDEV(InventoryItemList, { itemIDs: filteredItemIDs, currentItemID: currentItemID, onSelectItem: onSelectItem }, void 0, false, { fileName: _jsxFileName, lineNumber: 27, columnNumber: 13 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 24, columnNumber: 9 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 23, columnNumber: 11 }, this);
}
