import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  heading: string
  description?: string
  icon?: LucideIcon
}

export function PageHeader({ heading, description, icon: Icon }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      {Icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          {/* @ts-expect-error - Icon is a valid component */}
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div>
        <h1 className="text-2xl font-semibold">{heading}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}
