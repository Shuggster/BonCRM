import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Create tags table
    const { error: createTableError } = await supabase.rpc('create_tags_table')
    if (createTableError) {
      console.error('Error creating tags table:', createTableError)
      return NextResponse.json({ error: createTableError.message }, { status: 500 })
    }

    // Add default tags
    const defaultTags = [
      { name: 'Lead', color: '#10B981' },
      { name: 'Partner', color: '#6366F1' },
      { name: 'New Customer', color: '#EC4899' },
      { name: 'management', color: '#3B82F6' },
      { name: 'developer', color: '#8B5CF6' },
      { name: 'designer', color: '#F59E0B' },
      { name: 'creative', color: '#EC4899' },
      { name: 'engineering', color: '#10B981' }
    ]

    const { error: insertError } = await supabase
      .from('tags')
      .upsert(defaultTags, { onConflict: 'name' })

    if (insertError) {
      console.error('Error inserting default tags:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Tags setup completed successfully' })
  } catch (error: any) {
    console.error('Error in setup:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 