import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getToken } from "next-auth/jwt"
import { headers } from "next/headers"

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown'
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: Request) {
  console.log('=== Starting File Upload ===')
  
  try {
    // Get JWT token directly
    const token = await getToken({ 
      req: {
        headers: Object.fromEntries(headers()),
        cookies: Object.fromEntries(cookies().getAll().map(c => [c.name, c.value]))
      } as any
    })
    
    console.log('Token check result:', { 
      hasToken: !!token,
      email: token?.email,
      role: token?.role,
      department: token?.department
    })

    if (!token?.email) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: "Authentication required",
          step: "auth"
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    console.log('Supabase client initialized')

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', token.email)
      .single()

    if (userError || !userData) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: "User not found",
          step: "getUserData"
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Role and department access check
    if (!userData.role || !userData.department) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: "Invalid user role or department",
          step: "accessCheck"
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate role is one of the allowed values
    if (!['admin', 'manager', 'operational'].includes(userData.role)) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: "Invalid user role",
          step: "roleCheck"
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate department is one of the allowed values
    if (!['management', 'sales', 'accounts', 'trade_shop'].includes(userData.department)) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: "Invalid department",
          step: "departmentCheck"
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Process the file upload
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: "No file provided",
          step: "fileCheck"
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: "Invalid file type",
          step: "fileTypeCheck",
          allowedTypes: ALLOWED_FILE_TYPES
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: "File too large",
          step: "fileSizeCheck",
          maxSize: MAX_FILE_SIZE
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Upload file to Supabase Storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const fileName = `${userData.department}/${Date.now()}-${file.name}`
    const { data: fileData, error: uploadError } = await supabase
      .storage
      .from('files')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: "File upload failed",
          step: "upload",
          details: uploadError.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from('files')
      .getPublicUrl(fileData.path)

    // Create file record in database matching the existing schema
    const { data: dbFile, error: dbError } = await supabase
      .from('files')
      .insert({
        filename: file.name,
        path: fileData.path,
        size: file.size,
        type: file.type,
        url: publicUrl,
        user_id: userData.id,
        metadata: {
          department: userData.department,
          uploadedAt: new Date().toISOString(),
          needsProcessing: true,  // Always set to true for new files
          status: 'pending'  // Add status for tracking
        },
        uploaded_by: userData.email
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: "Failed to save file record",
          step: "database",
          details: dbError.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // For now, just return success without AI processing
    return new NextResponse(
      JSON.stringify({ 
        success: true,
        file: dbFile,
        message: "File uploaded successfully. AI processing will happen in the background."
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 