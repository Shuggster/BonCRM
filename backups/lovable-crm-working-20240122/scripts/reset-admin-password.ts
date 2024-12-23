import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupAdmins() {
  try {
    console.log('Setting up admin accounts...')
    
    // Setup admin accounts
    const admins = [
      {
        email: 'hugh@bonnymans.co.uk',
        name: 'Hugh',
        password: 'test123456'
      },
      {
        email: 'admin@test.com',
        name: 'Admin User',
        password: 'test123456'
      }
    ]

    for (const admin of admins) {
      console.log(`Setting up ${admin.email}...`)
      
      try {
        // Create/Update auth user
        const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
          email: admin.email,
          password: admin.password,
          email_confirm: true,
          user_metadata: {
            name: admin.name,
            role: 'admin'
          }
        })

        if (createError) {
          console.error(`Error with ${admin.email}:`, createError)
          continue
        }

        if (!authUser?.user?.id) {
          console.error(`No user ID returned for ${admin.email}`)
          continue
        }

        // Update users table
        const { error: tableError } = await supabase
          .from('users')
          .upsert({
            id: authUser.user.id,
            email: admin.email,
            name: admin.name,
            role: 'admin'
          })

        if (tableError) {
          console.error(`Error updating users table for ${admin.email}:`, tableError)
          continue
        }

        console.log(`Successfully set up ${admin.email}`)
      } catch (error) {
        console.error(`Error processing ${admin.email}:`, error)
      }
    }

    console.log('\nSetup complete!')
    console.log('\nYou can now login with either:')
    console.log('\n1. hugh@bonnymans.co.uk / test123456')
    console.log('2. admin@test.com / test123456')

  } catch (error) {
    console.error('Setup error:', error)
  }
}

console.log('Starting admin setup...')
setupAdmins()
  .catch(console.error)
  .finally(() => process.exit()) 