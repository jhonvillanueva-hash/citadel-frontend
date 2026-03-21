import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollAnimationService } from './core/services/scroll-animation.service';
import { ToastContainerComponent } from './shared/components/toast/toast-container';
import { ConfirmDialogComponent } from "./shared/components/confirm-dialog/confirm-dialog";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, ConfirmDialogComponent],
  templateUrl: './app.html',
})

export class App implements OnInit, OnDestroy {
  constructor(private scrollAnimationService: ScrollAnimationService) {}

  ngOnInit() {
    this.scrollAnimationService.init();
  }

  ngOnDestroy() {
    this.scrollAnimationService.destroy();
  }
}
