"use client"

import { useState, useEffect } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { FileText, Image as ImageIcon, FileCode, File, X } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface FilePreviewProps {
  file: {
    filename: string
    type: string
    path: string
    size: number
  } | null
  isOpen: boolean
  onClose: () => void
}

export function FilePreview({ file, isOpen, onClose }: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadPreview() {
      if (!file) return

      setIsLoading(true)
      try {
        // Ensure we're using the correct folder path
        const filePath = file.path.startsWith('sales/') ? file.path : `sales/${file.path}`
        console.log('Loading preview for path:', filePath)

        const { data, error } = await supabase.storage
          .from('files')
          .download(filePath)

        if (error) throw error

        const url = URL.createObjectURL(data)
        setPreviewUrl(url)
      } catch (error) {
        console.error('Error loading preview:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen && file) {
      loadPreview()
    } else {
      // Cleanup
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    }
  }, [file, isOpen])

  const renderPreview = () => {
    if (!file || isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse text-zinc-400">Loading preview...</div>
        </div>
      )
    }

    const fileType = file.type.toLowerCase()

    if (fileType.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center">
          <img
            src={previewUrl!}
            alt={file.filename}
            className="max-w-full max-h-[600px] object-contain rounded-lg"
          />
        </div>
      )
    }

    if (fileType === 'application/pdf') {
      return (
        <iframe
          src={previewUrl!}
          className="w-full h-[600px] rounded-lg"
          title={file.filename}
        />
      )
    }

    if (fileType.includes('text/') || fileType.includes('application/json')) {
      return (
        <div className="bg-zinc-900 rounded-lg p-4 max-h-[600px] overflow-auto">
          <pre className="text-sm text-zinc-300 whitespace-pre-wrap">
            {previewUrl}
          </pre>
        </div>
      )
    }

    // Default preview for unsupported file types
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <File className="w-16 h-16 text-zinc-400" />
        <div className="text-zinc-400">Preview not available for this file type</div>
        <div className="text-sm text-zinc-500">{file.type}</div>
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
          <Dialog.Title className="flex items-center gap-2 text-lg font-semibold mb-4">
            <FileText className="w-5 h-5" />
            {file?.filename}
          </Dialog.Title>
          
          <Dialog.Description id="file-preview-description">
            Preview of file: {file?.filename}. {file?.type ? `File type: ${file.type}` : ''}
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