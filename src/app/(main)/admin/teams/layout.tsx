interface TeamsLayoutProps {
  children: React.ReactNode
  split: React.ReactNode
}

export default function TeamsLayout({ children, split }: TeamsLayoutProps) {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        {children}
      </div>

      {/* Split view */}
      <div className="w-[400px] border-l border-white/[0.08] flex overflow-auto bg-background">
        {split}
      </div>
    </div>
  )
} 