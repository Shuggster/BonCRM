import { Configuration, OpenAIApi } from 'openai';
import { ShugBotMessage, ShugBotContext } from './types';

export class AIService {
  private openai: OpenAIApi;
  
  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async generateResponse(
    message: string,
    context: ShugBotContext,
    documents?: any[]
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(context, documents);
      
      const completion = await this.openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.data.choices[0].message?.content || 
        "I apologize, I couldn't generate a response.";
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
} 