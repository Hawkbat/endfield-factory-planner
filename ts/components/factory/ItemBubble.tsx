import type { ItemID } from "../../types/data.ts"
import { useLocalization } from "../../contexts/localization.tsx"
import { items } from "../../data/items.ts"
import { cn } from "../../utils/react.ts"

interface ItemBubbleProps {
    itemID: ItemID | undefined | null
    x: number
    y: number
    size?: number
    onClick?: () => void
}

export function ItemBubble({ itemID, x, y, size = 16, onClick }: ItemBubbleProps) {
    const { getItemName } = useLocalization()
    const itemData = itemID ? items[itemID] : undefined

    function handleClick(e: React.MouseEvent) {
        e.stopPropagation()
        onClick?.()
    }

    return (
        <g 
            onClick={handleClick}
            style={onClick ? { cursor: 'pointer' } : undefined}
        >
            <circle
                cx={x}
                cy={y}
                r={size / 2}
                className={cn("item-bubble", `tier-${itemData?.tier ?? 1}`)}
            />
            {itemID ? <image
                x={x - size / 2}
                y={y - size / 2}
                width={size}
                height={size}
                href={`images/${itemID}.webp`}
                className="item-bubble-icon"
            /> : null}
        </g>
    )
}
