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

async function checkUser() {
    try {
        // Query the user
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'admin@example.com')
            .single();

        if (error) {
            console.error('Error querying user:', error);
            return;
        }

        if (!user) {
            console.log('No user found with email admin@example.com');
            return;
        }

        console.log('User found:', {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            password_hash_length: user.password_hash?.length || 0
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

checkUser();
