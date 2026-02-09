
interface ActionButtonProps {
    onClick: () => void
    disabled?: boolean
    children: React.ReactNode
    title?: string
}

export function ActionButton({ onClick, disabled, children, title }: ActionButtonProps) {

    function handleClick(e: React.MouseEvent) {
        e.stopPropagation()
        onClick()
    }

    return (
        <button
            className="action-button"
            onClick={handleClick}
            disabled={disabled}
            title={title}
        >
            {children}
        </button>
    )
}
