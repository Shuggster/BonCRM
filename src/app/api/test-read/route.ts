import { NextResponse } from "next/server"
import mammoth from 'mammoth'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('=== Test Read Start ===')
    console.log('File details:', {
      name: 'name' in file ? file.name : 'unknown',
      type: file.type,
      size: file.size,
      isBlob: file instanceof Blob,
      isFile: file instanceof File
    })

    // Get array buffer
    const arrayBuffer = await file.arrayBuffer()
    console.log('Array buffer:', {
      size: arrayBuffer.byteLength,
      isArrayBuffer: arrayBuffer instanceof ArrayBuffer
    })

    // Convert to Buffer
    const buffer = Buffer.from(arrayBuffer)
    console.log('Buffer:', {
      size: buffer.length,
      isBuffer: Buffer.isBuffer(buffer)
    })

    // Try to read with mammoth
    const result = await mammoth.extractRawText({ buffer })
    console.log('Mammoth result:', {
      hasValue: !!result.value,
      valueLength: result.value?.length || 0,
      messages: result.messages,
      preview: result.value?.substring(0, 100)
    })

    return NextResponse.json({ 
      success: true,
      hasContent: !!result.value,
      contentLength: result.value?.length || 0,
      preview: result.value?.substring(0, 100)
    })

  } catch (error) {
    console.error('Test read failed:', {
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