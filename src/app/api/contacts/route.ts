import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/(auth)/lib/auth-options"
import { supabase } from "@/lib/supabase/client"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        industries (
          id,
          name
        )
      `)
      .order('first_name', { ascending: true })
    
    if (error) throw error

    const transformedData = data?.map(contact => ({
      ...contact,
      name: contact.name || `${contact.first_name} ${contact.last_name || ''}`.trim(),
      tags: contact.tags || []
    }))

    return NextResponse.json(transformedData)
  } catch (error: any) {
    console.error('Error in /api/contacts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const contact = await request.json()
    const { data, error } = await supabase
      .from('contacts')
      .insert(contact)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in /api/contacts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create contact' },
      { status: 500 }
    )
  }
} 