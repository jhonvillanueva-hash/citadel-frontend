import { Component, signal, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Landing } from "./pages/landing/landing";
import { ScrollAnimationService } from './services/scroll-animation.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App implements OnInit, OnDestroy {
  constructor(private scrollAnimationService: ScrollAnimationService) {}

  ngOnInit() {
    // Inicializar el servicio de animaciones al scroll
    this.scrollAnimationService.init();
  }

  ngOnDestroy() {
    this.scrollAnimationService.destroy();
  }
}
