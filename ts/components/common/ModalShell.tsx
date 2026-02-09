import type { ReactNode } from "react"
import { cn } from "../../utils/react.ts"

interface ModalShellProps {
    isOpen: boolean
    onClose?: (event?: React.MouseEvent) => void
    closeOnBackdrop?: boolean
    showCloseButton?: boolean
    className?: string
    children: ReactNode
}

export function ModalShell({
    isOpen,
    onClose,
    closeOnBackdrop = true,
    showCloseButton = false,
    className,
    children,
}: ModalShellProps) {
    if (!isOpen) {
        return null
    }

    function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
        if (!closeOnBackdrop || !onClose) {
            return
        }
        onClose(event)
    }

    function handleCloseClick(event: React.MouseEvent<HTMLDivElement>) {
        if (!onClose) {
            return
        }
        onClose(event)
    }

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className={cn("modal", className)} onClick={event => event.stopPropagation()}>
                {showCloseButton && (
                    <div className="modal-closer" onClick={handleCloseClick}>X</div>
                )}
                {children}
            </div>
        </div>
    )
}
