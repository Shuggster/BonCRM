import { createClient } from '@supabase/supabase-js'
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

interface ExistingUser {
  email: string
  name: string
  role: string
  department: string | null
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

async function checkMissingUsers() {
  try {
    // Get all existing users
    const { data: existingUsers, error } = await supabase
      .from('users')
      .select('email, name, role, department')

    if (error) throw error

    console.log('\nExisting Users:')
    console.log('---------------')
    existingUsers.forEach((user: ExistingUser) => {
      console.log(`${user.email} (${user.name}) - ${user.role} in ${user.department || 'no department'}`)
    })

    // Find missing users
    const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase()))
    const missingUsers = Object.entries(EXPECTED_USERS).filter(
      ([email]) => !existingEmails.has(email.toLowerCase())
    )

    if (missingUsers.length === 0) {
      console.log('\nNo missing users! All team members are in the database.')
      return
    }

    console.log('\nMissing Users:')
    console.log('--------------')
    missingUsers.forEach(([email, user]) => {
      console.log(`${email} - ${user.name} (${user.role} in ${user.department})`)
    })

    // Find users that exist but have incorrect details
    console.log('\nUsers Needing Updates:')
    console.log('--------------------')
    existingUsers.forEach((existingUser: ExistingUser) => {
      const expectedUser = EXPECTED_USERS[existingUser.email]
      if (expectedUser) {
        const updates = []
        if (existingUser.role !== expectedUser.role) {
          updates.push(`role should be ${expectedUser.role}`)
        }
        if (existingUser.department !== expectedUser.department) {
          updates.push(`department should be ${expectedUser.department}`)
        }
        if (existingUser.name !== expectedUser.name) {
          updates.push(`name should be ${expectedUser.name}`)
        }
        if (updates.length > 0) {
          console.log(`${existingUser.email}:`)
          updates.forEach(update => console.log(`  - ${update}`))
        }
      }
    })

  } catch (error) {
    console.error('Error checking users:', error)
  }
}

// Run the check
checkMissingUsers()
