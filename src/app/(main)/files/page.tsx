"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { FileText } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { formatBytes } from "@/lib/utils"
import { getFileTypeInfo } from "@/lib/file-types"
import { FileUpload } from "@/components/shared/FileUpload"

interface FileRecord {
  id: string
  filename: string
  size: number
  type: string
  url: string
  created_at: string
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setFiles(data || [])
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  return (
    <div className="p-8">
      <PageHeader
        heading="File Management"
        description="Upload, manage and share your files"
        icon={FileText}
      />

      {/* Upload Section */}
      <div className="mt-8">
        <FileUpload
          onUploadSuccess={() => fetchFiles()}
          maxSize={10 * 1024 * 1024} // 10MB
        />
      </div>

      {/* Files List */}
      <div className="mt-8">
        <div className="rounded-md border">
          <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
            <div className="col-span-2">Name</div>
            <div>Type</div>
            <div>Size</div>
            <div>Uploaded</div>
          </div>
          
          <div className="divide-y">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading files...
              </div>
            ) : files.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No files uploaded yet
              </div>
            ) : (
              files.map((file) => {
                const { icon: Icon, color } = getFileTypeInfo(file.filename)
                return (
                  <div key={file.id} className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-muted/50">
                    <div className="col-span-2 flex items-center gap-2">
                      <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />
                      <span className="truncate">{file.filename}</span>
                    </div>
                    <div>{file.type || "Unknown"}</div>
                    <div>{formatBytes(file.size)}</div>
                    <div>{new Date(file.created_at).toLocaleDateString()}</div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 