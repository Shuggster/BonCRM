import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Indie_Flower } from 'next/font/google'
import './globals.css'
import '@/styles/icons.css'
import { cn } from '@/lib/utils'

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
    <html lang="en" className="dark h-full bg-zinc-950">
      <body className={cn(
        inter.className,
        indieFlower.variable,
        "h-full bg-zinc-950 text-white antialiased"
      )}>
        {children}
      </body>
    </html>
  )
}
