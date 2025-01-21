"use client"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SupabaseClient } from '@supabase/supabase-js'

export interface FileMetadata {
  userId?: string
  department?: string
  size?: number
  mimetype?: string
}

export interface FileUploadOptions {
  metadata?: FileMetadata
  onProgress?: (progress: number) => void
}

// Singleton instance
let instance: FileService | null = null

export class FileService {
  private client: SupabaseClient

  private constructor() {
    this.client = createClientComponentClient()
  }

  static getInstance(): FileService {
    if (!instance) {
      instance = new FileService()
    }
    return instance
  }

  async listFiles(folder: string) {
    try {
      const { data, error } = await this.client.storage
        .from('files')  // Use the actual bucket name
        .list(folder)   // Pass the folder name as the path

      if (error) {
        console.error('List error:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in listFiles:', error)
      throw error
    }
  }

  async downloadFile(folder: string, path: string) {
    try {
      const { data, error } = await this.client.storage
        .from('files')
        .download(`${folder}/${path}`)

      if (error) {
        console.error('Download error:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in downloadFile:', error)
      throw error
    }
  }

  async deleteFile(folder: string, path: string) {
    try {
      const { error } = await this.client.storage
        .from('files')
        .remove([`${folder}/${path}`])

      if (error) {
        console.error('Delete error:', error)
        throw error
      }
    } catch (error) {
      console.error('Error in deleteFile:', error)
      throw error
    }
  }

  async uploadFile(file: File, folder: string, options?: FileUploadOptions) {
    try {
      const { data, error } = await this.client.storage
        .from('files')
        .upload(`${folder}/${Date.now()}-${file.name}`, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
          metadata: options?.metadata
        })

      if (error) {
        console.error('Upload error:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in uploadFile:', error)
      throw error
    }
  }
} 