"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X } from "lucide-react"
import { formatBytes } from "@/lib/utils"
import { getFileTypeInfo } from "@/lib/file-types"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FilePreview } from "./FilePreview"

interface FileUploadProps {
  // Allowed file types (e.g., ['application/pdf', 'image/*'])
  accept?: Record<string, string[]>
  // Maximum file size in bytes (default 10MB)
  maxSize?: number
  // Maximum number of files (default 1)
  maxFiles?: number
  // Whether to show file preview
  showPreview?: boolean
  // Called when files are added
  onFilesAdded: (files: File[]) => void
  // Called when a file is removed
  onFileRemoved?: (file: File) => void
  // Upload progress (0-100)
  progress?: number
  // Whether files are being processed
  isProcessing?: boolean
}

export function FileUpload({
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 1,
  showPreview = true,
  onFilesAdded,
  onFileRemoved,
  progress,
  isProcessing = false
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string>("")

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(rejection => {
        const error = rejection.errors[0]
        if (error.code === "file-too-large") {
          return `File too large. Max size is ${formatBytes(maxSize)}`
        }
        if (error.code === "file-invalid-type") {
          return "Invalid file type"
        }
        return error.message
      })
      setError(errors.join(", "))
      return
    }

    // Clear any previous errors
    setError("")

    // Handle accepted files
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles)
    setFiles(newFiles)
    onFilesAdded(newFiles)
  }, [files, maxFiles, maxSize, onFilesAdded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    disabled: isProcessing
  })

  const removeFile = (fileToRemove: File) => {
    const newFiles = files.filter(file => file !== fileToRemove)
    setFiles(newFiles)
    onFileRemoved?.(fileToRemove)
  }

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8
          ${isDragActive ? "border-primary bg-primary/5" : "border-border"}
          ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          transition-colors duration-200
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isDragActive ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-muted-foreground">
              or click to select files
            </p>
            {maxFiles > 1 && (
              <p className="text-xs text-muted-foreground">
                Up to {maxFiles} files
              </p>
            )}
            {accept && (
              <p className="text-xs text-muted-foreground">
                Allowed types: {Object.values(accept).flat().join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}

      {/* File list */}
      {showPreview && files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const { icon: Icon, color } = getFileTypeInfo(file.name)
            return (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 bg-muted rounded"
              >
                <div className="flex items-center space-x-2 overflow-hidden">
                  <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />
                  <span className="text-sm truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatBytes(file.size)})
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <FilePreview file={file} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file)}
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Progress bar */}
      {isProcessing && typeof progress === "number" && (
        <div className="space-y-2">
          <Progress value={progress} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Processing...</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      )}
    </div>
  )
} 