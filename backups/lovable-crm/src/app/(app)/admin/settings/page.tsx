import { Settings } from 'lucide-react'

export default function SystemSettingsPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h2 className="text-2xl font-semibold">System Settings</h2>
      </div>
      
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <p className="text-muted-foreground">
            This is a placeholder for the system settings interface. Here you will be able to:
          </p>
          <ul className="list-disc ml-6 mt-4 space-y-2">
            <li>Configure system-wide preferences</li>
            <li>Manage email templates</li>
            <li>Set up integrations</li>
            <li>View system logs</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
