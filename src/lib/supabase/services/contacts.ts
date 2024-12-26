import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Contact, LeadStatus, LeadSource, ConversionStatus } from '@/types'

export async function seedTestContacts() {
  const supabase = createClientComponentClient()
  
  try {
    const testContacts: Partial<Contact>[] = [
      {
        first_name: "Bobby",
        last_name: "Crown",
        email: "crown2919@hotmail.com",
        phone: "+1 (484) 288 60 28",
        job_title: "Sales Manager",
        company: "Google Inc",
        tags: ["Family"],
        lead_status: "new",
        lead_source: "referral",
        department: "Sales",
        conversion_status: "lead",
        lead_score: 80,
        probability: 60,
        expected_value: 10000
      },
      {
        first_name: "Anna",
        last_name: "Mitchell",
        email: "anna_mitchell@hotmail.com",
        phone: "+1 (484) 293 88 56",
        job_title: "Software Developer",
        company: "Microsoft",
        tags: ["Family", "Job"],
        lead_status: "qualified",
        lead_source: "website",
        department: "Engineering",
        conversion_status: "opportunity",
        lead_score: 90,
        probability: 75,
        expected_value: 15000
      },
      {
        first_name: "David",
        last_name: "Johnson",
        email: "dave_j89@hotmail.com",
        phone: "+1 (484) 322 22 32",
        job_title: "Product Designer",
        company: "Apple",
        tags: ["Sports", "Family"],
        lead_status: "new",
        lead_source: "social_media",
        department: "Design",
        conversion_status: "lead",
        lead_score: 70,
        probability: 50,
        expected_value: 8000
      }
    ]

    // Insert new contacts
    const { data, error } = await supabase
      .from('contacts')
      .upsert(testContacts, { 
        onConflict: 'email',
        ignoreDuplicates: true 
      })
      .select()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error in seedTestContacts:', error)
    throw error
  }
}

export async function getContacts() {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('first_name')
  
  if (error) {
    console.error('Error fetching contacts:', error)
    return []
  }
  
  return data
} 