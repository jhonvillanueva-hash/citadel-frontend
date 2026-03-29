import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export type AiMessageRole = 'user' | 'ai';
export type AiMessageStatus = 'done' | 'thinking';

@Component({
  selector: 'app-ai-user-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-user-message.html',
})
export class AiUserMessageComponent {
  constructor(private sanitizer: DomSanitizer) { }

  @Input() text: string = '';
  @Input() role: AiMessageRole = 'user';
  @Input() status: AiMessageStatus = 'done';

  sanitizeText(text: string): SafeHtml {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>')
      .replace(/\*(.*?)\*/g, '<span class="italic">$1</span>')
      .replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}