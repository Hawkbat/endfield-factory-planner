import { cn } from "../../utils/react.ts"

interface SectionHeaderProps {
    title: string
    description?: string
    className?: string
    titleClassName?: string
    descriptionClassName?: string
}

export function SectionHeader({
    title,
    description,
    className,
    titleClassName,
    descriptionClassName,
}: SectionHeaderProps) {
    return (
        <div className={cn(className)}>
            <div className={cn(titleClassName)}>{title}</div>
            {description ? (
                <div className={cn(descriptionClassName)}>{description}</div>
            ) : null}
        </div>
    )
}
