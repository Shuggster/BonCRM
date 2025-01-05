import fetch from 'node-fetch';
import { config } from 'dotenv';
import { createClient, PostgrestError } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import path from 'path';

// Make fetch available globally
(global as any).fetch = fetch;

// Load test environment variables
config({
    path: path.resolve(process.cwd(), '.env.test')
});

// Verify required environment variables
const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GROQ_API_KEY',
    'DEEPSEEK_API_KEY',
    'GEMINI_API_KEY'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

// Server-side Supabase client with service role
const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        },
        db: {
            schema: 'public'
        }
    }
);

interface TestData {
    user: {
        id: string;
        email: string;
        role: 'admin' | 'manager' | 'operational';
        department: 'management' | 'sales' | 'accounts' | 'trade_shop';
        name: string;
    };
    team: {
        id: string;
        name: string;
        department: string;
    };
}

// Test data constants
const TEST_USER_ID = '0233b606-d5af-4bcf-9adf-0980d0dc434a';
const TEST_TEAM_ID = '9db18aee-4989-420e-9002-28c174ec2c3d';

export async function setupTestData(): Promise<TestData> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create test user
    const { data: user, error: userError } = await supabase
        .from('users')
        .upsert({
            id: TEST_USER_ID,
            email: 'hugh@bonnymans.co.uk',
            name: 'Hugh Bonnyman',
            password_hash: '$2b$10$dummyHashForTesting',
            created_at: new Date().toISOString()
        })
        .select()
        .single();

    if (userError) {
        console.error('Error creating test user:', userError);
        throw userError;
    }

    // Create test team
    const { data: team, error: teamError } = await supabase
        .from('teams')
        .upsert({
            id: TEST_TEAM_ID,
            name: 'Sales and Marketing',
            department: 'sales',
            created_at: new Date().toISOString()
        })
        .select()
        .single();

    if (teamError) {
        console.error('Error creating test team:', teamError);
        throw teamError;
    }

    // Add user to team
    const { error: teamMemberError } = await supabase
        .from('team_members')
        .upsert({
            user_id: TEST_USER_ID,
            team_id: TEST_TEAM_ID,
            role: 'member'
        });

    if (teamMemberError) {
        console.error('Error adding user to team:', teamMemberError);
        throw teamMemberError;
    }

    return {
        user: {
            id: TEST_USER_ID,
            email: 'hugh@bonnymans.co.uk',
            name: 'Hugh Bonnyman',
            role: 'admin',
            department: 'management'
        },
        team: {
            id: TEST_TEAM_ID,
            name: 'Sales and Marketing',
            department: 'sales'
        }
    };
}

export async function cleanupTestData(): Promise<void> {
    try {
        // Clean up test documents and chunks
        const { data: docs } = await supabase
            .from('documents')
            .select('id')
            .eq('user_id', TEST_USER_ID);

        if (docs && docs.length > 0) {
            const docIds = docs.map(d => d.id);
            
            // Delete chunks first (foreign key constraint)
            await supabase
                .from('document_chunks')
                .delete()
                .in('document_id', docIds);

            // Then delete documents
            await supabase
                .from('documents')
                .delete()
                .in('id', docIds);
        }

        // Clean up test user and team
        await supabase
            .from('team_members')
            .delete()
            .eq('user_id', TEST_USER_ID);

        await supabase
            .from('users')
            .delete()
            .eq('id', TEST_USER_ID);

        await supabase
            .from('teams')
            .delete()
            .eq('id', TEST_TEAM_ID);

        console.log('Test data cleanup complete');
    } catch (error) {
        const pgError = error as PostgrestError;
        console.error('Error cleaning up test data:', pgError);
        throw error;
    }
} 