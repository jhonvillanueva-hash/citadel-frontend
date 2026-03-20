import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';
import { ToastMessage } from './toast.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark, faTriangleExclamation, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
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
          bg: 'bg-red-800',
          icon: this.icons.faXmark
        };
      case 'warning':
        return {
          bg: 'bg-yellow-700',
          icon: this.icons.faTriangleExclamation
        };
      case 'success':
        return {
          bg: 'bg-green-800',
          icon: this.icons.faCircleCheck
        };
    }
  }

  icons = {
    faXmark,
    faTriangleExclamation,
    faCircleCheck
  }
}
