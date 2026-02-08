import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-info-landing',
  standalone: true,
  templateUrl: './info-landing.html',
  styleUrls: ['./info-landing.css'],
  imports: [CommonModule]
})

export class InfoLanding implements OnInit {
  constructor(private scrollAnimationService: ScrollAnimationService) {}

  ngOnInit() {

    setTimeout(() => {
      this.scrollAnimationService.init();
    }, 100);
  }
}



