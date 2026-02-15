import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';
import { ToastMessage } from './toast.model';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.html'
})
export class ToastContainerComponent {

  private toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  expanded = signal<string | null>(null);

  toggle(id: string) {
    this.expanded.update(current => current === id ? null : id);
  }

  close(id: string) {
    this.toastService.remove(id);
  }

  getStyles(toast: ToastMessage) {
    switch (toast.type) {
      case 'error':
        return {
          bg: 'bg-red-600',
          icon: 'bi-x-circle-fill'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          icon: 'bi-exclamation-triangle-fill'
        };
      case 'success':
        return {
          bg: 'bg-green-600',
          icon: 'bi-check-circle-fill'
        };
    }
  }
}
