import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.html',
  styles: ``,
})
export class Carousel implements OnInit, OnDestroy {
  @Input() images: string[] = [];
  @Input() autoSlide: boolean = true;
  @Input() slideInterval: number = 5000;

  currentIndex = 0;
  private intervalId: any;

  ngOnInit() {
    if (this.autoSlide && this.images.length > 1) {
      this.startAutoSlide();
    }
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.intervalId = setInterval(() => {
      this.next();
    }, this.slideInterval);
  }

  stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  pause() {
    this.stopAutoSlide();
  }

  resume() {
    if (this.autoSlide && this.images.length > 1) {
      this.startAutoSlide();
    }
  }
}
