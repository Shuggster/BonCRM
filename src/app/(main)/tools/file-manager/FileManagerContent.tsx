"use client"

import { useEffect, useState } from "react"
import { FileText, Download, Trash2, Eye } from "lucide-react"
import { formatBytes } from "@/lib/utils"
import { FileUpload } from "@/components/ui/file-upload"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { FileService } from "@/features/file-management/services/file-service"
import { usePathname } from "next/navigation"
import { documentService } from '@/features/document-management/services/document-service'
import { Button } from "@/components/ui/button"
import { PDFScriptLoader } from "@/components/pdf-script-loader"
import { Toast } from "@/components/ui/toast"
import { FilePreview } from "@/components/shared/FilePreview"
import { wordProcessor } from './processors/word-processor'

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

interface FileItemProps {
  file: FileRecord;
  onDelete: (path: string) => void;
  onDownload: (path: string) => void;
  onProcess?: (path: string, fileName: string) => void;
  onPreview: (file: FileRecord) => void;
  toast: ReturnType<typeof useToast>["toast"];
}

function FileItem({ file, onDelete, onDownload, onProcess, onPreview, toast }: FileItemProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Check if file is processable (PDF or Word)
  const isProcessable = file.name.toLowerCase().endsWith('.pdf') || 
                       file.name.toLowerCase().endsWith('.docx') || 
                       file.name.toLowerCase().endsWith('.doc');
  
  const handleProcessFile = async () => {
    try {
      setIsProcessing(true);
      console.log('Starting file processing:', file.name);

      if (onProcess) {
        await onProcess(file.path, file.name);
      }
      
      console.log('File processed successfully:', file.name);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="group px-6 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#111111] border border-white/[0.08] flex items-center justify-center">
          <FileText className="w-5 h-5 text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{file.name}</h3>
          <p className="text-sm text-zinc-400 line-clamp-1">
            {formatBytes(file.size)} • {new Date(file.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPreview(file)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <Eye className="w-4 h-4" />
            <span className="sr-only">Preview</span>
          </Button>
          {isProcessable && onProcess && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProcessFile}
              disabled={isProcessing}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              {isProcessing ? 'Analyzing...' : 'Process'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(file.path)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <Download className="w-4 h-4" />
            <span className="sr-only">Download</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(file.path)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FileManagerContent() {
  const isFileManagerPage = useIsFileManagerPage()
  
  // Return null early before any other hooks are called
  if (!isFileManagerPage) {
    return null
  }

  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
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
      toast("Could not load files")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (path: string) => {
    try {
      const file = files.find(f => f.path === path);
      if (!file) {
        throw new Error('File not found');
      }
      
      const data = await fileService.downloadFile(folderName, path)
      
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
      URL.revokeObjectURL(url)
      
      toast("File downloaded successfully")
    } catch (error) {
      console.error('Error downloading file:', error)
      toast("Could not download file")
    }
  }

  const handleDelete = async (path: string) => {
    try {
      await fileService.deleteFile(folderName, path)
      await fetchFiles()
      toast("File deleted successfully")
    } catch (error) {
      console.error('Error deleting file:', error)
      toast("Could not delete file")
    }
  }

  const handleProcessFile = async (filePath: string, fileName: string) => {
    if (!userId) {
      toast("User not authenticated");
      return;
    }

    try {
      toast("Starting file analysis...");

      const fileType = fileName.toLowerCase();
      if (fileType.endsWith('.pdf')) {
        await documentService.processPDFFile(filePath, fileName, userId);
      } else if (fileType.endsWith('.docx') || fileType.endsWith('.doc')) {
        await wordProcessor.processWordFile(filePath, fileName, userId);
      } else {
        throw new Error('Unsupported file type for processing');
      }
      
      toast("Processing document...");
      toast(`File "${fileName}" processed successfully`);
    } catch (error) {
      console.error('Error processing file:', error);
      toast(error instanceof Error ? error.message : 'Error processing file');
    }
  };

  const handlePreview = (file: FileRecord) => {
    setSelectedFile(file)
    setIsPreviewOpen(true)
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
      <PDFScriptLoader />
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
            toast("File uploaded successfully")
          } catch (error) {
            console.error('Error uploading file:', error)
            toast("Could not upload file")
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
            <FileItem
              key={file.name}
              file={file}
              onDelete={handleDelete}
              onDownload={handleDownload}
              onProcess={handleProcessFile}
              onPreview={handlePreview}
              toast={toast}
            />
          ))
        )}
      </div>

      <FilePreview
        file={selectedFile ? {
          filename: selectedFile.name,
          type: selectedFile.metadata?.mimetype || '',
          path: selectedFile.path,
          size: selectedFile.size
        } : null}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false)
          setSelectedFile(null)
        }}
      />
    </div>
  )
} 