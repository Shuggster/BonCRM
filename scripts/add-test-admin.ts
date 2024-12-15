import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addTestAdmin() {
  const testEmail = 'test@admin.com' // Replace with your test admin email

  try {
    // Get the user from Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) throw authError

    const testUser = authUser.users.find(u => u.email === testEmail)
    if (!testUser) {
      throw new Error('Test admin user not found in Auth')
    }

    // Add to users table
    const { error: dbError } = await supabase
      .from('users')
      .upsert([
        {
          id: testUser.id,
          email: testEmail,
          role: 'admin',
          name: 'Test Admin',
          department: 'System',
        }
      ])

    if (dbError) throw dbError

    console.log('Successfully added test admin to users table')
  } catch (error) {
    console.error('Error:', error)
  }
}

addTestAdmin()
