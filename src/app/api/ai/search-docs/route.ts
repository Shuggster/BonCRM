import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth' // Fixed import path

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

async function searchDocuments(query: string, department: string) {
  // First try semantic search using embeddings
  const { data: chunks, error } = await supabase
    .from('document_chunks')
    .select(`
      id,
      content,
      document_id,
      metadata,
      documents(
        title,
        metadata
      )
    `)
    .textSearch('content', query)
    .eq('department', department)
    .limit(5)

  if (error) throw error
  return chunks || []
}

export async function POST(request: Request) {
  try {
    // Session validation
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query } = await request.json()
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Search for relevant document chunks
    const chunks = await searchDocuments(query, session.user.department)

    if (chunks.length === 0) {
      return NextResponse.json({
        reply: "I couldn't find any relevant documents to answer your question. Could you try rephrasing or asking something else?"
      })
    }

    // Build context from chunks
    let context = "Based on our documentation:\n\n"
    chunks.forEach((chunk: any) => {
      context += `From "${chunk.documents.title}":\n${chunk.content}\n\n`
    })

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const prompt = `You are ShugBot, a helpful AI assistant for NeoCRM. 
    Use the following documentation to answer the user's question.
    If the information in the documentation is not sufficient, say so.
    Always cite which document you're referencing.
    
    Documentation context:
    ${context}
    
    User's question: ${query}`

    const result = await model.generateContent([{ text: prompt }])
    const reply = result.response.text()

    // Log the interaction
    await supabase
      .from('document_chunks')
      .update({ 
        metadata: { 
          ...chunks[0].metadata,
          last_accessed: new Date().toISOString(),
          times_accessed: ((chunks[0].metadata?.times_accessed || 0) + 1)
        }
      })
      .eq('id', chunks[0].id)

    return NextResponse.json({ reply })

  } catch (error) {
    console.error('Document search error:', error)
    return NextResponse.json(
      { error: 'Failed to search documents' },
      { status: 500 }
    )
  }
} 