export interface DocumentMetadata {
  fileSize: number
  fileType: string
  fileName: string
  uploadedBy: string
  department?: string
  isPrivate: boolean
  publicUrl?: string
}

export interface ProcessedDocument {
  id: string
  title: string
  content: string
  metadata: DocumentMetadata
  user_id: string
  team_id?: string
  department?: string
  file_path: string
  file_name: string
  is_private: boolean
  created_at?: string
  updated_at?: string
}

export type ProcessingStatus = 'idle' | 'processing' | 'complete' | 'error'

export interface ProcessingState {
  status: ProcessingStatus
  progress: number
  error?: string
} 