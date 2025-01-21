"use client"

import { useState } from "react"
import { FileText, Download } from "lucide-react"
import { formatBytes } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { FileService } from "@/features/file-management/services/file-service"

interface FileRecord {
  id: string
  name: string
  path: string
  size: number
  created_at: string
  updated_at: string
  metadata?: {
    userId?: string
    department?: string
    size?: number
    mimetype?: string
  }
}

export function FileManagerPreview() {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const fileService = FileService.getInstance()
  
  // For testing, hardcode to 'sales' bucket
  const bucketName = 'sales'

  // Show a simplified preview
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Recent Files</h2>
        <div className="text-sm text-zinc-500">
          Bucket: {bucketName}
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="text-center text-zinc-500">
          Open the file manager to view and manage your files
        </div>
      </div>
    </div>
  )
} 