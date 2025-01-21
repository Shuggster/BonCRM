import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getToken } from "next-auth/jwt"
import { headers } from "next/headers"
import { extractText } from '@/lib/ai/text-extractor'
import { DocumentProcessor } from '@/lib/ai/document-processor'
import { AIProviderFactory } from '@/lib/ai/provider-factory'

// Add a GET handler for testing
export async function GET() {
  return NextResponse.json({ status: 'Route is working' })
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    }
  })
}

export async function POST(request: Request) {
  try {
    // Get JWT token
    const token = await getToken({ 
      req: {
        headers: Object.fromEntries(headers()),
        cookies: Object.fromEntries(cookies().getAll().map(c => [c.name, c.value]))
      } as any
    })
    
    if (!token?.email) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required"
      }, { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true'
        }
      })
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', token.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found"
      }, { status: 401 })
    }

    // Get request body
    const { fileId } = await request.json()
    if (!fileId) {
      return NextResponse.json({ 
        success: false, 
        error: "File ID is required"
      }, { status: 400 })
    }

    // Get file data
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (fileError || !fileData) {
      return NextResponse.json({ 
        success: false, 
        error: "File not found"
      }, { status: 404 })
    }

    // Download file content
    const { data: fileContent, error: downloadError } = await supabase
      .storage
      .from('files')
      .download(fileData.path)

    if (downloadError || !fileContent) {
      return NextResponse.json({ 
        success: false, 
        error: "Could not download file"
      }, { status: 500 })
    }

    // Extract text from file
    const arrayBuffer = await fileContent.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const text = await extractText(buffer, fileData.filename, fileData.type)

    if (!text) {
      return NextResponse.json({ 
        success: false, 
        error: "Could not extract text from file"
      }, { status: 500 })
    }

    // Get AI provider
    const aiProvider = AIProviderFactory.getInstance().getProvider()
    
    // Create document processor
    const processor = new DocumentProcessor(
      supabase,
      aiProvider,
      userData.id,
      userData.team_id,
      userData.department
    )

    // Process the document
    const result = await processor.processDocument({
      title: fileData.filename,
      content: text,
      metadata: {
        fileId: fileId,
        originalPath: fileData.path,
        fileType: fileData.type,
        fileSize: fileData.size
      }
    })

    return NextResponse.json({ 
      success: true,
      document: result
    })

  } catch (error) {
    console.error('Error processing file:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to process file"
    }, { status: 500 })
  }
} 