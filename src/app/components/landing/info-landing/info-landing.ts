import { Component, OnInit } from '@angular/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-info-landing',
  templateUrl: './info-landing.html',
  styleUrl: './info-landing.css'
})

export class InfoLanding implements OnInit {
  constructor(private scrollAnimationService: ScrollAnimationService) {}

  ngOnInit() {

    setTimeout(() => {
      this.scrollAnimationService.init();
    }, 100);
  }
}



