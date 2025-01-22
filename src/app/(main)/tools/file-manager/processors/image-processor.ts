"use client"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export class ImageProcessor {
  private supabase = createClientComponentClient()

  private async generateEmbedding(text: string): Promise<number[]> {
    console.log('Generating embedding for text:', text)
    const response = await fetch('http://localhost:3002/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const result = await response.json()
    console.log('Full API response:', result)
    console.log('Response data array:', result.data)
    console.log('First item in data:', result.data?.[0])
    
    const embedding = result.data?.[0]?.embedding
    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Invalid embedding format in API response')
    }

    console.log('Embedding array length:', embedding.length)
    return embedding
  }

  async processImageFile(filePath: string, fileName: string, userId: string) {
    console.log('Processing image file:', fileName)
    
    try {
      // Create document record
      const { data: documentData, error: docError } = await this.supabase
        .from('documents')
        .insert({
          title: fileName,
          file_name: fileName,
          file_path: filePath,
          department: 'sales',
          is_private: false,
          user_id: userId,
          content: `Image file: ${fileName}`,
          metadata: {
            type: 'image',
            processed: new Date().toISOString()
          }
        })
        .select()
        .single()

      if (docError) throw docError

      // Generate embedding for the content
      const content = `Image file: ${fileName}`
      const embedding = await this.generateEmbedding(content)
      
      // Create chunk with embedding
      const { error: chunkError } = await this.supabase
        .from('document_chunks')
        .insert({
          document_id: documentData.id,
          content: content,
          user_id: userId,
          embedding: embedding,
          metadata: {
            type: 'image',
            processed: new Date().toISOString()
          }
        })

      if (chunkError) {
        console.error('Error inserting chunk:', chunkError)
        throw chunkError
      }

      console.log('Successfully processed image with embedding')
      return documentData
    } catch (error) {
      console.error('Error processing image:', error)
      throw error
    }
  }
}

export const imageProcessor = new ImageProcessor() 