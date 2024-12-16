import { supabase } from './supabase';
import { hashPassword } from './bcrypt';

export async function createOrUpdateUser(email: string, password: string, role: string = 'admin') {
    try {
        console.log('Starting createOrUpdateUser for email:', email);
        
        // Hash the password
        console.log('Hashing password...');
        const password_hash = await hashPassword(password);
        console.log('Password hashed successfully');
        
        // Check if user exists
        console.log('Checking if user exists...');
        const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (userError) {
            console.error('Error checking existing user:', userError);
            throw userError;
        }

        if (existingUser) {
            console.log('Updating existing user...');
            // Update existing user
            const { data, error } = await supabase
                .from('users')
                .update({
                    password_hash,
                    role
                })
                .eq('id', existingUser.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating user:', error);
                throw error;
            }
            console.log('User updated successfully:', { ...data, password_hash: '[REDACTED]' });
            return { success: true, message: 'User updated successfully' };
        } else {
            console.log('Creating new user...');
            // Create new user
            const { data, error } = await supabase
                .from('users')
                .insert([
                    {
                        email,
                        password_hash,
                        role,
                        name: email.split('@')[0]
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error('Error creating user:', error);
                throw error;
            }
            console.log('User created successfully:', { ...data, password_hash: '[REDACTED]' });
            return { success: true, message: 'User created successfully' };
        }
    } catch (error) {
        console.error('Error in createOrUpdateUser:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            error: error
        };
    }
}
