import { SidebarProvider } from '@/contexts/sidebar-context'
import Sidebar from '@/components/layout/Sidebar'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <div className="relative flex min-h-screen">
                <Sidebar />
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    )
}
