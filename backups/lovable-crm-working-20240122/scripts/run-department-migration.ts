import { runMigration } from '../src/app/api/migrations/set-default-departments'

runMigration().catch(console.error)
