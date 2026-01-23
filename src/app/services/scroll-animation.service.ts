// services/scroll-animation.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ScrollAnimationService {

  private observer: IntersectionObserver | null = null;
  private animatedElements = new Set<Element>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  init() {
    // Solo en el navegador
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Verificar si IntersectionObserver está disponible
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver no disponible, animando elementos directamente');
      this.animateAllElements();
      return;
    }

    // Configurar el observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
          this.animateElement(entry.target);
          this.animatedElements.add(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observar elementos con la clase 'animate-on-scroll'
    setTimeout(() => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(element => this.observer?.observe(element));
    }, 100);
  }

  private animateElement(element: Element) {
    element.classList.add('animated');
  }

  private animateAllElements() {
    setTimeout(() => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(element => {
        this.animateElement(element);
      });
    }, 300);
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
