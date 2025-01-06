import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

async function addTestIndustry() {
  const supabase = createClientComponentClient()
  
  try {
    // First create the industry
    const { data: industry, error: industryError } = await supabase
      .from('industries')
      .insert([
        {
          name: 'Technology',
          description: 'Software and technology companies'
        }
      ])
      .select()
      .single()

    if (industryError) throw industryError
    console.log('Created industry:', industry)

    // Get the first contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .limit(1)
      .single()

    if (contactError) throw contactError
    console.log('Found contact:', contact)

    // Update the contact with the industry
    const { data: updatedContact, error: updateError } = await supabase
      .from('contacts')
      .update({ industry_id: industry.id })
      .eq('id', contact.id)
      .select()
      .single()

    if (updateError) throw updateError
    console.log('Updated contact:', updatedContact)

    console.log('Successfully added industry to contact')
  } catch (error) {
    console.error('Error:', error)
  }
}

addTestIndustry() 