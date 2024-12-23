import { SidebarProvider } from '@/contexts/sidebar-context'
import Sidebar from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { getServerSession } from 'next-auth'
import { authOptions } from '../(auth)/lib/auth-options'
import { redirect } from 'next/navigation'

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/login')
    }

    return (
        <SidebarProvider>
            <div className="relative flex min-h-screen">
                <Sidebar />
                <div className="flex-1">
                    <Header />
                    <main>
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
