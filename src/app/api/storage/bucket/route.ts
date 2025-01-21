import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { bucketName } = await request.json()
    
    if (!bucketName) {
      return NextResponse.json(
        { error: 'Bucket name is required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // First check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.name === bucketName)

    if (!bucketExists) {
      // Create bucket with public access
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      })

      if (createError) {
        console.error('Error creating bucket:', createError)
        return NextResponse.json(
          { error: 'Failed to create bucket' },
          { status: 500 }
        )
      }

      // Set bucket to public
      const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
        public: true
      })

      if (updateError) {
        console.error('Error updating bucket permissions:', updateError)
        return NextResponse.json(
          { error: 'Failed to update bucket permissions' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in bucket creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 