import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import mammoth from 'mammoth'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('=== Test Upload Start ===')
    console.log('File details:', {
      name: 'name' in file ? file.name : 'unknown',
      type: file.type,
      size: file.size,
      isBlob: file instanceof Blob,
      isFile: file instanceof File,
      isWord: file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })

    // Test file reading
    let text = ''
    try {
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.type === 'application/msword') {
        console.log('Processing Word document...')
        
        // Convert to Buffer for mammoth
        const arrayBuffer = await file.arrayBuffer()
        console.log('Array buffer created:', {
          size: arrayBuffer.byteLength,
          isArrayBuffer: arrayBuffer instanceof ArrayBuffer
        })

        // Convert ArrayBuffer to Buffer for mammoth
        const buffer = Buffer.from(arrayBuffer)
        const result = await mammoth.extractRawText({ buffer })
        console.log('Mammoth result:', {
          hasValue: !!result.value,
          valueLength: result.value?.length || 0,
          messages: result.messages
        })

        if (!result.value) {
          throw new Error('No text extracted from document')
        }

        text = result.value
      } else {
        text = await file.text()
      }

      console.log('File content:', {
        length: text.length,
        preview: text.substring(0, 100) + '...',
        hasContent: text.length > 0
      })

      if (!text || text.length === 0) {
        throw new Error('No text content extracted')
      }

    } catch (error) {
      console.error('Failed to read file:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      return NextResponse.json({ 
        error: 'Failed to read file',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 })
    }

    // Test database connection
    const supabase = createRouteHandlerClient({ cookies })
    
    // Test documents table
    const { data: docTest, error: docError } = await supabase
      .from('documents')
      .insert({
        title: file instanceof File ? file.name : 'Test Document',
        content: text,
        metadata: { 
          test: true,
          fileType: file.type,
          fileName: file instanceof File ? file.name : 'unknown'
        }
      })
      .select()
      .single()

    if (docError) {
      console.error('Document insert error:', {
        error: docError,
        details: docError.details,
        hint: docError.hint
      })
      return NextResponse.json({ 
        error: 'Failed to insert document',
        details: docError.message
      }, { status: 500 })
    }

    console.log('Document test:', {
      success: true,
      id: docTest.id,
      contentLength: text.length
    })

    // Test chunks table
    const chunks = text.split(/(?<=[.!?])\s+/).slice(0, 3) // Just test with first 3 sentences
    console.log('Test chunks:', {
      total: chunks.length,
      samples: chunks.map(c => c.substring(0, 50) + '...')
    })

    for (const chunk of chunks) {
      const { error: chunkError } = await supabase
        .from('document_chunks')
        .insert({
          document_id: docTest.id,
          content: chunk,
          metadata: { 
            test: true,
            fileType: file.type,
            fileName: file instanceof File ? file.name : 'unknown'
          }
        })

      if (chunkError) {
        console.error('Chunk insert error:', {
          error: chunkError,
          details: chunkError.details,
          hint: chunkError.hint
        })
        return NextResponse.json({ 
          error: 'Failed to insert chunk',
          details: chunkError.message
        }, { status: 500 })
      }
    }

    console.log('=== Test Upload Complete ===')

    return NextResponse.json({ 
      success: true,
      fileRead: text.length > 0,
      docTest: true,
      chunkTest: true,
      textLength: text.length,
      chunkCount: chunks.length
    })

  } catch (error) {
    console.error('Test upload failed:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 