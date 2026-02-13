export type ToastType = 'error' | 'warning' | 'success';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  stack?: string;
  createdAt: number;
}
