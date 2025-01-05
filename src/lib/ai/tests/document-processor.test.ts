import { DocumentProcessor } from '../document-processor';
import { setupTestData, cleanupTestData } from './setup';
import { DocumentMatch } from '@/lib/supabase/types';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

describe('Document Processor', () => {
    let processor: DocumentProcessor;
    let testUser: { id: string };
    let testTeam: { id: string };

    beforeAll(async () => {
        const testData = await setupTestData();
        testUser = testData.user;
        testTeam = testData.team;
    });

    afterAll(async () => {
        await cleanupTestData();
    });

    beforeEach(() => {
        processor = new DocumentProcessor(
            {
                userId: testUser.id,
                teamId: testTeam.id
            },
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                groq: { apiKey: process.env.GROQ_API_KEY! },
                deepseek: { apiKey: process.env.DEEPSEEK_API_KEY! },
                gemini: { apiKey: process.env.GEMINI_API_KEY! }
            }
        );
    });

    it('should process and store a document', async () => {
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
    });

    it('should search for similar documents', async () => {
        const query = 'test document chunks';
        const matches = await processor.searchSimilarDocuments(query, testUser.id);

        expect(Array.isArray(matches)).toBe(true);
        if (matches.length > 0) {
            const match = matches[0] as DocumentMatch;
            expect(match).toHaveProperty('id');
            expect(match).toHaveProperty('content');
            expect(match).toHaveProperty('similarity');
            expect(match).toHaveProperty('metadata');
            expect(typeof match.metadata).toBe('object');
        }
    });
}); 