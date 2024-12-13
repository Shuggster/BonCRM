import { Inter } from 'next/font/google'
import './globals.css'
import 'react-datepicker/dist/react-datepicker.css'
import '@/styles/icons.css'
import { cn } from '@/lib/utils'
import { SidebarProvider } from '@/contexts/sidebar-context'
import Sidebar from '@/components/layout/Sidebar'
import SessionRefresh from '@/components/auth/session-refresh'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Bonnymans CRM',
  description: 'A lovable CRM for Bonnymans',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark h-full bg-zinc-950">
      <body className={cn(
        inter.className,
        "h-full bg-zinc-950 text-white antialiased"
      )}>
        <SidebarProvider>
          <SessionRefresh />
          <div className="relative flex min-h-screen">
            <Sidebar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
