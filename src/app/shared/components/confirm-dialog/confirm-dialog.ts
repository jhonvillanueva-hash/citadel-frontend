import { Component, OnInit } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  imports: [FontAwesomeModule]
})
export class ConfirmDialogComponent implements OnInit {
  visible = false;
  message = '¿Estás seguro?';

  private resolve!: (value: boolean) => void;

  constructor(private confirmDialogService: ConfirmDialogService) {}

  ngOnInit() {
    this.confirmDialogService.register(this);
  }

  open(message: string): Promise<boolean> {
    this.message = message;
    this.visible = true;

    return new Promise<boolean>((res) => {
      this.resolve = res;
    });
  }

  confirm() {
    this.visible = false;
    this.resolve(true);
  }

  cancel() {
    this.visible = false;
    this.resolve(false);
  }

  icons = {
    faQuestionCircle
  }
}