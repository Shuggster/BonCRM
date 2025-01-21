import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/(auth)/lib/auth-options"

export async function POST(request: Request) {
  try {
    console.log('=== Test DB Start ===')
    
    // Get session using existing auth
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.error('No session found')
      return NextResponse.json({ 
        error: 'Authentication required',
        details: 'No session found'
      }, { status: 401 })
    }

    console.log('Session found:', {
      userId: session.user.id,
      email: session.user.email
    })

    // Test database connection
    const supabase = createRouteHandlerClient({ cookies })

    // Test documents table
    console.log('Testing documents table...')
    const { data: docTest, error: docError } = await supabase
      .from('documents')
      .insert({
        title: 'Test Document',
        content: 'Test content',
        metadata: { test: true },
        user_id: session.user.id,
        department: session.user.department || 'test'
      })
      .select()
      .single()

    if (docError) {
      console.error('Document test failed:', {
        error: docError,
        details: docError.details,
        hint: docError.hint,
        message: docError.message
      })
      return NextResponse.json({ 
        error: 'Failed to insert document',
        details: docError.message
      }, { status: 500 })
    }

    console.log('Document inserted:', {
      id: docTest.id,
      title: docTest.title
    })

    // Test chunks table
    console.log('Testing document_chunks table...')
    const { data: chunkTest, error: chunkError } = await supabase
      .from('document_chunks')
      .insert({
        document_id: docTest.id,
        content: 'Test chunk content',
        metadata: { test: true },
        user_id: session.user.id,
        department: session.user.department || 'test'
      })
      .select()
      .single()

    if (chunkError) {
      console.error('Chunk test failed:', {
        error: chunkError,
        details: chunkError.details,
        hint: chunkError.hint,
        message: chunkError.message
      })
      return NextResponse.json({ 
        error: 'Failed to insert chunk',
        details: chunkError.message
      }, { status: 500 })
    }

    console.log('Chunk inserted:', {
      id: chunkTest.id,
      documentId: chunkTest.document_id
    })

    // Test reading back
    console.log('Testing document retrieval...')
    const { data: readTest, error: readError } = await supabase
      .from('documents')
      .select(`
        *,
        document_chunks (*)
      `)
      .eq('id', docTest.id)
      .single()

    if (readError) {
      console.error('Read test failed:', readError)
      return NextResponse.json({ 
        error: 'Failed to read document',
        details: readError.message
      }, { status: 500 })
    }

    console.log('Document retrieved:', {
      document: {
        id: readTest.id,
        title: readTest.title
      },
      chunks: readTest.document_chunks?.length || 0
    })

    console.log('=== Test DB Complete ===')

    return NextResponse.json({ 
      success: true,
      documentId: docTest.id,
      chunkId: chunkTest.id,
      readSuccess: !!readTest
    })

  } catch (error) {
    console.error('Test DB failed:', {
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