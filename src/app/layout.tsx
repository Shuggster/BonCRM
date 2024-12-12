import { Inter, Indie_Flower } from 'next/font/google'
import './globals.css'
import '@/styles/icons.css'
import { cn } from '@/lib/utils'
import { SidebarProvider } from '@/contexts/sidebar-context'
import Sidebar from '@/components/layout/Sidebar'

const inter = Inter({ subsets: ['latin'] })
const indieFlower = Indie_Flower({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-indie-flower',
})

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
        indieFlower.variable,
        "h-full bg-zinc-950 text-white antialiased"
      )}>
        <SidebarProvider>
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
