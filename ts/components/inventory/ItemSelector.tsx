import { useLayoutEffect, useRef, useState } from "react"
import { useLocalization } from "../../contexts/localization.tsx"
import { items } from "../../data/items.ts"
import type { ItemID } from "../../types/data.ts"
import { InventoryItemList } from "./InventoryItemList.tsx"
import { ModalShell } from "../common/ModalShell.tsx"
import { objectKeys } from "../../utils/types.ts"

export function ItemSelector({ currentItemID, onSelectItem, itemFilter, groupBy, allowClear = true }: { currentItemID: ItemID | null, onSelectItem: (itemID: ItemID | null) => void, itemFilter: (itemID: ItemID) => boolean, groupBy?: (itemID: ItemID) => string, allowClear?: boolean }) {
    const { ui, getItemName } = useLocalization()
    const [filterText, setFilterText] = useState('')
    const filterInputRef = useRef<HTMLInputElement>(null)
    const allItemIDs = objectKeys(items)
    const filteredItemIDs = allItemIDs.filter(itemFilter)
    const searchFilteredItemIDs = filterText ? filteredItemIDs.filter(itemID => {
        const itemName = getItemName(itemID).toLowerCase()
        return itemName.includes(filterText.toLowerCase())
    }) : filteredItemIDs
    const sortedItemIDs = searchFilteredItemIDs.sort((a, b) => {
        const nameA = getItemName(a)
        const nameB = getItemName(b)
        return nameA.localeCompare(nameB)
    })
    const groups = new Map<string, ItemID[]>()
    if (groupBy) {
        for (const itemID of sortedItemIDs) {
            const group = groupBy(itemID)
            if (!groups.has(group)) {
                groups.set(group, [])
            }
            groups.get(group)!.push(itemID)
        }
    }

    const onCloseClick = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        onSelectItem(null)
    }

    const onClearClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onSelectItem(null)
    }

    useLayoutEffect(() => {
        filterInputRef.current?.focus()
    }, [])

    return (
        <ModalShell isOpen={true} onClose={onCloseClick} className="item-selector" showCloseButton>
            <input ref={filterInputRef} className="item-selector-filter" type="text" placeholder={ui.search} value={filterText} onChange={e => setFilterText(e.target.value)} />
            {allowClear && (
                <button className="clear-button" onClick={onClearClick}>
                    {ui.clearItem} — {ui.clearItemDescription}
                </button>
            )}
            {groupBy ? Array.from(groups.keys()).sort().map(groupName => (
                <div key={groupName} className="item-selector-group">
                    <div className="item-selector-group-name">{groupName}</div>
                    <InventoryItemList itemIDs={groups.get(groupName)!} currentItemID={currentItemID} onSelectItem={onSelectItem} />
                </div>
            )) : <InventoryItemList itemIDs={sortedItemIDs} currentItemID={currentItemID} onSelectItem={onSelectItem} />}
        </ModalShell>
    )
}
