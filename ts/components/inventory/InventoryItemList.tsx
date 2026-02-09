import type { ItemID } from "../../types/data.ts"
import { InventoryItem } from "./InventoryItem.tsx"


export function InventoryItemList({ itemIDs, currentItemID, onSelectItem }: { itemIDs: ItemID[], currentItemID?: ItemID | null, onSelectItem?: (itemID: ItemID) => void }) {
    return <div className="inventory-item-list">
        {itemIDs.map(itemID => <InventoryItem key={itemID} itemID={itemID} selected={itemID === currentItemID} onSelect={onSelectItem} />)}
    </div>
}
