import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/inventory/ItemSelector.tsx";
import { useLayoutEffect, useRef, useState } from "react";
import { useLocalization } from "../../contexts/localization.js";
import { items } from "../../data/items.js";
import { InventoryItemList } from "./InventoryItemList.js";
import { ModalShell } from "../common/ModalShell.js";
import { objectKeys } from "../../utils/types.js";
export function ItemSelector({ currentItemID, onSelectItem, itemFilter, groupBy, allowClear = true }) {
    const { ui, getItemName } = useLocalization();
    const [filterText, setFilterText] = useState('');
    const filterInputRef = useRef(null);
    const allItemIDs = objectKeys(items);
    const filteredItemIDs = allItemIDs.filter(itemFilter);
    const searchFilteredItemIDs = filterText ? filteredItemIDs.filter(itemID => {
        const itemName = getItemName(itemID).toLowerCase();
        return itemName.includes(filterText.toLowerCase());
    }) : filteredItemIDs;
    const sortedItemIDs = searchFilteredItemIDs.sort((a, b) => {
        const nameA = getItemName(a);
        const nameB = getItemName(b);
        return nameA.localeCompare(nameB);
    });
    const groups = new Map();
    if (groupBy) {
        for (const itemID of sortedItemIDs) {
            const group = groupBy(itemID);
            if (!groups.has(group)) {
                groups.set(group, []);
            }
            groups.get(group).push(itemID);
        }
    }
    const onCloseClick = (e) => {
        e?.stopPropagation();
        onSelectItem(null);
    };
    const onClearClick = (e) => {
        e.stopPropagation();
        onSelectItem(null);
    };
    useLayoutEffect(() => {
        filterInputRef.current?.focus();
    }, []);
    return (_jsxDEV(ModalShell, { isOpen: true, onClose: onCloseClick, className: "item-selector", showCloseButton: true, children: [_jsxDEV("input", { ref: filterInputRef, className: "item-selector-filter", type: "text", placeholder: ui.search, value: filterText, onChange: e => setFilterText(e.target.value) }, void 0, false, { fileName: _jsxFileName, lineNumber: 51, columnNumber: 13 }, this), allowClear && (_jsxDEV("button", { className: "clear-button", onClick: onClearClick, children: [ui.clearItem, " \u2014 ", ui.clearItemDescription] }, void 0, true, { fileName: _jsxFileName, lineNumber: 52, columnNumber: 29 }, this)), groupBy ? Array.from(groups.keys()).sort().map(groupName => (_jsxDEV("div", { className: "item-selector-group", children: [_jsxDEV("div", { className: "item-selector-group-name", children: groupName }, void 0, false, { fileName: _jsxFileName, lineNumber: 59, columnNumber: 21 }, this), _jsxDEV(InventoryItemList, { itemIDs: groups.get(groupName), currentItemID: currentItemID, onSelectItem: onSelectItem }, void 0, false, { fileName: _jsxFileName, lineNumber: 60, columnNumber: 21 }, this)] }, groupName, true, { fileName: _jsxFileName, lineNumber: 57, columnNumber: 75 }, this))) : _jsxDEV(InventoryItemList, { itemIDs: sortedItemIDs, currentItemID: currentItemID, onSelectItem: onSelectItem }, void 0, false, { fileName: _jsxFileName, lineNumber: 62, columnNumber: 17 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 49, columnNumber: 13 }, this));
}
