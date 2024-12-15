import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/(auth)/lib/auth-options'
import { Header } from '@/components/layout/header'
import Sidebar from '@/components/layout/Sidebar'
import { SidebarProvider } from '@/contexts/sidebar-context'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <Header />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
