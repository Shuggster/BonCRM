import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
    try {
        // Create users table
        const { error: createError } = await supabase.rpc('create_users_table');

        if (createError) {
            console.error('Error creating users table:', createError);
            return;
        }

        console.log('Database setup completed successfully');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

setupDatabase();
