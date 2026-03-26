import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { AiUserMessageComponent } from '../../components/ai-user-message/ai-user-message';
import { AiService } from '../../../core/services/ai.service';

interface ChatMessage {
  id: number;
  role: 'user' | 'ai';
  text: string;
  status: 'done' | 'thinking';
}

@Component({
  selector: 'app-ai-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, AiUserMessageComponent],
  styles: `
    @keyframes borderFlow {
      0%, 100% { 
        border-color: #c35b64; 
        box-shadow: 0 0 6px #c35b64;
      }
      20% { 
        border-color: #de5fad; 
        box-shadow: 0 0 8px #de5fad;
      }
      40% { 
        border-color: #a95ed1; 
        box-shadow: 0 0 10px #a95ed1;
      }
      60% { 
        border-color: #ff8fa3; 
        box-shadow: 0 0 8px #ff8fa3;
      }
      80% { 
        border-color: #a74ea3; 
        box-shadow: 0 0 6px #a74ea3;
      }
    }

    .animate-borderFlow {
      animation: borderFlow 2.5s linear infinite;
      border-width: 2px;
      border-style: solid;
    }
  `,
  templateUrl: 'ai-chat-widget.html'
})
export class AiChatWidgetComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  private aiService = inject(AiService);

  text: string = '';
  isFocused: boolean = false;
  readonly MAX_LENGTH = 150;
  messages = signal<ChatMessage[]>([]);
  private idCounter = 0;

  get charCount(): number {
    return this.text.length;
  }

  get isNearLimit(): boolean {
    return this.charCount >= this.MAX_LENGTH * 0.65;
  }

  get isAtLimit(): boolean {
    return this.charCount >= this.MAX_LENGTH;
  }

  onInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;

    if (target.value.length > this.MAX_LENGTH) {
      target.value = target.value.slice(0, this.MAX_LENGTH);
      this.text = target.value;
    }

    const maxHeight = 120;
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, maxHeight) + 'px';
  }

  sendMessage() {
    const content = this.text.trim();
    if (!content) return;

    this.messages.update(msgs => [
      ...msgs,
      {
        id: ++this.idCounter,
        role: 'user',
        text: content,
        status: 'done'
      }
    ]);

    this.text = '';

    const textarea = document.getElementById('aiInput');
    if (textarea) textarea.style.height = 'auto';

    const aiId = ++this.idCounter;
    this.messages.update(msgs => [
      ...msgs,
      {
        id: aiId,
        role: 'ai',
        text: '',
        status: 'thinking'
      }
    ]);

    this.aiService.sendPrompt(content).subscribe({
      next: (res) => {
        this.messages.update(msgs =>
          msgs.map(m =>
            m.id === aiId
              ? {
                ...m,
                status: 'done',
                text: res.text ?? 'Sin respuesta'
              }
              : m
          )
        );
      },
      error: () => {
        this.messages.update(msgs =>
          msgs.map(m =>
            m.id === aiId
              ? {
                ...m,
                status: 'done',
                text: 'Error al consultar la IA'
              }
              : m
          )
        );
      }
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (event.ctrlKey || event.shiftKey) {
        return;
      }
      event.preventDefault();
      this.sendMessage();
    }
  }

  icons = {
    faPaperPlane,
  }
}