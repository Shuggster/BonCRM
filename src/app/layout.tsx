import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Indie_Flower } from 'next/font/google'
import './globals.css'
import '@/styles/icons.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/header'
import dynamic from 'next/dynamic'

const StickyNotes = dynamic(() => import('@/components/ui/sticky-note'), {
  ssr: false
})

const inter = Inter({ subsets: ['latin'] })
const indieFlower = Indie_Flower({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-indie-flower'
})

export const metadata: Metadata = {
  title: 'Lovable CRM',
  description: 'A CRM system you will love to use',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${indieFlower.variable}`} suppressHydrationWarning>
        <div className="flex h-screen bg-background text-foreground">
          <div className="w-72 flex-shrink-0">
            <Sidebar />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto relative">
              {children}
            </main>
          </div>
        </div>
        <StickyNotes />
      </body>
    </html>
  )
}
