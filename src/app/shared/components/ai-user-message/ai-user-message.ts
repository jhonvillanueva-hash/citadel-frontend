import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';

export type AiMessageRole = 'user' | 'ai';
export type AiMessageStatus = 'done' | 'thinking';

@Component({
  selector: 'app-ai-user-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-user-message.html',
})
export class AiUserMessageComponent {
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);

  @Input() text: string = '';
  @Input() role: AiMessageRole = 'user';
  @Input() status: AiMessageStatus = 'done';

  sanitizeText(text: string): SafeHtml {
    let html = text
      .replace(
        /\[\[(.*?)\|(.*?)\]\]/g,
        '<a href="$2" class="text-blue-600 underline hover:opacity-80">$1</a>'
      )
      .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>')
      .replace(/\*(.*?)\*/g, '<span class="italic">$1</span>')
      .replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  onMessageClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (target.tagName === 'A') {
      event.preventDefault();

      const href = target.getAttribute('href');
      if (href) {
        this.router.navigateByUrl(href);
      }
    }
  }
}