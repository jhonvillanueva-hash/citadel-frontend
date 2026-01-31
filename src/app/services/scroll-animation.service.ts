
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
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver no disponible, animando elementos directamente');
      this.animateAllElements();
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
          this.animateElement(entry.target);
          this.animatedElements.add(entry.target);

          this.observer?.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    setTimeout(() => {
      const elements = document.querySelectorAll(
        '.animate-on-scroll, .text-scroll-animate, .text-scroll-slow, .text-scroll-fast'
      );
      elements.forEach(element => this.observer?.observe(element));
    }, 100);
  }

  private animateElement(element: Element) {
    if (element.classList.contains('animate-on-scroll')) {
      element.classList.add('animated');
    }

    if (element.classList.contains('text-scroll-animate') ||
        element.classList.contains('text-scroll-slow') ||
        element.classList.contains('text-scroll-fast')) {
      element.classList.add('visible');
    }
  }

  private animateAllElements() {
    setTimeout(() => {
      const elements = document.querySelectorAll(
        '.animate-on-scroll, .text-scroll-animate, .text-scroll-slow, .text-scroll-fast'
      );
      elements.forEach(element => {
        this.animateElement(element);
      });
    }, 300);
  }

  observeElement(element: Element) {
    if (this.observer && !this.animatedElements.has(element)) {
      this.observer.observe(element);
    }
  }

  animateElementNow(element: Element) {
    this.animateElement(element);
    this.animatedElements.add(element);
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.animatedElements.clear();
  }
}
