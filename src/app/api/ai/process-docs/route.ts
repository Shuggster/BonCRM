import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/(auth)/lib/auth-options';
import fs from 'fs/promises';
import path from 'path';

async function generateEmbedding(text: string, apiKey: string) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'models/embedding-001',
                content: { parts: [{ text }] }
            })
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Embedding API Error:', errorText);
        throw new Error(`Embedding API error: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding.values;
}

export async function POST(req: NextRequest) {
    let supabase;
    let session;
    let originalError: any = null;

    try {
        console.log('1. Starting documentation processing...');

        // Use NextAuth session for authentication
        session = await getServerSession(authOptions);
        console.log('2. Got session:', {
            exists: !!session,
            hasUser: !!session?.user,
            userRole: session?.user?.role
        });

        if (!session?.user) {
            console.error('3. No session found. Session data:', session);
            return NextResponse.json({ error: 'Unauthorized', details: 'No session found' }, { status: 401 });
        }

        // Check admin role
        if (session.user.role !== 'admin') {
            console.error('4. User role not admin:', session.user.role);
            return NextResponse.json({ 
                error: 'Unauthorized - Admin access required',
                details: `User role is ${session.user.role}`
            }, { status: 403 });
        }
        console.log('5. Admin role validated');

        if (!process.env.GEMINI_API_KEY) {
            console.error('6. GEMINI_API_KEY not found');
            return NextResponse.json({ 
                error: 'Configuration error',
                details: 'GEMINI_API_KEY is not configured'
            }, { status: 500 });
        }
        console.log('7. GEMINI_API_KEY exists');

        // Initialize Supabase client with service role key for better access
        try {
            console.log('8. Initializing Supabase client...');
            supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key
                {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false
                    }
                }
            );
            console.log('9. Supabase client initialized');

            // Test connection
            const { data: testData, error: testError } = await supabase
                .from('documents')
                .select('count')
                .limit(1);

            if (testError) {
                console.error('10. Supabase connection test failed:', testError);
                throw testError;
            }
            console.log('11. Supabase connection test successful');
        } catch (dbError) {
            console.error('12. Database error:', dbError);
            return NextResponse.json({ 
                error: 'Database connection error',
                details: dbError instanceof Error ? dbError.message : 'Unknown database error',
                dbError
            }, { status: 500 });
        }

        // Test Gemini API
        try {
            console.log('13. Testing Gemini API...');
            const testEmbedding = await generateEmbedding('test', process.env.GEMINI_API_KEY);
            if (!testEmbedding) {
                console.error('14. No embedding returned from test');
                throw new Error('Failed to generate test embedding');
            }
            console.log('15. Gemini API test successful');
        } catch (apiError) {
            console.error('16. Gemini API test failed:', apiError);
            return NextResponse.json({ 
                error: 'API test failed',
                details: apiError instanceof Error ? apiError.message : 'Unknown API error',
                apiError
            }, { status: 500 });
        }

        // First, get all existing documentation document IDs
        const { data: existingDocs, error: queryError } = await supabase
            .from('documents')
            .select('id')
            .eq('metadata->>type', 'documentation');

        if (queryError) {
            console.error('Error querying existing documents:', queryError);
            throw queryError;
        }

        if (existingDocs && existingDocs.length > 0) {
            console.log(`Found ${existingDocs.length} existing documents to clean up`);
            
            // Delete associated chunks first
            const { error: chunksDeleteError } = await supabase
                .from('document_chunks')
                .delete()
                .in('document_id', existingDocs.map((doc: { id: string }) => doc.id));

            if (chunksDeleteError) {
                console.error('Error deleting existing chunks:', chunksDeleteError);
                throw chunksDeleteError;
            }
            console.log('Deleted existing chunks');

            // Then delete the documents
            const { error: docsDeleteError } = await supabase
                .from('documents')
                .delete()
                .in('id', existingDocs.map((doc: { id: string }) => doc.id));

            if (docsDeleteError) {
                console.error('Error deleting existing documents:', docsDeleteError);
                throw docsDeleteError;
            }
            console.log('Deleted existing documents');
        }

        const docsPath = path.join(process.cwd(), 'Documentation', 'user-manual');
        console.log('Documentation path:', docsPath);
        
        // Check if directory exists
        try {
            await fs.access(docsPath);
            console.log('Documentation directory exists');
        } catch (error) {
            console.error('Documentation directory not found:', docsPath);
            return NextResponse.json({ 
                error: 'Documentation directory not found',
                path: docsPath
            }, { status: 404 });
        }

        const files = [
            'GETTING_STARTED.md',
            'CONTACT_MANAGEMENT.md',
            'DASHBOARD_ANALYTICS.md',
            'AI_TOOLS.md',
            'ADMIN_FEATURES.md',
            'IMPORT_EXPORT.md',
            'API_DOCS.md'
        ];

        const results = [];
        for (const file of files) {
            console.log(`Processing file: ${file}`);
            const filePath = path.join(docsPath, file);
            
            // Check if file exists
            try {
                await fs.access(filePath);
                console.log(`File exists: ${file}`);
            } catch (error) {
                console.error(`File not found: ${filePath}`);
                results.push({
                    file,
                    status: 'error',
                    error: 'File not found'
                });
                continue;
            }

            try {
                const content = await fs.readFile(filePath, 'utf-8');
                console.log(`Read file content: ${file} (${content.length} bytes)`);
                
                // Insert document
                const { data: document, error: docError } = await supabase
                    .from('documents')
                    .insert({
                        title: file.replace('.md', '').replace(/_/g, ' '),
                        content: content,
                        metadata: {
                            type: "documentation",
                            category: "user-manual",
                            fileName: file,
                            filePath: `Documentation/user-manual/${file}`
                        },
                        user_id: session.user.id,
                        is_private: false
                    })
                    .select()
                    .single();

                if (docError) {
                    console.error(`Error inserting document ${file}:`, docError);
                    throw docError;
                }
                console.log(`Document inserted: ${file}`);
                
                if (!document) throw new Error('Failed to create document');
                
                // Split content into chunks (using a simple paragraph split for now)
                const chunks = content.split('\n\n').filter(chunk => chunk.trim().length > 0);
                console.log(`Split into ${chunks.length} chunks`);
                let processedChunks = 0;
                
                // Process each chunk with embedding
                for (const chunk of chunks) {
                    try {
                        console.log(`Processing chunk ${processedChunks + 1}/${chunks.length}`);
                        // Generate embedding using Gemini
                        const embedding = await generateEmbedding(chunk, process.env.GEMINI_API_KEY);
                        console.log('Generated embedding');
                        
                        // Store chunk with embedding
                        const { error: chunkError } = await supabase
                            .from('document_chunks')
                            .insert({
                                document_id: document.id,
                                content: chunk,
                                embedding: embedding,
                                metadata: {
                                    ...document.metadata,
                                    chunk_index: processedChunks
                                },
                                user_id: session.user.id
                            });

                        if (chunkError) {
                            console.error(`Error inserting chunk for ${file}:`, chunkError);
                            console.error('Chunk details:', {
                                documentId: document.id,
                                contentLength: chunk.length,
                                embeddingLength: embedding.length,
                                metadata: document.metadata
                            });
                            throw chunkError;
                        }
                        processedChunks++;
                        console.log(`Chunk ${processedChunks} stored with embedding length:`, embedding.length);
                    } catch (error) {
                        console.error(`Error processing chunk in ${file}:`, error);
                        throw error;
                    }
                }
                
                results.push({
                    file,
                    documentId: document.id,
                    status: 'success',
                    chunks: processedChunks
                });
                console.log(`Completed processing ${file}`);
            } catch (error) {
                console.error(`Error processing file ${file}:`, error);
                results.push({
                    file,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return NextResponse.json({ 
            message: 'Documentation processing completed',
            results 
        });
    } catch (error) {
        console.error('Final error:', {
            error,
            type: error?.constructor?.name,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });

        return NextResponse.json(
            { 
                error: 'Failed to process documentation',
                details: error instanceof Error ? error.message : 'Unknown error',
                errorObject: error instanceof Error ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                    cause: error.cause
                } : error,
                session: session ? {
                    hasUser: !!session.user,
                    userRole: session.user?.role
                } : null
            },
            { status: 500 }
        );
    }
} 