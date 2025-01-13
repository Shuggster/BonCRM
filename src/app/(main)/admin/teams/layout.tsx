"use client"

interface TeamsLayoutProps {
  children: React.ReactNode
  split: React.ReactNode
}

export default function TeamsLayout({
  children,
  split,
}: TeamsLayoutProps) {
  return (
    <div className="h-full flex">
      <div className="w-[60%] min-w-0 overflow-hidden">
        {children}
      </div>
      <div className="w-[40%] border-l border-white/[0.08] overflow-hidden">
        {split}
      </div>
    </div>
  )
} 