import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ProcessedDocument, ProcessingState, DocumentMetadata } from '../types'

export class DocumentService {
  private supabase = createClientComponentClient()

  async validateFile(file: File): Promise<boolean> {
    // Basic validation
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit')
    }

    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/json'
    ]

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported')
    }

    return true
  }

  async uploadDocument(
    file: File, 
    userId: string,
    metadata: Partial<DocumentMetadata>,
    onProgress?: (state: ProcessingState) => void
  ): Promise<ProcessedDocument> {
    try {
      console.log('Starting file upload:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        userId,
        department: metadata.department
      })

      // Validate file
      await this.validateFile(file)
      
      onProgress?.({ status: 'processing', progress: 0 })

      // Upload to Supabase storage in department folder
      const department = metadata.department || 'general'
      const filePath = `${department}/${file.name}`
      console.log('Uploading to path:', filePath)

      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error(`Failed to upload file: ${uploadError.message}`)
      }

      console.log('Upload successful:', uploadData)
      onProgress?.({ status: 'complete', progress: 100 })

      // Get the file URL for reference
      const { data: { publicUrl } } = this.supabase.storage
        .from('files')
        .getPublicUrl(filePath)

      // Return processed document format
      const processedDoc: ProcessedDocument = {
        id: uploadData.id || uploadData.path,
        title: file.name,
        content: '',
        file_name: file.name,
        file_path: filePath,
        user_id: userId,
        is_private: metadata.isPrivate ?? false,
        metadata: {
          fileSize: file.size,
          fileType: file.type,
          fileName: file.name,
          uploadedBy: userId,
          isPrivate: metadata.isPrivate ?? false,
          department,
          publicUrl
        }
      }

      console.log('Returning processed document:', processedDoc)
      return processedDoc
    } catch (error) {
      console.error('Error in uploadDocument:', error)
      onProgress?.({ 
        status: 'error', 
        progress: 0, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      })
      throw error
    }
  }

  async processDocument(filePath: string, userId: string): Promise<void> {
    try {
      // Download the file from storage
      const { data: fileData, error: downloadError } = await this.supabase.storage
        .from('files')
        .download(filePath)

      if (downloadError) throw downloadError

      // Extract text content based on file type
      const fileName = filePath.split('/').pop() || ''
      const fileType = fileName.split('.').pop()?.toLowerCase()
      let content = ''

      if (fileData) {
        if (fileType === 'txt' || fileType === 'json') {
          content = await fileData.text()
        } else if (fileType === 'pdf') {
          // TODO: Implement PDF text extraction
          content = 'PDF content extraction pending'
        } else if (fileType === 'docx') {
          // TODO: Implement DOCX text extraction
          content = 'DOCX content extraction pending'
        }
      }

      // Create document record
      const { data: document, error: docError } = await this.supabase
        .from('documents')
        .insert({
          title: fileName,
          content,
          file_path: filePath,
          user_id: userId,
          metadata: {
            fileType,
            fileName,
            processedAt: new Date().toISOString()
          }
        })
        .select()
        .single()

      if (docError) throw docError

      // Split content into chunks and create embeddings
      // This part would typically be handled by a background process
      // For now, we'll just update the file's metadata to indicate it needs processing
      const { error: updateError } = await this.supabase.storage
        .from('files')
        .update(filePath, fileData, {
          metadata: {
            needsProcessing: true,
            documentId: document.id
          }
        })

      if (updateError) throw updateError
    } catch (error) {
      console.error('Error processing document:', error)
      throw error
    }
  }
} 