import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

async function searchDocuments(query: string) {
  try {
    console.log('=== Starting document search ===')

    // First, let's check what documents we have
    const { data: allDocs, error: countError } = await supabase
      .from('document_chunks')
      .select('content, metadata')
      .limit(1)

    console.log('Database check:', {
      hasData: !!allDocs?.length,
      error: countError?.message,
      firstDoc: allDocs?.[0] ? {
        contentPreview: allDocs[0].content.substring(0, 100),
        metadata: allDocs[0].metadata
      } : null
    })

    // Search using text search on content_search column
    const { data: chunks, error: searchError } = await supabase
      .from('document_chunks')
      .select('*')
      .textSearch('content_search', query.split(' ').join(' | '), {
        type: 'websearch',
        config: 'english'
      })
      .limit(10)

    if (searchError) {
      console.error('Failed to search documents:', searchError)
      return { systemDocs: [], uploadedDocs: [] }
    }

    console.log('Found document chunks:', {
      total: chunks?.length || 0,
      chunks: chunks?.map(c => ({
        content: c.content.substring(0, 100) + '...',
        metadata: c.metadata
      }))
    })

    // Simple separation based on metadata type
    const systemDocs = chunks?.filter(doc => doc.metadata?.type === 'system') || []
    const uploadedDocs = chunks?.filter(doc => doc.metadata?.type === 'upload') || []

    console.log('Document breakdown:', {
      total: chunks?.length || 0,
      system: systemDocs.length,
      uploaded: uploadedDocs.length
    })

    if (uploadedDocs.length > 0) {
      console.log('Found uploaded documents:', uploadedDocs.map(doc => ({
        content: doc.content.substring(0, 100) + '...',
        metadata: doc.metadata
      })))
    } else {
      console.log('No uploaded documents found')
    }

    return { systemDocs, uploadedDocs }
  } catch (error) {
    console.error('=== Document search failed ===')
    console.error('Error details:', error)
    return { systemDocs: [], uploadedDocs: [] }
  }
}

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json()
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    console.log('Processing message:', message)

    // Search for relevant documents
    const { systemDocs, uploadedDocs } = await searchDocuments(message)
    
    // Build context string
    let contextString = `You are ShugBot, a helpful AI assistant for NeoCRM.
Current time: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}
Current year: ${new Date().getFullYear()}\n\n`

    // Add document information
    if (uploadedDocs.length > 0) {
      contextString += "I found these relevant documents:\n\n"
      uploadedDocs.forEach((doc: any) => {
        contextString += `${doc.content}\n\n`
      })
    } else {
      contextString += "I don't have any relevant documents to help answer your question.\n"
    }

    console.log('Context built with document counts:', {
      systemDocs: systemDocs.length,
      uploadedDocs: uploadedDocs.length
    })

    // Generate response
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent([
      { text: contextString },
      { text: message }
    ])
    
    const reply = result.response.text()

    return NextResponse.json({ reply })

  } catch (error) {
    console.error('Gemini API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}