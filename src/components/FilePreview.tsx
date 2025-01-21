"use client"

import { useState, useEffect } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { FileText, Image as ImageIcon, FileCode, File, X, Download } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface FilePreviewProps {
  file: {
    id: string
    path: string
    name: string
    size: number
    created_at: string
    metadata?: {
      size?: number
      mimetype?: string
    }
  } | null
  isOpen: boolean
  onClose: () => void
}

export function FilePreview({ file, isOpen, onClose }: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewText, setPreviewText] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadPreview() {
      if (!file) {
        console.log('No file provided')
        return
      }

      setIsLoading(true)
      console.log('Loading preview for file:', {
        name: file.name,
        type: file.metadata?.mimetype,
        path: file.path,
        size: file.size
      })
      
      try {
        console.log('Attempting to download from path:', file.path)
        const { data: blob, error } = await supabase.storage
          .from('files')
          .download(file.path)

        if (error) {
          console.error('Supabase download error:', error)
          throw error
        }

        console.log('File downloaded successfully, blob:', {
          size: blob.size,
          type: blob.type
        })

        const fileType = file.metadata?.mimetype?.toLowerCase() || ''
        console.log('Processing file type:', fileType)
        
        // Create URL for all files
        const url = URL.createObjectURL(blob)
        console.log('Created preview URL:', url)
        setPreviewUrl(url)

        // For text files, also load the content
        if (fileType.includes('text/') || fileType.includes('application/json')) {
          console.log('Loading text content for text file')
          const text = await blob.text()
          console.log('Text content loaded, length:', text.length)
          setPreviewText(text)
        }
      } catch (error) {
        console.error('Error in loadPreview:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen && file) {
      loadPreview()
    } else {
      // Cleanup
      if (previewUrl) {
        console.log('Cleaning up preview URL:', previewUrl)
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      setPreviewText(null)
    }
  }, [file, isOpen])

  const handleDownload = () => {
    if (!previewUrl || !file) return
    
    const link = document.createElement('a')
    link.href = previewUrl
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderPreview = () => {
    if (!file || isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse text-zinc-400">Loading preview...</div>
        </div>
      )
    }

    const fileType = file.metadata?.mimetype?.toLowerCase() || ''
    console.log('Rendering preview for file type:', fileType)

    if (fileType.startsWith('image/')) {
      return (
        <div className="flex flex-col items-center justify-center gap-4">
          <img
            src={previewUrl!}
            alt={file.name}
            className="max-w-full max-h-[600px] object-contain rounded-lg"
          />
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm text-zinc-200"
          >
            <Download className="w-4 h-4" />
            Download Image
          </button>
        </div>
      )
    }

    if (fileType === 'application/pdf') {
      return (
        <div className="flex flex-col gap-4">
          <iframe
            src={previewUrl!}
            className="w-full h-[600px] rounded-lg"
            title={file.name}
          />
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm text-zinc-200"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      )
    }

    // Handle Word documents
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <FileText className="w-16 h-16 text-zinc-400" />
          <div className="text-zinc-400">Word Document</div>
          <div className="text-sm text-zinc-500">{file.name}</div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm text-zinc-200"
          >
            <Download className="w-4 h-4" />
            Download Document
          </button>
        </div>
      )
    }

    if (fileType.includes('text/') || fileType.includes('application/json')) {
      return (
        <div className="flex flex-col gap-4">
          <div className="bg-zinc-900 rounded-lg p-4 max-h-[600px] overflow-auto">
            <pre className="text-sm text-zinc-300 whitespace-pre-wrap">
              {previewText}
            </pre>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm text-zinc-200"
          >
            <Download className="w-4 h-4" />
            Download Text File
          </button>
        </div>
      )
    }

    // Default preview for unsupported file types
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <File className="w-16 h-16 text-zinc-400" />
        <div className="text-zinc-400">Preview not available for this file type</div>
        <div className="text-sm text-zinc-500">{file.metadata?.mimetype}</div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm text-zinc-200"
        >
          <Download className="w-4 h-4" />
          Download File
        </button>
      </div>
    )
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        <Dialog.Content 
          className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-4xl bg-zinc-900 p-6 shadow-lg rounded-lg border border-white/[0.08]"
          aria-describedby="file-preview-description"
        >
          <Dialog.Title className="flex items-center gap-2 text-lg font-semibold mb-4" asChild>
            <h2>
              <FileText className="w-5 h-5" />
              {file?.name}
            </h2>
          </Dialog.Title>
          
          <Dialog.Description id="file-preview-description" className="sr-only">
            Preview of file: {file?.name}. {file?.metadata?.mimetype ? `File type: ${file.metadata.mimetype}` : ''}
          </Dialog.Description>
          
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
          
          {renderPreview()}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
} 