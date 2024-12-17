import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'
import 'react-datepicker/dist/react-datepicker.css'
import '@/styles/icons.css'
import { cn } from '@/lib/utils'
import { Toaster } from 'sonner'

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
        <Providers>
          {children}
        </Providers>
        <Toaster richColors />
      </body>
    </html>
  )
}
