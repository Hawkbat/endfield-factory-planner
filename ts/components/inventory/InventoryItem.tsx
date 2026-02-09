import { useLocalization } from "../../contexts/localization.tsx"
import { items } from "../../data/items.ts"
import type { ItemID } from "../../types/data.ts"
import { cn } from "../../utils/react.ts"


export function InventoryItem({ itemID, selected, onSelect }: { itemID: ItemID, selected?: boolean, onSelect?: (itemID: ItemID) => void }) {
    const { getItemName } = useLocalization()

    const itemData = items[itemID]

    const onClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onSelect?.(itemID)
    }
    return <div className={cn("inventory-item", `tier-${itemData.tier}`, { selected })} onClick={onClick}>
        <img className="inventory-item-icon" src={`images/${itemID}.webp`}></img>
        <div className="inventory-item-name">{getItemName(itemID)}</div>
    </div>
}
