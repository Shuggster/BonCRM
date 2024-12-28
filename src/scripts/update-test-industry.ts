import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wupeyfswadimlhobgo.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  try {
    // First get a contact ID
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id')
      .limit(1)
      .single()
      
    if (contactsError) throw contactsError
    if (!contacts) throw new Error('No contacts found')
    
    // Update with Technology industry
    const TECHNOLOGY_INDUSTRY_ID = 'ec3ef12c-04ac-48ff-9d86-2678618e8872'
    const { data: updatedContact, error: updateError } = await supabase
      .from('contacts')
      .update({ industry_id: TECHNOLOGY_INDUSTRY_ID })
      .eq('id', contacts.id)
      .select(`
        *,
        industries!industry_id (
          id,
          name
        )
      `)
      .single()
    
    if (updateError) throw updateError
    console.log('Updated contact:', updatedContact)
  } catch (error) {
    console.error('Error:', error)
  }
}

main() 