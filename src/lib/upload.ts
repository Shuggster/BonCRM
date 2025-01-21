export interface UploadOptions {
  path?: string
  metadata?: Record<string, any>
  onProgress?: (progress: number) => void
}

export interface UploadResult {
  success: boolean
  file?: {
    id: string
    filename: string
    path: string
    size: number
    type: string
    url: string
    metadata: Record<string, any>
    created_at: string
  }
  error?: string
}

export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    if (options.path) {
      formData.append('path', options.path)
    }
    
    if (options.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata))
    }

    // Upload with progress tracking
    const xhr = new XMLHttpRequest()
    
    const uploadPromise = new Promise<UploadResult>((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && options.onProgress) {
          const progress = (event.loaded / event.total) * 100
          options.onProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText)
          resolve(response)
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            reject(new Error(errorResponse.error || 'Upload failed'))
          } catch {
            reject(new Error('Upload failed'))
          }
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'))
      })

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'))
      })
    })

    xhr.open('POST', '/api/upload')
    xhr.send(formData)

    return await uploadPromise

  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
} 