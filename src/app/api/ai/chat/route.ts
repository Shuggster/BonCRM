import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function searchDocumentation(query: string) {
  try {
    const { data, error } = await supabase
      .from('documentation')
      .select()
      .textSearch('content', query)
      .limit(5)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Documentation search error:', error)
    return []
  }
}

async function searchWikipedia(query: string) {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&format=json&origin=*`
    )
    const data = await response.json()
    return data.query?.search?.[0]?.snippet || null
  } catch (error) {
    console.error('Wikipedia search error:', error)
    return null
  }
}

async function searchOMDB(query: string) {
  try {
    const response = await fetch(
      `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&t=${encodeURIComponent(query)}`
    )
    const data = await response.json()
    return data.Response === 'True' ? data : null
  } catch (error) {
    console.error('OMDB search error:', error)
    return null
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

    // Search for relevant documentation
    const docs = await searchDocumentation(message)
    
    // Check for movie-related queries
    const movieMatch = message.match(/(?:movie|film|watch)\s+(.+?)(?:\s|$)/i)
    const movieInfo = movieMatch ? await searchOMDB(movieMatch[1]) : null
    
    // Check for general knowledge queries
    const wikiInfo = await searchWikipedia(message)

    // Build context for Gemini
    let systemPrompt = `You are ShugBot, a helpful AI assistant for the Bonnymans CRM system.
Current page: ${context?.currentPage || 'unknown'}

Your role is to:
1. Help users with CRM-related questions
2. Provide accurate information from documentation
3. Assist with general queries using external knowledge
4. Maintain a professional and helpful tone

When responding:
- Cite sources when using documentation
- Be concise but thorough
- If unsure, admit uncertainty
- Format responses clearly\n\n`
    
    if (docs.length > 0) {
      systemPrompt += "Relevant CRM documentation:\n"
      docs.forEach(doc => {
        systemPrompt += `[${doc.title}]: ${doc.content}\n`
      })
    }

    if (movieInfo) {
      systemPrompt += `\nMovie Information:\nTitle: ${movieInfo.Title}\nYear: ${movieInfo.Year}\nPlot: ${movieInfo.Plot}\n`
    }

    if (wikiInfo) {
      systemPrompt += `\nRelevant Information: ${wikiInfo}\n`
    }

    // Generate response with Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const chat = model.startChat({
      history: context?.messages?.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: msg.content
      })) || [],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7
      }
    })

    const result = await chat.sendMessage(message)
    const response = result.response.text()

    // Log interaction
    try {
      await supabase
        .from('shugbot_interactions')
        .insert({
          user_message: message,
          bot_response: response,
          context: {
            currentPage: context?.currentPage,
            docs: docs.map(d => d.id),
            movie: movieInfo?.Title,
            wiki: !!wikiInfo
          }
        })
    } catch (error) {
      console.error('Failed to log interaction:', error)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API Error:', error)
    
    // Check if it's a Gemini API error
    if (error instanceof Error && error.message.includes('Gemini')) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
} 