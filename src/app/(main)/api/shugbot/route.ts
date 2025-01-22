import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/(auth)/lib/auth-options'
import { createClient } from '@/lib/supabase/server'

interface DocumentChunk {
  content: string
  document_id: string
  document_title: string
  metadata: string
}

const propertyTerms = ['ph', 'specific gravity', 'density', 'boiling point', 'melting point', 'flash point', 'vapor pressure']

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, previousContext } = await request.json()
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const supabase = createClient()
    const documentsUsed: string[] = []
    let context = ''
    let response = ''

    // Check if this is a property question
    const propertyMatch = propertyTerms.find(term => 
      message.toLowerCase().includes(term) || 
      (previousContext?.toLowerCase().includes(term) && message.toLowerCase() === 'yes')
    )
    console.log('Property match:', propertyMatch)

    // Check if this is about Acetic Acid
    const isAceticAcidQuestion = message.toLowerCase().includes('acetic acid') ||
      (previousContext?.toLowerCase().includes('acetic acid') && message.toLowerCase() === 'yes')
    console.log('Is Acetic Acid question:', isAceticAcidQuestion)

    if (propertyMatch && isAceticAcidQuestion) {
      // Search for Acetic Acid document chunks with the specific property
      console.log('Searching with department:', session.user.department)
      
      // Format search terms for PostgreSQL text search
      const searchTerms = [
        propertyMatch.split(' ').join(' & '),  // Join multi-word properties with &
        'acetic',
        'acid',
        'properties'  // Add this to help find the properties section
      ].join(' & ')
      
      const { data: chunks, error: searchError } = await supabase
        .from('document_chunks')
        .select('content, document_id, document_title, metadata')
        .eq('department', session.user.department)
        .textSearch('content', searchTerms, {
          type: 'plain',
          config: 'english'
        })
        .limit(10)

      if (searchError) {
        console.error('Search error:', searchError)
      }
      
      console.log('Search terms:', searchTerms)
      console.log('Found chunks:', chunks?.length)
      if (chunks?.length) {
        console.log('Found chunks with metadata:', chunks.map(c => ({
          title: c.document_title,
          metadata: c.metadata,
          preview: c.content.substring(0, 100) + '...'
        })))
      }
      
      if (chunks?.length) {
        documentsUsed.push(...chunks.map((chunk: DocumentChunk) => chunk.document_id))
        const docTitle = chunks[0].document_title.replace(/^\d{13}-/, '')
        context = `Found information in document: ${docTitle}\n\nPlease find the ${propertyMatch} value in this content:\n\n${chunks.map((chunk: DocumentChunk) => chunk.content).join('\n')}`
        console.log('Set context from specific search')
      } else {
        console.log('Trying broader search...')
        // Try a broader search if specific search fails
        const broadSearchTerms = 'acetic & acid'
        const { data: broadChunks, error: broadError } = await supabase
          .from('document_chunks')
          .select('content, document_id, document_title, metadata')
          .eq('department', session.user.department)
          .textSearch('content', broadSearchTerms, {
            type: 'plain',
            config: 'english'
          })
          .limit(10)
          
        if (broadError) {
          console.error('Broad search error:', broadError)
        }
        
        console.log('Broad search terms:', broadSearchTerms)
        console.log('Found broad chunks:', broadChunks?.length)
        if (broadChunks?.length) {
          console.log('Found broad chunks with metadata:', broadChunks.map(c => ({
            title: c.document_title,
            metadata: c.metadata,
            preview: c.content.substring(0, 100) + '...'
          })))
        }
          
        if (broadChunks?.length) {
          documentsUsed.push(...broadChunks.map((chunk: DocumentChunk) => chunk.document_id))
          const docTitle = broadChunks[0].document_title.replace(/^\d{13}-/, '')
          context = `Found information in document: ${docTitle}\n\nPlease find the ${propertyMatch} value in this content:\n\n${broadChunks.map((chunk: DocumentChunk) => chunk.content).join('\n')}`
          console.log('Set context from broad search')
        } else {
          console.log('No documents found in either search')
          context = '' // Explicitly clear context if no documents found
        }
      }
    } else {
      console.log('Not a property question about Acetic Acid')
      context = '' // Explicitly clear context for non-property questions
    }

    // Generate AI response
    const systemMessage = `You are Shug, a friendly and knowledgeable AI assistant for NeoCRM. You have two main sources of information:

1. Document Database: For technical documents and specifications
   - When document context is provided, you MUST cite the exact document name
   - NEVER make up or fabricate document sections or values
   - If information is found, quote the exact text from the document
   - If you can't find specific information in the documents, clearly state "I don't see that information in our current documents"
   - Do not mix general knowledge with document information

2. Built-in Knowledge: For CRM features and general help
   - You are an expert on NeoCRM's features and functionality
   - You can help with navigation, explain features, and provide best practices
   - You understand the CRM's departments, roles, and access controls
   - For technical/scientific questions, clearly state when you're using general knowledge

Keep your responses friendly and concise.
When using document information, always specify which document and quote the exact text.
When explaining CRM features, be specific about where to find things.
Never refer to the system as Lovable CRM - it is now NeoCRM.
Never fabricate document content or section numbers.`

    // Add debug logging for document search
    console.log('Message:', message)
    console.log('Previous context:', previousContext)
    console.log('Property match:', propertyMatch)
    console.log('Is Acetic Acid question:', isAceticAcidQuestion)
    
    try {
      const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemMessage },
            ...(context ? [{ role: 'assistant', content: `Document context: ${context}` }] : []),
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      if (deepseekResponse.ok) {
        const data = await deepseekResponse.json()
        response = data.choices[0].message.content
      } else {
        throw new Error('Deepseek API failed')
      }
    } catch (error) {
      console.error('Deepseek API error:', error)
      
      // Fallback to Gemini
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

      const result = await model.generateContent({
        contents: [{ 
          role: 'user',
          parts: [{ text: `${systemMessage}\n\n${context ? `Document context: ${context}\n\n` : ''}User question: ${message}` }]
        }]
      })

      response = result.response.text()
    }

    // Log interaction
    await supabase.from('shugbot_interactions').insert({
      user_id: session.user.id,
      message,
      response,
      documents_used: documentsUsed,
      department: session.user.department
    })

    return NextResponse.json({ 
      response,
      context: propertyMatch || isAceticAcidQuestion ? context : null
    })

  } catch (error) {
    console.error('ShugBot error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 