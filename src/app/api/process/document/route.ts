import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { fileContent } = await req.json()
    if (!fileContent) {
      return NextResponse.json({ error: 'No file content provided' }, { status: 400 })
    }

    // Convert base64 content to text
    const text = Buffer.from(fileContent, 'base64').toString('utf-8')

    return NextResponse.json({ success: true, text })
  } catch (error) {
    console.error('Process error:', error)
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 })
  }
}

// Verify bearer token
function verifyToken(authHeader: string | null): boolean {
  if (!authHeader) {
    console.log('No auth header present')
    return false
  }
  const token = authHeader.split(' ')[1]
  console.log('Verifying token:', { 
    received: token?.slice(0,5) + '...',
    expected: process.env.NEXT_PUBLIC_API_BEARER_TOKEN?.slice(0,5) + '...'
  })
  return token === process.env.NEXT_PUBLIC_API_BEARER_TOKEN
}

// Helper function to extract text from PDF
async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdf = await pdfjsLib.getDocument(new Uint8Array(buffer)).promise
    let fullText = ''
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ')
      fullText += pageText + '\\n'
    }
    
    return fullText.trim()
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

// Helper function to sanitize text content
function sanitizeText(text: string): string {
  return text
    // Remove null bytes and control characters
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Replace invalid Unicode escape sequences
    .replace(/\\u[\dA-Fa-f]{0,3}/g, '')
    // Replace any remaining problematic characters
    .replace(/[^\x20-\x7E\xA0-\xFF\u0100-\uFFFF]/g, '')
    .trim()
}

// Helper function to generate embeddings using DeepSeek
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('https://api.deepseek.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-embedding",
        input: text.slice(0, 8000) // Limit text length to avoid token limits
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('DeepSeek API error details:', error)
      throw new Error(`DeepSeek API error: ${error.message || response.statusText}`)
    }

    const data = await response.json()
    if (!data.data?.[0]?.embedding) {
      console.error('Unexpected DeepSeek API response:', data)
      throw new Error('Invalid embedding response format')
    }

    return data.data[0].embedding
  } catch (error) {
    console.error('Embedding generation error:', error)
    throw new Error('Failed to generate embedding')
  }
}

// Helper function to split text into chunks
function splitIntoChunks(text: string, chunkSize: number = 1000): string[] {
  const chunks: string[] = []
  let currentChunk = ''
  const sentences = text.split(/[.!?]+\s+/)

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim())
  }

  return chunks
} 