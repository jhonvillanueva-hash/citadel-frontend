import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollAnimationService } from '../../../core/services/scroll-animation.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAward, faDiagramProject, faHeart, faTruck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-info-landing',
  standalone: true,
  templateUrl: './info-landing.html',
  styleUrls: ['./info-landing.css'],
  imports: [CommonModule, FontAwesomeModule]
})

export class InfoLanding implements OnInit {
  constructor(private scrollAnimationService: ScrollAnimationService) {}

  ngOnInit() {
    setTimeout(() => {
      this.scrollAnimationService.init();
    }, 100);
  }

  icons = {
    faDiagramProject,
    faAward,
    faTruck,
    faHeart
  }
}



