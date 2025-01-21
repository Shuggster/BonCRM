"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { DocumentService } from "@/features/document-processing/services/document-service"
import { ProcessingState, ProcessedDocument } from "@/features/document-processing/types"

// Global error handler
const logError = (error: any, context: string) => {
  const errorDetails = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString()
  }
  console.error('Error Details:', errorDetails)
  return errorDetails
}

interface UploadError {
  message: string
  details?: string
  step?: string
  context?: any
}

interface FileUploadProps {
  onUploadSuccess?: (file: ProcessedDocument) => void
  onUploadError?: (error: UploadError) => void
  maxSize?: number
  accept?: Record<string, string[]>
}

export function FileUpload({ 
  onUploadSuccess, 
  onUploadError,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
    'application/json': ['.json']
  }
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [lastError, setLastError] = useState<UploadError | null>(null)
  const [processingStatus, setProcessingStatus] = useState<string>('')
  const [uploadedFileId, setUploadedFileId] = useState<string>('')
  const { data: session } = useSession()
  const [error, setError] = useState<UploadError | null>(null)
  const [processing, setProcessing] = useState<ProcessingState>({
    status: 'idle',
    progress: 0
  })

  const documentService = new DocumentService()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setFile(file)
    setError(null)
    setLastError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    maxFiles: 1,
    maxSize,
    accept
  })

  const uploadFile = async () => {
    if (!file || !session?.user?.id) {
      const error: UploadError = { message: 'Please select a file first' }
      setError(error)
      onUploadError?.(error)
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const department = session.user.department || 'general'
      console.log('Uploading file with department:', department)

      const result = await documentService.uploadDocument(
        file,
        session.user.id,
        {
          isPrivate: false,
          department
        },
        (state) => {
          setProcessing(state)
          setUploadProgress(state.progress)
        }
      )

      setUploadedFileId(result.id)
      toast.success('File uploaded successfully')
      onUploadSuccess?.(result)
    } catch (err) {
      const errorDetails = logError(err, 'File Upload')
      const error: UploadError = {
        message: 'Failed to upload file',
        details: errorDetails.message,
        step: 'upload'
      }
      setError(error)
      onUploadError?.(error)
      toast.error('Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setError(null)
    setLastError(null)
    setUploadProgress(0)
    setProcessing({ status: 'idle', progress: 0 })
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${error ? 'border-red-500 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {file ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selected file: <span className="font-medium">{file.name}</span>
            </p>
            {processing.status !== 'idle' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{processing.status}</span>
                  <span>{processing.progress}%</span>
                </div>
                <Progress value={processing.progress} />
              </div>
            )}
            <div className="flex justify-center gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  uploadFile()
                }}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile()
                }}
                disabled={isUploading}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Drop your file here or click to upload
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOCX, TXT and JSON files up to 10MB
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded text-sm text-red-600">
            <p className="font-medium">{error.message}</p>
            {error.details && <p className="mt-1">{error.details}</p>}
          </div>
        )}
      </div>
    </div>
  )
} 