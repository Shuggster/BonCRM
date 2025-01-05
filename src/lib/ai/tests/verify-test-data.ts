import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({
    path: path.resolve(process.cwd(), '.env.local'),
});

async function verifyTestSetup() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('🔍 Verifying database setup...\n');

    // Check users table
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');
    
    console.log('Users table:', usersError ? '❌ Error' : '✅ OK');
    console.log(`Total users: ${users?.length || 0}`);
    if (usersError) console.error(usersError);

    // Check teams table
    const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*');
    
    console.log('\nTeams table:', teamsError ? '❌ Error' : '✅ OK');
    console.log(`Total teams: ${teams?.length || 0}`);
    if (teamsError) console.error(teamsError);

    // Check documents table
    const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('*');
    
    console.log('\nDocuments table:', documentsError ? '❌ Error' : '✅ OK');
    console.log(`Total documents: ${documents?.length || 0}`);
    if (documentsError) console.error(documentsError);

    // Check document_chunks table
    const { data: chunks, error: chunksError } = await supabase
        .from('document_chunks')
        .select('*');
    
    console.log('\nDocument chunks table:', chunksError ? '❌ Error' : '✅ OK');
    console.log(`Total chunks: ${chunks?.length || 0}`);
    if (chunksError) console.error(chunksError);

    // Test match_documents function
    const { data: matches, error: matchError } = await supabase
        .rpc('match_documents', {
            query_embedding: Array(1536).fill(0),
            match_threshold: 0.5,
            match_count: 5,
            current_user_id: 'test-user-id'
        });
    
    console.log('\nmatch_documents function:', matchError ? '❌ Error' : '✅ OK');
    if (matchError) console.error(matchError);

    console.log('\n✨ Verification complete');
    process.exit(0);
}

verifyTestSetup().catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
}); 