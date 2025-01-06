import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { DocumentProcessor } from '@/lib/ai/document-processor';
import { authOptions } from '@/app/(auth)/lib/auth-options';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, content, metadata, teamId, isPrivate } = await req.json();

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        const processor = new DocumentProcessor({
            userId: session.user.id,
            teamId,
            isPrivate
        });

        const document = await processor.processDocument(title, content, metadata, isPrivate);

        return NextResponse.json({ document });
    } catch (error) {
        console.error('Error processing document:', error);
        return NextResponse.json(
            { error: 'Failed to process document' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = req.nextUrl.searchParams;
        const query = searchParams.get('query');
        const teamId = searchParams.get('teamId');

        const processor = new DocumentProcessor({
            userId: session.user.id,
            teamId: teamId || undefined
        });

        if (query) {
            // Search documents
            const matches = await processor.searchSimilarDocuments(
                query,
                parseFloat(searchParams.get('threshold') || '0.7'),
                parseInt(searchParams.get('limit') || '5')
            );
            return NextResponse.json({ matches });
        } else if (teamId) {
            // Get team documents
            const documents = await processor.getTeamDocuments(teamId);
            return NextResponse.json({ documents });
        } else {
            // Get user documents
            const documents = await processor.getUserDocuments();
            return NextResponse.json({ documents });
        }
    } catch (error) {
        console.error('Error retrieving documents:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve documents' },
            { status: 500 }
        );
    }
} 