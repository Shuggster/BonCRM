import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
                id: '0fb30808-5c50-4cd5-b4ec-4ecee7607771', // Your admin UID
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
