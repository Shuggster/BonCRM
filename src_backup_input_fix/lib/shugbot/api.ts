import { createClient } from '@supabase/supabase-js';
import { ShugBotMessage, ShugBotContext } from './types';
import { AIService } from './ai-service';

export class ShugBotAPI {
  private supabase;
  private aiService: AIService;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.aiService = new AIService();
  }

  async processMessage(
    message: string, 
    context: ShugBotContext
  ): Promise<ShugBotMessage> {
    try {
      // Search relevant documentation
      const docs = await this.searchDocumentation(message);
      
      // Generate AI response
      const response = await this.aiService.generateResponse(
        message,
        context,
        docs
      );

      // Log interaction
      await this.logInteraction({
        message,
        response,
        context,
        documents: docs
      });

      return {
        id: crypto.randomUUID(),
        content: response,
        sender: 'bot',
        timestamp: new Date(),
        metadata: {
          documentRefs: docs.map(d => d.id),
          confidence: 0.8, // TODO: Implement confidence scoring
          category: 'general' // TODO: Implement category detection
        }
      };
    } catch (error) {
      console.error('ShugBot Error:', error);
      return {
        id: crypto.randomUUID(),
        content: "I apologize, I'm having trouble processing your request.",
        sender: 'bot',
        timestamp: new Date()
      };
    }
  }

  private async logInteraction(data: {
    message: string;
    response: string;
    context: ShugBotContext;
    documents: any[];
  }) {
    await this.supabase
      .from('shugbot_interactions')
      .insert({
        user_message: data.message,
        bot_response: data.response,
        context: data.context,
        referenced_docs: data.documents.map(d => d.id),
        timestamp: new Date()
      });
  }

  async searchDocumentation(query: string): Promise<any[]> {
    // Will implement full text search later
    const { data, error } = await this.supabase
      .from('documentation')
      .select()
      .textSearch('content', query);

    if (error) throw error;
    return data;
  }
} 