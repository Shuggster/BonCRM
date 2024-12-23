import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface UserInfo {
  role: string
  department: string
  name: string
}

// All expected users from team structure
const EXPECTED_USERS: Record<string, UserInfo> = {
  'hugh@bonnymans.co.uk': { role: 'admin', department: 'management', name: 'Hugh Rogers' },
  'david@bonnymans.co.uk': { role: 'manager', department: 'management', name: 'David Dickie' },
  'lai@bonnymans.co.uk': { role: 'manager', department: 'accounts', name: 'Lai Howie' },
  'jenny@bonnymans.co.uk': { role: 'operational', department: 'sales', name: 'Jenny McFadzean' },
  'khyla@bonnymans.co.uk': { role: 'operational', department: 'sales', name: 'Khyla Swan' },
  'melanie@bonnymans.co.uk': { role: 'operational', department: 'sales', name: 'Melanie Trushell' },
  'jordan@bonnymans.co.uk': { role: 'operational', department: 'sales', name: 'Jordan Allam' },
  'kelly@bonnymans.co.uk': { role: 'operational', department: 'accounts', name: 'Kelly Robinson' },
  'jennifer@bonnymans.co.uk': { role: 'manager', department: 'trade_shop', name: 'Jennifer Darge' }
}

async function createMissingUsers() {
  try {
    // Get all existing users
    const { data: existingUsers, error } = await supabase
      .from('users')
      .select('email')

    if (error) throw error

    // Find missing users
    const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase()))
    const missingUsers = Object.entries(EXPECTED_USERS).filter(
      ([email]) => !existingEmails.has(email.toLowerCase())
    )

    if (missingUsers.length === 0) {
      console.log('No missing users to create!')
      return
    }

    console.log(`Found ${missingUsers.length} users to create`)

    // Create each missing user
    for (const [email, user] of missingUsers) {
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8)
      const hashedPassword = await bcrypt.hash(tempPassword, 10)

      // Create the user
      const { error: createError } = await supabase
        .from('users')
        .insert({
          email,
          name: user.name,
          role: user.role,
          department: user.department,
          password_hash: hashedPassword,
          is_active: true
        })

      if (createError) {
        console.error(`Failed to create user ${email}:`, createError)
        continue
      }

      console.log(`Created user ${email} (${user.name})`)
      console.log(`Temporary password: ${tempPassword}`)
    }

    console.log('\nUser creation completed!')

  } catch (error) {
    console.error('Error creating users:', error)
  }
}

// Run the creation
createMissingUsers()
