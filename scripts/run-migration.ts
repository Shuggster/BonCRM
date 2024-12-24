import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function runMigration() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Read the migration SQL
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20240124_add_relation_type.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', {
      query: migrationSQL
    })

    if (error) {
      console.error('Error executing migration:', error)
      throw error
    }

    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration() 