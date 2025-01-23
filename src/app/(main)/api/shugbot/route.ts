import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/(auth)/lib/auth-options'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function searchDocuments(query: string, department: string) {
  try {
    // Extract key terms for technical searches
    const technicalTerms = query.toLowerCase()
      .match(/specific\s+gravity|density|ph|flash\s+point|boiling\s+point|melting\s+point|\d+(\.\d+)?/g) || [];
    
    // Create search query combining original terms and technical terms
    const searchTerms = [
      ...query.replace(/[^\w\s]/g, '').split(/\s+/).filter(word => word.length > 2),
      ...technicalTerms
    ];
    
    const searchQuery = searchTerms.join(' | ');
    console.log('Technical terms identified:', technicalTerms);
    console.log('Final search query:', searchQuery);

    // First try exact phrase matching
    const { data: exactChunks, error: exactError } = await supabase
      .from('document_chunks')
      .select(`
        id,
        content,
        document_id,
        metadata,
        documents!inner (
          id,
          title,
          metadata
        )
      `)
      .textSearch('content', `'${query}'`, {
        type: 'plain',
        config: 'english'
      })
      .eq('department', department)
      .limit(5);

    // Then try broader search if exact match fails
    const { data: broadChunks, error: broadError } = await supabase
      .from('document_chunks')
      .select(`
        id,
        content,
        document_id,
        metadata,
        documents!inner (
          id,
          title,
          metadata
        )
      `)
      .textSearch('content', searchQuery, {
        type: 'websearch',
        config: 'english'
      })
      .eq('department', department)
      .limit(10);

    if (exactError || broadError) {
      console.error('Search errors:', { exactError, broadError });
      throw exactError || broadError;
    }

    const chunks = [...(exactChunks || []), ...(broadChunks || [])];
    const uniqueChunks = Array.from(new Map(chunks.map(chunk => [chunk.id, chunk])).values());

    console.log('Search results:', {
      exactMatches: exactChunks?.length || 0,
      broadMatches: broadChunks?.length || 0,
      uniqueMatches: uniqueChunks.length
    });

    if (uniqueChunks.length) {
      console.log('\nFound content chunks:');
      uniqueChunks.forEach((chunk, i) => {
        console.log(`\nChunk ${i + 1}:`);
        console.log('Content:', chunk.content);
        console.log('Document:', chunk.documents?.[0]?.title);
        console.log('Metadata:', chunk.metadata);
      });
    } else {
      console.log('No matching chunks found');
    }

    return uniqueChunks;
  } catch (error) {
    console.error('Document search error:', error)
    return []
  }
}

async function generateAIResponse(query: string, context: string) {
  try {
    const systemPrompt = `You are ShugBot, a helpful AI assistant for NeoCRM. 
    When answering questions:
    1. ONLY use information from the provided document context
    2. If the exact information isn't in the context, say "I don't see that specific information in the document"
    3. Always cite which document and section you found the information in
    4. Do not use your general knowledge unless explicitly asked
    5. Be concise and to-the-point while maintaining a friendly tone
    6. If you find conflicting information in different documents, point this out`;

    // Try Deepseek first
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            "role": "system",
            "content": systemPrompt
          },
          {
            "role": "user",
            "content": `Context:\n${context}\n\nQuestion: ${query}\n\nRemember: Only use information from the provided context. If you can't find the specific information, say so.`
          }
        ]
      })
    })

    if (deepseekResponse.ok) {
      const data = await deepseekResponse.json()
      return data.choices[0].message.content
    }

    // Fallback to Gemini if Deepseek fails
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `${systemPrompt}\n\nContext:\n${context}\n\nQuestion: ${query}\n\nRemember: Only use information from the provided context. If you can't find the specific information, say so.`
    const result = await model.generateContent([
      { text: prompt }
    ])

    return result.response.text()
  } catch (error) {
    console.error('AI generation error:', error)
    throw error
  }
}

export async function POST(req: Request) {
  try {
    // Session validation
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Input validation
    const { message } = await req.json()
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Search for relevant documents
    const chunks = await searchDocuments(message, session.user.department)

    // Build context from chunks
    console.log('First chunk document data:', JSON.stringify(chunks[0]?.documents, null, 2));
    
    let context = chunks.length > 0 
      ? "Based on our documentation:\n\n" + chunks.map(chunk => {
          const rawTitle = chunk.documents?.title || 'Unknown Document'
          // Remove timestamp prefix (13 digits followed by a hyphen)
          const docTitle = rawTitle.replace(/^\d{13}-/, '')
          const docMetadata = chunk.documents?.metadata || {}
          const docInfo = `Document: "${docTitle}" ${docMetadata.version ? `(Version: ${docMetadata.version})` : ''}`
          return `${docInfo}\n${chunk.content}\n`
        }).join('\n')
      : "No specific documentation found for this query."

    // Generate AI response
    const response = await generateAIResponse(message, context)

    // Log the interaction for analytics
    await supabase
      .from('shugbot_interactions')
      .insert({
        user_id: session.user.id,
        department: session.user.department,
        query: message,
        response: response,
        documents_used: chunks.map(c => c.document_id),
        timestamp: new Date().toISOString()
      })
      .select()

    return NextResponse.json({ response })
  } catch (error) {
    console.error('ShugBot error:', error)
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    )
  }
} 