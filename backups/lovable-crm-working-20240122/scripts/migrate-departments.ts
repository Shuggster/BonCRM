import { runMigration } from '../src/app/api/migrations/set-default-departments'

// Run the migration
runMigration().catch(console.error)
