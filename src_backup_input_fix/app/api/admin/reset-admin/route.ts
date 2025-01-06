import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // Check environment variables
        const envVars = {
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'exists' : 'missing',
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'exists' : 'missing',
            NODE_ENV: process.env.NODE_ENV,
        };

        // If missing required vars, return helpful error
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({
                error: 'Missing required environment variables',
                environment: envVars
            }, { status: 500 });
        }

        // Test Supabase connection
        try {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            );

            // Test connection with simple query
            const { data, error: testError } = await supabase
                .from('users')
                .select('count(*)', { count: 'exact' });

            if (testError) {
                return NextResponse.json({
                    error: 'Failed to connect to Supabase',
                    details: testError,
                    environment: envVars
                }, { status: 500 });
            }

            return NextResponse.json({
                message: 'Connection test successful',
                environment: envVars,
                testResult: data
            });

        } catch (dbError) {
            return NextResponse.json({
                error: 'Failed to initialize Supabase client',
                details: dbError,
                environment: envVars
            }, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({
            error: 'Unexpected error',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
