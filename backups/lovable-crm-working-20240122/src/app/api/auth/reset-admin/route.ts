import { createOrUpdateUser } from '@/app/(auth)/lib/create-user';
import { NextResponse } from 'next/server';
import { supabase } from '@/app/(auth)/lib/supabase';

export async function GET() {
    try {
        // First, let's test the Supabase connection
        console.log('Testing Supabase connection...');
        const { data: testData, error: testError } = await supabase
            .from('users')
            .select('count')
            .single();

        if (testError) {
            console.error('Supabase connection test failed:', testError);
            return NextResponse.json({
                success: false,
                message: 'Database connection failed',
                error: testError
            }, { status: 500 });
        }

        console.log('Supabase connection successful');
        
        // Now try to create/update the user
        console.log('Attempting to create/update admin user...');
        const result = await createOrUpdateUser('admin@test.com', 'test123456', 'admin');
        
        if (!result.success) {
            console.error('Failed to create/update user:', result);
            return NextResponse.json(result, { status: 500 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Reset admin error:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            error: error instanceof Error ? error.stack : 'No stack trace available'
        }, { status: 500 });
    }
}
