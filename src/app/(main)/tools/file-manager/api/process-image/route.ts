import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createWorker } from 'tesseract.js'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { filePath, fileName, userId } = await request.json()

    // Download file from Supabase
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('files')
      .download(`sales/${fileName}`)

    if (downloadError) {
      return NextResponse.json(
        { error: 'Failed to download file' },
        { status: 500 }
      )
    }

    // Process image and extract text
    const worker = await createWorker('eng')
    const buffer = await fileData.arrayBuffer()
    const processedImageBuffer = await sharp(buffer)
      .resize(2000, undefined, { withoutEnlargement: true })
      .normalize()
      .sharpen()
      .toBuffer()

    const { data: { text, confidence } } = await worker.recognize(processedImageBuffer)
    await worker.terminate()

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'No text could be extracted from the image' },
        { status: 400 }
      )
    }

    // Create chunks from the extracted text
    const CHUNK_SIZE = 1000
    const chunks = text.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'g')) || []

    // Store document and get ID
    const { data: documentData, error: insertError } = await supabase
      .from('documents')
      .insert({
        title: fileName,
        content: text.slice(0, 1000), // Store first 1000 chars as preview
        user_id: userId,
        file_name: fileName,
        file_path: `sales/${fileName}`,
        department: 'sales',
        is_private: false,
        metadata: {
          type: 'image',
          confidence,
          fileSize: fileData.size,
          processedAt: new Date().toISOString()
        }
      })
      .select('id')
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 }
      )
    }

    // Process chunks in batches
    const documentId = documentData.id
    const BATCH_SIZE = 3
    
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE)
      await Promise.all(batch.map(async (chunk) => {
        // Call embeddings API
        const embeddingResponse = await fetch('http://localhost:3002/api/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: chunk })
        })

        if (!embeddingResponse.ok) {
          throw new Error(`Failed to generate embedding: ${embeddingResponse.statusText}`)
        }

        const { embedding } = await embeddingResponse.json()

        // Store chunk with embedding
        await supabase.from('document_chunks').insert({
          document_id: documentId,
          content: chunk,
          embedding,
          metadata: { confidence },
          user_id: userId
        })
      }))

      // Add delay between batches
      if (i + BATCH_SIZE < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Image processed successfully'
    })

  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
} 