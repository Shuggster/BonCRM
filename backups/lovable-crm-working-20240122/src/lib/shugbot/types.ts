export interface ShugBotMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  metadata?: {
    documentRefs?: string[];
    confidence?: number;
    category?: string;
  };
}

export interface ShugBotContext {
  currentPage?: string;
  userRole?: string;
  recentSearches?: string[];
  previousInteractions?: ShugBotMessage[];
} 