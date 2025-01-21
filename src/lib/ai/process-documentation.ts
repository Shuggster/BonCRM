import { DocumentProcessor } from './document-processor';
import fs from 'fs/promises';
import path from 'path';

async function processDocumentation() {
    console.log('🚀 Starting documentation processing...\n');
    
    const processor = new DocumentProcessor({
        userId: process.env.ADMIN_USER_ID!, // We'll need to set this
        isPrivate: false
    });

    const docsPath = path.join(process.cwd(), 'Documentation', 'user-manual');
    const files = [
        'GETTING_STARTED.md',
        'CONTACT_MANAGEMENT.md',
        'DASHBOARD_ANALYTICS.md',
        'AI_TOOLS.md',
        'ADMIN_FEATURES.md',
        'IMPORT_EXPORT.md',
        'API_DOCS.md'
    ];

    try {
        for (const file of files) {
            console.log(`\n1️⃣ Processing ${file}...`);
            const content = await fs.readFile(path.join(docsPath, file), 'utf-8');
            
            const document = await processor.processDocument(
                file.replace('.md', '').replace(/_/g, ' '),
                content,
                {
                    type: 'documentation',
                    category: 'user-manual',
                    fileName: file,
                    filePath: `Documentation/user-manual/${file}`
                }
            );
            
            console.log(`✅ Document processed successfully: ${document.id}`);
        }

        console.log('\n✨ All documentation processed successfully!');
    } catch (error) {
        console.error('\n❌ Processing failed:', error);
    }
}

// Only run if called directly
if (require.main === module) {
    processDocumentation();
} 