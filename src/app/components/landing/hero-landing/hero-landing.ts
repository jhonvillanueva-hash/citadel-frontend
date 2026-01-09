import { Component, OnInit, OnDestroy, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-hero-landing',
  templateUrl: './hero-landing.html',
  styleUrl: './hero-landing.css'
})
export class HeroLanding implements OnInit, AfterViewInit, OnDestroy {
  private nextDom!: HTMLElement | null;
  private carouselDom!: HTMLElement | null;
  private listItemDom!: HTMLElement | null;
  private thumbnailDom!: HTMLElement | null;

  private timeRunning: number = 3000;
  private timeAutoNext: number = 7000;
  private runTimeOut: any;
  private runAutoRun: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeElements();
      this.setupEventListeners();
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private initializeElements(): void {
    this.nextDom = document.getElementById('next');
    this.carouselDom = document.querySelector('.container .carousel');
    this.listItemDom = document.querySelector('.container .carousel .list');
    this.thumbnailDom = document.querySelector('.container .carousel .thumbnail');
  }

  private setupEventListeners(): void {
    if (this.nextDom) {
      this.nextDom.onclick = () => {
        this.showSlider();
      };
    }

    this.runAutoRun = setTimeout(() => {
      if (this.nextDom) {
        this.nextDom.click();
      }
    }, this.timeAutoNext);
  }

  private showSlider(): void {
    if (!this.listItemDom || !this.thumbnailDom || !this.carouselDom) {
      return;
    }

    const itemSlider = this.listItemDom.querySelectorAll('.item');
    const itemThumbnail = this.thumbnailDom.querySelectorAll('.item');

    this.listItemDom.appendChild(itemSlider[0]);
    this.thumbnailDom.appendChild(itemThumbnail[0]);
    this.carouselDom.classList.add('next');

    clearTimeout(this.runTimeOut);
    this.runTimeOut = setTimeout(() => {
      this.carouselDom?.classList.remove('next');
    }, this.timeRunning);

    clearTimeout(this.runAutoRun);
    this.runAutoRun = setTimeout(() => {
      if (this.nextDom) {
        this.nextDom.click();
      }
    }, this.timeAutoNext);
  }

  private clearTimers(): void {
    if (this.runTimeOut) {
      clearTimeout(this.runTimeOut);
    }
    if (this.runAutoRun) {
      clearTimeout(this.runAutoRun);
    }
  }
}

