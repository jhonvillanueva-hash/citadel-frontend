import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ``,
})
export class Carousel implements OnInit, OnDestroy {
  private _images: string[] = [];

  @Input()
  set images(value: string[]) {
    this._images = value || [];
    this.currentIndex.set(0);
    this.manageAutoSlide();
  }
  get images(): string[] {
    return this._images;
  }

  @Input() autoSlide: boolean = true;
  @Input() slideInterval: number = 5000;

  currentIndex = signal(0);
  private intervalId: any;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.manageAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  private manageAutoSlide() {
    if (this.autoSlide && this.images.length > 1) {
      this.startAutoSlide();
    } else {
      this.stopAutoSlide();
    }
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
    if (this.images.length === 0) return;
    this.currentIndex.update(idx => (idx + 1) % this.images.length);
    this.cdr.markForCheck();
  }

  prev() {
    if (this.images.length === 0) return;
    this.currentIndex.update(idx => (idx - 1 + this.images.length) % this.images.length);
    this.cdr.markForCheck();
  }

  goToSlide(index: number) {
    this.currentIndex.set(index);
    this.cdr.markForCheck();
  }

  pause() {
    this.stopAutoSlide();
  }

  resume() {
    this.manageAutoSlide();
  }
}
