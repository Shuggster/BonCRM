"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
  maxSize?: number
  accept?: Record<string, string[]>
}

export function FileUpload({ 
  onUpload,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
    'application/json': ['.json']
  }
}: FileUploadProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    
    await onUpload(file)
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    maxFiles: 1,
    maxSize,
    accept
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200 ease-in-out
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
      `}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <Upload className="w-8 h-8 mx-auto text-gray-400" />
        <div className="space-y-1">
          <p className="text-sm font-medium">
            Drop your file here or click to upload
          </p>
          <p className="text-sm text-muted-foreground">
            Supports PDF, DOCX, TXT, JSON and image files up to 10MB
          </p>
        </div>
      </div>
    </div>
  )
} 