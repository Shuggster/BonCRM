import { DocumentProcessor } from '../document-processor';
import { setupTestData, cleanupTestData } from './setup';
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import { Session } from 'next-auth';

// Mock NextAuth session with custom user data
const mockSession = {
    user: {
        id: '',  // Will be set in beforeEach
        email: 'hugh@bonnymans.co.uk',
        name: 'Hugh Bonnyman',
        role: 'admin',
        department: 'management',
        is_active: true
    }
};

// Mock auth options
jest.mock('@/lib/auth/auth-options', () => ({
    authOptions: {
        providers: [],
        callbacks: {
            session: ({ session }: { session: Session }) => session
        }
    }
}));

// Mock NextAuth
jest.mock('next-auth', () => ({
    getServerSession: jest.fn(async () => mockSession)
}));

describe('Document System', () => {
    let processor: DocumentProcessor;
    let testUser: { id: string };
    let testTeam: { id: string };
    let supabase: ReturnType<typeof createClient>;

    beforeAll(async () => {
        const testData = await setupTestData();
        testUser = testData.user;
        testTeam = testData.team;

        // Initialize server-side Supabase client with service role key
        supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: { persistSession: false }
            }
        );

        // Ensure test user exists in users table
        const { data: existingUser } = await supabase
            .from('users')
            .select()
            .eq('email', mockSession.user.email)
            .single();

        if (!existingUser) {
            await supabase
                .from('users')
                .insert({
                    id: testUser.id,
                    email: mockSession.user.email,
                    name: mockSession.user.name,
                    role: mockSession.user.role,
                    department: mockSession.user.department,
                    is_active: true,
                    password_hash: '$2b$10$dummyHashForTesting' // Dummy hash for testing
                });
        }
    });

    afterAll(async () => {
        // Clean up test user
        await supabase
            .from('users')
            .delete()
            .eq('email', mockSession.user.email);
            
        await cleanupTestData();
    });

    describe('Document Processing', () => {
        beforeEach(() => {
            // Update mock session with current test user
            mockSession.user.id = testUser.id;
            mockSession.user.role = 'admin';

            processor = new DocumentProcessor(
                {
                    userId: testUser.id,
                    teamId: testTeam.id
                },
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                {
                    groq: { apiKey: process.env.GROQ_API_KEY! },
                    deepseek: { apiKey: process.env.DEEPSEEK_API_KEY! },
                    gemini: { apiKey: process.env.GEMINI_API_KEY! }
                }
            );
        });

        it('should process and store a document with proper authorization', async () => {
            const testDoc = {
                title: 'Test Document',
                content: 'This is a test document that will be split into chunks.',
                metadata: { category: 'test', tags: ['test', 'document'] }
            };

            const document = await processor.processDocument(
                testDoc.title,
                testDoc.content,
                testUser.id,
                testTeam.id,
                testDoc.metadata
            );

            expect(document).toBeDefined();
            expect(document.id).toBeDefined();

            // Verify document was stored with correct permissions
            const { data: storedDoc } = await supabase
                .from('documents')
                .select('*')
                .eq('id', document.id)
                .single();

            expect(storedDoc).toBeDefined();
            expect(storedDoc?.user_id).toBe(testUser.id);
            expect(storedDoc?.team_id).toBe(testTeam.id);

            // Verify chunks were stored
            const { data: chunks } = await supabase
                .from('document_chunks')
                .select('*')
                .eq('document_id', document.id);

            expect(chunks).toBeDefined();
            expect(chunks!.length).toBeGreaterThan(0);
            expect(chunks![0].embedding).toBeDefined();
        });

        it('should retrieve user documents respecting department access', async () => {
            const docs = await processor.getUserDocuments(testUser.id);
            expect(Array.isArray(docs)).toBe(true);

            // Verify documents are from user's department
            docs.forEach(doc => {
                expect(doc.department).toBe('management');
            });
        });

        it('should search for similar documents with role-based access', async () => {
            // Create a test document first
            const testDoc = {
                title: 'Test Search Document',
                content: 'This is a test document specifically for searching. It contains unique content that we can search for.',
                metadata: { category: 'test', tags: ['test', 'search'] }
            };

            // Process and store the document
            const document = await processor.processDocument(
                testDoc.title,
                testDoc.content,
                testUser.id,
                testTeam.id,
                testDoc.metadata
            );

            // Verify chunks were stored with embeddings
            const { data: chunks } = await supabase
                .from('document_chunks')
                .select('*')
                .eq('document_id', document.id);

            expect(chunks).toBeDefined();
            expect(chunks!.length).toBeGreaterThan(0);
            expect(chunks![0].embedding).toBeDefined();

            // Wait a moment for embeddings to be stored
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Search with part of the content
            const query = 'test document searching';
            const matches = await processor.searchSimilarDocuments(query, testUser.id, {
                threshold: 0.5,  // Lower threshold for testing
                limit: 5
            });

            expect(Array.isArray(matches)).toBe(true);
            expect(matches.length).toBeGreaterThan(0);
            
            if (matches.length > 0) {
                expect(matches[0]).toHaveProperty('id');
                expect(matches[0]).toHaveProperty('content');
                expect(matches[0]).toHaveProperty('similarity');
                // Verify access control
                expect(matches[0].department).toBe('management');
            }
        });
    });
}); 