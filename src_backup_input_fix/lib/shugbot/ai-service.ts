import { providerFactory } from '../ai/provider-factory';
import { AIProvider, ChatMessage } from '../ai/providers/base';
import { ShugBotContext } from './types';

export class AIService {
    private provider: AIProvider | null = null;

    constructor() {
        this.initializeProvider();
    }

    private async initializeProvider() {
        try {
            this.provider = await providerFactory.getAvailableProvider({
                apiKey: process.env.NEXT_PUBLIC_AI_API_KEY!,
                isTest: process.env.NODE_ENV === 'test'
            });
        } catch (error) {
            console.error('Failed to initialize AI provider:', error);
        }
    }

    async generateResponse(
        message: string,
        context: ShugBotContext,
        documents?: any[]
    ): Promise<string> {
        try {
            if (!this.provider) {
                await this.initializeProvider();
                if (!this.provider) {
                    throw new Error('No AI provider available');
                }
            }

            const systemPrompt = this.buildSystemPrompt(context, documents);
            const messages: ChatMessage[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ];

            const response = await this.provider.chat(messages);
            return response.content;
        } catch (error) {
            console.error('AI Service Error:', error);
            return "I'm having trouble processing your request right now.";
        }
    }

    private buildSystemPrompt(
        context: ShugBotContext,
        documents?: any[]
    ): string {
        let prompt = `You are ShugBot, a helpful AI assistant for the Bonnymans CRM system. 
        Current context: User is on ${context.currentPage} page.
        Role: ${context.userRole || 'User'}.\n\n`;

        if (documents?.length) {
            prompt += "Relevant documentation:\n";
            documents.forEach(doc => {
                prompt += `${doc.title}: ${doc.content}\n`;
            });
        }

        prompt += `\nRespond in a helpful, professional manner. 
        If referencing documentation, cite the source.
        If unsure, admit uncertainty and offer to escalate to human support.`;

        return prompt;
    }

    async *streamResponse(
        message: string,
        context: ShugBotContext,
        documents?: any[]
    ): AsyncGenerator<string> {
        try {
            if (!this.provider) {
                await this.initializeProvider();
                if (!this.provider) {
                    throw new Error('No AI provider available');
                }
            }

            const systemPrompt = this.buildSystemPrompt(context, documents);
            const messages: ChatMessage[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ];

            for await (const chunk of this.provider.chatStream(messages)) {
                yield chunk;
            }
        } catch (error) {
            console.error('AI Service Streaming Error:', error);
            yield "I'm having trouble processing your request right now.";
        }
    }
} 