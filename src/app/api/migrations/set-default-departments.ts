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
}

// Known user mappings based on team structure
const KNOWN_USERS: Record<string, UserInfo> = {
  'hugh@bonnymans.co.uk': { role: 'admin', department: 'management' },
  'david@bonnymans.co.uk': { role: 'manager', department: 'management' },
  'lai@bonnymans.co.uk': { role: 'manager', department: 'accounts' },
  'jenny@bonnymans.co.uk': { role: 'operational', department: 'sales' },
  'khyla@bonnymans.co.uk': { role: 'operational', department: 'sales' },
  'melanie@bonnymans.co.uk': { role: 'operational', department: 'sales' },
  'jordan@bonnymans.co.uk': { role: 'operational', department: 'sales' },
  'kelly@bonnymans.co.uk': { role: 'operational', department: 'accounts' },
  'jennifer@bonnymans.co.uk': { role: 'manager', department: 'trade_shop' }
}

async function setDefaultDepartments() {
  try {
    // 1. Get all users without departments
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, email, role, department')
      .is('department', null)

    if (fetchError) throw fetchError

    if (!users || users.length === 0) {
      console.log('No users need department updates')
      return
    }

    console.log(`Found ${users.length} users without departments`)

    // 2. Update each user with a default department
    for (const user of users) {
      let defaultDepartment: string

      // First check if this is a known user
      if (user.email in KNOWN_USERS) {
        const knownUser = KNOWN_USERS[user.email as keyof typeof KNOWN_USERS]
        defaultDepartment = knownUser.department
        
        // Also update role if it doesn't match
        if (user.role !== knownUser.role) {
          const { error: roleError } = await supabase
            .from('users')
            .update({ role: knownUser.role })
            .eq('id', user.id)

          if (roleError) {
            console.error(`Failed to update role for ${user.email}:`, roleError)
          } else {
            console.log(`Updated role for ${user.email} to ${knownUser.role}`)
          }
        }
      } else {
        // For unknown users, use role-based logic
        switch (user.role) {
          case 'admin':
            defaultDepartment = 'management'
            break
          case 'manager':
            defaultDepartment = 'management'
            break
          case 'operational':
            defaultDepartment = 'sales' // Default operational users to sales
            break
          default:
            defaultDepartment = 'sales'
        }
      }

      // Update the user's department
      const { error: updateError } = await supabase
        .from('users')
        .update({ department: defaultDepartment })
        .eq('id', user.id)

      if (updateError) {
        console.error(`Failed to update user ${user.email}:`, updateError)
        continue
      }

      console.log(`Updated user ${user.email} with department: ${defaultDepartment}`)
    }

    console.log('Department migration completed successfully')

  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

// Add department enum type and constraint
async function addDepartmentConstraints() {
  try {
    // 1. Create enum type for departments
    const { error: enumError } = await supabase.rpc('create_department_enum', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'department_type') THEN
            CREATE TYPE department_type AS ENUM ('management', 'sales', 'accounts', 'trade_shop');
          END IF;
        END
        $$;
      `
    })

    if (enumError) {
      console.error('Failed to create enum:', enumError)
      throw enumError
    }

    // 2. Add constraint to users table
    const { error: constraintError } = await supabase.rpc('add_department_constraint', {
      sql: `
        ALTER TABLE users
        ALTER COLUMN department SET NOT NULL,
        ALTER COLUMN department TYPE department_type
        USING department::department_type;
      `
    })

    if (constraintError) {
      console.error('Failed to add constraints:', constraintError)
      throw constraintError
    }

    console.log('Department constraints added successfully')

  } catch (error) {
    console.error('Failed to add constraints:', error)
    throw error
  }
}

export async function runMigration() {
  console.log('Starting department migration...')
  
  try {
    // 1. Set default departments
    await setDefaultDepartments()
    
    // 2. Add constraints
    await addDepartmentConstraints()
    
    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}
