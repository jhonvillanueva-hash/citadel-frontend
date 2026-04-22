import { Directive, Input, OnChanges, SimpleChanges, Renderer2, RendererFactory2, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appBodyScrollLock]',
  standalone: true
})
export class BodyScrollLockDirective implements OnChanges, OnDestroy {
  @Input() appBodyScrollLock: boolean = false;

  private renderer: Renderer2;
  private isBrowser: boolean;
  private originalOverflow: string = '';

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appBodyScrollLock'] && this.isBrowser) {
      if (this.appBodyScrollLock) {
        this.disableScroll();
      } else {
        this.enableScroll();
      }
    }
  }

  ngOnDestroy() {
    this.enableScroll();
  }

  private disableScroll() {
    const body = document.body;
    this.originalOverflow = body.style.overflow;
    this.renderer.setStyle(body, 'overflow', 'hidden');
    this.renderer.addClass(body, 'modal-open');

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      this.renderer.setStyle(body, 'padding-right', `${scrollbarWidth}px`);
    }
  }

  private enableScroll() {
    const body = document.body;
    this.renderer.setStyle(body, 'overflow', this.originalOverflow);
    this.renderer.removeClass(body, 'modal-open');
    this.renderer.setStyle(body, 'padding-right', '');
  }
}
