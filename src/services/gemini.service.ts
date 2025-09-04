import { Injectable } from '@angular/core';
import { GoogleGenAI, Chat } from '@google/genai';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat;

  constructor() {
    // IMPORTANT: In a real application, the API key should be handled securely
    // and not exposed in the client-side code. It's assumed to be available
    // via environment variables managed by the deployment platform (e.g., Netlify).
    const apiKey = (process.env as any).API_KEY;
    if (!apiKey) {
      console.error("API_KEY environment variable not set!");
      // Fallback for local development if you create an environment file.
      // throw new Error("API_KEY environment variable not set!");
    }

    this.ai = new GoogleGenAI({ apiKey });

    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'أنت مساعد إبداعي ومفيد اسمك MZ. قدم إجابات واضحة وموجزة وودية.',
      },
    });
  }

  async *sendMessageStream(message: string): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await this.chat.sendMessageStream({ message });
      for await (const chunk of stream) {
        yield chunk.text;
      }
    } catch (error) {
      console.error('Error in sendMessageStream:', error);
      yield 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى.';
    }
  }
}