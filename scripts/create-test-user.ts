import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createTestUser() {
    try {
        // Hash the password
        const password = 'test123'; // This is just for testing
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert test user
        const { data, error } = await supabase
            .from('users')
            .upsert({
                email: 'admin@example.com',
                password_hash: hashedPassword,
                name: 'Admin User',
                role: 'admin'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating test user:', error);
            return;
        }

        console.log('Test user created successfully:', {
            id: data.id,
            email: data.email,
            role: data.role
        });
        console.log('You can login with:');
        console.log('Email: admin@example.com');
        console.log('Password: test123');

    } catch (error) {
        console.error('Error:', error);
    }
}

createTestUser();
