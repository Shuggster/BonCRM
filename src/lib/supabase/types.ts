import { Database, Json } from '@/types/supabase';

// Base types for timestamps
export interface TimestampFields {
    created_at: string;
    updated_at?: string;
}

// Document types
export interface Document extends TimestampFields {
    id: string;
    title: string;
    content: string;
    metadata: Record<string, any>;
    user_id: string;
    team_id?: string;
    is_private: boolean;
}

export interface DocumentChunk extends TimestampFields {
    id: string;
    document_id: string;
    content: string;
    embedding: number[];
    metadata: Record<string, any>;
    user_id: string;
    team_id?: string;
}

// Search result type from match_documents function
export interface DocumentMatch {
    id: string;
    content: string;
    similarity: number;
    department: string;
    user_id: string;
    team_id?: string;
    metadata?: Record<string, any>;
}

// Database interface extensions
export type Tables = Database['public']['Tables'];
export type Documents = Tables['documents']['Row'];
export type DocumentChunks = Tables['document_chunks']['Row'];

// Function return types
export type MatchDocuments = Database['public']['Functions']['match_documents']['Returns']; 