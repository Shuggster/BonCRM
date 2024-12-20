import { supabase } from './supabase';

export type UserResponse = {
    user: {
        id: string;
        email: string;
        role: string;
        name: string | null;
    } | null;
    error: Error | null;
};

/**
 * Get user by email for authentication
 */
export async function getUserByEmail(email: string): Promise<UserResponse> {
    try {
        console.log('Querying user with email:', email);
        
        const { data: user, error } = await supabase
            .from('users')
            .select('*')  // Select all fields for debugging
            .eq('email', email)
            .single();

        console.log('Supabase response:', { user, error });

        if (error) {
            console.error('Supabase error:', error);
            return { user: null, error: new Error(error.message) };
        }

        if (!user) {
            console.log('No user found');
            return { user: null, error: new Error('User not found') };
        }

        console.log('User found:', { ...user, password_hash: '[REDACTED]' });

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            },
            error: null
        };
    } catch (error) {
        console.error('Unexpected error:', error);
        return {
            user: null,
            error: error instanceof Error ? error : new Error('Unknown error occurred')
        };
    }
}
