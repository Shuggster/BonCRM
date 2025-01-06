import { Users } from 'lucide-react'
import UserManagement from './UserManagement'

export default function UsersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6" />
        <h2 className="text-2xl font-semibold">User Management</h2>
      </div>
      
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <UserManagement />
        </div>
      </div>
    </div>
  )
}
