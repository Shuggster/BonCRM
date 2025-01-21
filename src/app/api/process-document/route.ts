import { NextResponse } from 'next/server'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getSession } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { fileId, filePath, content } = body

    if (!fileId || !filePath || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClientComponentClient()

    // Process the document content
    // 1. Split into chunks
    const chunks = splitIntoChunks(content)
    
    // 2. Store chunks in document_chunks table
    const { error: insertError } = await supabase
      .from('document_chunks')
      .insert(
        chunks.map((chunk, index) => ({
          document_id: fileId,
          content: chunk,
          chunk_index: index,
          metadata: {
            path: filePath
          }
        }))
      )

    if (insertError) {
      throw insertError
    }

    // 3. Update document status
    const { error: updateError } = await supabase
      .from('documents')
      .update({ 
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('id', fileId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Document processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}

function splitIntoChunks(text: string, maxChunkSize: number = 1000): string[] {
  const chunks: string[] = []
  let currentChunk = ''

  // Split text into sentences (roughly)
  const sentences = text.split(/[.!?]+\s+/)

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim())
        currentChunk = ''
      }
      // Handle sentences longer than maxChunkSize
      if (sentence.length > maxChunkSize) {
        const words = sentence.split(/\s+/)
        let tempChunk = ''
        for (const word of words) {
          if ((tempChunk + ' ' + word).length > maxChunkSize) {
            chunks.push(tempChunk.trim())
            tempChunk = word
          } else {
            tempChunk += (tempChunk ? ' ' : '') + word
          }
        }
        if (tempChunk) {
          currentChunk = tempChunk
        }
      } else {
        currentChunk = sentence
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim())
  }

  return chunks
} 