import { LucideIcon } from "lucide-react"

interface PageHeaderProps {
  heading: string
  description?: string
  icon?: LucideIcon
}

export function PageHeader({ heading, description, icon: Icon }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      {Icon && (
        <div className="p-2 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
          <Icon className="w-5 h-5 text-emerald-400" />
        </div>
      )}
      <div>
        <h1 className="text-2xl font-semibold">{heading}</h1>
        {description && (
          <p className="text-sm text-zinc-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  )
} 