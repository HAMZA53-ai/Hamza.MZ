import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatSidebarComponent } from './components/chat-sidebar/chat-sidebar.component';
import { ConstellationBackgroundComponent } from './components/constellation-background/constellation-background.component';
import { GeminiService } from './services/gemini.service';

export interface Message {
  role: 'user' | 'model';
  content: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ChatSidebarComponent, ConstellationBackgroundComponent],
})
export class AppComponent {
  messages = signal<Message[]>([]);
  isLoading = signal(false);
  chatInput = signal('');
  
  private geminiService = new GeminiService();

  constructor() {}

  async handleSendMessage(prompt: string): Promise<void> {
    if (!prompt || this.isLoading()) return;

    this.messages.update(current => [...current, { role: 'user', content: prompt }]);
    this.chatInput.set('');
    this.isLoading.set(true);

    this.messages.update(current => [...current, { role: 'model', content: '' }]);

    try {
      const stream = this.geminiService.sendMessageStream(prompt);
      for await (const chunk of stream) {
        this.messages.update(current => {
          const lastMessage = current[current.length - 1];
          lastMessage.content += chunk;
          return [...current.slice(0, -1), lastMessage];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
       this.messages.update(current => {
          const lastMessage = current[current.length - 1];
          lastMessage.content = 'Sorry, I encountered an error. Please try again.';
          return [...current.slice(0, -1), lastMessage];
        });
    } finally {
      this.isLoading.set(false);
    }
  }

  submitOnEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSendMessage(this.chatInput());
    }
  }

  selectSuggestion(suggestion: string): void {
    this.chatInput.set(suggestion);
    this.handleSendMessage(suggestion);
  }
}
