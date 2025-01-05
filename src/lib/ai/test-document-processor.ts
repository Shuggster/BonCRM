import { DocumentProcessor } from './document-processor';
import { DocumentMatch } from '../supabase/types';

async function testDocumentProcessor() {
    console.log('🚀 Starting document processor test...\n');
    
    const processor = new DocumentProcessor();
    const testDocument = {
        title: 'Test Document',
        content: `
            Customer Relationship Management (CRM) is essential for modern businesses.
            It helps track customer interactions, manage sales pipelines, and improve customer service.
            A good CRM system can increase efficiency, boost sales, and enhance customer satisfaction.
            Modern CRM systems often include AI features for better insights and automation.
        `.trim(),
        metadata: {
            category: 'CRM',
            tags: ['test', 'documentation']
        }
    };

    try {
        console.log('1️⃣ Processing test document...');
        const document = await processor.processDocument(
            testDocument.title,
            testDocument.content,
            testDocument.metadata
        );
        console.log('✅ Document processed successfully:', document.id);

        console.log('\n2️⃣ Testing similarity search...');
        const searchQuery = 'How does CRM help with customer service?';
        console.log('Query:', searchQuery);
        
        const matches = await processor.searchSimilarDocuments(searchQuery);
        console.log('\nMatches found:');
        matches.forEach((match: DocumentMatch, index: number) => {
            console.log(`\nMatch ${index + 1} (Similarity: ${(match.similarity * 100).toFixed(2)}%):`);
            console.log(match.content);
        });

        console.log('\n✨ All tests completed successfully!');
    } catch (error) {
        console.error('\n❌ Test failed:', error);
    }
}

testDocumentProcessor(); 