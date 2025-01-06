interface PageHeaderProps {
  heading: string
  description?: string
  icon?: React.ReactNode
}

export function PageHeader({ heading, description, icon }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
          {icon}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-semibold text-white">{heading}</h1>
        {description && (
          <p className="text-sm text-zinc-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  )
} 