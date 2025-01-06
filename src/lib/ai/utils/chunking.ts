import { RateLimitError } from './errors';

export interface ChunkMetadata {
    userId: string;
    [key: string]: any;
}

export interface Chunk {
    content: string;
    metadata: ChunkMetadata;
}

export interface ProcessingOptions {
    onProgress?: (progress: number) => void;
    signal?: AbortSignal;
}

const DEFAULT_CHUNK_SIZE = 2000;
const DEFAULT_CHUNK_OVERLAP = 200;

export async function generateChunks(
    text: string,
    userId: string,
    metadata: Record<string, any> = {}
): Promise<Chunk[]> {
    if (!text || text.trim().length === 0) {
        throw new Error('Empty document');
    }

    const chunks: Chunk[] = [];
    const words = text.split(' ');
    let currentChunk = '';
    let currentWordCount = 0;

    for (let i = 0; i < words.length; i++) {
        currentChunk += words[i] + ' ';
        currentWordCount++;

        if (currentWordCount >= DEFAULT_CHUNK_SIZE || i === words.length - 1) {
            chunks.push({
                content: currentChunk.trim(),
                metadata: {
                    userId,
                    ...metadata
                }
            });

            // Start next chunk with overlap
            const overlapWords = words.slice(
                Math.max(i - DEFAULT_CHUNK_OVERLAP, 0),
                i + 1
            );
            currentChunk = overlapWords.join(' ') + ' ';
            currentWordCount = overlapWords.length;
        }
    }

    return chunks;
}

export async function processDocuments(
    documents: string[],
    userId: string,
    options: ProcessingOptions = {}
): Promise<Chunk[][]> {
    const { onProgress, signal } = options;
    const results: Chunk[][] = [];
    let processedCount = 0;

    for (const document of documents) {
        if (signal?.aborted) {
            throw new Error('Aborted');
        }

        try {
            const chunks = await generateChunks(document, userId);
            results.push(chunks);
            processedCount++;

            if (onProgress) {
                onProgress(processedCount);
            }

            // Add a small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            if (error instanceof RateLimitError) {
                throw error;
            }
            // Log other errors but continue processing
            console.error('Error processing document:', error);
            results.push([]);
        }
    }

    return results;
} 