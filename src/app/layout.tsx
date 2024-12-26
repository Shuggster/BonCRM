import './globals.css'
import { Inter } from 'next/font/google'
import 'react-datepicker/dist/react-datepicker.css'
import '@/styles/icons.css'
import { cn } from '@/lib/utils'
import { ClientLayout } from '@/components/layouts/ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Lovable CRM',
  description: 'A lovable CRM application'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className={cn(
        inter.className,
        "h-full text-white antialiased overflow-hidden"
      )}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
