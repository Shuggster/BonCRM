import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { DocumentProcessor } from '@/lib/ai/document-processor';
import { authOptions } from '@/app/(auth)/lib/auth-options';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    }
);

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete document (RLS will ensure user can only delete their own documents)
        const { error: docError } = await supabase
            .from('documents')
            .delete()
            .eq('id', params.id)
            .eq('user_id', session.user.id);

        if (docError) {
            console.error('Error deleting document:', docError);
            return NextResponse.json(
                { error: 'Failed to delete document' },
                { status: 500 }
            );
        }

        // Document chunks will be automatically deleted due to ON DELETE CASCADE

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json(
            { error: 'Failed to delete document' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, content, metadata, teamId, isPrivate } = await req.json();
        const updates: Record<string, any> = {};

        // Only include fields that are provided
        if (title !== undefined) updates.title = title;
        if (content !== undefined) updates.content = content;
        if (metadata !== undefined) updates.metadata = metadata;
        if (teamId !== undefined) updates.team_id = teamId;
        if (isPrivate !== undefined) updates.is_private = isPrivate;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: 'No updates provided' },
                { status: 400 }
            );
        }

        // Update the document
        const { data: document, error: docError } = await supabase
            .from('documents')
            .update(updates)
            .eq('id', params.id)
            .eq('user_id', session.user.id)
            .select()
            .single();

        if (docError) {
            console.error('Error updating document:', docError);
            return NextResponse.json(
                { error: 'Failed to update document' },
                { status: 500 }
            );
        }

        // If content was updated, reprocess the chunks
        if (content !== undefined) {
            // Delete existing chunks
            await supabase
                .from('document_chunks')
                .delete()
                .eq('document_id', params.id);

            // Create new processor
            const processor = new DocumentProcessor({
                userId: session.user.id,
                teamId: document.team_id,
                isPrivate: document.is_private
            });

            // Process new content
            await processor.processDocument(
                document.title,
                content,
                document.metadata,
                document.is_private
            );
        }

        return NextResponse.json({ document });
    } catch (error) {
        console.error('Error updating document:', error);
        return NextResponse.json(
            { error: 'Failed to update document' },
            { status: 500 }
        );
    }
} 