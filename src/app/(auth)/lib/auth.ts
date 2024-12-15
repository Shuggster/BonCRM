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
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, role, name, password_hash')
            .eq('email', email)
            .single();

        if (error) {
            return { user: null, error: new Error(error.message) };
        }

        if (!user) {
            return { user: null, error: new Error('User not found') };
        }

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
        return {
            user: null,
            error: error instanceof Error ? error : new Error('Unknown error occurred')
        };
    }
}
