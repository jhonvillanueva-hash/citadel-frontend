import { Injectable, signal } from '@angular/core';
import { ToastMessage, ToastType } from './toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {

  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private readonly duration = 5000;

  show(
    type: ToastType,
    title: string,
    message?: string,
    stack?: string
  ) {
    const toast: ToastMessage = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      stack,
      createdAt: Date.now()
    };

    this._toasts.update(list => [...list, toast]);

    setTimeout(() => {
      this.remove(toast.id);
    }, this.duration);
  }

  showError(title: string, error?: any) {
    this.show(
      'error',
      title,
      error?.message ?? 'Ocurrió un error inesperado',
      error?.stack
    );
  }

  showWarning(title: string, message?: string) {
    this.show('warning', title, message);
  }

  showSuccess(title: string, message?: string) {
    this.show('success', title, message);
  }

  remove(id: string) {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}
