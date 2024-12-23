import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updatePassword() {
    try {
        // Hash the password
        const password = 'test123';
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        console.log('Password hashed successfully');

        // Update user's password
        const { data, error } = await supabase
            .from('users')
            .update({ password_hash: hashedPassword })
            .eq('email', 'admin@test.com')
            .select()
            .single();

        if (error) {
            console.error('Error updating password:', error);
            return;
        }

        console.log('Password updated successfully for user:', data.email);
        console.log('\nYou can now login with:');
        console.log('Email: admin@test.com');
        console.log('Password: test123');

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

updatePassword();
