"use client"

import { useEffect, useState } from "react"
import { FileText, Download, Trash2 } from "lucide-react"
import { formatBytes } from "@/lib/utils"
import { FileUpload } from "@/components/ui/file-upload"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { FileService } from "@/features/file-management/services/file-service"
import { usePathname } from "next/navigation"

// Custom hook to check if we're on the file manager page
function useIsFileManagerPage() {
  const pathname = usePathname()
  return pathname?.endsWith('/tools/file-manager') ?? false
}

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

export function FileManagerContent() {
  const isFileManagerPage = useIsFileManagerPage()
  
  // Return null early before any other hooks are called
  if (!isFileManagerPage) {
    return null
  }

  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const fileService = FileService.getInstance()
  
  // For testing, hardcode to 'sales' folder
  const folderName = 'sales'
  const userId = session?.user?.id

  const fetchFiles = async () => {
    try {
      console.log('Fetching files from folder:', folderName)
      const files = await fileService.listFiles(folderName)
      console.log('Files fetched:', files)
      
      const processedFiles = files.map(file => ({
        id: file.id || `${file.name}-${Date.now()}`,
        name: file.name,
        path: file.name,
        size: file.metadata?.size || 0,
        created_at: file.created_at,
        updated_at: file.updated_at || file.created_at,
        metadata: {
          ...file.metadata,
          userId
        }
      }))

      console.log('Processed files:', processedFiles)
      setFiles(processedFiles)
    } catch (error) {
      console.error('Error fetching files:', error)
      toast({
        title: "Error",
        description: "Could not load files",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (file: FileRecord) => {
    try {
      const data = await fileService.downloadFile(folderName, file.path)
      
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
      URL.revokeObjectURL(url)
      
      toast({
        title: "Success",
        description: "File downloaded successfully",
        variant: "default",
      })
    } catch (error) {
      console.error('Error downloading file:', error)
      toast({
        title: "Error",
        description: "Could not download file",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (file: FileRecord) => {
    try {
      await fileService.deleteFile(folderName, file.path)
      await fetchFiles()
      toast({
        title: "Success",
        description: "File deleted successfully",
        variant: "default",
      })
    } catch (error) {
      console.error('Error deleting file:', error)
      toast({
        title: "Error",
        description: "Could not delete file",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    let mounted = true

    if (status === 'authenticated' && mounted) {
      console.log('Component mounted')
      console.log('Session status:', status)
      console.log('Session:', session)
      fetchFiles()
    }

    return () => {
      mounted = false
      setFiles([])
      setLoading(true)
    }
  }, [status])

  if (loading) {
    return <div className="p-4">Loading files...</div>
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Files</h2>
        <div className="text-sm text-zinc-500">
          Folder: {folderName}
        </div>
      </div>

      <FileUpload 
        onUpload={async (file: File) => {
          try {
            console.log('Uploading file:', file)
            await fileService.uploadFile(file, folderName, {
              metadata: {
                userId,
                department: folderName,
                size: file.size,
                mimetype: file.type
              }
            })
            
            await fetchFiles()
            toast({
              title: "Success",
              description: "File uploaded successfully",
              variant: "default",
            })
          } catch (error) {
            console.error('Error uploading file:', error)
            toast({
              title: "Error",
              description: "Could not upload file",
              variant: "destructive",
            })
          }
        }}
      />
      
      <div className="mt-8 space-y-4">
        {files.length === 0 ? (
          <div className="text-center text-zinc-500">
            No files uploaded yet
          </div>
        ) : (
          files.map((file) => (
            <div 
              key={file.id}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 text-blue-400" />
                <div>
                  <h3 className="font-medium">{file.name}</h3>
                  <p className="text-sm text-white/60">
                    {formatBytes(file.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(file)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(file)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 