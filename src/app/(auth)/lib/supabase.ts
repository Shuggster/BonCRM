import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseServiceKey) {
    throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY');
}

console.log('Initializing Supabase with URL:', supabaseUrl);

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
        auth: {
            persistSession: false, // We're using NextAuth for session management
            autoRefreshToken: false,
        },
        db: {
            schema: 'public'
        }
    }
);
