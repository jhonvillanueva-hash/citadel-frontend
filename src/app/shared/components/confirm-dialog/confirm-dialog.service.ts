import { Injectable } from '@angular/core';
import { ConfirmDialogComponent } from './confirm-dialog';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private dialog!: ConfirmDialogComponent;

  register(dialog: ConfirmDialogComponent) {
    this.dialog = dialog;
  }

  confirm(message: string): Promise<boolean> {
    return this.dialog.open(message);
  }
}
